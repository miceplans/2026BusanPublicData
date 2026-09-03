'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ContestHeader } from '@/components/contest-header';
import { useToast } from '@/components/toast';
type Detail = Record<string, unknown> & {
  receipt_number: string;
  team_name: string;
  leader_name: string;
  leader_org: string;
  leader_email: string;
  leader_phone: string;
  leader_birth_date: string;
  leader_gender: string;
  leader_residence: string;
  participation_type: string;
  industry: string;
  information_source: string | null;
  information_source_other: string | null;
  item_name: string;
  item_summary: string;
  requests: string | null;
  created_at: string;
  updated_at: string;
  application_members: {
    id: string;
    name: string;
    role: string;
    is_leader: boolean;
    org: string;
    email: string;
    phone: string;
    birth_date: string;
    gender: string;
    residence: string;
  }[];
  application_files: {
    id: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
  }[];
  email_logs: {
    id: string;
    status: string;
    attempt_count: number;
    sent_at: string | null;
    error_summary: string | null;
  }[];
};
export default function Page() {
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Detail | null>(null);
  const [resending, setResending] = useState(false);
  const load = () =>
    fetch(`/api/admin/applications/${id}`)
      .then(async (r) => {
        if (r.status === 401) {
          location.assign('/admin/login');
          return null;
        }
        const v = await r.json();
        if (!r.ok) {
          showToast(v.error ?? '신청 정보를 불러오지 못했습니다.');
          return null;
        }
        return v;
      })
      .then((v) => v && setApp(v.application))
      .catch(() =>
        showToast('네트워크 오류로 신청 정보를 불러오지 못했습니다.'),
      );
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const resend = async () => {
    setResending(true);
    try {
      const r = await fetch(`/api/admin/applications/${id}/resend-email`, {
        method: 'POST',
      });
      if (!r.ok) {
        const value = await r.json().catch(() => null);
        showToast(value?.error ?? '재발송 요청에 실패했습니다.');
        return;
      }
      await load();
      showToast('이메일 재발송 요청을 완료했습니다.', 'success');
    } catch {
      showToast('네트워크 오류로 재발송 요청에 실패했습니다.');
    } finally {
      setResending(false);
    }
  };
  if (!app) return <p className="p-8">불러오는 중…</p>;
  return (
    <div>
      <ContestHeader actionLabel="신청 목록" actionHref="/admin/applications" />
      <main className="mx-auto max-w-[900px] px-5 py-8">
        <h1 className="text-3xl font-bold">{app.team_name}</h1>
        <p className="mt-2">{app.receipt_number}</p>
        <dl className="mt-8 grid gap-4 rounded-xl border border-[#e5e5e5] p-5 sm:grid-cols-2">
          {[
            ['팀장', app.leader_name],
            ['소속', app.leader_org],
            ['이메일', app.leader_email],
            ['연락처', app.leader_phone],
            ['생년월일', app.leader_birth_date],
            ['성별', app.leader_gender],
            ['거주지', app.leader_residence],
            ['참가유형', app.participation_type],
            ['참가분야', app.industry],
            [
              '대회 정보 습득 경로',
              app.information_source === '기타'
                ? `기타 (${app.information_source_other ?? ''})`
                : (app.information_source ?? '미입력'),
            ],
            ['아이템명', app.item_name],
            ['아이템요약', app.item_summary],
            ['요청사항', app.requests ?? ''],
          ].map(([k, v]) => (
            <div key={String(k)}>
              <dt className="text-xs text-[#666]">{String(k)}</dt>
              <dd className="mt-1 whitespace-pre-wrap">{String(v)}</dd>
            </div>
          ))}
        </dl>
        <h2 className="mt-8 text-xl font-bold">팀원</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="brand-gradient text-white">
                {[
                  '이름',
                  '소속',
                  '역할',
                  '이메일',
                  '연락처',
                  '생년월일',
                  '성별',
                  '거주지',
                  '구분',
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
              {app.application_members.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-6 text-center text-sm text-[#999]"
                  >
                    팀원 정보가 없습니다.
                  </td>
                </tr>
              )}
              {app.application_members.map((m) => (
                <tr
                  className="border-b border-[#eee] last:border-b-0"
                  key={m.id}
                >
                  <td className="p-3 pl-4 font-bold text-[#111]">{m.name}</td>
                  <td className="p-3 text-[#333]">{m.org}</td>
                  <td className="p-3 text-[#333]">{m.role}</td>
                  <td className="p-3 text-[#333]">{m.email}</td>
                  <td className="p-3 text-[#333]">{m.phone}</td>
                  <td className="p-3 text-[#333]">{m.birth_date}</td>
                  <td className="p-3 text-[#333]">{m.gender}</td>
                  <td className="p-3 text-[#333]">{m.residence}</td>
                  <td className="p-3 pr-4 text-[#666]">
                    {m.is_leader ? '팀장' : '팀원'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className="mt-8 text-xl font-bold">증빙자료</h2>
        {app.application_files.length ? (
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {app.application_files.map((f) => (
              <li
                className="overflow-hidden rounded-xl border border-[#e5e5e5]"
                key={f.id}
              >
                <a
                  className="flex min-h-52 items-center justify-center bg-[#f5f5f5] p-2"
                  href={`/api/admin/files/${f.id}`}
                  target="_blank"
                  rel="noreferrer"
                  title={`${f.original_name} 새 창에서 보기`}
                >
                  <Image
                    alt={`${f.original_name} 미리보기`}
                    className="h-auto max-h-96 w-auto object-contain"
                    height={400}
                    loading="lazy"
                    src={`/api/admin/files/${f.id}`}
                    unoptimized
                    width={640}
                  />
                </a>
                <div className="flex items-center justify-between gap-3 p-3 text-sm">
                  <span className="min-w-0 truncate" title={f.original_name}>
                    {f.original_name} ({Math.ceil(f.size_bytes / 1024)}KB)
                  </span>
                  <a
                    className="shrink-0 underline"
                    href={`/api/admin/files/${f.id}?download=1`}
                  >
                    다운로드
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-[#666]">
            제출된 증빙자료가 없습니다.
          </p>
        )}
        <h2 className="mt-8 text-xl font-bold">이메일 발송 결과</h2>
        {app.email_logs.length ? (
          app.email_logs.map((e) => (
            <p
              className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-[#e5e5e5] p-3 text-sm"
              key={e.id}
            >
              <span>
                {e.status} · 시도 {e.attempt_count}회{' '}
                {e.sent_at &&
                  `· ${new Date(e.sent_at).toLocaleString('ko-KR')}`}{' '}
                {e.error_summary && `· ${e.error_summary}`}
              </span>
              {e.status !== 'sent' && (
                <button
                  className="motion-control rounded-lg border border-[#e5e5e5] px-3 py-1 hover:bg-[#f5f5f5] disabled:opacity-50"
                  disabled={resending}
                  onClick={resend}
                >
                  {resending ? '재발송 중…' : '재시도'}
                </button>
              )}
            </p>
          ))
        ) : (
          <p className="mt-2 text-sm text-[#666]">이메일 기록이 없습니다.</p>
        )}
        <Link
          className="mt-8 inline-block underline"
          href="/admin/applications"
        >
          목록으로 돌아가기
        </Link>
      </main>
    </div>
  );
}
