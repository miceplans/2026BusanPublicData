import Image from 'next/image';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-[#0a0a0b] px-5 py-12 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-8 border-b border-white/12 pb-10 lg:grid-cols-[1fr_1.35fr] lg:items-end">
          <div>
            <p className="text-sm font-bold text-white/55">문의처</p>
            <p className="mt-3 text-sm text-white/70">대회 운영사무국</p>
            <a
              className="mt-1 inline-block text-lg font-bold underline decoration-white/30 underline-offset-4 hover:decoration-white"
              href="mailto:office1170@naver.com"
            >
              office1170@naver.com
            </a>
            <a
              className="mt-2 block w-fit text-lg font-bold underline decoration-white/30 underline-offset-4 hover:decoration-white"
              href="tel:07046181703"
            >
              070.4618.1703
            </a>
          </div>

          <div
            className="flex h-20 items-center rounded-xl px-4"
            aria-label="주최·주관·참여 기관"
          >
            <Image
              alt="주최·주관·참여 기관 로고"
              className="max-h-11 w-auto object-contain"
              src="/assets/organizations.png"
              width={1183}
              height={82}
              sizes="(max-width: 639px) 320px, 480px"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 text-xs leading-6 text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 부산광역시. All rights reserved.</p>
          <Link
            className="w-fit font-bold text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white"
            href="/privacy"
          >
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
