// 접수 마감: 2026.9.30.(수) 18:00 (Asia/Seoul)
export const APPLICATION_DEADLINE = new Date('2026-09-30T18:00:00+09:00');

// 마감 직전에 제출 버튼을 눌렀지만 업로드가 끝나지 않아 마감 이후 도착한
// 요청을 받아 주기 위한 유예 시간. 이 시간 안에 도착한 신청은 접수하되
// 지각으로 표시한다.
export const LATE_SUBMISSION_GRACE_MS = 10 * 60 * 1000;

export const APPLICATION_CLOSED_PATH = '/apply/closed';

export function isApplicationClosed(now: Date = new Date()) {
  return now.getTime() >= APPLICATION_DEADLINE.getTime();
}

export function isPastLateSubmissionGrace(now: Date = new Date()) {
  return (
    now.getTime() >= APPLICATION_DEADLINE.getTime() + LATE_SUBMISSION_GRACE_MS
  );
}

export function isLateApplication(createdAt: string | Date) {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  return date.getTime() > APPLICATION_DEADLINE.getTime();
}
