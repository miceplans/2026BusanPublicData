import 'server-only';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_DIMENSION = 2000;

async function compressImage(buffer: Buffer, mimeType: string) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType))
    return buffer;
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

export function validateFiles(files: File[]) {
  for (const file of files) {
    if (file.size <= 0) throw new Error('빈 파일은 첨부할 수 없습니다.');
  }
}
export async function uploadFiles(applicationId: string, files: File[]) {
  const client = createAdminClient();
  const uploaded: string[] = [];
  for (const file of files) {
    const extensionMatch = file.name.match(/\.([^./\\]+)$/);
    const ext = extensionMatch?.[1].toLowerCase() ?? '';
    const objectKey = `${applicationId}/${randomUUID()}${ext ? `.${ext}` : ''}`;
    const compressed = await compressImage(
      Buffer.from(await file.arrayBuffer()),
      file.type,
    );
    const { error } = await client.storage
      .from('application-files')
      .upload(objectKey, compressed, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
    if (error) throw error;
    uploaded.push(objectKey);
    const { error: metaError } = await client.from('application_files').insert({
      application_id: applicationId,
      object_key: objectKey,
      original_name: file.name,
      extension: ext,
      mime_type: file.type || 'application/octet-stream',
      size_bytes: compressed.byteLength,
    });
    if (metaError) throw metaError;
  }
  return uploaded;
}
