import { ContestHeader } from '@/components/contest-header';

export default function Page() {
  return (
    <div>
      <ContestHeader
        actionLabel="신청 확인·수정"
        actionHref="/application/login"
      />
      <section className="motion-success mx-auto my-12 max-w-[700px] rounded-2xl border p-8">
        <h1 className="text-3xl font-bold">접수 신청 기간이 종료되었습니다.</h1>
        <p className="mt-6 text-lg text-[#333]">
          참가 신청은 2026.9.30.(수) 18:00에 마감되었습니다.
        </p>
      </section>
    </div>
  );
}
