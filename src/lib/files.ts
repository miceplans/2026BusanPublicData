import 'server-only';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';

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
export function validateFiles(files: File[]) {
  if (!files.length) return;
  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!types[file.type]?.includes(ext))
      throw new Error('JPG, JPEG, PNG, WEBP 이미지만 첨부할 수 있습니다.');
    if (file.size <= 0) throw new Error('빈 파일은 첨부할 수 없습니다.');
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
