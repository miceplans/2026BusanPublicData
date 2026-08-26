'use client';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ContestHeader } from '@/components/contest-header';
import { useToast } from '@/components/toast';
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
export default function Page() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const load = useCallback(() => {
    const q = new URLSearchParams({ search });
    fetch(`/api/admin/applications?${q}`)
      .then(async (r) => {
        if (r.status === 401) {
          location.href = '/admin/login';
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
  }, [search]);
  useEffect(load, [load]);
  async function patch(id: string, body: unknown) {
    try {
      const r = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const v = await r.json();
      if (!r.ok) {
        showToast(v.error ?? '변경하지 못했습니다.');
        return;
      }
      setMessage('변경했습니다.');
      load();
    } catch {
      showToast('네트워크 오류로 변경하지 못했습니다. 다시 시도해주세요.');
    }
  }
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const file = f.get('file');
    if (!(file instanceof File)) return;
    setExcelFile(file);
    f.set('mode', 'preview');
    try {
      const r = await fetch('/api/admin/excel/import', {
        method: 'POST',
        body: f,
      });
      const v = await r.json();
      if (!r.ok) {
        showToast(v.error ?? '엑셀 검증에 실패했습니다.');
        setPreviewReady(false);
        return;
      }
      setMessage(
        `미리보기: ${v.preview.map((x: { row: number; type: string }) => `${x.row}행 ${x.type}`).join(', ')}`,
      );
      setPreviewReady(
        !v.preview.some((x: { type: string }) => x.type === '오류'),
      );
    } catch {
      showToast('네트워크 오류로 엑셀 검증에 실패했습니다. 다시 시도해주세요.');
      setPreviewReady(false);
    }
  }
  async function applyExcel() {
    if (
      !excelFile ||
      !confirm('미리보기의 변경사항을 실제 신청 데이터에 반영하시겠습니까?')
    )
      return;
    const body = new FormData();
    body.set('file', excelFile);
    body.set('mode', 'apply');
    try {
      const r = await fetch('/api/admin/excel/import', {
        method: 'POST',
        body,
      });
      const v = await r.json();
      if (!r.ok) {
        showToast(v.error ?? '엑셀 반영에 실패했습니다.');
        return;
      }
      setMessage(`${v.result.updated}건을 반영했습니다.`);
      setPreviewReady(false);
      load();
    } catch {
      showToast('네트워크 오류로 엑셀 반영에 실패했습니다. 다시 시도해주세요.');
    }
  }
  return (
    <div>
      <ContestHeader
        helper={`관리자 신청 목록 · ${total}건`}
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
            placeholder="팀명, 대표자, 연락처 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 min-w-64 flex-1 rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-sm text-[#111] outline-none placeholder:text-[#b9b9b9] focus:border-[#0053b9] focus:ring-2 focus:ring-[#0053b9]/10"
          />
          <a
            href="/api/admin/excel/export"
            className="motion-control inline-flex h-11 items-center justify-center rounded-[10px] border border-[#e5e5e5] px-4 text-sm font-bold text-[#111] hover:bg-[#f7f7f7]"
          >
            엑셀 다운로드
          </a>
          <Link
            href="/admin/audit-logs"
            className="motion-control inline-flex h-11 items-center justify-center rounded-[10px] border border-[#e5e5e5] px-4 text-sm font-bold text-[#111] hover:bg-[#f7f7f7]"
          >
            작업 이력
          </Link>
        </div>
        <form
          onSubmit={upload}
          className="mt-4 flex flex-wrap items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-[#f7f8fa] p-3"
        >
          <input
            required
            name="file"
            type="file"
            accept=".xlsx"
            className="text-sm"
          />
          <button className="motion-control h-11 rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-bold text-[#111] hover:bg-[#f5f5f5]">
            엑셀 검증·미리보기
          </button>
        </form>
        {previewReady && (
          <button
            onClick={applyExcel}
            className="motion-control mt-3 rounded-[10px] bg-[#1b4292] px-4 py-3 text-sm font-bold text-white hover:bg-[#153675]"
          >
            확인 후 엑셀 반영
          </button>
        )}
        {message && (
          <p className="motion-feedback mt-4 text-sm text-[#666]">{message}</p>
        )}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead>
              <tr className="bg-[#1b4292] text-white">
                {[
                  '접수번호',
                  '팀명/대표자',
                  '참가유형',
                  '분야',
                  '신청일',
                  '증빙',
                  '비밀번호',
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
                    colSpan={7}
                    className="p-10 text-center text-sm text-[#999]"
                  >
                    신청 내역이 없습니다.
                  </td>
                </tr>
              )}
              {items.map((x) => (
                <tr
                  className="motion-row border-b border-[#eee] last:border-b-0"
                  key={x.id}
                >
                  <td className="p-3 pl-4 font-mono text-xs whitespace-nowrap text-[#666]">
                    <Link
                      className="font-bold text-[#0053b9] underline decoration-[#0053b9]/30 underline-offset-2 hover:decoration-[#0053b9]"
                      href={`/admin/applications/${x.id}`}
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
                  <td className="p-3 whitespace-nowrap text-[#666]">
                    {new Date(x.created_at).toLocaleString('ko-KR')}
                  </td>
                  <td className="p-3 text-center text-[#333]">
                    {x.application_files?.[0]?.count ?? 0}
                  </td>
                  <td className="p-3 pr-4">
                    <button
                      className="motion-control rounded-[10px] border border-[#e5e5e5] px-3 py-2 text-xs font-bold whitespace-nowrap text-[#111] hover:bg-[#eef4fb]"
                      onClick={() => {
                        const p = prompt(
                          '새 비밀번호를 입력하세요. 비우면 자동 생성합니다.',
                        );
                        if (p === null) return;
                        const generated =
                          p || `${crypto.randomUUID().slice(0, 8)}!A1`;
                        patch(x.id, { password: generated });
                        if (!p) alert(`새 비밀번호: ${generated}`);
                      }}
                    >
                      초기화
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
