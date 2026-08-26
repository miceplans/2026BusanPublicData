'use client';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ContestHeader } from '@/components/contest-header';
import { APPLICATION_STATUSES } from '@/types';
type Row = {
  id: string;
  receipt_number: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  participation_type: string;
  industry: string;
  status: string;
  created_at: string;
  application_files: { count: number }[];
};
export default function Page() {
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const load = useCallback(() => {
    const q = new URLSearchParams({ search, status });
    fetch(`/api/admin/applications?${q}`)
      .then(async (r) => {
        if (r.status === 401) {
          location.href = '/admin/login';
          return null;
        }
        return r.json();
      })
      .then((v) => {
        if (v) {
          setItems(v.items);
          setTotal(v.total);
        }
      });
  }, [search, status]);
  useEffect(load, [load]);
  async function patch(id: string, body: unknown) {
    const r = await fetch(`/api/admin/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const v = await r.json();
    setMessage(r.ok ? '변경했습니다.' : v.error);
    if (r.ok) load();
  }
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const file = f.get('file');
    if (!(file instanceof File)) return;
    setExcelFile(file);
    f.set('mode', 'preview');
    const r = await fetch('/api/admin/excel/import', {
      method: 'POST',
      body: f,
    });
    const v = await r.json();
    setMessage(
      r.ok
        ? `미리보기: ${v.preview.map((x: { row: number; type: string }) => `${x.row}행 ${x.type}`).join(', ')}`
        : v.error,
    );
    setPreviewReady(
      r.ok && !v.preview.some((x: { type: string }) => x.type === '오류'),
    );
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
    const r = await fetch('/api/admin/excel/import', { method: 'POST', body });
    const v = await r.json();
    setMessage(r.ok ? `${v.result.updated}건을 반영했습니다.` : v.error);
    if (r.ok) {
      setPreviewReady(false);
      load();
    }
  }
  return (
    <div>
      <ContestHeader
        helper={`관리자 신청 목록 · ${total}건`}
        actionLabel="운영 설정"
        actionHref="/admin/settings"
      />
      <main className="motion-page px-5 py-8">
        <div className="flex flex-wrap gap-3">
          <input
            aria-label="검색"
            placeholder="팀명, 대표자, 연락처 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 min-w-64 rounded-lg border px-3"
          />
          <select
            aria-label="접수 상태"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-lg border px-3"
          >
            <option value="">전체 상태</option>
            {APPLICATION_STATUSES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <a
            href="/api/admin/excel/export"
            className="rounded-lg border px-4 py-3"
          >
            엑셀 다운로드
          </a>
          <Link
            href="/admin/audit-logs"
            className="rounded-lg border px-4 py-3"
          >
            작업 이력
          </Link>
        </div>
        <form onSubmit={upload} className="mt-4 flex flex-wrap gap-2">
          <input required name="file" type="file" accept=".xlsx" />
          <button className="motion-control rounded-lg border px-3 hover:bg-[#f5f5f5]">
            엑셀 검증·미리보기
          </button>
        </form>
        {previewReady && (
          <button
            onClick={applyExcel}
            className="motion-control mt-3 rounded-lg bg-[#1b4292] px-4 py-3 font-bold text-white hover:bg-[#153675]"
          >
            확인 후 엑셀 반영
          </button>
        )}
        {message && <p className="motion-feedback mt-4 text-sm">{message}</p>}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead>
              <tr>
                {[
                  '접수번호',
                  '팀명/대표자',
                  '참가유형',
                  '분야',
                  '신청일',
                  '증빙',
                  '상태',
                  '비밀번호',
                ].map((x) => (
                  <th className="border-b p-3" key={x}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr className="motion-row" key={x.id}>
                  <td className="border-b p-3">
                    <Link
                      className="underline"
                      href={`/admin/applications/${x.id}`}
                    >
                      {x.receipt_number}
                    </Link>
                  </td>
                  <td className="border-b p-3">
                    <b>{x.team_name}</b>
                    <br />
                    {x.leader_name} · {x.leader_phone}
                  </td>
                  <td className="border-b p-3">{x.participation_type}</td>
                  <td className="border-b p-3">{x.industry}</td>
                  <td className="border-b p-3">
                    {new Date(x.created_at).toLocaleString('ko-KR')}
                  </td>
                  <td className="border-b p-3">
                    {x.application_files?.[0]?.count ?? 0}
                  </td>
                  <td className="border-b p-3">
                    <select
                      value={x.status}
                      onChange={(e) => patch(x.id, { status: e.target.value })}
                    >
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border-b p-3">
                    <button
                      className="motion-control rounded-lg px-3 py-2 hover:bg-[#eef4fb]"
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
