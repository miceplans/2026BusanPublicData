import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { adminLoginSchema } from '@/validations';
import { jsonError, validationError } from '@/lib/http';

export async function POST(request: NextRequest) {
  const parsed = adminLoginSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return validationError(parsed.error);
  const client = await createClient();
  const { data, error } = await client.auth.signInWithPassword(parsed.data);
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
  return NextResponse.json({ ok: true });
}
export async function DELETE() {
  const client = await createClient();
  await client.auth.signOut();
  return NextResponse.json({ ok: true });
}
