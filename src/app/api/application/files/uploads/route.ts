import { NextRequest, NextResponse } from 'next/server';
import { getApplicationId } from '@/lib/application-session';
import { getSettings, applicationEditable } from '@/lib/settings';
import { createUploadTargets, uploadRequestSchema } from '@/lib/files';
import { jsonError, validationError } from '@/lib/http';

// 증빙자료 추가 1단계: 로그인한 신청의 폴더에 대한 업로드 주소를 발급한다.
export async function POST(request: NextRequest) {
  const applicationId = await getApplicationId();
  if (!applicationId) return jsonError('로그인이 필요합니다.', 401);
  const settings = await getSettings();
  if (!applicationEditable(settings))
    return jsonError('현재 증빙자료를 변경할 수 없습니다.', 403);
  let body: { files?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError('요청 형식이 올바르지 않습니다.');
  }
  const files = uploadRequestSchema.safeParse(body.files);
  if (!files.success) return validationError(files.error);
  try {
    const uploads = await createUploadTargets(applicationId, files.data);
    return NextResponse.json({ ok: true, uploads });
  } catch {
    return jsonError('증빙자료를 저장할 수 없습니다.', 500);
  }
}
