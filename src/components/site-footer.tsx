import Image from 'next/image';
import Link from 'next/link';

const organizations = [
  {
    role: '주최',
    name: '부산광역시',
    src: '/organization-logos/busan-metropolitan-city.png',
    width: 3509,
    height: 922,
    panel: true,
  },
  {
    role: '주관',
    name: '부산정보산업진흥원',
    src: '/organization-logos/busan-it-industry-promotion-agency.png',
    width: 226,
    height: 37,
    panel: false,
  },
  {
    role: '참여',
    name: '부산창조경제혁신센터',
    src: '/organization-logos/busan-center-for-creative-economy-innovation.png',
    width: 249,
    height: 53,
    panel: false,
  },
] as const;

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
          </div>

          <ul
            className="grid gap-3 sm:grid-cols-3"
            aria-label="주최·주관·참여 기관"
          >
            {organizations.map((organization) => (
              <li key={organization.role} className="min-w-0">
                <p className="mb-2 text-xs font-bold text-white/50">
                  {organization.role}
                </p>
                <div
                  className={`flex h-20 items-center rounded-xl px-4 ${organization.panel ? 'bg-white' : 'bg-white/6'}`}
                >
                  <Image
                    alt={`${organization.name} 로고`}
                    className="max-h-11 w-auto object-contain"
                    src={organization.src}
                    width={organization.width}
                    height={organization.height}
                    sizes="(max-width: 639px) 220px, 180px"
                  />
                </div>
              </li>
            ))}
          </ul>
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
