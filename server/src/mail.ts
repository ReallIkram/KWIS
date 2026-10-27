import nodemailer from 'nodemailer';
export async function sendMail(subject: string, text: string, to = process.env.MAIL_TO) {
  if (!process.env.SMTP_HOST || !process.env.MAIL_FROM || !to) return false;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === '465',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  await transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
  return true;
}
