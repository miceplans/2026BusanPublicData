import 'server-only';

import nodemailer from 'nodemailer';

import { getServerEnv } from '@/lib/env/server';

export function createSmtpTransport() {
  const env = getServerEnv();
  if (!env.SMTP_USER || !env.SMTP_PASS)
    throw new Error('SMTP 계정 정보가 설정되지 않았습니다.');
  const port = env.SMTP_PORT ?? 465;
  return nodemailer.createTransport({
    host: env.SMTP_HOST ?? 'smtp.naver.com',
    port,
    secure: port === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}
