import Link from 'next/link';

export function ContestHeader({
  helper,
  actionLabel,
  actionHref = '/apply',
}: {
  helper?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <header className="motion-section flex min-h-[78px] flex-col items-stretch justify-between gap-3 border-b border-[#e5e5e5] bg-white px-5 py-4 sm:flex-row sm:items-center sm:px-8 sm:py-5 lg:px-10">
      <Link
        href="/"
        className="flex min-h-11 items-center text-lg leading-tight font-bold tracking-[-0.02em] text-[#111] sm:shrink-0 sm:text-xl"
      >
        창업경진대회 참가관리
      </Link>
      {(helper || actionLabel) && (
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:justify-end">
          {helper && (
            <span className="hidden text-sm text-[#666] md:block">
              {helper}
            </span>
          )}
          {actionLabel && (
            <Link
              href={actionHref}
              className="motion-control inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#e5e5e5] px-4 py-2 text-sm font-bold text-[#111] hover:bg-[#f7f7f7] sm:px-[18px]"
            >
              {actionLabel}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export const fieldClass =
  'h-[49px] w-full min-w-0 rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-base text-[#111] outline-none placeholder:text-[#b9b9b9] focus:border-[#0053b9] focus:ring-2 focus:ring-[#0053b9]/10 sm:text-sm';
