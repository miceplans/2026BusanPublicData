import { NextRequest, NextResponse } from 'next/server';
import { createUploadTargets, uploadRequestSchema } from '@/lib/files';
import { jsonError, validationError } from '@/lib/http';
import { isPastLateSubmissionGrace } from '@/lib/application-deadline';
import {
  preflightApplication,
  submissionFilePrefix,
} from '@/lib/application-submission';
import { issueSubmissionTicket } from '@/lib/submission-ticket';

// 1단계: 신청서를 미리 검증하고 파일 업로드 주소와 제출 티켓을 발급한다.
export async function POST(request: NextRequest) {
  if (isPastLateSubmissionGrace())
    return jsonError('접수 신청 기간이 종료되었습니다.', 403, {
      reason: 'application_closed',
    });
  let body: { data?: unknown; files?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError('신청 데이터 형식이 올바르지 않습니다.');
  }
  const files = uploadRequestSchema.safeParse(body.files ?? []);
  if (!files.success) return validationError(files.error);
  try {
    const preflight = await preflightApplication(body.data);
    if ('response' in preflight) return preflight.response;
    const key = preflight.data.idempotencyKey;
    const uploads = await createUploadTargets(
      submissionFilePrefix(key),
      files.data,
    );
    return NextResponse.json({
      ok: true,
      ticket: issueSubmissionTicket(key),
      uploads,
    });
  } catch (error) {
    console.error('application_prepare_failed', {
      message: error instanceof Error ? error.message.slice(0, 300) : undefined,
    });
    return jsonError(
      '신청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
      500,
    );
  }
}
