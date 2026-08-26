import { NextRequest, NextResponse } from 'next/server';
import { getApplicationId } from '@/lib/application-session';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError } from '@/lib/http';
export async function GET(
  request: NextRequest,
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
    .select('application_id,object_key,original_name,mime_type')
    .eq('id', id);
  if (!admin) query = query.eq('application_id', applicationId!);
  const { data } = await query.maybeSingle();
  if (!data) return jsonError('파일을 찾을 수 없습니다.', 404);
  const { data: file, error } = await db.storage
    .from('application-files')
    .download(data.object_key);
  if (error || !file) return jsonError('파일을 불러올 수 없습니다.', 500);

  const download = request.nextUrl.searchParams.get('download') === '1';
  const headers = new Headers({
    'Cache-Control': 'private, no-store',
    'Content-Type': data.mime_type,
    'X-Content-Type-Options': 'nosniff',
  });
  if (download) {
    const encodedName = encodeURIComponent(data.original_name);
    headers.set(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodedName}`,
    );
  }

  return new NextResponse(await file.arrayBuffer(), { headers });
}
