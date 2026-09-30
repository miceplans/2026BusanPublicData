import { strToU8, zipSync, type Zippable } from 'fflate';

export type BulkExportProgress = {
  phase: 'preparing' | 'downloading' | 'finalizing' | 'done';
  completed: number;
  total: number;
  bytesDone: number;
  totalBytes: number;
};

export type BulkExportResult = {
  fileName: string;
  fileCount: number;
  failedCount: number;
};

type ManifestFile = {
  objectKey: string;
  zipPath: string;
  signedUrl: string | null;
  sizeBytes: number;
  receiptNumber: string;
  teamName: string;
  originalName: string;
};

type BulkDownloadResponse = {
  ok: boolean;
  expiresInSeconds: number;
  files: ManifestFile[];
};

export class BulkExportError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'BulkExportError';
  }
}

const CONCURRENCY = 4;
const LARGE_DOWNLOAD_WARN_LIMIT = 2 * 1024 * 1024 * 1024;
const EXPIRED_STATUSES = new Set([401, 403]);

function buildFileName() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';
  const stamp = `${value('year')}${value('month')}${value('day')}`;
  return `증빙자료-일괄다운로드-${stamp}.zip`;
}

function buildResultText(
  total: number,
  failures: { zipPath: string; reason: string }[],
) {
  const seoulTime = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
  const lines = [
    '증빙자료 일괄 다운로드 내역',
    `생성 시각(Asia/Seoul): ${seoulTime}`,
    `전체 파일: ${total}건`,
    `다운로드 성공: ${total - failures.length}건`,
    `다운로드 실패: ${failures.length}건`,
  ];
  if (failures.length) {
    lines.push('', '[실패 목록]');
    for (const failure of failures)
      lines.push(`- ${failure.zipPath} (${failure.reason})`);
  }
  return lines.join('\n');
}

function triggerBlobDownload(fileName: string, chunks: Uint8Array[]) {
  const blob = new Blob(chunks as BlobPart[], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function requestManifest(keys?: string[]) {
  const response = await fetch('/api/admin/files/bulk-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keys?.length ? { keys } : {}),
  });
  if (response.status === 401)
    throw new BulkExportError('관리자 로그인이 필요합니다.', 401);
  if (!response.ok) {
    const message = await response
      .json()
      .then((value: { error?: string }) => value?.error)
      .catch(() => null);
    throw new BulkExportError(
      message || '증빙자료 목록을 불러오지 못했습니다.',
      response.status,
    );
  }
  return (await response.json()) as BulkDownloadResponse;
}

export async function runFileBulkExport(
  onProgress?: (progress: BulkExportProgress) => void,
): Promise<BulkExportResult | null> {
  onProgress?.({
    phase: 'preparing',
    completed: 0,
    total: 0,
    bytesDone: 0,
    totalBytes: 0,
  });

  const manifest = await requestManifest();
  const files = manifest.files;
  const totalBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0);

  const fileName = buildFileName();
  if (
    totalBytes > LARGE_DOWNLOAD_WARN_LIMIT &&
    !window.confirm(
      `전체 용량이 ${(totalBytes / 1024 / 1024 / 1024).toFixed(1)}GB입니다. 브라우저 메모리 한계로 다운로드에 실패할 수 있습니다. 계속할까요?`,
    )
  ) {
    return null;
  }

  try {
    // Windows 탐색기는 스트리밍 ZIP(data descriptor)을 열지 못하는 경우가 있어
    // 항목 크기를 헤더에 기록하는 zipSync로 만든다. 이미지는 이미 압축된 형식이라 저장만 한다.
    const entries: Zippable = {};

    let refreshPromise: Promise<void> | null = null;
    async function refreshSignedUrls() {
      refreshPromise ??= requestManifest(files.map((file) => file.objectKey))
        .then((next) => {
          const urlByKey = new Map(
            next.files.map((file) => [file.objectKey, file.signedUrl]),
          );
          for (const file of files) {
            const url = urlByKey.get(file.objectKey);
            if (url) file.signedUrl = url;
          }
        })
        .catch(() => {})
        .finally(() => {
          refreshPromise = null;
        });
      await refreshPromise;
    }

    async function fetchOne(file: ManifestFile): Promise<Uint8Array | null> {
      if (!file.signedUrl) return null;
      try {
        let response = await fetch(file.signedUrl);
        if (EXPIRED_STATUSES.has(response.status)) {
          await refreshSignedUrls();
          if (!file.signedUrl) return null;
          response = await fetch(file.signedUrl);
        }
        if (!response.ok) return null;
        return new Uint8Array(await response.arrayBuffer());
      } catch {
        return null;
      }
    }

    // 앞으로 CONCURRENCY개까지만 미리 받아 메모리 사용을 파일 수와 무관하게 유지한다.
    const pending: (Promise<Uint8Array | null> | null)[] = files.map(
      () => null,
    );
    let cursor = 0;
    const prefetch = (index: number) => {
      while (cursor < files.length && cursor < index + CONCURRENCY) {
        pending[cursor] = fetchOne(files[cursor]);
        cursor += 1;
      }
    };

    const failures: { zipPath: string; reason: string }[] = [];
    let completed = 0;
    let bytesDone = 0;
    for (let index = 0; index < files.length; index += 1) {
      prefetch(index);
      const file = files[index];
      const data = await pending[index];
      completed += 1;
      if (data) {
        entries[file.zipPath] = [data, { level: 0 }];
        bytesDone += data.length;
      } else {
        failures.push({
          zipPath: file.zipPath,
          reason: file.signedUrl
            ? '다운로드 실패(네트워크 또는 저장소 오류)'
            : '서명 URL 발급 실패',
        });
      }
      onProgress?.({
        phase: 'downloading',
        completed,
        total: files.length,
        bytesDone,
        totalBytes,
      });
    }

    onProgress?.({
      phase: 'finalizing',
      completed,
      total: files.length,
      bytesDone,
      totalBytes,
    });
    entries['_다운로드_내역.txt'] = strToU8(
      buildResultText(files.length, failures),
    );
    triggerBlobDownload(fileName, [zipSync(entries)]);

    onProgress?.({
      phase: 'done',
      completed,
      total: files.length,
      bytesDone,
      totalBytes,
    });
    return {
      fileName,
      fileCount: files.length - failures.length,
      failedCount: failures.length,
    };
  } catch (error) {
    if (error instanceof BulkExportError) throw error;
    throw new BulkExportError('일괄 다운로드 중 오류가 발생했습니다.');
  }
}
