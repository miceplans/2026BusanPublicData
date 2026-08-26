import { NextRequest, NextResponse } from 'next/server';
import { getApplicationId } from '@/lib/application-session';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError } from '@/lib/http';
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const applicationId = await getApplicationId();
  const admin = await requireAdmin();
  if (!applicationId && !admin)
    return jsonError('파일 접근 권한이 없습니다.', 401);
  const db = createAdminClient();
  let query = db
    .from('application_files')
    .select('application_id,object_key')
    .eq('id', id);
  if (!admin) query = query.eq('application_id', applicationId!);
  const { data } = await query.maybeSingle();
  if (!data) return jsonError('파일을 찾을 수 없습니다.', 404);
  const { data: signed, error } = await db.storage
    .from('application-files')
    .createSignedUrl(data.object_key, 600);
  if (error) return jsonError('다운로드 주소를 만들 수 없습니다.', 500);
  return NextResponse.redirect(signed.signedUrl);
}
