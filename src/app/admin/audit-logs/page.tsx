'use client';
import { useEffect, useState } from 'react';
import { ContestHeader } from '@/components/contest-header';
import { useToast } from '@/components/toast';
import { formatKoreanDateTime } from '@/lib/date-format';
type Log = {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  change_summary: unknown;
  created_at: string;
};
export default function Page() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<Log[]>([]);
  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then(async (r) => {
        if (r.status === 401) {
          location.href = '/admin/login';
          return null;
        }
        const value = await r.json();
        if (!r.ok) {
          showToast(value.error ?? '작업 이력을 불러오지 못했습니다.');
          return null;
        }
        return value;
      })
      .then((v) => v && setLogs(v.items))
      .catch(() =>
        showToast('네트워크 오류로 작업 이력을 불러오지 못했습니다.'),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <ContestHeader actionLabel="신청 목록" actionHref="/admin/applications" />
      <main className="motion-page mx-auto max-w-[1000px] px-5 py-8">
        <h1 className="text-3xl font-bold">관리자 작업 이력</h1>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left">시각</th>
                <th className="p-3 text-left">작업</th>
                <th className="p-3 text-left">대상</th>
                <th className="p-3 text-left">변경 요약</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((v) => (
                <tr className="motion-row" key={v.id}>
                  <td className="border-t border-[#eee] p-3">
                    {formatKoreanDateTime(v.created_at)}
                  </td>
                  <td className="border-t border-[#eee] p-3">{v.action}</td>
                  <td className="border-t border-[#eee] p-3">
                    {v.target_type} {v.target_id}
                  </td>
                  <td className="border-t border-[#eee] p-3">
                    <code>{JSON.stringify(v.change_summary)}</code>
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
