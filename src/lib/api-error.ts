export type ApiBody = {
  error?: string;
  details?: { reason?: string } & Record<string, unknown>;
  [key: string]: unknown;
};

// 413 등 JSON이 아닌 응답(플랫폼 에러 페이지)도 던지지 않고 빈 본문으로 처리한다.
export async function readJson<T extends ApiBody = ApiBody>(
  response: Response,
): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

const FIELD_LABELS: Record<string, string> = {
  teamName: '팀명',
  leaderName: '팀장 이름',
  leaderOrg: '팀장 소속',
  leaderEmail: '팀장 이메일',
  leaderPhone: '팀장 연락처',
  leaderBirthDate: '팀장 생년월일',
  leaderGender: '팀장 성별',
  leaderResidence: '팀장 거주지',
  participationType: '참가 유형',
  industry: '참가 분야',
  informationSource: '대회 정보 습득 경로',
  informationSourceOther: '대회 정보 습득 경로(기타)',
  itemName: '아이템명',
  itemSummary: '아이템 요약',
  members: '팀원 정보',
  eligibilityConfirmed: '참가 자격 확인',
  exclusionConfirmed: '제외 대상 확인',
  privacyAgreed: '개인정보 수집·이용 동의',
  requests: '요청 사항',
  password: '비밀번호',
  files: '증빙자료',
};

function describeInvalidFields(details: ApiBody['details']) {
  if (!details || typeof details !== 'object') return '';
  const entries = Object.entries(details).filter(
    (entry): entry is [string, string[]] =>
      Array.isArray(entry[1]) && entry[1].length > 0,
  );
  if (!entries.length) return '';
  const labels = entries.map(([key]) => FIELD_LABELS[key] ?? key);
  const firstMessage = entries[0][1].find((m) => typeof m === 'string');
  return ` 확인이 필요한 항목: ${labels.join(', ')}${firstMessage ? ` (${firstMessage})` : ''}`;
}

// HTTP 상태 코드별로 무엇이 문제인지 알려주는 토스트 문구를 만든다.
export function apiErrorMessage(
  status: number,
  body: ApiBody,
  fallback = '요청을 처리하지 못했습니다.',
) {
  const server = typeof body.error === 'string' ? body.error : '';
  switch (status) {
    case 413:
      return '[413] 업로드한 파일 용량이 너무 커서 제출하지 못했습니다. 파일 크기를 줄이거나 더 작은 파일로 다시 시도해 주세요.';
    case 422:
      return `[422] ${server || '입력값이 올바르지 않습니다.'}${describeInvalidFields(body.details)}`;
    case 400:
      return `[400] ${server || '요청 형식이 올바르지 않습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.'}`;
    case 401:
      return `[401] ${server || '로그인이 필요하거나 인증이 만료되었습니다. 다시 로그인해 주세요.'}`;
    case 403:
      return `[403] ${server || '이 작업을 수행할 권한이 없거나 접수 기간이 아닙니다.'}`;
    case 404:
      return `[404] ${server || '요청한 정보를 찾을 수 없습니다.'}`;
    case 409:
      return `[409] ${server || '이미 처리되었거나 정보가 충돌합니다. 새로고침 후 다시 시도해 주세요.'}`;
    case 429:
      return `[429] ${server || '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'}`;
    default:
      if (status >= 500)
        return `[${status}] 서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.`;
      return `[${status}] ${server || fallback}`;
  }
}
