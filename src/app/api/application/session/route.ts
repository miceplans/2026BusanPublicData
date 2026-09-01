import { compare } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applicationLoginSchema, normalizeTeamName } from '@/validations';
import {
  setApplicationSession,
  clearApplicationSession,
} from '@/lib/application-session';
import { jsonError, validationError } from '@/lib/http';

export async function POST(request: NextRequest) {
  const parsed = applicationLoginSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return validationError(parsed.error);
  const normalized = normalizeTeamName(parsed.data.teamName);
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
  await setApplicationSession(application.id);
  return NextResponse.json({ ok: true });
}
export async function DELETE() {
  await clearApplicationSession();
  return NextResponse.json({ ok: true });
}
