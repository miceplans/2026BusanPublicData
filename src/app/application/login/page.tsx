'use client';
import { FormEvent, useState } from 'react';
import { ContestHeader, fieldClass } from '@/components/contest-header';
export default function Page() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const r = await fetch('/api/application/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamName: f.get('teamName'),
        password: f.get('password'),
      }),
    });
    const v = await r.json();
    setBusy(false);
    if (!r.ok) return setMessage(v.error);
    location.href = '/application';
  }
  return (
    <div>
      <ContestHeader />
      <div className="motion-page mx-auto max-w-[520px] px-5 py-12">
        <h1 className="text-3xl font-bold">신청 확인·수정</h1>
        <form
          onSubmit={submit}
          className="motion-card mt-8 flex flex-col gap-5 rounded-2xl border p-6"
        >
          <Field name="teamName" label="팀명" />
          <Field name="password" label="신청 비밀번호" type="password" />
          {message && (
            <p role="alert" className="motion-feedback text-sm text-red-700">
              {message}
            </p>
          )}
          <button
            disabled={busy}
            aria-busy={busy}
            className="motion-control rounded-[10px] bg-[#1b4292] p-4 font-bold text-white hover:bg-[#153675] disabled:hover:bg-[#1b4292]"
          >
            {busy ? '확인 중…' : '접수 내용 확인'}
          </button>
          <p className="text-sm text-[#666]">
            비밀번호를 분실한 경우 운영사무국에 문의해 주세요.
          </p>
        </form>
      </div>
    </div>
  );
}
function Field({
  name,
  label,
  type = 'text',
}: {
  name: string;
  label: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold">{label}</span>
      <input required name={name} type={type} className={fieldClass} />
    </label>
  );
}
