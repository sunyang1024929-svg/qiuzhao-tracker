# qiuzhao-tracker backend

Railway backend for multi-user email-code login and private application progress storage.

## Environment variables

- `DATABASE_URL`: Railway PostgreSQL connection string.
- `JWT_SECRET`: long random secret, for example `openssl rand -base64 32`.
- `RESEND_API_KEY`: Resend API key used to send login codes.
- `MAIL_FROM`: sender identity, for example `qiuzhao-tracker <onboarding@resend.dev>` for testing, or your verified domain sender.
- `CORS_ORIGIN`: frontend origin, for example `https://sunyang1024929-svg.github.io`.

## Railway start command

```bash
npx prisma migrate deploy && npx prisma generate && node src/server.js
```
