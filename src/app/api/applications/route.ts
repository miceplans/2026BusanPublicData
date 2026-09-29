import { hash } from 'bcryptjs';
import { NextRequest, NextResponse, after } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { phoneLastFour } from '@/validations';
import {
  registerUploadedFiles,
  uploadedFilesSchema,
  UploadVerificationError,
} from '@/lib/files';
import { sendCompletionEmail } from '@/lib/email';
import { jsonError, validationError } from '@/lib/http';
import { invalidateApplicationList } from '@/lib/admin-application-list';
import { isPastLateSubmissionGrace } from '@/lib/application-deadline';
import {
  preflightApplication,
  submissionFilePrefix,
} from '@/lib/application-submission';
import { readSubmissionTicketIssuedAt } from '@/lib/submission-ticket';

const closedResponse = () =>
  jsonError('접수 신청 기간이 종료되었습니다.', 403, {
    reason: 'application_closed',
  });

// 2단계: 파일이 Storage에 직접 업로드된 뒤 신청서를 저장한다.
// 요청에는 파일 본문이 없으므로 Vercel 요청 크기 제한과 무관하다.
export async function POST(request: NextRequest) {
  if (!request.headers.get('content-type')?.includes('application/json'))
    return jsonError(
      '신청 페이지가 업데이트되었습니다. 입력 내용을 복사해 둔 뒤 페이지를 새로고침하고 다시 제출해 주세요.',
      409,
    );
  const db = createAdminClient();
  let applicationId: string | null = null;
  let stage = 'parse_request';
  try {
    let body: { data?: unknown; ticket?: unknown; files?: unknown };
    try {
      body = await request.json();
    } catch {
      return jsonError('신청 데이터 형식이 올바르지 않습니다.');
    }
    const idempotencyKey =
      body.data && typeof body.data === 'object'
        ? (body.data as { idempotencyKey?: unknown }).idempotencyKey
        : undefined;
    // 마감 판정은 제출 버튼을 누른 시각(티켓 발급 시각) 기준이다.
    const issuedAt =
      typeof idempotencyKey === 'string'
        ? readSubmissionTicketIssuedAt(body.ticket, idempotencyKey)
        : null;
    if (issuedAt === null) {
      if (isPastLateSubmissionGrace()) return closedResponse();
      return jsonError('제출 정보가 만료되었습니다. 다시 제출해 주세요.', 409);
    }
    if (isPastLateSubmissionGrace(new Date(issuedAt))) return closedResponse();
    stage = 'validate_files';
    const files = uploadedFilesSchema.safeParse(body.files ?? []);
    if (!files.success) return validationError(files.error);
    stage = 'validate_application';
    const preflight = await preflightApplication(body.data);
    if ('response' in preflight) return preflight.response;
    const { settings, normalized } = preflight;
    const parsed = preflight;
    const receiptNumber = `BSAI-2026-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();
    stage = 'hash_password';
    const passwordHash = await hash(phoneLastFour(parsed.data.leaderPhone), 12);
    stage = 'save_application';
    const { data: application, error } = await db
      .from('applications')
      .insert({
        receipt_number: receiptNumber,
        team_name: parsed.data.teamName.trim(),
        normalized_team_name: normalized,
        password_hash: passwordHash,
        credential_type: 'phone_last_four',
        leader_name: parsed.data.leaderName,
        leader_org: parsed.data.leaderOrg,
        leader_email: parsed.data.leaderEmail.toLowerCase(),
        leader_phone: parsed.data.leaderPhone,
        leader_birth_date: parsed.data.leaderBirthDate,
        leader_gender: parsed.data.leaderGender,
        leader_residence: parsed.data.leaderResidence,
        participation_type: parsed.data.participationType,
        industry: parsed.data.industry,
        information_source: parsed.data.informationSource,
        information_source_other:
          parsed.data.informationSource === '기타'
            ? parsed.data.informationSourceOther
            : null,
        item_name: parsed.data.itemName,
        item_summary: parsed.data.itemSummary,
        proposal_background: '',
        introduction_and_differentiation: '',
        feasibility_and_business_viability: '',
        expected_effects: '',
        eligibility_confirmed: true,
        exclusion_confirmed: true,
        privacy_agreed_at: now,
        requests: parsed.data.requests || null,
        idempotency_key: parsed.data.idempotencyKey,
      })
      .select('id,created_at')
      .single();
    if (error?.code === '23505' && error.message.includes('idempotency_key')) {
      // 같은 신청이 동시에 재전송되어 다른 요청이 먼저 저장한 경우
      const { data: duplicate } = await db
        .from('applications')
        .select('receipt_number')
        .eq('idempotency_key', parsed.data.idempotencyKey)
        .maybeSingle();
      if (duplicate)
        return NextResponse.json({
          ok: true,
          receiptNumber: duplicate.receipt_number,
          duplicate: true,
        });
    }
    if (error || !application) throw error ?? new Error('신청 저장 실패');
    applicationId = application.id;
    stage = 'save_members';
    const { error: memberError } = await db.from('application_members').insert(
      parsed.data.members.map((member, index) => ({
        application_id: application.id,
        name: member.name,
        role: member.role,
        is_leader: member.isLeader,
        display_order: index + 1,
        org: member.org,
        email: member.email.toLowerCase(),
        phone: member.phone,
        birth_date: member.birthDate,
        gender: member.gender,
        residence: member.residence,
      })),
    );
    if (memberError) throw memberError;
    stage = 'register_files';
    await registerUploadedFiles(
      application.id,
      submissionFilePrefix(parsed.data.idempotencyKey),
      files.data,
    );
    invalidateApplicationList();
    after(() =>
      sendCompletionEmail({
        applicationId: application.id,
        receiptNumber,
        teamName: parsed.data.teamName,
        email: parsed.data.leaderEmail,
        createdAt: application.created_at,
        body: settings.completion_email_body,
        contact: settings.contact,
      }),
    );
    return NextResponse.json({ ok: true, receiptNumber }, { status: 201 });
  } catch (error) {
    const safeError = error as {
      name?: unknown;
      code?: unknown;
      status?: unknown;
      message?: unknown;
    };
    console.error('application_submission_failed', {
      stage,
      name: typeof safeError?.name === 'string' ? safeError.name : undefined,
      code: typeof safeError?.code === 'string' ? safeError.code : undefined,
      status:
        typeof safeError?.status === 'number' ? safeError.status : undefined,
      message:
        typeof safeError?.message === 'string'
          ? safeError.message.slice(0, 300)
          : undefined,
    });
    // Storage 객체는 지우지 않는다. 같은 신청이 동시에 재전송된 경우 먼저
    // 성공한 요청의 파일일 수 있다. 연결되지 않은 객체는 조회되지 않는다.
    if (applicationId)
      await db.from('applications').delete().eq('id', applicationId);
    if (error instanceof UploadVerificationError)
      return jsonError(error.message, 422);
    if (
      stage === 'save_application' &&
      safeError?.code === '23505' &&
      typeof safeError.message === 'string' &&
      safeError.message.includes('normalized_team_name')
    )
      return jsonError('이미 사용 중인 팀명입니다.', 409);
    return jsonError(
      '신청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
      500,
      process.env.NODE_ENV === 'development' ? { stage } : undefined,
    );
  }
}
