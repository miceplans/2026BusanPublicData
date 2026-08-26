'use client';
import { FormEvent } from 'react';
import { ContestHeader, fieldClass } from '@/components/contest-header';
import { useToast } from '@/components/toast';
export default function Page() {
  const { showToast } = useToast();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: f.get('email'),
          password: f.get('password'),
        }),
      });
      const v = await r.json();
      if (!r.ok) {
        showToast(v.error ?? '로그인하지 못했습니다.');
        return;
      }
      location.href = '/admin/applications';
    } catch {
      showToast('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }
  return (
    <div>
      <ContestHeader helper="운영 담당자 전용" />
      <form
        onSubmit={submit}
        className="motion-page motion-card mx-auto my-12 flex max-w-[480px] flex-col gap-5 rounded-2xl border p-7"
      >
        <h1 className="text-3xl font-bold">관리자 로그인</h1>
        <input
          aria-label="관리자 이메일"
          required
          name="email"
          type="email"
          className={fieldClass}
        />
        <input
          aria-label="비밀번호"
          required
          name="password"
          type="password"
          className={fieldClass}
        />
        <button className="motion-control rounded-[10px] bg-[#1b4292] p-4 font-bold text-white hover:bg-[#153675]">
          로그인
        </button>
      </form>
    </div>
  );
}
