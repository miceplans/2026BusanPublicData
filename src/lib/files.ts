import 'server-only';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SiteSettings } from '@/types';

const MAX_DIMENSION = 2000;

async function compressImage(buffer: Buffer, mimeType: string) {
  if (!mimeType.startsWith('image/')) return buffer;
  const image = sharp(buffer).rotate().resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: 'inside',
    withoutEnlargement: true,
  });
  switch (mimeType) {
    case 'image/png':
      return image.png({ quality: 80, compressionLevel: 9 }).toBuffer();
    case 'image/webp':
      return image.webp({ quality: 80 }).toBuffer();
    default:
      return image.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  }
}

const types: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
};
export function validateFiles(files: File[], settings: SiteSettings) {
  if (!files.length) return;
  if (
    !settings.evidence_max_files ||
    !settings.evidence_max_bytes ||
    !settings.evidence_label
  )
    throw new Error('현재 증빙자료 업로드를 받지 않습니다.');
  if (files.length > settings.evidence_max_files)
    throw new Error(
      `증빙자료는 최대 ${settings.evidence_max_files}개까지 첨부할 수 있습니다.`,
    );
  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!types[file.type]?.includes(ext))
      throw new Error('JPG, JPEG, PNG, WEBP 이미지만 첨부할 수 있습니다.');
    if (file.size <= 0 || file.size > settings.evidence_max_bytes)
      throw new Error('파일 용량 제한을 확인해 주세요.');
  }
}
export async function uploadFiles(applicationId: string, files: File[]) {
  const client = createAdminClient();
  const uploaded: string[] = [];
  for (const file of files) {
    const ext = file.name.split('.').pop()!.toLowerCase();
    const objectKey = `${applicationId}/${randomUUID()}.${ext}`;
    const compressed = await compressImage(
      Buffer.from(await file.arrayBuffer()),
      file.type,
    );
    const { error } = await client.storage
      .from('application-files')
      .upload(objectKey, compressed, {
        contentType: file.type,
        upsert: false,
      });
    if (error) throw error;
    uploaded.push(objectKey);
    const { error: metaError } = await client.from('application_files').insert({
      application_id: applicationId,
      object_key: objectKey,
      original_name: file.name.slice(0, 255),
      extension: ext,
      mime_type: file.type,
      size_bytes: compressed.byteLength,
    });
    if (metaError) throw metaError;
  }
  return uploaded;
}
