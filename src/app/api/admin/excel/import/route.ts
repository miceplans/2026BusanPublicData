import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeTeamName } from '@/validations';
import { INDUSTRIES, PARTICIPATION_TYPES } from '@/types';
import { jsonError } from '@/lib/http';
const headers = [
  '접수번호',
  '팀명',
  '참가유형',
  '참가분야',
  '아이템명',
  '아이템요약',
  '대표자이름',
  '대표자이메일',
  '대표자연락처',
  '팀원수',
  '부산소재여부',
  '증빙자료수',
  '요청사항',
  '신청일시',
  '최종수정일시',
];
const rowSchema = z.object({
  접수번호: z.string().min(1),
  팀명: z.string().trim().min(1).max(100),
  참가유형: z.enum(PARTICIPATION_TYPES),
  참가분야: z.enum(INDUSTRIES),
  아이템명: z.string().trim().min(1).max(200),
  아이템요약: z.string().trim().min(1).max(10000),
  대표자이름: z.string().trim().min(1).max(50),
  대표자이메일: z.email(),
  대표자연락처: z.string().regex(/^01[016789]-?\d{3,4}-?\d{4}$/),
  팀원수: z.coerce.number(),
  부산소재여부: z.enum(['예', '아니오']),
  증빙자료수: z.coerce.number(),
  요청사항: z.string().max(2000).optional().default(''),
  신청일시: z.string(),
  최종수정일시: z.string(),
});
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return jsonError('관리자 로그인이 필요합니다.', 401);
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.xlsx'))
    return jsonError('.xlsx 파일을 선택해 주세요.');
  let rows: Record<string, unknown>[];
  try {
    const book = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const sheet = book.Sheets[book.SheetNames[0]];
    if (!sheet) return jsonError('첫 번째 시트를 읽을 수 없습니다.');
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
    });
    if (JSON.stringify(matrix[0]) !== JSON.stringify(headers))
      return jsonError('엑셀 열 이름과 순서가 명세와 일치하지 않습니다.', 422);
    rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  } catch {
    return jsonError('엑셀 파일을 읽을 수 없습니다.', 422);
  }
  const db = createAdminClient();
  const receipts = rows.map((v) => String(v['접수번호']));
  const { data: existing } = await db
    .from('applications')
    .select('*,application_members(count),application_files(count)')
    .in('receipt_number', receipts);
  const map = new Map((existing ?? []).map((v) => [v.receipt_number, v]));
  const preview = rows.map((row, index) => {
    const parsed = rowSchema.safeParse(row);
    if (!parsed.success)
      return {
        row: index + 2,
        type: '오류',
        errors: parsed.error.issues.map((v) => v.message),
      };
    const current = map.get(parsed.data.접수번호);
    if (!current)
      return {
        row: index + 2,
        type: '오류',
        errors: ['존재하지 않는 접수번호입니다.'],
      };
    if (
      Number(parsed.data.팀원수) !==
        (current.application_members?.[0]?.count ?? 0) ||
      Number(parsed.data.증빙자료수) !==
        (current.application_files?.[0]?.count ?? 0) ||
      parsed.data.신청일시 !== current.created_at ||
      parsed.data.최종수정일시 !== current.updated_at
    )
      return {
        row: index + 2,
        type: '오류',
        errors: ['계산 열은 변경할 수 없습니다.'],
      };
    const next = {
      team_name: parsed.data.팀명,
      normalized_team_name: normalizeTeamName(parsed.data.팀명),
      participation_type: parsed.data.참가유형,
      industry: parsed.data.참가분야,
      item_name: parsed.data.아이템명,
      item_summary: parsed.data.아이템요약,
      leader_name: parsed.data.대표자이름,
      leader_email: parsed.data.대표자이메일.toLowerCase(),
      leader_phone: parsed.data.대표자연락처,
      is_busan_based: parsed.data.부산소재여부 === '예',
      requests: parsed.data.요청사항 || null,
    };
    const changed = Object.entries(next).some(([k, v]) => current[k] !== v);
    return {
      row: index + 2,
      type: changed ? '수정' : '변경 없음',
      receiptNumber: parsed.data.접수번호,
      values: next,
    };
  });
  if (form.get('mode') !== 'apply')
    return NextResponse.json({
      ok: true,
      preview: preview.map((item) => ({
        row: item.row,
        type: item.type,
        errors: 'errors' in item ? item.errors : undefined,
        receiptNumber: 'receiptNumber' in item ? item.receiptNumber : undefined,
      })),
    });
  if (preview.some((v) => v.type === '오류'))
    return jsonError('오류 행을 수정한 뒤 다시 시도해 주세요.', 422, preview);
  for (const item of preview) {
    if (item.type !== '수정' || !item.receiptNumber || !item.values) continue;
    const { error } = await db
      .from('applications')
      .update(item.values)
      .eq('receipt_number', item.receiptNumber);
    if (error)
      return jsonError(
        `접수번호 ${item.receiptNumber} 반영 중 오류가 발생했습니다.`,
        409,
      );
  }
  await db.from('admin_audit_logs').insert({
    admin_user_id: admin.user.id,
    action: 'excel_import',
    target_type: 'applications',
    change_summary: {
      total: rows.length,
      updated: preview.filter((v) => v.type === '수정').length,
      unchanged: preview.filter((v) => v.type === '변경 없음').length,
    },
  });
  return NextResponse.json({
    ok: true,
    result: {
      updated: preview.filter((v) => v.type === '수정').length,
      unchanged: preview.filter((v) => v.type === '변경 없음').length,
    },
  });
}
