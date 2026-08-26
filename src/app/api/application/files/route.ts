import { NextRequest, NextResponse } from 'next/server';
import { getApplicationId } from '@/lib/application-session';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings, applicationEditable } from '@/lib/settings';
import { uploadFiles, validateFiles } from '@/lib/files';
import { jsonError } from '@/lib/http';

export async function POST(request: NextRequest) {
  const applicationId = await getApplicationId();
  if (!applicationId) return jsonError('로그인이 필요합니다.', 401);
  const db = createAdminClient();
  const settings = await getSettings();
  if (!applicationEditable(settings))
    return jsonError('현재 증빙자료를 변경할 수 없습니다.', 403);
  const files = (await request.formData())
    .getAll('files')
    .filter((value): value is File => value instanceof File);
  const { count } = await db
    .from('application_files')
    .select('id', { count: 'exact', head: true })
    .eq('application_id', applicationId);
  try {
    validateFiles(files, settings);
    if (
      settings.evidence_max_files &&
      (count ?? 0) + files.length > settings.evidence_max_files
    )
      throw new Error(
        `증빙자료는 최대 ${settings.evidence_max_files}개까지 첨부할 수 있습니다.`,
      );
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : '파일을 확인해 주세요.',
      422,
    );
  }
  try {
    await uploadFiles(applicationId, files);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError('증빙자료를 저장할 수 없습니다.', 500);
  }
}
