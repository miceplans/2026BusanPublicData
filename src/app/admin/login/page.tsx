'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ContestHeader, fieldClass } from '@/components/contest-header';
import { useToast } from '@/components/toast';
export default function Page() {
  const { showToast } = useToast();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
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
      router.push('/admin/applications');
    } catch {
      showToast('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="service-page">
      <ContestHeader helper="운영 담당자 전용" />
      <form
        onSubmit={submit}
        autoComplete="on"
        className="service-card motion-page motion-card mx-auto my-12 flex max-w-[480px] flex-col gap-5 rounded-2xl p-7 sm:my-20 sm:p-8"
      >
        <h1 className="text-3xl font-extrabold tracking-[-0.04em]">
          관리자 로그인
        </h1>
        <label className="flex flex-col gap-2 text-sm font-bold">
          관리자 이메일
          <input
            required
            name="email"
            type="email"
            autoComplete="username"
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-bold">
          비밀번호
          <input
            required
            name="password"
            type="password"
            autoComplete="current-password"
            className={fieldClass}
          />
        </label>
        <button
          disabled={pending}
          className="brand-gradient motion-control min-h-14 rounded-[8px] p-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? '로그인 중…' : '로그인'}
        </button>
        <p className="text-center text-sm text-[#6b7684]">
          관리자 계정이 없나요?{' '}
          <Link
            href="/admin/signup"
            className="font-bold text-[#176f9f] underline underline-offset-4"
          >
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}
