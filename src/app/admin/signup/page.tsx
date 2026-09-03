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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
          passwordConfirm: form.get('passwordConfirm'),
        }),
      });
      const value = await response.json();
      if (!response.ok) {
        showToast(value.error ?? '회원가입하지 못했습니다.');
        return;
      }
      showToast('관리자 계정이 생성되었습니다. 로그인해 주세요.', 'success');
      router.push('/admin/login');
    } catch {
      showToast('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
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
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em]">
            관리자 회원가입
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#6b7684]">
            첫 관리자 계정은 바로 등록할 수 있으며, 이후 계정은 로그인한
            관리자만 생성할 수 있습니다.
          </p>
        </div>
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
            minLength={8}
            name="password"
            type="password"
            autoComplete="new-password"
            className={fieldClass}
          />
          <span className="font-normal text-[#6b7684]">
            영문자와 숫자를 포함해 8자 이상 입력해 주세요.
          </span>
        </label>
        <label className="flex flex-col gap-2 text-sm font-bold">
          비밀번호 확인
          <input
            required
            minLength={8}
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            className={fieldClass}
          />
        </label>
        <button
          disabled={pending}
          className="brand-gradient motion-control min-h-14 rounded-[8px] p-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? '계정 생성 중…' : '회원가입'}
        </button>
        <Link
          href="/admin/login"
          className="text-center text-sm font-bold text-[#176f9f] underline underline-offset-4"
        >
          로그인으로 돌아가기
        </Link>
      </form>
    </div>
  );
}
