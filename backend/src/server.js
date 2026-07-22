import crypto from 'node:crypto';
import cors from 'cors';
import express from 'express';
import { z } from 'zod';
import { requireAuth, signToken } from './auth.js';
import { sendLoginCode } from './mailer.js';
import { prisma } from './prisma.js';

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: false,
}));
app.use(express.json({ limit: '1mb' }));

const emailSchema = z.object({ email: z.string().email().max(200).transform(v => v.toLowerCase()) });
const verifySchema = emailSchema.extend({ code: z.string().regex(/^\d{6}$/) });
const applicationSchema = z.object({
  companyId: z.string().min(1).max(120),
  appliedPosition: z.string().max(500).default(''),
  status: z.string().max(80).default('pending'),
  notes: z.string().max(5000).default(''),
  progress: z.record(z.any()).default({}),
});

function makeCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/auth/request-code', async (req, res, next) => {
  try {
    const { email } = emailSchema.parse(req.body);
    const recent = await prisma.loginCode.findFirst({
      where: { email, createdAt: { gt: new Date(Date.now() - 60_000) } },
      orderBy: { createdAt: 'desc' },
    });
    if (recent) return res.status(429).json({ error: 'Please wait before requesting another code' });

    const code = makeCode();
    await prisma.loginCode.create({
      data: { email, code, expiresAt: new Date(Date.now() + 10 * 60_000) },
    });
    await sendLoginCode(email, code);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post('/auth/verify-code', async (req, res, next) => {
  try {
    const { email, code } = verifySchema.parse(req.body);
    const loginCode = await prisma.loginCode.findFirst({
      where: { email, code, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!loginCode) return res.status(401).json({ error: 'Invalid or expired code' });

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    await prisma.loginCode.update({ where: { id: loginCode.id }, data: { consumedAt: new Date() } });
    res.json({ token: signToken({ sub: user.id, email: user.email }), user: { email: user.email } });
  } catch (err) {
    next(err);
  }
});

app.get('/me/applications', requireAuth, async (req, res, next) => {
  try {
    const rows = await prisma.application.findMany({ where: { userId: req.user.sub } });
    const data = {};
    for (const row of rows) {
      data[row.companyId] = {
        appliedPosition: row.appliedPosition,
        status: row.status,
        notes: row.notes,
        progress: row.progress || {},
      };
    }
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

app.put('/me/applications/:companyId', requireAuth, async (req, res, next) => {
  try {
    const payload = applicationSchema.parse({ ...req.body, companyId: req.params.companyId });
    const row = await prisma.application.upsert({
      where: { userId_companyId: { userId: req.user.sub, companyId: payload.companyId } },
      update: payload,
      create: { ...payload, userId: req.user.sub },
    });
    res.json({
      data: {
        companyId: row.companyId,
        appliedPosition: row.appliedPosition,
        status: row.status,
        notes: row.notes,
        progress: row.progress || {},
      },
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid request', details: err.errors });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`qiuzhao tracker backend listening on ${port}`);
});
