import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { getServerEnv } from '@/lib/env/server';

type SignedPayload = { email: string; expiresAt: number; codeHash?: string };

function sign(value: string) {
  return createHmac('sha256', getServerEnv().APPLICATION_SESSION_SECRET)
    .update(value)
    .digest('base64url');
}

function encode(payload: SignedPayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

function decode(token: string): SignedPayload | null {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export function makeEmailChallenge(email: string, code: string) {
  return encode({
    email,
    expiresAt: Date.now() + 10 * 60 * 1000,
    codeHash: sign(`email-code:${email}:${code}`),
  });
}

export function verifyEmailChallenge(
  token: string,
  email: string,
  code: string,
) {
  const payload = decode(token);
  if (!payload?.codeHash || payload.email !== email) return false;
  const actual = sign(`email-code:${email}:${code}`);
  return (
    actual.length === payload.codeHash.length &&
    timingSafeEqual(Buffer.from(actual), Buffer.from(payload.codeHash))
  );
}

export function makeVerifiedEmailToken(email: string) {
  return encode({ email, expiresAt: Date.now() + 30 * 60 * 1000 });
}

export function isVerifiedEmailToken(token: string, email: string) {
  const payload = decode(token);
  return !!payload && !payload.codeHash && payload.email === email;
}
