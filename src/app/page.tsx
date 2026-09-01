import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';

const overview = [
  [
    '대회명',
    '2026 해양수도 부산 AI 창업 경진대회 : 부산 9대 전략산업 AI 스타트업 발굴 프로젝트',
  ],
  ['주최', '부산광역시'],
  ['주관', '부산정보산업진흥원'],
  ['개최장소', '벡스코 컨벤션홀 205호'],
  ['참여기관', '부산창조경제혁신센터'],
  [
    '추진목적',
    '우수 AI 스타트업 발굴과 창업 사업화 지원을 통한 지역 AI 창업 생태계 조성',
  ],
  [
    '대회내용',
    'AI 관련 예비·신규 창업팀의 예선·본선 시상 및 수상팀의 AI 시제품·서비스 제작을 위한 창업 사업화 비용 지원',
  ],
  [
    '추진방식',
    '공모전을 통한 우수 아이디어 발굴, 창업 컨설팅 및 창업·사업화 지원금 제공',
  ],
  ['참가대상', '전국 AI 관련 예비·신규 창업팀(2~4인 구성)'],
  ['추진예산', '총 190백만원(총 지원규모 107백만원)'],
];

const strategicIndustries = [
  '해양',
  '에너지테크',
  '미래모빌리티',
  '융합부품 소재',
  '라이프스타일',
  '디지털테크',
  '금융',
  '문화관광',
  '바이오헬스',
];

const schedule = [
  ['세부 일정 추후 안내', '참가팀 공모·접수'],
  ['세부 일정 추후 안내', '예선 심사'],
  ['세부 일정 추후 안내', '본선 심사 및 시상'],
  ['세부 일정 추후 안내', '창업 컨설팅'],
  ['세부 일정 추후 안내', '창업·사업화 지원'],
];

const operationPlan = [
  {
    stage: '예선',
    qualification: 'AI 관련 예비창업팀·업력 2년 이내 신규 창업기업',
    description: '창업 및 사업화 계획 서면평가',
  },
  {
    stage: '본선',
    qualification: '예선 서류평가 통과팀',
    description: '아이디어 발표평가 및 시상식',
  },
  {
    stage: '사업화 지원',
    qualification: '창업 경진대회 입상팀 중 협약요건을 충족한 팀',
    description: 'AI 시제품·서비스 제작을 위한 사업화 비용 지원',
  },
];

const participation = [
  '공고일 기준 AI 관련 우수 아이템을 보유한 예비창업자(팀) 또는 업력 2년 이내 신규 창업기업',
  '예비창업자는 공고일 기준 신청자 명의의 개인·법인 사업자등록이 없어야 함',
  '신규창업자는 공고일 기준 개업일(법인은 법인설립등기일)로부터 2년이 경과하지 않아야 함',
  '2~4인으로 구성된 팀',
  '팀원 전원이 지원대상 요건을 충족해야 함',
  '부산 소재 예비·신규 창업자에게 평가 전형별 우대 가점(예비창업자는 대표자 주소지, 신규창업자는 사업장 소재지 기준)',
];

const agreementTargets = [
  '창업 경진대회 입상팀',
  '지원제외 대상에 해당하지 않고 창업·사업화 지원 협약요건을 성실히 이행할 수 있는 팀',
];

const agreementRequirements = [
  '상위 수상팀이 협약요건을 충족하지 못하거나 협약을 포기하면 차순위 수상팀에 사업화 지원 자격이 순차 승계됨',
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="max-w-[760px] text-[clamp(1.5rem,4.5vw,3rem)] leading-[1.12] font-semibold tracking-[0.055em]">
      {children}
    </h2>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#05070f] bg-[url('/assets/bg.png')] bg-cover bg-fixed bg-center text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            className="flex min-h-11 items-center text-lg font-semibold tracking-[-0.045em] sm:text-xl"
            href="/"
          >
            2026 해양수도 부산 AI 창업 경진대회
          </Link>
          <nav
            aria-label="주요 메뉴"
            className="flex items-center gap-1 text-sm font-bold"
          >
            <a
              className="hidden min-h-11 items-center rounded-full px-4 hover:bg-white/10 sm:flex"
              href="#overview"
            >
              대회개요
            </a>
            <a
              className="hidden min-h-11 items-center rounded-full px-4 hover:bg-white/10 sm:flex"
              href="#support"
            >
              지원내용
            </a>
            <a
              className="hidden min-h-11 items-center rounded-full px-4 hover:bg-white/10 md:flex"
              href="#schedule"
            >
              추진절차
            </a>
            <Link
              className="brand-gradient flex min-h-11 items-center rounded-full px-5 text-white"
              href="/apply"
            >
              참가 신청
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
          <div
            aria-hidden="true"
            className="hero-ai-art pointer-events-none absolute top-[calc(48%+150px)] right-[-0.8vw] hidden w-[clamp(520px,48vw,780px)] -translate-y-1/2 lg:block"
          >
            <Image
              alt=""
              className="h-auto w-full brightness-[0.48]"
              src="/assets/ai.svg"
              width={1134}
              height={749}
              unoptimized
            />
          </div>
          <div className="relative z-1 mx-auto max-w-[1280px]">
            <div className="hero-copy max-w-[760px]">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-bold text-white/80">
                <span
                  aria-hidden="true"
                  className="block size-1.5 rounded-full bg-[#ed68ad]"
                />
                주최 부산광역시 · 주관 부산정보산업진흥원
              </p>
              <h1 className="mt-6 max-w-[760px] text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.02] font-black tracking-[-0.065em]">
                <span className="block">2026 해양수도 부산</span>
                <span className="mt-2 block">AI 창업 경진대회</span>
                <span className="mt-5 block max-w-[700px] text-[clamp(1.15rem,2.2vw,2rem)] leading-[1.3] font-bold tracking-[-0.035em] text-white/75">
                  부산 9대 전략산업 AI 스타트업 발굴 프로젝트
                </span>
              </h1>
              <p className="mt-6 text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">
                부산 9대 전략산업 <span className="text-[#ed68ad]">×</span> AI,
                <br />
                도전에서 사업화까지
              </p>
              <p className="mt-6 max-w-[680px] text-lg leading-[1.7] text-white/70 sm:text-xl">
                부산 9대 전략산업 기반 AI 스타트업을 발굴하고,
                <br /> 예비·신규 창업기업의 사업화까지 연결합니다.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  className="brand-gradient inline-flex min-h-14 items-center justify-center rounded-full px-7 text-base font-bold text-white"
                  href="/apply"
                >
                  참가 신청하기
                </Link>
                <Link
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 text-base font-bold text-white hover:bg-white/20"
                  href="/application/login"
                >
                  신청 확인·수정
                </Link>
              </div>
            </div>
            <div className="hero-stats mt-20 grid border-t border-white/15 pt-8 sm:grid-cols-3 sm:gap-8">
              {[
                ['9개', '부산 전략산업 분야'],
                ['2~4인', '팀 단위 참가'],
                ['1억 7백만원', '시상·사업화 지원'],
              ].map(([value, label]) => (
                <div
                  className="border-b border-white/15 py-5 sm:border-0 sm:py-0"
                  key={label}
                >
                  <strong className="block text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                    {value}
                  </strong>
                  <span className="mt-2 block text-sm text-white/60">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1280px] space-y-28 px-5 py-24 sm:px-8 sm:py-32 lg:space-y-40">
          <section id="overview" className="scroll-mt-28">
            <SectionTitle>대회개요</SectionTitle>
            <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {overview.map(([term, detail]) => (
                <div
                  className="interactive-card min-h-44 rounded-[28px] bg-white/8 p-7 sm:p-8"
                  key={term}
                >
                  <dt className="text-sm font-bold text-white/55">{term}</dt>
                  <dd className="mt-5 text-xl leading-[1.45] font-bold tracking-[-0.035em]">
                    {detail}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="support" className="scroll-mt-28">
            <SectionTitle>단계별 지원내용</SectionTitle>
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="interactive-card rounded-[32px] bg-white/8 p-7 sm:p-10">
                <span className="text-sm font-semibold text-[#ed68ad]">
                  경진대회
                </span>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                  총 7백만원 지원
                </h3>
                <p className="mt-8 leading-[1.7] text-white/70">
                  AI 관련 예비·신규 창업팀을 대상으로 예선과 본선을 거쳐 우수
                  아이디어를 시상합니다.
                </p>
              </article>
              <article className="interactive-card brand-gradient rounded-[32px] p-7 text-white sm:p-10">
                <span className="text-sm font-semibold text-white/70">
                  사업화 지원
                </span>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                  총 1억원 지원
                </h3>
                <p className="mt-8 leading-[1.7] text-white/80">
                  입상팀의 AI 시제품·서비스 제작을 위한 창업·사업화 비용을
                  지원합니다.
                </p>
              </article>
            </div>
            <div className="mt-5 rounded-[32px] border border-white/15 p-7 sm:p-10">
              <h3 className="text-xl font-semibold">
                부산 9대 전략산업 모집분야
              </h3>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="모집분야">
                {strategicIndustries.map((industry) => (
                  <li
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/75"
                    key={industry}
                  >
                    {industry}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="grid gap-20">
            <div className="min-w-0">
              <section id="schedule" className="scroll-mt-28">
                <SectionTitle>추진절차</SectionTitle>
                <p className="mt-5 text-sm text-white/55">
                  세부 일정은 공고 확정 후 안내합니다.
                </p>
                <ol className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {schedule.map(([date, label], index) => (
                    <li
                      className="interactive-card min-h-36 rounded-[28px] border border-white/15 p-6"
                      key={`${date}-${label}`}
                    >
                      <span className="text-sm font-semibold text-[#ed68ad]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <strong className="mt-7 block text-xl tracking-[-0.035em]">
                        {label}
                      </strong>
                      <span className="mt-3 block text-sm text-white/55">
                        {date}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="mt-28 min-w-0">
                <SectionTitle>운영계획</SectionTitle>
                <div className="mt-12 grid gap-5 lg:grid-cols-3">
                  {operationPlan.map((item, index) => (
                    <article
                      className="interactive-card rounded-[28px] bg-white/8 p-7"
                      key={item.stage}
                    >
                      <span className="text-sm font-semibold text-[#ed68ad]">
                        {index + 1}단계
                      </span>
                      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                        {item.stage}
                      </h3>
                      <dl className="mt-8 grid gap-5">
                        {[
                          ['자격', item.qualification],
                          ['내용', item.description],
                        ].map(([label, value]) => (
                          <div
                            className="border-t border-white/15 pt-4"
                            key={label}
                          >
                            <dt className="text-xs font-bold text-white/55">
                              {label}
                            </dt>
                            <dd className="mt-2 text-sm leading-[1.6]">
                              {value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            </div>
            <div className="min-w-0">
              <section>
                <SectionTitle>참가 및 협약 핵심요건</SectionTitle>
                <div className="mt-12 grid gap-5 lg:grid-cols-2">
                  <div className="interactive-card rounded-[32px] bg-white/14 p-7 text-white sm:p-10">
                    <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                      창업 경진대회 참가요건
                    </h3>
                    <ul className="mt-8 grid gap-5 text-sm leading-[1.65] text-white/75">
                      {participation.map((item) => (
                        <li className="flex items-start gap-2.5" key={item}>
                          <span
                            aria-hidden="true"
                            className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-[#ed68ad]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="interactive-card rounded-[32px] bg-white/8 p-7 sm:p-10">
                    <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                      창업·사업화 지원 협약요건
                    </h3>
                    <div className="mt-8 grid gap-7">
                      {[
                        {
                          title: '협약대상 요건',
                          items: agreementTargets,
                        },
                        {
                          title: '필수 협약요건',
                          items: agreementRequirements,
                        },
                      ].map((group) => (
                        <div key={group.title}>
                          <h4 className="text-xs font-bold tracking-[0.04em] text-white/55 uppercase">
                            {group.title}
                          </h4>
                          <ul className="mt-3 grid gap-3 text-sm leading-[1.65] text-white/70">
                            {group.items.map((item) => (
                              <li
                                className="flex items-start gap-2.5"
                                key={item}
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-[#ed68ad]"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <section className="bg-[#111111] px-5 py-24 text-white sm:px-8 sm:py-32">
          <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
            <h2 className="max-w-[800px] text-[clamp(1.5rem,2vw,5rem)] leading-[1.02] font-semibold tracking-[0.065em]">
              2026 해양수도 부산 AI 창업 경진대회
            </h2>
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <Link
                className="brand-gradient inline-flex min-h-14 shrink-0 items-center justify-center rounded-full px-8 font-bold"
                href="/apply"
              >
                참가 신청하기
              </Link>
              <div className="flex shrink-0 flex-col items-center gap-2 sm:flex-row sm:gap-3">
                <Image
                  alt="참가 신청 QR 코드"
                  className="size-16 rounded-lg bg-white p-1.5"
                  src="/assets/qr.svg"
                  width={87}
                  height={87}
                  unoptimized
                />
                <span className="text-sm font-bold text-white/80">
                  바로 접수하기
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
