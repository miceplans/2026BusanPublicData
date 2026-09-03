'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
  const router = useRouter();
  const { showToast } = useToast();
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
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
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 min-w-64 flex-1 rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-sm text-[#111] outline-none placeholder:text-[#b9b9b9] focus:border-[#35c1de] focus:ring-2 focus:ring-[#35c1de]/10"
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
                  <td className="p-3 whitespace-nowrap text-[#666]">
                    {new Date(x.created_at).toLocaleString('ko-KR')}
                  </td>
                  <td className="p-3 text-center text-[#333]">
                    {x.application_files?.[0]?.count ?? 0}
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
