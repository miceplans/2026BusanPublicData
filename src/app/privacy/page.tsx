import type { Metadata } from 'next';
import Link from 'next/link';

import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 2026 해양수도 부산 AI 창업 경진대회',
  description: '2026 해양수도 부산 AI 창업 경진대회 개인정보처리방침',
};

const policySections = [
  {
    title: '1. 개인정보의 처리 목적',
    content: (
      <p>
        부산정보산업진흥원은 2026 해양수도 부산 AI 창업 경진대회 참가 신청의
        접수, 신청자 본인 확인, 참가 자격 확인, 신청 내용의 조회·수정, 심사 및
        대회 운영, 신청 완료 안내, 민원·문의 처리와 분쟁 대응을 위해 개인정보를
        처리합니다. 수집한 개인정보는 이 목적 이외의 용도로 이용하지 않으며,
        이용 목적이 변경되는 경우 관계 법령에 따라 별도의 동의를 받는 등 필요한
        조치를 합니다.
      </p>
    ),
  },
  {
    title: '2. 처리하는 개인정보의 항목',
    content: (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-y border-black/20 bg-[#f6f6f8]">
              <th className="px-4 py-3">구분</th>
              <th className="px-4 py-3">항목</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/10 align-top">
              <td className="px-4 py-4 font-bold">필수 입력 정보</td>
              <td className="px-4 py-4">
                팀명, 팀장 이름·이메일·연락처·지역, 참가 유형, 참가 분야,
                아이템명, 아이템 요약, 팀원 이름·역할, 부산 소재 여부, 지원대상
                및 제외사유 확인 결과, 개인정보 수집·이용 동의 일시
              </td>
            </tr>
            <tr className="border-b border-black/10 align-top">
              <td className="px-4 py-4 font-bold">제출 자료</td>
              <td className="px-4 py-4">
                참가 자격 및 신청 내용 확인을 위해 이용자가 제출한 증빙 이미지와
                파일명·형식·크기 등의 파일 정보
              </td>
            </tr>
            <tr className="border-b border-black/10 align-top">
              <td className="px-4 py-4 font-bold">자동 생성 정보</td>
              <td className="px-4 py-4">
                접수번호, 신청·수정 일시, 접속기록, IP 주소, 서비스 이용기록,
                오류 및 보안 기록
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-xs text-[#6b6b75]">
          신청 비밀번호는 복호화할 수 없는 해시값으로 변환하여 저장하며 원문을
          저장하지 않습니다.
        </p>
      </div>
    ),
  },
  {
    title: '3. 개인정보의 처리 및 보유 기간',
    content: (
      <>
        <p>
          참가 신청 및 대회 운영을 위해 수집한 개인정보는 수집일로부터 1년간
          보유한 뒤 지체 없이 파기합니다. 다만, 관계 법령에 따라 보존할 필요가
          있거나 분쟁·민원 처리가 진행 중인 경우에는 해당 사유가 종료될 때까지
          필요한 범위에서 분리 보관할 수 있습니다.
        </p>
        <p className="mt-3">
          접속기록과 관리자 작업기록은 보안 및 부정 이용 방지를 위해 내부 보관
          기준에 따른 기간 동안 보관한 뒤 파기합니다.
        </p>
      </>
    ),
  },
  {
    title: '4. 개인정보의 제3자 제공',
    content: (
      <p>
        개인정보를 정보주체의 동의 없이 제3자에게 제공하지 않습니다. 법령에
        특별한 규정이 있거나 정보주체가 사전에 동의한 경우에는 제공받는 자,
        목적, 항목 및 보유기간을 알린 뒤 필요한 범위에서만 제공합니다.
      </p>
    ),
  },
  {
    title: '5. 개인정보 처리업무의 위탁',
    content: (
      <>
        <p>
          원활한 서비스 운영을 위해 다음과 같이 개인정보 처리업무를 위탁하며,
          위탁계약 시 개인정보 보호 관련 법령에 따른 보호조치를 명시하고
          수탁자의 처리 현황을 관리·감독합니다.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-y border-black/20 bg-[#f6f6f8]">
                <th className="px-4 py-3">수탁자</th>
                <th className="px-4 py-3">위탁 업무</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black/10">
                <td className="px-4 py-4">Supabase, Inc.</td>
                <td className="px-4 py-4">
                  데이터베이스·인증·파일 저장 서비스 운영
                </td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="px-4 py-4">Vercel Inc.</td>
                <td className="px-4 py-4">웹사이트 호스팅 및 서비스 제공</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="px-4 py-4">네이버 주식회사</td>
                <td className="px-4 py-4">신청 완료 이메일 발송</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    title: '6. 개인정보의 파기 절차 및 방법',
    content: (
      <p>
        보유기간이 지나거나 처리 목적이 달성되어 개인정보가 불필요하게 되면 지체
        없이 파기합니다. 전자적 파일은 복구 또는 재생할 수 없는 방법으로
        삭제하고, 출력물 등 종이 문서는 분쇄하거나 소각합니다. 다른 법령에 따라
        계속 보존해야 하는 정보는 별도의 저장공간에 분리하여 보관합니다.
      </p>
    ),
  },
  {
    title: '7. 정보주체의 권리·의무 및 행사 방법',
    content: (
      <p>
        정보주체는 자신의 개인정보에 대해 열람, 정정·삭제, 처리정지를 요청할 수
        있습니다. 신청 확인·수정 페이지에서 직접 확인하거나 정정할 수 있으며, 그
        밖의 요청은 아래 문의처로 접수할 수 있습니다. 법령에서 정한 사유가 있는
        경우 요청이 제한될 수 있으며, 본인 또는 정당한 대리인인지 확인하기 위해
        필요한 자료를 요청할 수 있습니다.
      </p>
    ),
  },
  {
    title: '8. 개인정보의 안전성 확보 조치',
    content: (
      <p>
        개인정보에 대한 접근 권한을 최소화하고 관리자 인증과 접근통제를
        적용합니다. 신청 비밀번호는 안전한 방식으로 해시 처리하며, 증빙파일은
        비공개 저장소에 보관하고 제한된 시간 동안만 유효한 접근주소로
        제공합니다. 또한 전송 구간 암호화, 접속기록 관리, 입력값 검증, 요청 횟수
        제한 등의 기술적·관리적 보호조치를 시행합니다.
      </p>
    ),
  },
  {
    title: '9. 개인정보 자동 수집 장치',
    content: (
      <p>
        신청 확인·수정 및 관리자 로그인 상태를 안전하게 유지하기 위한 필수
        쿠키를 사용할 수 있습니다. 이 쿠키는 로그인 상태와 보안을 위한
        목적으로만 사용되며 맞춤형 광고나 행동정보 분석에 사용하지 않습니다.
        브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 기능
        이용이 제한될 수 있습니다.
      </p>
    ),
  },
  {
    title: '10. 개인정보 보호 및 고충처리 문의',
    content: (
      <>
        <dl className="grid gap-2 rounded-2xl bg-[#f6f6f8] p-5 text-sm sm:grid-cols-[130px_1fr]">
          <dt className="font-bold">담당부서</dt>
          <dd>대회 운영사무국</dd>
          <dt className="font-bold">이메일</dt>
          <dd>
            <a
              className="underline underline-offset-4"
              href="mailto:office1170@naver.com"
            >
              office1170@naver.com
            </a>
          </dd>
        </dl>
        <p className="mt-4">
          개인정보 침해에 대한 상담이 필요한 경우 개인정보침해 신고센터(국번
          없이 118), 개인정보분쟁조정위원회(1833-6972) 등 관계 기관에 문의할 수
          있습니다.
        </p>
      </>
    ),
  },
  {
    title: '11. 개인정보처리방침의 변경',
    content: (
      <p>
        이 방침은 2026년 8월 26일부터 적용됩니다. 내용이 변경되는 경우
        변경사항과 시행일을 웹사이트를 통해 공개합니다.
      </p>
    ),
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-[#191f28]">
      <header className="border-b border-black/8 bg-white px-5 sm:px-8">
        <div className="mx-auto flex min-h-[72px] max-w-[1000px] items-center justify-between gap-4">
          <Link className="font-extrabold tracking-[-0.035em]" href="/">
            2026 해양수도 부산 AI 창업 경진대회
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1000px] px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-sm font-extrabold text-[#b50065]">
          2026 해양수도 부산 AI 창업 경진대회
        </p>
        <h1 className="mt-3 text-[clamp(2.25rem,5vw,3.75rem)] font-bold tracking-[0.055em]">
          개인정보처리방침
        </h1>
        <p className="mt-6 max-w-[780px] text-[15px] leading-7 text-[#5f6570]">
          부산정보산업진흥원은 개인정보 보호법 등 관계 법령을 준수하며, 이용자의
          개인정보를 안전하게 보호하기 위해 다음과 같이 개인정보처리방침을
          공개합니다.
        </p>

        <div className="mt-14 divide-y divide-black/10 border-y border-black/15">
          {policySections.map((section) => (
            <section className="py-9 sm:py-11" key={section.title}>
              <h2 className="text-xl font-extrabold tracking-[-0.035em] sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-5 text-[15px] leading-7 text-[#4b5260]">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
