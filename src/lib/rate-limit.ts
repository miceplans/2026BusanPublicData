import 'server-only';

import { createHmac } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getServerEnv } from '@/lib/env/server';

export type RateLimitResult = { allowed: boolean; retryAfter: number };

function digest(value: string) {
  return createHmac('sha256', getServerEnv().APPLICATION_SESSION_SECRET)
    .update(value)
    .digest('hex');
}

export function requestClientKey(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip');
  return digest(`ip:${ip || 'unknown'}`);
}

export function subjectKey(kind: string, value: string) {
  return digest(`${kind}:${value}`);
}

export async function consumeRateLimit(
  action: string,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const { data, error } = await createAdminClient().rpc('consume_rate_limit', {
    p_action: action,
    p_identifier_hash: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    retryAfter: Math.max(1, Number(row?.retry_after_seconds ?? windowSeconds)),
  };
}

export async function resetRateLimit(action: string, key: string) {
  const { error } = await createAdminClient()
    .from('request_rate_limits')
    .delete()
    .eq('action', action)
    .eq('identifier_hash', key);
  if (error) throw error;
}
