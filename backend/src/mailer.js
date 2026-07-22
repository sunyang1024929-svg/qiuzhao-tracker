import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.MAIL_FROM || 'qiuzhao-tracker <onboarding@resend.dev>';

export async function sendLoginCode(email, code) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '秋招追踪器登录验证码',
    html: `<p>你的登录验证码是：<b style="font-size:20px">${code}</b></p><p>10 分钟内有效，请勿泄露给他人。</p>`,
    text: `你的登录验证码是：${code}（10 分钟内有效，请勿泄露给他人）`,
  });
}
