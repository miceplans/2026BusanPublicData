import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, validationError } from '@/lib/http';
import { consumeRateLimit, requestClientKey } from '@/lib/rate-limit';
import { FILE_BUCKET } from '@/lib/files';
import { bulkDownloadSchema } from '@/validations';

type FileRow = {
  object_key: string;
  original_name: string;
  size_bytes: number | string;
  created_at: string;
  applications: {
    receipt_number: string;
    team_name: string;
    participation_type: string;
  } | null;
};

const UNSAFE_CODES = new Set<number>(
  Array.from({ length: 0x20 }, (_, code) => code),
);
UNSAFE_CODES.add(0x7f);
for (const char of '\\/:*?"<>|') UNSAFE_CODES.add(char.charCodeAt(0));

function sanitizeSegment(raw: string, fallback: string, maxLength: number) {
  const cleaned = [...raw]
    .map((char) => (UNSAFE_CODES.has(char.charCodeAt(0)) ? '_' : char))
    .join('')
    .replace(/\.\.+/g, '_')
    .replace(/^\.+|\.+$/g, '')
    .trim()
    .slice(0, maxLength)
    .trimEnd();
  return cleaned || fallback;
}

function dedupeName(name: string, used: Set<string>) {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const dotIndex = name.lastIndexOf('.');
  const base = dotIndex > 0 ? name.slice(0, dotIndex) : name;
  const extension = dotIndex > 0 ? name.slice(dotIndex) : '';
  let candidate = name;
  for (let count = 2; used.has(candidate); count += 1) {
    candidate = `${base} (${count})${extension}`;
  }
  used.add(candidate);
  return candidate;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return jsonError('관리자 로그인이 필요합니다.', 401);

  const parsed = bulkDownloadSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return validationError(parsed.error);

  const limit = await consumeRateLimit(
    'admin_files_bulk_export',
    requestClientKey(request),
    30,
    3600,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          '일괄 다운로드 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const db = createAdminClient();
  let query = db
    .from('application_files')
    .select(
      'object_key,original_name,size_bytes,created_at,applications!inner(receipt_number,team_name,participation_type)',
    )
    .order('application_id', { ascending: true })
    .order('created_at', { ascending: true });
  if (parsed.data.keys?.length)
    query = query.in('object_key', parsed.data.keys);
  const { data: rows, error } = await query;
  if (error) return jsonError('파일 목록을 불러올 수 없습니다.', 500);

  const files = (rows ?? []) as unknown as FileRow[];
  if (!files.length) return jsonError('다운로드할 증빙자료가 없습니다.', 404);

  files.sort((a, b) => {
    const byReceipt = (a.applications?.receipt_number ?? '').localeCompare(
      b.applications?.receipt_number ?? '',
      'ko-KR',
    );
    return byReceipt || a.created_at.localeCompare(b.created_at);
  });

  const groups = new Map<string, FileRow[]>();
  for (const row of files) {
    const key = row.applications?.receipt_number ?? '';
    const bucket = groups.get(key);
    if (bucket) bucket.push(row);
    else groups.set(key, [row]);
  }

  const usedFolders = new Set<string>();
  const entries: {
    objectKey: string;
    zipPath: string;
    sizeBytes: number;
    receiptNumber: string;
    teamName: string;
    originalName: string;
  }[] = [];
  for (const [receiptNumber, items] of groups) {
    const team = sanitizeSegment(
      items[0].applications?.team_name ?? '',
      '팀명없음',
      60,
    );
    const type = sanitizeSegment(
      items[0].applications?.participation_type ?? '',
      '유형없음',
      20,
    );
    const base = `${type}_${team}`;
    let folder = base;
    let suffix = 2;
    while (usedFolders.has(folder)) folder = `${base}_${suffix++}`;
    usedFolders.add(folder);
    const usedNames = new Set<string>();
    items.forEach((item) => {
      const name = dedupeName(
        sanitizeSegment(item.original_name, 'file', 120),
        usedNames,
      );
      entries.push({
        objectKey: item.object_key,
        zipPath: `${folder}/${name}`,
        sizeBytes: Number(item.size_bytes) || 0,
        receiptNumber,
        teamName: items[0].applications?.team_name ?? '',
        originalName: item.original_name,
      });
    });
  }

  const { data: signed, error: signError } = await db.storage
    .from(FILE_BUCKET)
    .createSignedUrls(
      entries.map((entry) => entry.objectKey),
      3600,
    );
  if (signError) return jsonError('다운로드 주소를 발급할 수 없습니다.', 500);
  const signedUrlByPath = new Map(
    (signed ?? []).map((item) => [item.path, item.signedUrl]),
  );

  await db.from('admin_audit_logs').insert({
    admin_user_id: admin.user.id,
    action: 'files_bulk_export',
    target_type: 'application_files',
    change_summary: {
      file_count: entries.length,
      total_bytes: entries.reduce((sum, entry) => sum + entry.sizeBytes, 0),
      filtered: Boolean(parsed.data.keys?.length),
    },
  });

  return NextResponse.json({
    ok: true,
    expiresInSeconds: 3600,
    files: entries.map((entry) => ({
      objectKey: entry.objectKey,
      zipPath: entry.zipPath,
      signedUrl: signedUrlByPath.get(entry.objectKey) ?? null,
      sizeBytes: entry.sizeBytes,
      receiptNumber: entry.receiptNumber,
      teamName: entry.teamName,
      originalName: entry.originalName,
    })),
  });
}
