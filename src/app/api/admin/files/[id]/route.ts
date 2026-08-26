import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { jsonError } from '@/lib/http';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return jsonError('관리자 로그인이 필요합니다.', 401);

  const { id } = await params;
  const db = createAdminClient();
  const { data: metadata, error: metadataError } = await db
    .from('application_files')
    .select('object_key,original_name,mime_type')
    .eq('id', id)
    .maybeSingle();

  if (metadataError || !metadata)
    return jsonError('파일을 찾을 수 없습니다.', 404);

  const { data: file, error: downloadError } = await db.storage
    .from('application-files')
    .download(metadata.object_key);

  if (downloadError || !file)
    return jsonError('파일을 불러올 수 없습니다.', 500);

  const disposition =
    request.nextUrl.searchParams.get('download') === '1'
      ? 'attachment'
      : 'inline';
  const encodedName = encodeURIComponent(metadata.original_name);

  return new NextResponse(await file.arrayBuffer(), {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `${disposition}; filename*=UTF-8''${encodedName}`,
      'Content-Type': metadata.mime_type,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
