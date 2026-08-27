import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { adminPatchSchema } from '@/validations';
import { jsonError, validationError } from '@/lib/http';
import { sendPasswordResetEmail } from '@/lib/email';
import { invalidateApplicationList } from '@/lib/admin-application-list';
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return jsonError('관리자 로그인이 필요합니다.', 401);
  const { id } = await params;
  const { data, error } = await createAdminClient()
    .from('applications')
    .select('*,application_members(*),application_files(*),email_logs(*)')
    .eq('id', id)
    .single();
  if (error) return jsonError('신청 정보를 찾을 수 없습니다.', 404);
  return NextResponse.json({ ok: true, application: data });
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return jsonError('관리자 로그인이 필요합니다.', 401);
  const { id } = await params;
  const parsed = adminPatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return validationError(parsed.error);
  const db = createAdminClient();
  const changes: Record<string, unknown> = {};
  if (parsed.data.password)
    changes.password_hash = await hash(parsed.data.password, 12);
  const { error } = await db.from('applications').update(changes).eq('id', id);
  if (error) return jsonError('신청 정보를 변경할 수 없습니다.', 500);
  await db.from('admin_audit_logs').insert({
    admin_user_id: admin.user.id,
    action: 'password_reset',
    target_type: 'application',
    target_id: id,
    change_summary: {
      passwordReset: true,
    },
  });
  if (parsed.data.password) {
    const { data: application } = await db
      .from('applications')
      .select('id,receipt_number,team_name,leader_email')
      .eq('id', id)
      .single();
    if (application) {
      await sendPasswordResetEmail({
        applicationId: application.id,
        receiptNumber: application.receipt_number,
        teamName: application.team_name,
        email: application.leader_email,
        newPassword: parsed.data.password,
      });
    }
  }
  invalidateApplicationList();
  return NextResponse.json({ ok: true });
}
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return jsonError('관리자 로그인이 필요합니다.', 401);
  const { id } = await params;
  const db = createAdminClient();
  const { data: files } = await db
    .from('application_files')
    .select('object_key')
    .eq('application_id', id);
  if (files?.length)
    await db.storage
      .from('application-files')
      .remove(files.map((f) => f.object_key));
  await db.from('admin_audit_logs').insert({
    admin_user_id: admin.user.id,
    action: 'application_permanent_delete',
    target_type: 'application',
    target_id: id,
    change_summary: { filesDeleted: files?.length ?? 0 },
  });
  const { error } = await db.from('applications').delete().eq('id', id);
  if (error) return jsonError('신청을 삭제할 수 없습니다.', 500);
  invalidateApplicationList();
  return NextResponse.json({ ok: true });
}
