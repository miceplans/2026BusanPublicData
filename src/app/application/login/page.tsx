'use client';
import { FormEvent, useState } from 'react';
import { ContestHeader, fieldClass } from '@/components/contest-header';
import { useToast } from '@/components/toast';
export default function Page() {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/application/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: f.get('teamName'),
          password: f.get('password'),
        }),
      });
      const v = await r.json();
      if (!r.ok) {
        showToast(v.error ?? '확인하지 못했습니다.');
        return;
      }
      location.href = '/application';
    } catch {
      showToast('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="service-page">
      <ContestHeader />
      <div className="motion-page mx-auto max-w-[520px] px-5 py-14 sm:py-20">
        <h1 className="text-3xl font-extrabold tracking-[-0.04em]">
          신청 확인·수정
        </h1>
        <p className="mt-3 text-[15px] text-[#6b7684]">
          신청할 때 입력한 팀명과 비밀번호를 입력해 주세요.
        </p>
        <form
          onSubmit={submit}
          className="service-card motion-card mt-8 flex flex-col gap-5 rounded-2xl p-6 sm:p-8"
        >
          <Field name="teamName" label="팀명" />
          <Field name="password" label="신청 비밀번호" type="password" />
          <button
            disabled={busy}
            aria-busy={busy}
            className="brand-gradient motion-control min-h-14 rounded-[8px] p-4 font-bold text-white disabled:bg-[#b0b8c1]"
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
