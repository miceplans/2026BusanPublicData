import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { FaqSection } from '@/components/faq-section';
import { getSettings } from '@/lib/settings';
import type { FaqItem } from '@/types';

export const dynamic = 'force-dynamic';

const overview = [
  ['대회명', '2026 AI 창업 경진대회'],
  ['개최장소', '벡스코 컨벤션홀 205호'],
  [
    '추진목적',
    '부산의 전략산업 분야 우수 AI 창업 아이디어를 발굴·육성하고, 예비·초기 창업기업의 사업화를 지원하여 지역 AI 창업 생태계를 활성화',
  ],
  [
    '대회내용',
    'AI 관련 예비·신규 창업팀의 예선·본선 시상 및 수상팀의 AI 시제품·서비스 제작을 위한 창업 사업화 비용 지원',
  ],
  [
    '주최·주관',
    '주최 부산광역시 · 주관 부산정보산업진흥원 · 참여 부산창조경제혁신대표이사',
  ],
  ['참가대상', '전국 AI 관련 예비·신규 창업팀(2~4인 구성)'],
];

const partners = [
  {
    name: '부산광역시',
    logo: '/assets/partner-busan-metropolitan-city.png',
    width: 3332,
    height: 714,
  },
  {
    name: '부산정보산업진흥원',
    logo: '/assets/partner-busan-it-industry-promotion-agency.png',
    width: 865,
    height: 143,
  },
  {
    name: '부산창조경제혁신센터',
    logo: '/assets/partner-busan-center-for-creative-economy-innovation.png',
    width: 1387,
    height: 273,
  },
];

const strategicIndustries = [
  { icon: '/assets/industries/ocean.png', label: '해양' },
  { icon: '/assets/industries/energy-tech.png', label: '에너지테크' },
  { icon: '/assets/industries/future-mobility.png', label: '미래모빌리티' },
  { icon: '/assets/industries/fusion-parts.png', label: '융합부품 소재' },
  { icon: '/assets/industries/lifestyle.png', label: '라이프스타일' },
  { icon: '/assets/industries/digital-tech.png', label: '디지털테크' },
  { icon: '/assets/industries/finance.png', label: '금융' },
  { icon: '/assets/industries/culture-tourism.png', label: '문화관광' },
  { icon: '/assets/industries/bio-health.png', label: '바이오헬스' },
];

const schedule = [
  ['9월', '참가팀 모집'],
  ['10월', '서면 심사'],
  ['10월 31일', '발표심사 및 시상식'],
  ['11월', '창업·사업화 지원 협약'],
  ['11월 ~ 12월', '창업·사업화 교육 및 컨설팅 (3주)'],
  ['12월', '창업·사업화 지원금 수여'],
];

const operationPlan = [
  {
    stage: '예선',
    qualification: 'AI 관련 예비창업팀·업력 2년 이내 신규 창업기업',
    description: '온라인 서류심사 및 본선 참가팀 발표',
  },
  {
    stage: '온라인 오리엔테이션',
    qualification: '예선 서류평가 통과팀',
    description:
      'ZOOM을 활용해 본선 일정·운영규정·평가항목·발표순서 안내(팀별 1~2인 접속)',
  },
  {
    stage: '본선',
    qualification: '예선 서류평가 통과 20팀',
    description: '팀별 10분 발표·5분 질의응답으로 최종 11팀 선발 및 시상',
  },
];

const participation = [
  '공고일 기준 AI 관련 우수 아이템을 보유한 예비창업자(팀) \n 또는 업력 2년 이내 신규 창업기업',
  '예비창업자는 공고일 기준 신청자 명의의 개인·법인 사업자등록이 없어야 함',
  '신규창업자는 공고일 기준 개업일(법인은 법인설립등기일)로부터\n 2년이 경과하지 않아야 함',
  '2~4인으로 구성된 팀',
  '팀원 전원이 지원대상 요건을 충족해야 함'
];

const agreementTargets = [
  '창업 경진대회 입상팀',
  '지원제외 대상에 해당하지 않고 창업·사업화 지원 협약요건을 성실히 이행할 수 있는 팀',
];

const agreementRequirements = [
  '상위 수상팀이 협약요건을 충족하지 못하거나 협약을 포기하면\n 차순위 수상팀에 사업화 지원 자격이 순차 승계됨',
];

const commercializationProcess = [
  '협약 체결',
  '전문가 컨설팅',
  '창업·사업화 지원금 수여',
];

const mandatoryAgreementRequirements = [
  '(공통) 협약일로부터 1년 이상 부산광역시 관내 소재 창업기업을 유지하여야 함',
  '(예비창업자) 협약일로부터 2개월 이내 부산광역시 관내로 창업자(대표자) 명의의 사업자등록을 완료하여야 함',
  '(신규창업자) 협약 기준 소재지가 부산광역시이거나 2개월 이내 부산광역시 관내로 소재지를 이전등록 완료하여야 함(지점은 해당되지 않음)',
];

const commercializationEligibility = [
  'AI 창업 경진대회 입상팀 (수상순위에 따라 협약요건 충족팀 순차 지원)',
  '지원제외 대상에 해당하지 않으며, 아래 창업·사업화 지원 협약요건을 이행할 수 있는 자',
];

const excludedFromSupport = [
  '국세·지방세 체납 또는 금융기관 등 채무불이행이 확인된 경우',
  '파산·회생절차·개인회생절차 개시 신청이 이루어진 경우',
  '중소기업창업 지원법 시행령상 창업 제외 업종(사행산업, 유흥업 등)',
  '동일한 사업계획으로 다른 정부·지자체 사업으로부터 중복으로 사업화 자금을 지원받고 있는 경우',
  '타인의 특허·실용신안 등 지식재산권을 침해하거나 도용할 우려가 있는 아이템',
  '정부·기관 사업 제재 중이거나 의무사항(보고서 제출, 정산금·환수금 납부 등) 불이행 중인 경우',
  '기타 관련 법령에 저촉되어 사업 참여 제한을 받고 있는 기업',
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="max-w-[760px] text-[clamp(1.5rem,4.5vw,3rem)] leading-[1.12] font-semibold tracking-[0.055em]">
      {children}
    </h2>
  );
}

export default async function HomePage() {
  let faqs: FaqItem[] = [];
  try {
    faqs = (await getSettings()).faqs ?? [];
  } catch {
    faqs = [];
  }

  return (
    <div className="min-h-screen bg-[#05070f] bg-[url('/assets/bg.webp')] bg-cover bg-fixed bg-center text-white">
      <header className="sticky top-0 z-20 border-b border-[#45C4DE]/35 bg-[#0D1E5E]/80 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            className="flex min-h-11 items-center text-lg font-semibold tracking-[-0.045em] sm:text-xl"
            href="/"
          >
            2026 AI 창업 경진대회
          </Link>
          <nav
            aria-label="주요 메뉴"
            className="flex items-center gap-1 text-sm font-bold"
          >
            <a
              className="hidden min-h-11 items-center rounded-full px-4 hover:bg-[#45C4DE]/15 sm:flex"
              href="#overview"
            >
              대회개요
            </a>
            <a
              className="hidden min-h-11 items-center rounded-full px-4 hover:bg-[#45C4DE]/15 sm:flex"
              href="#support"
            >
              지원내용
            </a>
            <a
              className="hidden min-h-11 items-center rounded-full px-4 hover:bg-[#45C4DE]/15 md:flex"
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
        <section className="relative overflow-hidden px-5 py-20 text-center sm:px-8 sm:py-28 lg:py-32">
          <div
            className="pointer-events-none absolute z-0 hidden opacity-20 sm:block"
            style={{
              top: '40%',
              left: 'calc(50%)',
              width: 4200,
              maxWidth: 'none',
              transform: 'translate(-50%, -58%)',
            }}
            aria-hidden="true"
          >
            <Image
              alt=""
              className="hero-ai-art block h-auto max-w-none drop-shadow-[0_0_40px_rgba(69,196,222,0.12)]"
              style={{ width: 3000, maxWidth: 'none' }}
              src="/assets/ai.svg"
              width={1118}
              height={931}
              unoptimized
            />
          </div>
          <div className="relative z-1 mx-auto max-w-[1280px]">
            <div className="hero-copy mx-auto flex max-w-[980px] flex-col items-center">
              <h1 className="mt-6 flex w-full flex-col items-center text-[clamp(3rem,7vw,6.5rem)] leading-[0.98] font-black tracking-[-0.065em]">
                <Image
                  alt="2026 AI 창업 경진대회"
                  className="h-auto w-full max-w-[760px]"
                  src="/assets/title.svg"
                  width={1234}
                  height={296}
                  priority
                  unoptimized
                />
                <span className="mt-6 block max-w-[820px] text-[clamp(1.2rem,2.4vw,2.15rem)] leading-[1.3] font-bold tracking-[-0.035em] text-white/75">
                  부산의 전략산업 분야 우수 AI 창업 아이디어 발굴·육성
                </span>
              </h1>
              <p className="mt-10 text-3xl font-black tracking-[-0.035em] text-white sm:text-5xl">
                <span className="text-[#45C4DE]">
                  {' '}
                  AI 스타트업의 새로운 항구, 부산
                </span>
              </p>
              <p className="mt-6 max-w-[760px] text-lg leading-[1.7] text-white/70 sm:text-xl">
                부산의 전략산업 분야 우수 AI 창업 아이디어를 발굴·육성하고,
                <br /> 예비·신규 창업자의 창업·사업화를 지원합니다
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link
                  className="brand-gradient inline-flex min-h-14 items-center justify-center rounded-full px-7 text-base font-bold text-white"
                  href="/apply"
                >
                  참가 신청하기
                </Link>
                <Link
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#45C4DE] bg-[#0D1E5E] px-7 text-base font-bold text-white hover:bg-[#45C4DE]/20"
                  href="/application/login"
                >
                  신청 확인·수정
                </Link>
              </div>
            </div>
            <div className="hero-stats mx-auto mt-20 grid max-w-[980px] border-t border-[#45C4DE]/55 pt-8 text-center sm:grid-cols-3 sm:gap-8">
              {[
                ['접수기간', '9.7~9.30'],
                ['본선일정', '10.31(토)'],
                ['2~4인', '팀 단위 참가'],
                ['1억 7백만원', '시상·사업화 지원'],
              ].map(([value, label]) => (
                <div
                  className="border-b border-[#45C4DE]/55 py-5 sm:border-0 sm:py-0"
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
            <div className="mt-14 flex items-center justify-center gap-4 overflow-x-auto px-6 sm:gap-6">
              {partners.map((partner, index) => (
                <div
                  className="flex shrink-0 items-center gap-4 sm:gap-6"
                  key={partner.name}
                >
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className="text-base font-bold text-white/30"
                    >
                      ×
                    </span>
                  )}
                  <Image
                    alt={`${partner.name} 로고`}
                    className="max-h-6 w-auto shrink-0 object-contain sm:max-h-8"
                    height={partner.height}
                    src={partner.logo}
                    width={partner.width}
                  />
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
                  className="landing-panel interactive-card min-h-44 rounded-[28px] border border-[#45C4DE]/45 p-7 sm:p-8"
                  key={term}
                >
                  <dt className="text-sm font-bold text-white/55">{term}</dt>
                  <dd className="font-suit mt-5 text-xl leading-[1.45] font-bold tracking-[-0.035em]">
                    {detail}
                  </dd>
                  {term === '대회명' && (
                    <p className="mt-3 text-sm font-medium text-[#45C4DE]">
                      - AI 스타트업의 새로운 항구, 부산
                    </p>
                  )}
                </div>
              ))}
            </dl>
          </section>

          <section id="support" className="scroll-mt-28">
            <SectionTitle>단계별 지원내용</SectionTitle>
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="landing-panel interactive-card rounded-[32px] border border-[#45C4DE]/45 p-7 sm:p-10">
                <span className="text-sm font-semibold text-[#45C4DE]">
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
              <article className="landing-panel interactive-card rounded-[32px] border border-[#45C4DE]/55 p-7 text-white sm:p-10">
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
            <div className="landing-panel mt-5 rounded-[32px] border border-[#45C4DE]/55 p-7 sm:p-10">
              <h3 className="text-xl font-semibold">
                부산 9대 전략산업 모집분야
              </h3>
              <ul
                className="mt-6 grid grid-cols-3 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-9"
                aria-label="모집분야"
              >
                {strategicIndustries.map(({ icon, label }) => (
                  <li
                    className="interactive-card flex flex-col items-center gap-2 rounded-2xl border border-[#45C4DE]/35 bg-[#0D1E5E] px-2 py-4 text-center sm:gap-3 sm:py-5"
                    key={label}
                  >
                    <span className="relative h-14 w-full sm:h-16">
                      <Image
                        alt=""
                        aria-hidden="true"
                        className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
                        fill
                        sizes="80px"
                        src={icon}
                        unoptimized
                      />
                    </span>
                    <span className="text-xs leading-[1.3] font-bold break-keep text-white/80 sm:text-sm">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="grid gap-20">
            <div className="min-w-0">
              <section id="schedule" className="scroll-mt-28">
                <div className="flex justify-center text-center">
                  <SectionTitle>6단계 추진절차</SectionTitle>
                </div>
                <p className="mt-5 text-center text-sm text-white/55">
                  상기 일정은 진행 상황에 따라 변경될 수 있습니다.
                </p>
                <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {schedule.map(([date, label], index) => (
                    <li
                      className="landing-panel interactive-card relative flex min-h-48 flex-col items-center justify-between rounded-[24px] border border-[#45C4DE]/55 p-5 text-center"
                      key={`${date}-${label}`}
                    >
                      <span className="text-sm font-bold text-[#45C4DE]">
                        {index + 1}단계
                      </span>
                      <strong className="my-5 flex min-h-14 items-center text-lg leading-[1.4] tracking-[-0.035em]">
                        {label}
                      </strong>
                      <span className="block w-full border-t border-[#45C4DE]/35 pt-4 text-base font-bold text-white/75">
                        {date}
                      </span>
                      {index < schedule.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute top-1/2 -right-3.5 z-2 hidden -translate-y-1/2 text-xl text-[#45C4DE] xl:block"
                        >
                          →
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
              <section className="mt-28 min-w-0">
                <SectionTitle>운영계획</SectionTitle>
                <div className="mt-12 grid gap-5 lg:grid-cols-3">
                  {operationPlan.map((item, index) => (
                    <article
                      className="landing-panel interactive-card rounded-[28px] border border-[#45C4DE]/45 p-7"
                      key={item.stage}
                    >
                      <span className="text-sm font-semibold text-[#45C4DE]">
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
                            className="border-t border-[#45C4DE]/45 pt-4"
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
                  <div className="landing-panel interactive-card rounded-[32px] border border-[#45C4DE]/55 p-7 text-white sm:p-10">
                    <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                      창업 경진대회 참가요건
                    </h3>
                    <ul className="mt-8 grid gap-5 text-sm leading-[1.65] text-white/75">
                      {participation.map((item) => (
                        <li className="flex items-start gap-2.5" key={item}>
                          <span
                            aria-hidden="true"
                            className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-[#45C4DE]"
                          />
                          <span className="whitespace-pre-line">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="landing-panel interactive-card rounded-[32px] border border-[#45C4DE]/45 p-7 sm:p-10">
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
                                  className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-[#45C4DE]"
                                />
                                <span className="whitespace-pre-line">
                                  {item}
                                </span>
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

          <section id="commercialization-support" className="scroll-mt-28">
            <SectionTitle>창업·사업화 지원</SectionTitle>

            <div className="mt-12">
              <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                추진절차
              </h3>
              <ol className="mt-6 grid gap-3 lg:grid-cols-3">
                {commercializationProcess.map((step, index) => (
                  <li
                    className="landing-panel interactive-card relative flex min-h-32 items-center justify-center rounded-[24px] border border-[#45C4DE]/55 p-6 text-center text-xl font-semibold"
                    key={step}
                  >
                    <span className="sr-only">{index + 1}단계: </span>
                    {step}
                    {index < commercializationProcess.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-7 left-1/2 z-2 -translate-x-1/2 text-2xl text-[#45C4DE] lg:top-1/2 lg:-right-7 lg:bottom-auto lg:left-auto lg:-translate-y-1/2"
                      >
                        →
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-7 text-center text-sm font-semibold text-white/55">
                11월 중 순차 진행
              </p>
            </div>

            <div className="mt-16">
              <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                지원내용
              </h3>
              <p className="mt-3 text-base font-semibold text-white/60">
                창업·사업화 지원 (총 1억원 규모)
              </p>
              <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.7fr_1.15fr]">
                <article className="landing-panel rounded-[28px] border border-[#45C4DE]/45 p-7 sm:p-8">
                  <p className="text-sm font-bold text-[#45C4DE]">
                    창업·사업화 컨설팅
                  </p>
                  <p className="mt-5 text-lg leading-[1.65] font-semibold text-white/80">
                    창업·사업화 전문가 매칭 및 컨설팅을 통한 역량 강화
                  </p>
                </article>
                <article className="landing-panel rounded-[28px] border border-[#45C4DE]/55 p-7 sm:p-8">
                  <p className="text-sm font-bold text-[#45C4DE]">
                    창업·사업화 지원금
                  </p>
                  <ul className="mt-5 grid gap-3">
                    {['3,000만원', '2,000만원', '1,000만원'].map((amount) => (
                      <li
                        className="border-t border-[#45C4DE]/35 pt-3 text-2xl font-semibold first:border-0 first:pt-0"
                        key={amount}
                      >
                        {amount}
                      </li>
                    ))}
                  </ul>
                </article>
                <article className="landing-panel rounded-[28px] border border-[#45C4DE]/45 p-7 sm:p-8">
                  <p className="text-sm font-bold text-[#45C4DE]">비고</p>
                  <p className="mt-5 text-lg leading-[1.65] font-semibold text-white/80">
                    경진대회 수상순위에 따라 협약요건 충족팀 순차 지원
                  </p>
                </article>
              </div>
              <p className="mt-5 text-sm leading-[1.6] text-white/50">
                ※ 지원 대상자는 부산지역 내 창업 또는 사업장 이전 필수
              </p>
            </div>

            <div className="mt-16">
              <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                지원조건(협약요건)
              </h3>
              <ul className="mt-6 grid gap-3 text-sm leading-[1.65] text-white/75">
                {commercializationEligibility.map((item) => (
                  <li className="flex items-start gap-2.5" key={item}>
                    <span
                      aria-hidden="true"
                      className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-[#45C4DE]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <article className="landing-panel rounded-[28px] border border-[#45C4DE]/55 p-7 sm:p-8">
                  <h4 className="text-lg font-semibold">필수 협약요건</h4>
                  <ol className="mt-6 grid gap-4 text-sm leading-[1.7] text-white/75">
                    {mandatoryAgreementRequirements.map(
                      (requirement, index) => (
                        <li
                          className="flex items-start gap-3"
                          key={requirement}
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#45C4DE]/50 text-xs font-bold text-[#45C4DE]">
                            {index + 1}
                          </span>
                          <span>{requirement}</span>
                        </li>
                      ),
                    )}
                  </ol>
                </article>
                <article className="landing-panel rounded-[28px] border border-[#45C4DE]/45 p-7 sm:p-8">
                  <h4 className="text-lg font-semibold">지원제외 대상</h4>
                  <ul className="mt-6 grid gap-3 text-sm leading-[1.65] text-white/70">
                    {excludedFromSupport.map((item) => (
                      <li className="flex items-start gap-2.5" key={item}>
                        <span
                          aria-hidden="true"
                          className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-[#45C4DE]"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>

            <div className="landing-panel mt-5 rounded-[28px] border border-[#45C4DE]/45 p-7 sm:p-8">
              <h3 className="text-lg font-semibold">제출서류</h3>
              <p className="mt-4 flex items-start gap-2.5 text-sm leading-[1.65] text-white/75">
                <span
                  aria-hidden="true"
                  className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-[#45C4DE]"
                />
                <span>
                  사업자등록증 사본(부산광역시 관내 사업장 소재지 확인이 가능한
                  발급분)
                </span>
              </p>
            </div>
          </section>

          <FaqSection faqs={faqs} />
        </div>

        <section className="bg-[#111111] px-5 py-24 text-white sm:px-8 sm:py-32">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-10 text-center lg:flex-row lg:items-end lg:text-left">
            <h2 className="max-w-[800px]">
              <Image
                alt="2026 AI 창업 경진대회"
                className="mx-auto h-auto w-full max-w-[420px] lg:mx-0"
                src="/assets/title.svg"
                width={1234}
                height={296}
                unoptimized
              />
            </h2>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <Link
                className="brand-gradient inline-flex min-h-14 shrink-0 items-center justify-center rounded-full px-8 font-bold"
                href="/apply"
              >
                참가 신청하기
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
