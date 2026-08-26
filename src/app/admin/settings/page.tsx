'use client';
import { FormEvent, useEffect, useState } from 'react';
import { ContestHeader, fieldClass } from '@/components/contest-header';
import type { SiteSettings } from '@/types';
export default function Page() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(async (r) => {
        if (r.status === 401) {
          location.href = '/admin/login';
          return null;
        }
        return r.json();
      })
      .then((v) => v && setS(v.settings));
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!s) return;
    const r = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    });
    const v = await r.json();
    setMsg(r.ok ? '운영 설정을 저장했습니다.' : v.error);
  }
  if (!s) return <p className="motion-feedback p-8">불러오는 중…</p>;
  return (
    <div>
      <ContestHeader
        helper="Asia/Seoul 기준"
        actionLabel="신청 목록"
        actionHref="/admin/applications"
      />
      <form
        onSubmit={submit}
        className="motion-page mx-auto flex max-w-[760px] flex-col gap-5 px-5 py-8"
      >
        <h1 className="text-3xl font-bold">운영 설정</h1>
        <Check
          label="사이트 공개"
          value={s.is_public}
          set={(v) => setS({ ...s, is_public: v })}
        />
        <Check
          label="신청 수정 허용"
          value={s.editing_enabled}
          set={(v) => setS({ ...s, editing_enabled: v })}
        />
        {(
          [
            'completion_message',
            'contact',
            'completion_email_body',
            'evidence_label',
            'evidence_purpose',
            'privacy_retention_policy',
          ] as const
        ).map((k) => (
          <label key={k} className="text-sm font-bold">
            {k}
            <textarea
              className="mt-2 min-h-20 w-full rounded-lg border p-3 font-normal"
              value={s[k] ?? ''}
              onChange={(e) => setS({ ...s, [k]: e.target.value || null })}
            />
          </label>
        ))}
        {(
          [
            'item_summary_max_length',
            'evidence_max_files',
            'evidence_max_bytes',
          ] as const
        ).map((k) => (
          <label key={k} className="text-sm font-bold">
            {k}
            <input
              className={`${fieldClass} mt-2`}
              type="number"
              value={s[k] ?? ''}
              onChange={(e) =>
                setS({
                  ...s,
                  [k]: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </label>
        ))}
        {msg && <p className="motion-feedback">{msg}</p>}
        <button className="motion-control rounded-lg bg-[#1b4292] p-4 font-bold text-white hover:bg-[#153675]">
          설정 저장
        </button>
      </form>
    </div>
  );
}
function Check({
  label,
  value,
  set,
}: {
  label: string;
  value: boolean;
  set: (v: boolean) => void;
}) {
  return (
    <label className="flex gap-3">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => set(e.target.checked)}
      />
      {label}
    </label>
  );
}
