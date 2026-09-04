import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { FaqSection } from '@/components/faq-section';
import { MobileNav } from '@/components/mobile-nav';
import { getSettings } from '@/lib/settings';
import type { FaqItem } from '@/types';

export const dynamic = 'force-dynamic';

function FlowArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      height="24"
      viewBox="0 -960 960 960"
      width="24"
    >
      <path
        d="M593.23-480 291.92-781.31q-11.92-11.92-11.61-28.38.31-16.46 12.23-28.39Q304.46-850 320.92-850t28.39 11.92l306.23 306.85q10.84 10.85 16.07 24.31 5.24 13.46 5.24 26.92t-5.24 26.92q-5.23 13.46-16.07 24.31L348.69-121.92q-11.92 11.92-28.07 11.61-16.16-.31-28.08-12.23-11.92-11.92-11.92-28.38t11.92-28.39L593.23-480Z"
        fill="currentColor"
      />
    </svg>
  );
}

const awards = [
  ['대상', '1팀', '부산광역시장상', '200만원 상당'],
  ['최우수', '2팀', '부산정보산업진흥원장상', '100만원 상당'],
  ['우수', '3팀', '부산정보산업진흥원장상', '50만원 상당'],
  ['장려', '5팀', '부산창조경제혁신센터대표이사상', '30만원 상당'],
];

const contestSubmissionDocuments = [
  '참가신청서',
  '아이디어 기획서',
  '개인정보 수집·이용 동의서',
  '참가자 서약서',
  '본선진출팀: 발표자료(PPT), 사실증명(사업자등록사실여부)',
];

const evaluationCriteria = [
  {
    category: '문제인식',
    items: [
      '창업 아이디어 제안배경(목적 및 문제의식 등)',
      '시장 분석 및 환경분석',
    ],
    score: 20,
  },
  {
    category: '경쟁력',
    items: [
      'AI를 활용한 창업 아이디어의 핵심 기능 및 경쟁력',
      '아이디어의 독창성 및 차별화 전략',
    ],
    score: 30,
  },
  {
    category: '실현가능성 및 사업성',
    items: [
      '아이디어의 실현가능성 및 우수성',
      '아이디어의 수익화 모델 전개 가능여부',
    ],
    score: 30,
  },
  {
    category: '기대효과',
    items: [
      '아이디어 구현에 따른 기대효과',
      '아이디어 구현에 따른 사회문제 해결효과',
    ],
    score: 20,
  },
];

// Uniform shrink applied to all 9 strategic-industry icons.
const ICON_SCALE = 0.7;

const strategicIndustries = [
  {
    icon: '/assets/industries/ocean.png',
    label: '해양',
    description: '스마트물류, 해운항만, 해양데이터서비스, 스마트양식',
    // ocean.png is a very wide/flat product shot (689x144) — scaled down
    // 2x more than the other icons' ICON_SCALE, plus an extra x-only
    // squeeze so the flat image doesn't stretch across the card.
    iconScale: { x: 0.3, y: 0.4 },
  },
  {
    icon: '/assets/industries/energy-tech.png',
    label: '에너지테크',
    description: '전력반도체, 이차전지, 수소에너지, ESS',
  },
  {
    icon: '/assets/industries/future-mobility.png',
    label: '미래모빌리티',
    description: '전기차, 친환경선박, 미래항공',
  },
  {
    icon: '/assets/industries/fusion-parts.png',
    label: '융합부품 소재',
    description: '로봇, 스마트제조, 우주기, 복합소재',
  },
  {
    icon: '/assets/industries/lifestyle.png',
    label: '라이프스타일',
    description: '섬유(신발, 패션의류), 블루푸드, 커피화장품, 재난안전',
  },
  {
    icon: '/assets/industries/digital-tech.png',
    label: '디지털테크',
    description: '인공지능, 빅데이터, 블록체인, 클라우드',
  },
  {
    icon: '/assets/industries/finance.png',
    label: '금융',
    description: '핀테크, 디지털자산, 특화금융',
  },
  {
    icon: '/assets/industries/culture-tourism.png',
    label: '문화관광',
    description: '영화영상콘텐츠, 게임, 의료뷰티, 해양레저관광·전시·컨벤션',
    // 10px smaller than the shared icon box.
    iconBoxClassName: 'relative h-[54px] w-full sm:h-[70px]',
  },
  {
    icon: '/assets/industries/bio-health.png',
    label: '바이오헬스',
    description: '의료기기, 의료서비스, 실버케어',
    // 10px smaller than the shared icon box.
    iconBoxClassName: 'relative h-[54px] w-full sm:h-[70px]',
  },
];

const operationPlan = [
  {
    stage: '예선',
    tag: '서면평가',
    qualification: 'AI 관련 예비창업팀·업력 2년 이내 신규 창업기업',
    description: '부산 9대 전략산업 분야 AI 관련 창업·사업화 계획 서면평가',
    selection: '제한없음 → 20팀',
    period: '10.1.(목) ~ 10.7.(수)',
  },
  {
    stage: '오리엔테이션',
    tag: '온라인',
    qualification: '예선 서면평가 통과팀',
    description: '본선일정·운영규정·평가항목·발표순서 안내(팀별 1~2인 접속)',
    selection: '20팀',
    period: '10월 중',
  },
  {
    stage: '본선 및 시상식',
    tag: '발표평가',
    qualification: '예선 서면평가 통과 20팀',
    description: '팀별 10분 발표 + 5분 질의응답',
    selection: '20팀 → 11팀 시상',
    period: '10.31.(토)',
  },
];

const participation = [
  '공고일 기준 AI 관련 우수 아이템을 보유한 예비창업자(팀) \n 또는 업력 2년 이내 신규 창업기업',
  '예비창업자는 공고일 기준 신청자 명의의 개인·법인 사업자등록이 없어야 함',
  '신규창업자는 공고일 기준 개업일(법인은 법인설립등기일)로부터\n 2년이 경과하지 않아야 함',
  '2~4인으로 구성된 팀',
  '팀원 전원이 지원대상 요건을 충족해야 함',
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
    <div className="landing-high-contrast min-h-screen bg-[#05070f] bg-[url('/assets/bg.webp')] bg-cover bg-fixed bg-center text-white">
      <header className="sticky top-0 z-20 border-b border-[#45C4DE]/35 bg-[#0D1E5E]/80 backdrop-blur-xl">
        <div className="relative mx-auto flex min-h-[76px] max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            className="flex min-h-11 items-center text-lg font-semibold tracking-[-0.045em] sm:text-xl"
            href="/"
          >
            2026 AI 창업 경진대회
          </Link>
          <MobileNav />
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
                <a
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-base font-bold text-white hover:bg-white/15"
                  href="/downloads/[모집공고문] 2026 AI 창업 경진대회.hwp"
                  download="[모집공고문] 2026 AI 창업 경진대회.hwp"
                >
                  공고문 다운로드
                </a>
              </div>
            </div>
            <div className="hero-stats mx-auto mt-20 grid max-w-[1120px] border-t border-[#45C4DE]/55 pt-8 text-center sm:grid-cols-3 sm:gap-6 lg:gap-8">
              {[
                ['접수기간', '9.7.(월) ~ 9.30.(수), 18:00'],
                ['본선 일정', '10.31.(토)'],
                ['참가 단위', '2~4인 팀'],
              ].map(([label, value]) => (
                <div
                  className="border-b border-[#45C4DE]/55 py-5 sm:border-0 sm:py-0"
                  key={label}
                >
                  <strong className="block text-sm font-semibold tracking-[-0.05em] text-white sm:text-base">
                    {label}
                  </strong>
                  <span className="mt-2 block text-xl text-white/60 sm:text-2xl">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-20 flex flex-wrap items-center justify-center gap-4 px-6 sm:gap-6">
              {[
                {
                  role: '주최',
                  alt: '부산광역시 로고',
                  src: '/assets/partner-busan-metropolitan-city-white.png',
                  width: 243,
                  height: 63,
                },
                {
                  role: '주관',
                  alt: '부산정보산업진흥원 로고',
                  src: '/assets/partner-busan-it-industry-promotion-agency-white.png',
                  width: 392,
                  height: 66,
                },
                {
                  role: '참여',
                  alt: '부산창조경제혁신센터 로고',
                  src: '/assets/partner-busan-center-for-creative-economy-innovation-white.png',
                  width: 365,
                  height: 72,
                },
              ].map((logo) => (
                <div
                  className={`flex shrink-0 items-center ${
                    logo.role === '×' ? 'gap-4 sm:gap-6' : 'gap-2'
                  }`}
                  key={logo.src}
                >
                  <span
                    className={
                      logo.role === '×'
                        ? 'inline-flex h-7 items-center text-lg leading-none font-bold text-white/30'
                        : 'text-xs font-semibold text-white/55 sm:text-sm'
                    }
                  >
                    {logo.role}
                  </span>
                  <Image
                    alt={logo.alt}
                    className="h-auto max-h-5 w-auto object-contain sm:max-h-7"
                    src={logo.src}
                    width={logo.width}
                    height={logo.height}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1280px] space-y-28 px-5 py-24 sm:px-8 sm:py-32 lg:space-y-40">
          <section id="contest" className="contest-brief scroll-mt-28">
            <SectionTitle>AI 창업 경진대회</SectionTitle>

            <div className="contest-brief-content mt-12 grid gap-10 text-lg leading-[1.75] text-white/72 sm:text-xl">
              <div aria-labelledby="contest-eligibility">
                <h3 id="contest-eligibility" className="contest-brief-title">
                  참가자격
                </h3>
                <section className="landing-panel mt-5 rounded-[32px] border border-[#45C4DE]/45 p-7 sm:p-10">
                  <ul className="grid gap-1.5 pl-6 [list-style:disc] marker:text-white/60">
                    {participation.map((item) => (
                      <li className="pl-1 whitespace-pre-line" key={item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div aria-labelledby="contest-industries">
                <h3 id="contest-industries" className="contest-brief-title">
                  모집분야 — 부산 9대 전략산업
                </h3>
                <section className="landing-panel mt-5 rounded-[32px] border border-[#45C4DE]/55 p-7 sm:p-10">
                  <ul
                    className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3"
                    aria-label="모집분야"
                  >
                    {strategicIndustries.map(
                      ({
                        icon,
                        label,
                        description,
                        iconScale,
                        iconBoxClassName,
                      }) => {
                        const { x: scaleX, y: scaleY } = iconScale ?? {
                          x: ICON_SCALE,
                          y: ICON_SCALE,
                        };
                        return (
                          <li
                            className="interactive-card flex flex-col items-center gap-3 rounded-2xl px-4 py-5 text-center"
                            key={label}
                          >
                            <span className="text-lg leading-[1.3] font-bold break-keep text-white/90 sm:text-xl">
                              {label}
                            </span>
                            <span
                              className={
                                iconBoxClassName ??
                                'relative h-16 w-full sm:h-20'
                              }
                            >
                              <Image
                                alt=""
                                aria-hidden="true"
                                className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
                                style={{
                                  transform: `scale(${scaleX}, ${scaleY})`,
                                }}
                                fill
                                sizes="96px"
                                src={icon}
                                unoptimized
                              />
                            </span>
                            <span className="text-sm leading-[1.5] break-keep text-white/50 sm:text-base">
                              {description}
                            </span>
                          </li>
                        );
                      },
                    )}
                  </ul>
                </section>
              </div>

              <div aria-labelledby="contest-topic">
                <h3 id="contest-topic" className="contest-brief-title">
                  주제
                </h3>
                <section className="landing-panel mt-5 rounded-[32px] border border-[#45C4DE]/45 p-7 sm:p-10">
                  <p>모집분야 내 AI를 활용한 자유주제</p>
                </section>
              </div>

              <div aria-labelledby="contest-period">
                <h3 id="contest-period" className="contest-brief-title">
                  접수기간
                </h3>
                <section className="landing-panel mt-5 rounded-[32px] border border-[#45C4DE]/45 p-7 sm:p-10">
                  <p className="text-lg font-semibold text-white sm:text-xl">
                    2026. 9. 7.(월) ~ 9. 30.(수), 18:00
                  </p>
                </section>
              </div>

              <div
                id="schedule"
                className="scroll-mt-28"
                aria-labelledby="contest-schedule"
              >
                <h3 id="contest-schedule" className="contest-brief-title">
                  추진일정
                </h3>
                <section className="landing-panel mt-5 rounded-[32px] border border-[#45C4DE]/55 p-7 sm:p-10">
                  <div className="overflow-x-auto">
                    <table className="contest-brief-table min-w-[760px]">
                      <thead>
                        <tr>
                          <th>단계</th>
                          <th>내용</th>
                          <th>선발팀수</th>
                          <th>시기</th>
                        </tr>
                      </thead>
                      <tbody>
                        {operationPlan.map((item) => (
                          <tr key={item.stage}>
                            <td>
                              <strong>{item.stage}</strong>
                              <span>{item.tag}</span>
                            </td>
                            <td>{item.description}</td>
                            <td>{item.selection}</td>
                            <td>{item.period}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div aria-labelledby="contest-awards">
                <h3 id="contest-awards" className="contest-brief-title">
                  시상내역
                  <span className="ml-1 text-lg font-medium text-white/55 sm:text-xl">
                    (총 700만원 규모 생성형 AI 이용권)
                  </span>
                </h3>
                <section className="landing-panel mt-5 rounded-[32px] border border-[#45C4DE]/55 p-7 sm:p-10">
                  <div className="overflow-x-auto">
                    <table className="contest-brief-table contest-awards-table min-w-[760px] table-fixed">
                      <thead>
                        <tr>
                          <th>순위</th>
                          <th>팀수</th>
                          <th>훈격</th>
                          <th>부상</th>
                        </tr>
                      </thead>
                      <tbody>
                        {awards.map(([rank, teams, title, prize]) => (
                          <tr key={rank}>
                            <td>{rank}</td>
                            <td>{teams}</td>
                            <td>{title}</td>
                            <td>{prize}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div aria-labelledby="contest-evaluation">
                <h3 id="contest-evaluation" className="contest-brief-title">
                  평가 방법
                </h3>
                <section className="landing-panel mt-5 rounded-[32px] border border-[#45C4DE]/55 p-7 sm:p-10">
                  <div className="overflow-x-auto">
                    <table className="contest-brief-table contest-evaluation-table min-w-[620px]">
                      <thead>
                        <tr>
                          <th>구분</th>
                          <th>평가 항목</th>
                          <th>배점</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluationCriteria.map((row) => (
                          <tr key={row.category}>
                            <td>{row.category}</td>
                            <td>
                              <ul className="grid gap-1 pl-4 [list-style:disc] marker:text-white/40">
                                {row.items.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </td>
                            <td>{row.score}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={2}>총점</td>
                          <td>100점</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-5 text-lg leading-[1.6] text-white/50 sm:text-sm">
                    ※ 평가위원별 최저점과 최고점을 제외한 점수들의 평균 점수를
                    산출
                    <br />※ 최저 또는 최고점이 2개 이상일 경우 각각 1개만 제외
                    <br />※ 결과 개별 연락(문자, 이메일, 전화) 후 두절 시 불합격
                    처리
                  </p>
                </section>
              </div>

              <div
                id="contest-documents"
                className="scroll-mt-28"
                aria-labelledby="contest-documents-title"
              >
                <h3
                  id="contest-documents-title"
                  className="contest-brief-title"
                >
                  제출서류
                </h3>
                <section className="landing-panel mt-5 rounded-[32px] border border-[#45C4DE]/45 p-7 sm:p-10">
                  <ul className="grid gap-2 pl-6 [list-style:disc] marker:text-white/60">
                    {contestSubmissionDocuments.map((item) => (
                      <li className="pl-1" key={item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </section>

          <section id="support" className="scroll-mt-28">
            <SectionTitle>후속 - 창업·사업화 지원</SectionTitle>

            <div className="mt-12">
              <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                추진절차
              </h3>
              <ol className="mt-6 grid gap-16 lg:grid-cols-3 lg:gap-12">
                {commercializationProcess.map((step, index) => (
                  <li
                    className="landing-panel interactive-card relative flex min-h-32 items-center justify-center rounded-[24px] border border-[#45C4DE]/55 p-6 text-center text-xl font-semibold"
                    key={step}
                  >
                    <span className="sr-only">{index + 1}단계: </span>
                    {step}
                    {index < commercializationProcess.length - 1 && (
                      <FlowArrow className="absolute -bottom-11 left-1/2 z-2 -translate-x-1/2 rotate-90 text-[#45C4DE] lg:top-1/2 lg:bottom-auto lg:left-[calc(100%+1.5rem)] lg:-translate-y-1/2 lg:rotate-0" />
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-7 text-center text-lg font-semibold text-white/55 sm:text-xl">
                11월 중 순차 진행
              </p>
            </div>

            <div className="mt-16">
              <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                지원내용
              </h3>
              <p className="mt-3 text-lg font-semibold text-white/60 sm:text-xl">
                창업·사업화 지원 (총 1억원 규모)
              </p>
              <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr_1fr]">
                <article className="landing-panel rounded-[28px] border border-[#45C4DE]/45 p-7 sm:p-8">
                  <p className="text-lg font-semibold text-[#45C4DE]">
                    창업·사업화 컨설팅
                  </p>
                  <p className="mt-5 text-lg leading-[1.65] font-semibold text-white/80 sm:text-xl">
                    창업·사업화 전문가 매칭 및 컨설팅을 통한 역량 강화
                  </p>
                </article>
                <article className="landing-panel rounded-[28px] border border-[#45C4DE]/55 p-7 sm:p-8">
                  <p className="text-lg font-semibold text-[#45C4DE]">
                    창업·사업화 지원금
                  </p>
                  <ul className="mt-5 grid gap-3">
                    {[
                      ['3,000', '1팀'],
                      ['2,000', '2팀'],
                      ['1,000', '3팀'],
                    ].map(([amount, teams]) => (
                      <li
                        className="flex items-baseline justify-center gap-1.5 border-t border-[#45C4DE]/35 pt-3 text-2xl font-semibold whitespace-nowrap first:border-0 first:pt-0"
                        key={amount}
                      >
                        <span>{amount}</span>
                        <span className="text-sm font-medium">만원</span>
                        <span className="mx-0.5 text-sm font-medium text-white/65">
                          x
                        </span>
                        <span>{teams}</span>
                      </li>
                    ))}
                  </ul>
                </article>
                <article className="landing-panel rounded-[28px] border border-[#45C4DE]/45 p-7 sm:p-8">
                  <p className="text-lg font-semibold text-[#45C4DE]">비고</p>
                  <p className="mt-5 text-lg leading-[1.65] font-semibold text-white/80 sm:text-xl">
                    경진대회 수상순위에 따라 협약요건 충족팀 순차 지원
                  </p>
                </article>
              </div>
              <p className="mt-5 text-lg leading-[1.6] text-white/50 sm:text-sm">
                ※ 지원 대상자는 부산지역 내 창업 또는 사업장 이전 필수
              </p>
            </div>

            <div className="mt-16">
              <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                자격요건
              </h3>
              <ul className="mt-6 grid gap-3 text-lg leading-[1.65] text-white/75 sm:text-xl">
                {commercializationEligibility.map((item) => (
                  <li className="flex items-start gap-2.5" key={item}>
                    <span
                      aria-hidden="true"
                      className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-white/45"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <article className="landing-panel rounded-[28px] border border-[#45C4DE]/55 p-7 sm:p-8">
                  <h4 className="text-lg font-semibold text-[#45C4DE]">
                    필수 협약요건
                  </h4>
                  <ol className="mt-6 grid gap-4 text-lg leading-[1.7] text-white/75 sm:text-xl">
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
                  <h4 className="text-lg font-semibold text-[#45C4DE]">
                    지원제외 대상
                  </h4>
                  <ul className="mt-6 grid gap-3 text-lg leading-[1.65] text-white/70 sm:text-xl">
                    {excludedFromSupport.map((item) => (
                      <li className="flex items-start gap-2.5" key={item}>
                        <span
                          aria-hidden="true"
                          className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-white/45"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>

            <div className="landing-panel mt-5 rounded-[28px] border border-[#45C4DE]/45 p-7 sm:p-8">
              <h3 className="text-lg font-semibold text-[#45C4DE]">제출서류</h3>
              <p className="mt-4 flex items-start gap-2.5 text-lg leading-[1.65] text-white/75 sm:text-xl">
                <span
                  aria-hidden="true"
                  className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-white/45"
                />
                <span>사업자등록증 사본(협약일로부터 2개월 이내)</span>
              </p>
              <p className="sm:text-m mt-4 flex items-start gap-2.5 text-lg leading-[1.65] text-white/75">
                &nbsp;&nbsp; ※ 부산시 관내 사업장 소재지 확인이 가능한
                발급분
              </p>
            </div>
          </section>

          <FaqSection faqs={faqs} />

          <section id="contact" className="scroll-mt-28">
            <SectionTitle>문의하기</SectionTitle>
            <p className="mt-5 text-lg leading-[1.7] text-white/70 sm:text-xl">
              대회 참가에 대해 궁금한 점이 있으신가요?
              <br />
              카카오톡 오픈 채팅방으로 편하게 문의해 주세요.
            </p>
            <a
              className="mt-8 flex min-h-14 w-fit items-center gap-2 rounded-full bg-[#FEE500] px-8 font-bold text-[#191919] transition-opacity hover:opacity-90"
              href="http://pf.kakao.com/_uwqJX"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Image
                alt=""
                aria-hidden="true"
                src="/assets/kakaoicon.png"
                width={21}
                height={21}
              />
              카카오톡 오픈 채팅방 문의하기
            </a>
          </section>
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
