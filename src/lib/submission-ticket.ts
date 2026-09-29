import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getServerEnv } from '@/lib/env/server';

// 제출 버튼을 누른 시각(업로드 준비 요청 시각)을 서명해 두었다가 최종 제출
// 때 마감 판정에 사용한다. 마감 전에 누른 신청은 파일 업로드가 오래
// 걸려도 거절하지 않는다. 서명 업로드 URL 유효 시간(2시간)과 맞춘다.
const TICKET_TTL_MS = 2 * 60 * 60 * 1000;

type Payload = { idempotencyKey: string; issuedAt: number };

function sign(value: string) {
  return createHmac('sha256', getServerEnv().APPLICATION_SESSION_SECRET)
    .update(`submission_ticket:${value}`)
    .digest('base64url');
}

export function issueSubmissionTicket(idempotencyKey: string) {
  const encoded = Buffer.from(
    JSON.stringify({ idempotencyKey, issuedAt: Date.now() }),
  ).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function readSubmissionTicketIssuedAt(
  ticket: unknown,
  idempotencyKey: string,
) {
  if (typeof ticket !== 'string') return null;
  const [encoded, signature] = ticket.split('.');
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    return null;
  try {
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString(),
    ) as Payload;
    if (payload.idempotencyKey !== idempotencyKey) return null;
    if (Date.now() - payload.issuedAt > TICKET_TTL_MS) return null;
    return payload.issuedAt;
  } catch {
    return null;
  }
}
