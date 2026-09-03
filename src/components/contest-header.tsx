import Link from 'next/link';

export function ContestHeader({
  helper,
  actionLabel,
  actionHref = '/apply',
  links,
}: {
  helper?: string;
  actionLabel?: string;
  actionHref?: string;
  links?: { label: string; href: string }[];
}) {
  return (
    <header className="motion-section sticky top-0 z-20 flex min-h-[72px] flex-col items-stretch justify-between gap-3 border-b border-black/5 bg-white/90 px-5 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:px-8 lg:px-10">
      <Link
        href="/"
        className="flex min-h-11 items-center text-lg leading-tight font-extrabold tracking-[-0.035em] text-[#191f28] sm:shrink-0 sm:text-xl"
      >
        2026 AI 창업 경진대회
      </Link>
      {(helper || actionLabel || links?.length) && (
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:justify-end">
          {helper && (
            <span className="hidden text-sm text-[#666] md:block">
              {helper}
            </span>
          )}
          {links?.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="motion-control inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#e5e5e5] px-4 py-2 text-sm font-bold text-[#333d4b] hover:bg-[#f2f4f6] sm:px-[18px]"
            >
              {link.label}
            </Link>
          ))}
          {actionLabel && (
            <Link
              href={actionHref}
              className="motion-control inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[#f2f4f6] px-4 py-2 text-sm font-bold text-[#333d4b] hover:bg-[#e5e8eb] sm:px-[18px]"
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
  'h-[52px] w-full min-w-0 rounded-[6px] border border-[#dfe3e8] bg-white px-4 text-base text-[#191f28] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#b0b8c1] hover:border-[#c9d0d8] focus:border-[#35c1de] focus:ring-3 focus:ring-[#35c1de]/10 disabled:bg-[#f2f4f6] disabled:text-[#8b95a1] sm:text-sm';
