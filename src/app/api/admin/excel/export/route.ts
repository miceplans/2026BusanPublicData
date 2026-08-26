import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError } from '@/lib/http';
import { escapeSpreadsheetFormula } from '@/lib/output-safety';
const headers = [
  '접수번호',
  '접수상태',
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
type ExportRow = {
  receipt_number: string;
  status: string;
  team_name: string;
  participation_type: string;
  industry: string;
  item_name: string;
  item_summary: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  is_busan_based: boolean;
  requests: string | null;
  created_at: string;
  updated_at: string;
  application_members: { count: number }[];
  application_files: { count: number }[];
};
export async function GET(request: NextRequest) {
  if (!(await requireAdmin()))
    return jsonError('관리자 로그인이 필요합니다.', 401);
  const ids = request.nextUrl.searchParams
    .get('ids')
    ?.split(',')
    .filter(Boolean);
  let q = createAdminClient()
    .from('applications')
    .select(
      'id,receipt_number,status,team_name,participation_type,industry,item_name,item_summary,leader_name,leader_email,leader_phone,is_busan_based,requests,created_at,updated_at,application_members(count),application_files(count)',
    )
    .order('created_at', { ascending: false });
  if (ids?.length) q = q.in('id', ids);
  const { data, error } = await q;
  if (error) return jsonError('엑셀 데이터를 만들 수 없습니다.', 500);
  const rows = ((data ?? []) as ExportRow[]).map((v) => [
    v.receipt_number,
    v.status,
    v.team_name,
    v.participation_type,
    v.industry,
    v.item_name,
    v.item_summary,
    v.leader_name,
    v.leader_email,
    v.leader_phone,
    v.application_members?.[0]?.count ?? 0,
    v.is_busan_based ? '예' : '아니오',
    v.application_files?.[0]?.count ?? 0,
    v.requests ?? '',
    v.created_at,
    v.updated_at,
  ]);
  const safeRows = rows.map((row) => row.map(escapeSpreadsheetFormula));
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...safeRows]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, '신청목록');
  const body = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
  return new NextResponse(body, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="applications-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
