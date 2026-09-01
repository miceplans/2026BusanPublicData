import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  applicationSchema,
  normalizeTeamName,
  phoneLastFour,
} from '@/validations';
import { getSettings } from '@/lib/settings';
import { uploadFiles, validateFiles } from '@/lib/files';
import { sendCompletionEmail } from '@/lib/email';
import { jsonError, validationError } from '@/lib/http';
import { consumeRateLimit, requestClientKey } from '@/lib/rate-limit';
import { invalidateApplicationList } from '@/lib/admin-application-list';

export async function POST(request: NextRequest) {
  const rateLimit = await consumeRateLimit(
    'application_submit_ip',
    requestClientKey(request),
    5,
    60 * 60,
  );
  if (!rateLimit.allowed)
    return NextResponse.json(
      {
        ok: false,
        error: '신청 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    );
  const db = createAdminClient();
  let applicationId: string | null = null;
  let uploaded: string[] = [];
  let stage = 'parse_request';
  try {
    const form = await request.formData();
    const raw = form.get('data');
    if (typeof raw !== 'string') return jsonError('신청 데이터가 없습니다.');
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return jsonError('신청 데이터 형식이 올바르지 않습니다.');
    }
    stage = 'validate_application';
    const parsed = applicationSchema.safeParse(json);
    if (!parsed.success) return validationError(parsed.error);
    stage = 'load_settings';
    const settings = await getSettings();
    if (
      settings.item_summary_max_length &&
      parsed.data.itemSummary.length > settings.item_summary_max_length
    )
      return jsonError(
        `아이템 요약은 ${settings.item_summary_max_length}자 이하로 입력해 주세요.`,
        422,
      );
    const files = form
      .getAll('files')
      .filter((value): value is File => value instanceof File);
    stage = 'validate_files';
    validateFiles(files);
    stage = 'check_idempotency';
    const { data: duplicate } = await db
      .from('applications')
      .select('id,receipt_number')
      .eq('idempotency_key', parsed.data.idempotencyKey)
      .maybeSingle();
    if (duplicate)
      return NextResponse.json({
        ok: true,
        receiptNumber: duplicate.receipt_number,
        duplicate: true,
      });
    stage = 'check_team_name';
    const normalized = normalizeTeamName(parsed.data.teamName);
    const { data: team } = await db
      .from('applications')
      .select('id')
      .eq('normalized_team_name', normalized)
      .maybeSingle();
    if (team) return jsonError('이미 사용 중인 팀명입니다.', 409);
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
        leader_email: parsed.data.leaderEmail.toLowerCase(),
        leader_phone: parsed.data.leaderPhone,
        leader_region: parsed.data.leaderRegion,
        participation_type: parsed.data.participationType,
        industry: parsed.data.industry,
        item_name: parsed.data.itemName,
        item_summary: parsed.data.itemSummary,
        is_busan_based: parsed.data.isBusanBased,
        eligibility_confirmed: true,
        exclusion_confirmed: true,
        privacy_agreed_at: now,
        requests: parsed.data.requests || null,
        idempotency_key: parsed.data.idempotencyKey,
      })
      .select('id,created_at')
      .single();
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
      })),
    );
    if (memberError) throw memberError;
    stage = 'upload_files';
    uploaded = await uploadFiles(application.id, files);
    stage = 'send_email';
    await sendCompletionEmail({
      applicationId: application.id,
      receiptNumber,
      teamName: parsed.data.teamName,
      email: parsed.data.leaderEmail,
      createdAt: application.created_at,
      body: settings.completion_email_body,
      contact: settings.contact,
    });
    invalidateApplicationList();
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
    if (uploaded.length)
      await db.storage.from('application-files').remove(uploaded);
    if (applicationId)
      await db.from('applications').delete().eq('id', applicationId);
    if (
      stage === 'upload_files' &&
      (safeError?.code === 'EntityTooLarge' || safeError?.status === 413)
    )
      return jsonError(
        '파일이 Supabase 프로젝트의 전역 업로드 한도를 초과했습니다. 더 작은 파일을 선택하거나 운영사무국에 문의해 주세요.',
        413,
      );
    return jsonError(
      '신청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
      500,
    );
  }
}
