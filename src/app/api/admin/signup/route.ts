import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, validationError } from '@/lib/http';
import { consumeRateLimit, requestClientKey } from '@/lib/rate-limit';
import { adminSignupSchema } from '@/validations';

export async function POST(request: NextRequest) {
  const limit = await consumeRateLimit(
    'admin_signup_ip',
    requestClientKey(request),
    5,
    3600,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: '회원가입 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const parsed = adminSignupSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return validationError(parsed.error);

  const db = createAdminClient();
  const { count, error: countError } = await db
    .from('admin_profiles')
    .select('user_id', { count: 'exact', head: true })
    .eq('is_active', true);
  if (countError)
    return jsonError('관리자 계정 상태를 확인하지 못했습니다.', 500);

  const currentAdmin = count && count > 0 ? await requireAdmin() : null;
  if (count && count > 0 && !currentAdmin) {
    return jsonError('새 관리자 등록은 로그인한 관리자만 할 수 있습니다.', 403);
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true,
  });
  if (error || !data.user) {
    const duplicate = error?.message.toLowerCase().includes('already');
    return jsonError(
      duplicate
        ? '이미 등록된 이메일입니다.'
        : '관리자 계정을 만들지 못했습니다.',
      duplicate ? 409 : 400,
    );
  }

  const profileResult =
    count === 0
      ? await db.rpc('register_initial_admin', { p_user_id: data.user.id })
      : await db.from('admin_profiles').insert({
          user_id: data.user.id,
          role: 'administrator',
          is_active: true,
        });

  if (profileResult.error) {
    await db.auth.admin.deleteUser(data.user.id);
    return jsonError(
      count === 0
        ? '최초 관리자 등록이 이미 완료되었습니다.'
        : '관리자 권한을 생성하지 못했습니다.',
      count === 0 ? 409 : 500,
    );
  }

  if (currentAdmin) {
    await db.from('admin_audit_logs').insert({
      admin_user_id: currentAdmin.user.id,
      action: 'admin_created',
      target_type: 'admin_profile',
      target_id: data.user.id,
      change_summary: { email },
    });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
