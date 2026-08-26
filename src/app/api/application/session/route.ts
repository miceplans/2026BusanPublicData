import { compare } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applicationLoginSchema, normalizeTeamName } from '@/validations';
import {
  setApplicationSession,
  clearApplicationSession,
} from '@/lib/application-session';
import { jsonError, validationError } from '@/lib/http';
import {
  consumeRateLimit,
  requestClientKey,
  resetRateLimit,
  subjectKey,
} from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const parsed = applicationLoginSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return validationError(parsed.error);
  const normalized = normalizeTeamName(parsed.data.teamName);
  const ipKey = requestClientKey(request);
  const accountKey = subjectKey('application-login', normalized);
  const [ipLimit, accountLimit] = await Promise.all([
    consumeRateLimit('application_login_ip', ipKey, 20, 15 * 60),
    consumeRateLimit('application_login_account', accountKey, 5, 30 * 60),
  ]);
  if (!ipLimit.allowed || !accountLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfter, accountLimit.retryAfter);
    return NextResponse.json(
      {
        ok: false,
        error: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }
  const db = createAdminClient();
  const { data: application } = await db
    .from('applications')
    .select('id,password_hash')
    .eq('normalized_team_name', normalized)
    .maybeSingle();
  const valid =
    !!application &&
    (await compare(parsed.data.password, application.password_hash));
  if (!valid) return jsonError('팀명 또는 비밀번호를 확인해 주세요.', 401);
  await resetRateLimit('application_login_account', accountKey);
  await setApplicationSession(application.id);
  return NextResponse.json({ ok: true });
}
export async function DELETE() {
  await clearApplicationSession();
  return NextResponse.json({ ok: true });
}
