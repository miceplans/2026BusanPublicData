import { NextRequest, NextResponse } from 'next/server';
import { getApplicationId } from '@/lib/application-session';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings, applicationEditable } from '@/lib/settings';
import { jsonError } from '@/lib/http';
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const applicationId = await getApplicationId();
  if (!applicationId) return jsonError('로그인이 필요합니다.', 401);
  const { id } = await params;
  const db = createAdminClient();
  const settings = await getSettings();
  if (!applicationEditable(settings))
    return jsonError('현재 증빙자료를 삭제할 수 없습니다.', 403);
  const { data: file } = await db
    .from('application_files')
    .select('object_key')
    .eq('id', id)
    .eq('application_id', applicationId)
    .maybeSingle();
  if (!file) return jsonError('파일을 찾을 수 없습니다.', 404);
  const { error } = await db.storage
    .from('application-files')
    .remove([file.object_key]);
  if (error) return jsonError('파일을 삭제할 수 없습니다.', 500);
  await db
    .from('application_files')
    .delete()
    .eq('id', id)
    .eq('application_id', applicationId);
  return NextResponse.json({ ok: true });
}
