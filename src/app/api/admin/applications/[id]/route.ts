import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError } from '@/lib/http';
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
