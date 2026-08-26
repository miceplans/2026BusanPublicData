import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { getServerEnv } from '@/lib/env/server';
import { createSmtpTransport } from '@/lib/smtp/server';
import { escapeHtml } from '@/lib/output-safety';
import { generatePasswordResetEmailBody } from '@/lib/glm';

export async function sendCompletionEmail(input: {
  applicationId: string;
  receiptNumber: string;
  teamName: string;
  email: string;
  createdAt: string;
  body?: string | null;
  contact?: string | null;
}) {
  const db = createAdminClient();
  const key = `application_completed:${input.applicationId}`;
  const { data: existing } = await db
    .from('email_logs')
    .select('id,status,attempt_count')
    .eq('idempotency_key', key)
    .maybeSingle();
  if (existing?.status === 'sent') return;
  const env = getServerEnv();
  if (!env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM_EMAIL) {
    await db.from('email_logs').upsert(
      {
        application_id: input.applicationId,
        email_type: 'application_completed',
        idempotency_key: key,
        status: 'configuration_missing',
        error_code: 'EMAIL_CONFIGURATION_MISSING',
        error_summary: '발신 설정이 없습니다.',
      },
      { onConflict: 'idempotency_key' },
    );
    return;
  }
  const attempt = (existing?.attempt_count ?? 0) + 1;
  try {
    const safeTeamName = escapeHtml(input.teamName);
    const info = await createSmtpTransport().sendMail({
      from: `행사 운영사무국 <${env.SMTP_FROM_EMAIL}>`,
      to: input.email,
      subject: `[접수 완료] ${input.receiptNumber}`,
      html: `<h1>신청이 완료되었습니다.</h1><p>접수번호: ${input.receiptNumber}</p><p>팀명: ${safeTeamName}</p><p>신청 완료 시각: ${new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(input.createdAt))}</p><p>${input.body ?? ''}</p><p>신청 확인·수정: ${process.env.NEXT_PUBLIC_SITE_URL}/application/login</p><p>${input.contact ?? ''}</p>`,
    });
    await db.from('email_logs').upsert(
      {
        application_id: input.applicationId,
        email_type: 'application_completed',
        idempotency_key: key,
        status: 'sent',
        attempt_count: attempt,
        sent_at: new Date().toISOString(),
        provider_message_id: info.messageId,
        error_code: null,
        error_summary: null,
      },
      { onConflict: 'idempotency_key' },
    );
  } catch (error) {
    const delays = [1, 5, 30];
    const terminal = attempt >= 4;
    await db.from('email_logs').upsert(
      {
        application_id: input.applicationId,
        email_type: 'application_completed',
        idempotency_key: key,
        status: terminal ? 'failed' : 'retrying',
        attempt_count: attempt,
        next_retry_at: terminal
          ? null
          : new Date(
              Date.now() + delays[Math.min(attempt - 1, 2)] * 60000,
            ).toISOString(),
        error_code: 'PROVIDER_ERROR',
        error_summary:
          error instanceof Error
            ? error.message.slice(0, 300)
            : 'provider_error',
      },
      { onConflict: 'idempotency_key' },
    );
  }
}

export async function sendPasswordResetEmail(input: {
  applicationId: string;
  receiptNumber: string;
  teamName: string;
  email: string;
  newPassword: string;
}) {
  const db = createAdminClient();
  const key = `password_reset:${input.applicationId}:${Date.now()}`;
  const env = getServerEnv();
  if (!env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM_EMAIL) {
    await db.from('email_logs').upsert(
      {
        application_id: input.applicationId,
        email_type: 'password_reset',
        idempotency_key: key,
        status: 'configuration_missing',
        error_code: 'EMAIL_CONFIGURATION_MISSING',
        error_summary: '발신 설정이 없습니다.',
      },
      { onConflict: 'idempotency_key' },
    );
    return;
  }
  try {
    const safeTeamName = escapeHtml(input.teamName);
    const generatedBody = await generatePasswordResetEmailBody({
      teamName: input.teamName,
      receiptNumber: input.receiptNumber,
      newPassword: input.newPassword,
    });
    const bodyHtml = generatedBody
      ? escapeHtml(generatedBody).replace(/\n/g, '<br>')
      : `<p>안녕하세요, ${safeTeamName}님.</p><p>요청하신 비밀번호가 초기화되었습니다.</p><p>접수번호: ${escapeHtml(input.receiptNumber)}</p><p>새 비밀번호: ${escapeHtml(input.newPassword)}</p><p>로그인 후 반드시 비밀번호를 변경해 주세요.</p>`;
    const info = await createSmtpTransport().sendMail({
      from: `행사 운영사무국 <${env.SMTP_FROM_EMAIL}>`,
      to: input.email,
      subject: `[비밀번호 초기화] ${input.receiptNumber}`,
      html: `${bodyHtml}<p>신청 확인·수정: ${process.env.NEXT_PUBLIC_SITE_URL}/application/login</p>`,
    });
    await db.from('email_logs').upsert(
      {
        application_id: input.applicationId,
        email_type: 'password_reset',
        idempotency_key: key,
        status: 'sent',
        attempt_count: 1,
        sent_at: new Date().toISOString(),
        provider_message_id: info.messageId,
      },
      { onConflict: 'idempotency_key' },
    );
  } catch (error) {
    await db.from('email_logs').upsert(
      {
        application_id: input.applicationId,
        email_type: 'password_reset',
        idempotency_key: key,
        status: 'failed',
        attempt_count: 1,
        error_code: 'PROVIDER_ERROR',
        error_summary:
          error instanceof Error
            ? error.message.slice(0, 300)
            : 'provider_error',
      },
      { onConflict: 'idempotency_key' },
    );
  }
}
