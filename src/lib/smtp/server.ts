import 'server-only';

import nodemailer, { type Transporter } from 'nodemailer';

import { getServerEnv } from '@/lib/env/server';

let cachedTransport: Transporter | null = null;

export function createSmtpTransport() {
  if (cachedTransport) return cachedTransport;
  const env = getServerEnv();
  if (!env.SMTP_USER || !env.SMTP_PASS)
    throw new Error('SMTP 계정 정보가 설정되지 않았습니다.');
  const port = env.SMTP_PORT ?? 465;
  cachedTransport = nodemailer.createTransport({
    host: env.SMTP_HOST ?? 'smtp.naver.com',
    port,
    secure: port === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
  });
  return cachedTransport;
}
