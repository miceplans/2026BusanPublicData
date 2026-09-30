'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ContestHeader } from '@/components/contest-header';
import { useToast } from '@/components/toast';
import { formatKoreanDateTime } from '@/lib/date-format';
import { isLateApplication } from '@/lib/application-deadline';
import { BulkExportError, runFileBulkExport } from '@/lib/file-bulk-export';
type Row = {
  id: string;
  receipt_number: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  participation_type: string;
  industry: string;
  created_at: string;
  application_files: { count: number }[];
};
const PAGE_SIZE = 50;
export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const handleBulkDownload = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    setExportProgress('목록 준비 중…');
    try {
      const result = await runFileBulkExport((progress) => {
        if (progress.phase === 'preparing' || !progress.total) {
          setExportProgress('목록 준비 중…');
          return;
        }
        const percent =
          progress.totalBytes > 0
            ? Math.min(
                100,
                Math.round((progress.bytesDone / progress.totalBytes) * 100),
              )
            : Math.round((progress.completed / progress.total) * 100);
        setExportProgress(
          `${progress.completed}/${progress.total} · ${percent}%`,
        );
      });
      if (!result) {
        showToast('일괄 다운로드를 취소했습니다.');
      } else if (result.failedCount > 0) {
        showToast(
          `일괄 다운로드 완료: ${result.fileCount}건 (실패 ${result.failedCount}건은 ZIP 내 내역 참고)`,
        );
      } else {
        showToast(`일괄 다운로드 완료: ${result.fileCount}건`);
      }
    } catch (error) {
      if (error instanceof BulkExportError && error.status === 401) {
        router.push('/admin/login');
        return;
      }
      showToast(
        error instanceof Error
          ? error.message
          : '일괄 다운로드에 실패했습니다.',
      );
    } finally {
      setExporting(false);
      setExportProgress('');
    }
  }, [exporting, router, showToast]);
  const load = useCallback(() => {
    const q = new URLSearchParams({
      search,
      page: String(page),
      size: String(PAGE_SIZE),
    });
    fetch(`/api/admin/applications?${q}`)
      .then(async (r) => {
        if (r.status === 401) {
          router.push('/admin/login');
          return null;
        }
        const v = await r.json();
        if (!r.ok) {
          showToast(v.error ?? '목록을 불러오지 못했습니다.');
          return null;
        }
        return v;
      })
      .then((v) => {
        if (v) {
          setItems(v.items);
          setTotal(v.total);
        }
      })
      .catch(() => showToast('네트워크 오류로 목록을 불러오지 못했습니다.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);
  useEffect(load, [load]);
  return (
    <div>
      <ContestHeader
        helper={`관리자 신청 목록 · ${total}건`}
        links={[{ label: '자주 묻는 질문', href: '/admin/faq' }]}
        actionLabel="운영 설정"
        actionHref="/admin/settings"
      />
      <main className="motion-page mx-auto max-w-[1280px] px-5 py-8">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#111]">
          신청 목록
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            aria-label="검색"
            placeholder="팀명, 팀장, 연락처 검색"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-11 min-w-64 flex-1 rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-sm text-[#111] outline-none placeholder:text-[#b9b9b9] focus:border-[#35c1de] focus:ring-2 focus:ring-[#35c1de]/10"
          />
          <a
            href="/api/admin/excel/export"
            className="motion-control inline-flex h-11 items-center justify-center rounded-[10px] border border-[#e5e5e5] px-4 text-sm font-bold text-[#111] hover:bg-[#f7f7f7]"
          >
            엑셀 다운로드
          </a>
          <button
            type="button"
            onClick={handleBulkDownload}
            disabled={exporting}
            className="motion-control inline-flex h-11 items-center justify-center rounded-[10px] border border-[#e5e5e5] px-4 text-sm font-bold text-[#111] hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? `다운로드 중 ${exportProgress}` : '증빙 일괄 다운로드'}
          </button>
          <Link
            href="/admin/audit-logs"
            className="motion-control inline-flex h-11 items-center justify-center rounded-[10px] border border-[#e5e5e5] px-4 text-sm font-bold text-[#111] hover:bg-[#f7f7f7]"
          >
            작업 이력
          </Link>
          <Link
            href="/admin/signup"
            className="motion-control inline-flex h-11 items-center justify-center rounded-[10px] border border-[#e5e5e5] px-4 text-sm font-bold text-[#111] hover:bg-[#f7f7f7]"
          >
            관리자 추가
          </Link>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead>
              <tr className="brand-gradient text-white">
                {[
                  '접수번호',
                  '팀명/팀장',
                  '참가유형',
                  '분야',
                  '신청일',
                  '증빙',
                ].map((x) => (
                  <th
                    className="p-3 text-xs font-bold tracking-wide whitespace-nowrap first:pl-4 last:pr-4"
                    key={x}
                  >
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-sm text-[#999]"
                  >
                    신청 내역이 없습니다.
                  </td>
                </tr>
              )}
              {items.map((x) => (
                <tr
                  className="motion-row cursor-pointer border-b border-[#eee] last:border-b-0 hover:bg-[#f7f8fa]"
                  key={x.id}
                  onClick={() => router.push(`/admin/applications/${x.id}`)}
                >
                  <td className="p-3 pl-4 font-mono text-xs whitespace-nowrap text-[#666]">
                    <Link
                      className="font-bold text-[#176f9f] underline decoration-[#35c1de]/30 underline-offset-2 hover:decoration-[#35c1de]"
                      href={`/admin/applications/${x.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {x.receipt_number}
                    </Link>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-[#111]">{x.team_name}</div>
                    <div className="mt-0.5 text-xs text-[#666]">
                      {x.leader_name} · {x.leader_phone}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap text-[#333]">
                    {x.participation_type}
                  </td>
                  <td className="p-3 whitespace-nowrap text-[#333]">
                    {x.industry}
                  </td>
                  {isLateApplication(x.created_at) ? (
                    <td className="p-3 font-semibold whitespace-nowrap text-red-600">
                      지각 {formatKoreanDateTime(x.created_at)}
                    </td>
                  ) : (
                    <td className="p-3 whitespace-nowrap text-[#666]">
                      {formatKoreanDateTime(x.created_at)}
                    </td>
                  )}
                  <td className="p-3 text-center text-[#333]">
                    {x.application_files?.[0]?.count ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <nav
            aria-label="페이지 이동"
            className="mt-5 flex items-center justify-center gap-2 text-sm"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="motion-control inline-flex h-9 items-center justify-center rounded-[10px] border border-[#e5e5e5] px-3 font-bold text-[#111] hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40"
            >
              이전
            </button>
            <span className="px-2 text-[#666]" aria-live="polite">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="motion-control inline-flex h-9 items-center justify-center rounded-[10px] border border-[#e5e5e5] px-3 font-bold text-[#111] hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40"
            >
              다음
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}
