import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getServerEnv } from '@/lib/env/server';

const COOKIE = 'application_session';
type Payload = { applicationId: string; expiresAt: number };
function sign(value: string) {
  return createHmac('sha256', getServerEnv().APPLICATION_SESSION_SECRET)
    .update(value)
    .digest('base64url');
}
export function makeApplicationToken(applicationId: string) {
  const encoded = Buffer.from(
    JSON.stringify({ applicationId, expiresAt: Date.now() + 30 * 60 * 1000 }),
  ).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}
export async function setApplicationSession(applicationId: string) {
  (await cookies()).set(COOKIE, makeApplicationToken(applicationId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 1800,
  });
}
export async function clearApplicationSession() {
  (await cookies()).delete(COOKIE);
}
export async function getApplicationId() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [encoded, signature] = token.split('.');
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
    return payload.expiresAt > Date.now() ? payload.applicationId : null;
  } catch {
    return null;
  }
}
