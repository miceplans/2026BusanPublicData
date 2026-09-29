import 'server-only';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applicationSchema, normalizeTeamName } from '@/validations';
import { getSettings } from '@/lib/settings';
import { jsonError, validationError } from '@/lib/http';

export const submissionFilePrefix = (idempotencyKey: string) =>
  `submissions/${idempotencyKey}`;

// 업로드 준비와 최종 제출이 같은 기준으로 신청서를 검증하도록 공유한다.
export async function preflightApplication(json: unknown) {
  const parsed = applicationSchema.safeParse(json);
  if (!parsed.success)
    return { response: validationError(parsed.error) } as const;
  const settings = await getSettings();
  if (
    settings.item_summary_max_length &&
    parsed.data.itemSummary.length > settings.item_summary_max_length
  )
    return {
      response: jsonError(
        `아이템 요약은 ${settings.item_summary_max_length}자 이하로 입력해 주세요.`,
        422,
      ),
    } as const;
  const db = createAdminClient();
  const { data: duplicate } = await db
    .from('applications')
    .select('id,receipt_number')
    .eq('idempotency_key', parsed.data.idempotencyKey)
    .maybeSingle();
  if (duplicate)
    return {
      response: NextResponse.json({
        ok: true,
        receiptNumber: duplicate.receipt_number,
        duplicate: true,
      }),
    } as const;
  const normalized = normalizeTeamName(parsed.data.teamName);
  const { data: team, error: teamLookupError } = await db
    .from('applications')
    .select('id')
    .eq('normalized_team_name', normalized)
    .maybeSingle();
  if (teamLookupError) throw teamLookupError;
  if (team)
    return { response: jsonError('이미 사용 중인 팀명입니다.', 409) } as const;
  return { data: parsed.data, settings, normalized } as const;
}
