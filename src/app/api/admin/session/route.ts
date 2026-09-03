import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { adminLoginSchema } from '@/validations';
import { jsonError, validationError } from '@/lib/http';
import {
  consumeRateLimit,
  requestClientKey,
  resetRateLimit,
  subjectKey,
} from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const parsed = adminLoginSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return validationError(parsed.error);
  const email = parsed.data.email.trim().toLowerCase();
  const ipKey = requestClientKey(request);
  const emailKey = subjectKey('admin-login', email);
  const [ipLimit, emailLimit] = await Promise.all([
    consumeRateLimit('admin_login_ip', ipKey, 20, 900),
    consumeRateLimit('admin_login_email', emailKey, 8, 900),
  ]);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfter, emailLimit.retryAfter);
    return NextResponse.json(
      {
        ok: false,
        error: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }
  const client = await createClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });
  if (error || !data.user)
    return jsonError('관리자 로그인 정보를 확인해 주세요.', 401);
  const { data: profile } = await createAdminClient()
    .from('admin_profiles')
    .select('is_active')
    .eq('user_id', data.user.id)
    .eq('is_active', true)
    .maybeSingle();
  if (!profile) {
    await client.auth.signOut();
    return jsonError('관리자 권한이 없습니다.', 403);
  }
  await resetRateLimit('admin_login_email', emailKey);
  return NextResponse.json({ ok: true });
}
export async function DELETE() {
  const client = await createClient();
  await client.auth.signOut();
  return NextResponse.json({ ok: true });
}
