import { ContestHeader } from '@/components/contest-header';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ receipt?: string }>;
}) {
  const { receipt } = await searchParams;
  return (
    <div>
      <ContestHeader
        actionLabel="신청 확인·수정"
        actionHref="/application/login"
      />
      <section className="motion-success mx-auto my-12 max-w-[700px] rounded-2xl border p-8">
        <h1 className="text-3xl font-bold">참가 신청이 접수되었습니다.</h1>
        <p className="mt-6 text-lg">
          접수번호{' '}
          <strong className="text-[#1b4292]">
            {receipt ?? '확인할 수 없음'}
          </strong>
        </p>
      </section>
    </div>
  );
}
