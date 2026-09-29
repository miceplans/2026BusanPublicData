import 'server-only';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

// 파일은 Vercel 함수(요청 본문 4.5MB 제한)를 거치지 않고 브라우저에서
// 서명 업로드 URL로 Storage에 직접 올린다. 서버는 업로드 주소를 발급하고,
// 업로드가 끝난 뒤 실제 객체를 확인해 메타데이터만 기록한다.
export const FILE_BUCKET = 'application-files';

export const uploadRequestSchema = z.array(
  z.object({
    name: z.string().trim().min(1).max(255),
    size: z.number().int().positive('빈 파일은 첨부할 수 없습니다.'),
    type: z.string().max(255),
  }),
);
export const uploadedFilesSchema = z.array(
  z.object({
    objectKey: z.string().min(1).max(512),
    originalName: z.string().trim().min(1).max(255),
  }),
);
export type UploadedFile = z.infer<typeof uploadedFilesSchema>[number];

export class UploadVerificationError extends Error {
  constructor() {
    super('업로드한 파일을 확인할 수 없습니다. 다시 제출해 주세요.');
  }
}

function extensionOf(name: string) {
  const ext = name.match(/\.([^./\\]+)$/)?.[1].toLowerCase() ?? '';
  return /^[a-z0-9]{1,16}$/.test(ext) ? ext : '';
}

export async function createUploadTargets(
  prefix: string,
  files: z.infer<typeof uploadRequestSchema>,
) {
  const bucket = createAdminClient().storage.from(FILE_BUCKET);
  return Promise.all(
    files.map(async (file) => {
      const ext = extensionOf(file.name);
      const objectKey = `${prefix}/${randomUUID()}${ext ? `.${ext}` : ''}`;
      const { data, error } = await bucket.createSignedUploadUrl(objectKey);
      if (error || !data) throw error ?? new Error('업로드 주소 발급 실패');
      return { objectKey, token: data.token };
    }),
  );
}

export async function registerUploadedFiles(
  applicationId: string,
  prefix: string,
  uploads: UploadedFile[],
) {
  if (!uploads.length) return;
  const names = new Set<string>();
  for (const upload of uploads) {
    const name = upload.objectKey.slice(prefix.length + 1);
    if (
      !upload.objectKey.startsWith(`${prefix}/`) ||
      !/^[0-9a-f-]{36}(\.[a-z0-9]{1,16})?$/.test(name) ||
      names.has(name)
    )
      throw new UploadVerificationError();
    names.add(name);
  }
  const client = createAdminClient();
  const { data: objects, error } = await client.storage
    .from(FILE_BUCKET)
    .list(prefix, { limit: 1000 });
  if (error) throw error;
  const stored = new Map(objects.map((object) => [object.name, object]));
  const rows = uploads.map((upload) => {
    const name = upload.objectKey.slice(prefix.length + 1);
    const size = Number(stored.get(name)?.metadata?.size ?? 0);
    if (size <= 0) throw new UploadVerificationError();
    return {
      application_id: applicationId,
      object_key: upload.objectKey,
      original_name: upload.originalName,
      extension: extensionOf(name),
      mime_type:
        stored.get(name)?.metadata?.mimetype || 'application/octet-stream',
      size_bytes: size,
    };
  });
  const { error: insertError } = await client
    .from('application_files')
    .insert(rows);
  if (insertError) throw insertError;
}
