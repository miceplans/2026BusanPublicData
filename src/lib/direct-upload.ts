'use client';

import { createClient } from '@/lib/supabase/client';

export type UploadTarget = { objectKey: string; token: string };

export class DirectUploadError extends Error {}

export function describeFiles(files: File[]) {
  return files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
  }));
}

// 서버가 발급한 서명 업로드 URL로 Storage에 직접 올린다.
// 파일 본문이 Vercel 함수를 거치지 않으므로 4.5MB 요청 제한이 없다.
export async function uploadToTargets(files: File[], targets: UploadTarget[]) {
  if (targets.length !== files.length)
    throw new DirectUploadError('파일 업로드를 준비하지 못했습니다.');
  const bucket = createClient().storage.from('application-files');
  await Promise.all(
    files.map(async (file, index) => {
      const { error } = await bucket.uploadToSignedUrl(
        targets[index].objectKey,
        targets[index].token,
        file,
        { contentType: file.type || 'application/octet-stream' },
      );
      if (!error) return;
      const status = Number(
        (error as { status?: unknown; statusCode?: unknown }).status ??
          (error as { statusCode?: unknown }).statusCode,
      );
      throw new DirectUploadError(
        status === 413
          ? `'${file.name}' 파일이 업로드 가능한 용량을 초과했습니다. 더 작은 파일로 다시 시도하거나 운영사무국에 문의해 주세요.`
          : `'${file.name}' 파일을 업로드하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.`,
      );
    }),
  );
  return files.map((file, index) => ({
    objectKey: targets[index].objectKey,
    originalName: file.name,
  }));
}
