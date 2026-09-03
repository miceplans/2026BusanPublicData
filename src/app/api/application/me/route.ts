import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getApplicationId } from '@/lib/application-session';
import { applicationUpdateSchema, normalizeTeamName } from '@/validations';
import { getSettings, applicationEditable } from '@/lib/settings';
import { jsonError, validationError } from '@/lib/http';
import { invalidateApplicationList } from '@/lib/admin-application-list';
import { hash } from 'bcryptjs';
import { phoneLastFour } from '@/validations';

export async function GET() {
  const id = await getApplicationId();
  if (!id) return jsonError('로그인이 필요합니다.', 401);
  const db = createAdminClient();
  const { data, error } = await db
    .from('applications')
    .select(
      'id,receipt_number,team_name,leader_name,leader_org,leader_email,leader_phone,leader_birth_date,leader_gender,leader_residence,participation_type,industry,information_source,information_source_other,item_name,item_summary,eligibility_confirmed,exclusion_confirmed,requests,created_at,updated_at,application_members(id,name,role,is_leader,display_order,org,email,phone,birth_date,gender,residence),application_files(id,original_name,mime_type,size_bytes,created_at)',
    )
    .eq('id', id)
    .single();
  if (error || !data) return jsonError('신청 정보를 찾을 수 없습니다.', 404);
  const settings = await getSettings();
  return NextResponse.json({
    ok: true,
    application: data,
    editable: applicationEditable(settings),
    settings,
  });
}
export async function PATCH(request: NextRequest) {
  const id = await getApplicationId();
  if (!id) return jsonError('로그인이 필요합니다.', 401);
  const parsed = applicationUpdateSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return validationError(parsed.error);
  const db = createAdminClient();
  const settings = await getSettings();
  if (!applicationEditable(settings))
    return jsonError('현재 신청 내용을 수정할 수 없습니다.', 403);
  if (
    settings.item_summary_max_length &&
    parsed.data.itemSummary.length > settings.item_summary_max_length
  )
    return jsonError(
      `아이템 요약은 ${settings.item_summary_max_length}자 이하로 입력해 주세요.`,
      422,
    );
  const normalized = normalizeTeamName(parsed.data.teamName);
  const { error } = await db
    .from('applications')
    .update({
      team_name: parsed.data.teamName,
      normalized_team_name: normalized,
      leader_name: parsed.data.leaderName,
      leader_org: parsed.data.leaderOrg,
      leader_email: parsed.data.leaderEmail.toLowerCase(),
      leader_phone: parsed.data.leaderPhone,
      password_hash: await hash(phoneLastFour(parsed.data.leaderPhone), 12),
      credential_type: 'phone_last_four',
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
      eligibility_confirmed: true,
      exclusion_confirmed: true,
      requests: parsed.data.requests || null,
    })
    .eq('id', id);
  if (error)
    return jsonError(
      error.code === '23505'
        ? '이미 사용 중인 팀명입니다.'
        : '수정 내용을 저장할 수 없습니다.',
      error.code === '23505' ? 409 : 500,
    );
  await db.from('application_members').delete().eq('application_id', id);
  const { error: memberError } = await db.from('application_members').insert(
    parsed.data.members.map((member, index) => ({
      application_id: id,
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
  if (memberError) return jsonError('팀원 정보를 저장할 수 없습니다.', 500);
  invalidateApplicationList();
  return NextResponse.json({ ok: true });
}
