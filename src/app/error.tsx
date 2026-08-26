'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section>
      <h1>문제가 발생했습니다.</h1>
      <button
        type="button"
        className="motion-control rounded-lg border border-[#ddd] px-4 py-2 hover:bg-[#f5f5f5]"
        onClick={reset}
      >
        다시 시도
      </button>
    </section>
  );
}
