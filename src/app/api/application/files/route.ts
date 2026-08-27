import { NextRequest, NextResponse } from 'next/server';
import { getApplicationId } from '@/lib/application-session';
import { getSettings, applicationEditable } from '@/lib/settings';
import { uploadFiles, validateFiles } from '@/lib/files';
import { jsonError } from '@/lib/http';
import { invalidateApplicationList } from '@/lib/admin-application-list';

export async function POST(request: NextRequest) {
  const applicationId = await getApplicationId();
  if (!applicationId) return jsonError('로그인이 필요합니다.', 401);
  const settings = await getSettings();
  if (!applicationEditable(settings))
    return jsonError('현재 증빙자료를 변경할 수 없습니다.', 403);
  const files = (await request.formData())
    .getAll('files')
    .filter((value): value is File => value instanceof File);
  try {
    validateFiles(files);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : '파일을 확인해 주세요.',
      422,
    );
  }
  try {
    await uploadFiles(applicationId, files);
    invalidateApplicationList();
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError('증빙자료를 저장할 수 없습니다.', 500);
  }
}
