import { randomInt } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerEnv } from '@/lib/env/server';
import { createSmtpTransport } from '@/lib/smtp/server';
import {
  makeEmailChallenge,
  makeVerifiedEmailToken,
  verifyEmailChallenge,
} from '@/lib/email-verification';
import {
  consumeRateLimit,
  requestClientKey,
  subjectKey,
} from '@/lib/rate-limit';
import { jsonError, validationError } from '@/lib/http';

const emailSchema = z.object({ email: z.email().max(254) });
const verifySchema = emailSchema.extend({
  code: z.string().regex(/^\d{6}$/),
  challenge: z.string().min(20).max(2000),
});

export async function POST(request: NextRequest) {
  const parsed = emailSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const email = parsed.data.email.toLowerCase();
  const [ipLimit, emailLimit] = await Promise.all([
    consumeRateLimit(
      'email_verification_send_ip',
      requestClientKey(request),
      10,
      60 * 60,
    ),
    consumeRateLimit(
      'email_verification_send_email',
      subjectKey('email', email),
      3,
      60 * 60,
    ),
  ]);
  if (!ipLimit.allowed || !emailLimit.allowed)
    return jsonError(
      '인증 메일 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      429,
    );

  const env = getServerEnv();
  if (!env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM_EMAIL)
    return jsonError(
      '이메일 인증을 사용할 수 없습니다. 운영자에게 문의해 주세요.',
      503,
    );
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await createSmtpTransport().sendMail({
    from: `행사 운영사무국 <${env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: '[참가 신청] 이메일 인증번호',
    text: `이메일 인증번호는 ${code}입니다. 10분 안에 입력해 주세요.`,
    html: `<h1>이메일 인증</h1><p>인증번호: <strong>${code}</strong></p><p>10분 안에 입력해 주세요.</p>`,
  });
  return NextResponse.json({
    ok: true,
    challenge: makeEmailChallenge(email, code),
  });
}

export async function PUT(request: NextRequest) {
  const parsed = verifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const email = parsed.data.email.toLowerCase();
  const limit = await consumeRateLimit(
    'email_verification_check',
    subjectKey('email', email),
    5,
    10 * 60,
  );
  if (!limit.allowed)
    return jsonError(
      '인증 시도가 너무 많습니다. 새 인증번호를 요청해 주세요.',
      429,
    );
  if (!verifyEmailChallenge(parsed.data.challenge, email, parsed.data.code))
    return jsonError('인증번호가 올바르지 않거나 만료되었습니다.', 401);
  return NextResponse.json({ ok: true, token: makeVerifiedEmailToken(email) });
}
