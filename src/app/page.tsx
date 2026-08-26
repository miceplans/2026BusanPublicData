import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';

const overview = [
  ['대회명', '2026 부산 AI 창업 경진대회'],
  ['주최', '부산광역시'],
  ['주관', '부산정보산업진흥원'],
  ['개최장소', '벡스코 컨벤션홀 205호'],
  ['참여기관', '부산창조경제혁신센터'],
  [
    '추진목적',
    '우수 AI 스타트업 발굴, 창업 활성화 및 지역 AI 창업 생태계 조성',
  ],
];

const awards = [
  ['대상', '1개 팀', '부산광역시장상', '200만원 상당 생성형 AI 이용권'],
  [
    '최우수',
    '2개 팀',
    '부산정보산업진흥원장상',
    '100만원 상당 생성형 AI 이용권',
  ],
  ['우수', '3개 팀', '부산정보산업진흥원장상', '50만원 상당 생성형 AI 이용권'],
  [
    '장려',
    '5개 팀',
    '부산창조경제혁신센터장상',
    '30만원 상당 생성형 AI 이용권',
  ],
];

const support = [
  ['대상', '1팀', '30,000,000원'],
  ['최우수', '2팀', '팀당 20,000,000원'],
  ['우수', '3팀', '팀당 10,000,000원'],
];

const schedule = [
  ['9월', '신청접수 · 참가팀 모집'],
  ['10월', '예선 서면심사'],
  ['10월 31일', '본선 발표심사 및 시상식'],
  ['11월', '창업·사업화 지원 협약'],
  ['11월~12월', '창업사업화 교육 및 컨설팅'],
  ['12월', '창업·사업화 지원금 수여'],
];

const operationPlan = [
  {
    stage: '예선',
    qualification: 'AI 관련 예비창업팀·신규창업팀',
    selection: '제한 없음 / 20개 팀',
    description: '창업 및 사업화 계획 서면평가',
  },
  {
    stage: '본선',
    qualification: '예선 서류평가 통과팀',
    selection: '20개 팀 / 11개 팀',
    description: '아이디어 발표평가 및 시상식',
  },
  {
    stage: '사업화 지원',
    qualification: '본선 상위 6개 팀',
    selection: '6개 팀',
    description: '전문가 매칭 및 컨설팅',
  },
];

const participation = [
  '예비창업자 또는 업력 2년 이내 신규 창업기업',
  '2~4인으로 구성된 팀',
  '팀원 전원이 지원대상 요건을 충족해야 함',
  '부산 소재 예비·신규 창업자에게 평가 전형별 우대 가점',
];

const agreement = [
  '창업 경진대회 입상팀',
  '협약일로부터 1년 이상 부산광역시 관내 소재 창업기업 유지',
  '예비창업자는 협약일로부터 2개월 이내 부산광역시 관내 사업자등록 완료',
  '신규창업자는 부산 소재 기업이거나 2개월 이내 부산광역시 관내로 소재지 이전',
  '지점은 인정하지 않음',
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="max-w-[760px] text-[clamp(2rem,5vw,3.5rem)] leading-[1.12] font-bold tracking-[-0.055em]">
      {children}
    </h2>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            className="flex min-h-11 items-center text-lg font-extrabold tracking-[-0.045em] sm:text-xl"
            href="/"
          >
            2026 부산 AI 창업 경진대회
          </Link>
          <nav
            aria-label="주요 메뉴"
            className="flex items-center gap-1 text-sm font-bold"
          >
            <a
              className="hidden min-h-11 items-center rounded-full px-4 hover:bg-[#f5f5f7] sm:flex"
              href="#overview"
            >
              대회개요
            </a>
            <a
              className="hidden min-h-11 items-center rounded-full px-4 hover:bg-[#f5f5f7] sm:flex"
              href="#support"
            >
              지원내용
            </a>
            <a
              className="hidden min-h-11 items-center rounded-full px-4 hover:bg-[#f5f5f7] md:flex"
              href="#schedule"
            >
              추진절차
            </a>
            <Link
              className="flex min-h-11 items-center rounded-full bg-[#0053b9] px-5 text-white hover:bg-[#00489f]"
              href="/apply"
            >
              참가 신청
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="overflow-hidden bg-[linear-gradient(145deg,#f3f7fc_0%,#ffffff_55%,#eef6ff_100%)] px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-[1280px]">
            <div className="hero-copy max-w-[960px]">
              <h1 className="mt-6 text-[clamp(2.65rem,5.5vw,4.5rem)] leading-[1.08] font-extrabold tracking-[0.04em]">
                2026 부산 AI 창업 경진대회
              </h1>
              <p className="mt-8 max-w-[680px] text-lg leading-[1.7] text-[#5b5b66] sm:text-xl">
                부산 9대 전략산업 기반 AI 스타트업을 발굴하고,
                <br /> 예비·초기 창업기업의 사업화까지 연결합니다.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#0053b9] px-7 text-base font-bold text-white hover:bg-[#00489f]"
                  href="/apply"
                >
                  참가 신청하기
                </Link>
                <Link
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#d8d8e2] bg-white px-7 text-base font-bold hover:bg-[#f7f7fa]"
                  href="/application/login"
                >
                  신청 확인·수정
                </Link>
              </div>
            </div>
            <div className="hero-stats mt-20 grid border-t border-black/10 pt-8 sm:grid-cols-3 sm:gap-8">
              {[
                ['9개', '부산 전략산업 분야'],
                ['2~4인', '팀 단위 참가'],
                ['107백만원', '시상·사업화 지원'],
              ].map(([value, label]) => (
                <div
                  className="border-b border-black/10 py-5 sm:border-0 sm:py-0"
                  key={label}
                >
                  <strong className="block text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">
                    {value}
                  </strong>
                  <span className="mt-2 block text-sm text-[#696975]">
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
                  className="min-h-44 rounded-[28px] bg-[#f6f6f8] p-7 sm:p-8"
                  key={term}
                >
                  <dt className="text-sm font-bold text-[#777784]">{term}</dt>
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
              <article className="rounded-[32px] bg-[#f5f5f7] p-7 sm:p-10">
                <span className="text-sm font-extrabold text-[#0053b9]">
                  경진대회
                </span>
                <h3 className="mt-4 text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">
                  총 7백만원 상당 생성형 AI 이용권
                </h3>
                <div className="mt-10 grid gap-3">
                  {awards.map(([name, count, title, prize]) => (
                    <div className="rounded-2xl bg-white p-5" key={name}>
                      <div className="flex items-center justify-between gap-3">
                        <strong>{name}</strong>
                        <span className="rounded-full bg-[#eef4fb] px-3 py-1 text-xs font-bold text-[#0053b9]">
                          {count}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-[#777784]">{title}</p>
                      <p className="mt-1 font-bold">{prize}</p>
                    </div>
                  ))}
                </div>
              </article>
              <article className="rounded-[32px] bg-[#0053b9] p-7 text-white sm:p-10">
                <span className="text-sm font-extrabold text-white/70">
                  사업화 지원
                </span>
                <h3 className="mt-4 text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">
                  총 100백만원 · 본선 상위 6개 팀 지원
                </h3>
                <div className="mt-10 grid gap-3">
                  {support.map(([name, count, amount]) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 p-5"
                      key={name}
                    >
                      <div>
                        <strong>{name}</strong>
                        <span className="mt-1 block text-xs text-white/65">
                          {count}
                        </span>
                      </div>
                      <strong className="text-right text-sm sm:text-base">
                        {amount}
                      </strong>
                    </div>
                  ))}
                </div>
                <p className="mt-8 text-sm leading-[1.6] text-white/70">
                  교육·컨설팅, 공간, 시제품 제작비 등 창업 역량 강화 지원
                </p>
              </article>
            </div>
          </section>

          <div className="grid gap-20">
            <div className="min-w-0">
              <section id="schedule" className="scroll-mt-28">
                <SectionTitle>추진절차</SectionTitle>
                <p className="mt-5 text-sm text-[#777784]">
                  일정 및 세부내용은 운영 상황에 따라 변동될 수 있습니다.
                </p>
                <ol className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {schedule.map(([date, label], index) => (
                    <li
                      className="min-h-44 rounded-[28px] border border-[#e5e5ec] p-6"
                      key={label}
                    >
                      <span className="text-sm font-extrabold text-[#0053b9]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <strong className="mt-7 block text-xl tracking-[-0.035em]">
                        {label}
                      </strong>
                      <span className="mt-3 block text-sm text-[#777784]">
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
                      className="rounded-[28px] bg-[#f6f6f8] p-7"
                      key={item.stage}
                    >
                      <span className="text-sm font-extrabold text-[#0053b9]">
                        STEP {index + 1}
                      </span>
                      <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.04em]">
                        {item.stage}
                      </h3>
                      <dl className="mt-8 grid gap-5">
                        {[
                          ['자격', item.qualification],
                          ['참가·선발', item.selection],
                          ['내용', item.description],
                        ].map(([label, value]) => (
                          <div
                            className="border-t border-black/10 pt-4"
                            key={label}
                          >
                            <dt className="text-xs font-bold text-[#777784]">
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
                  <div className="rounded-[32px] bg-[#111111] p-7 text-white sm:p-10">
                    <h3 className="text-2xl font-extrabold tracking-[-0.04em]">
                      참가요건
                    </h3>
                    <ul className="mt-8 grid gap-5 text-sm leading-[1.65] text-white/75">
                      {participation.map((item) => (
                        <li className="flex items-start gap-2.5" key={item}>
                          <span
                            aria-hidden="true"
                            className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-[#78aee8]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[32px] bg-[#eef4fb] p-7 sm:p-10">
                    <h3 className="text-2xl font-extrabold tracking-[-0.04em]">
                      협약요건
                    </h3>
                    <ul className="mt-8 grid gap-5 text-sm leading-[1.65] text-[#4f4f61]">
                      {agreement.map((item) => (
                        <li className="flex items-start gap-2.5" key={item}>
                          <span
                            aria-hidden="true"
                            className="mt-[0.65em] block size-1.5 shrink-0 rounded-full bg-[#0053b9]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <section className="bg-[#111111] px-5 py-24 text-white sm:px-8 sm:py-32">
          <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
            <h2 className="max-w-[800px] text-[clamp(1.5rem,2vw,5rem)] leading-[1.02] font-extrabold tracking-[0.065em]">
              2026 부산 AI 창업 경진대회
            </h2>
            <Link
              className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-full bg-[#0053b9] px-8 font-bold hover:bg-[#176bc9]"
              href="/apply"
            >
              참가 신청하기
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
