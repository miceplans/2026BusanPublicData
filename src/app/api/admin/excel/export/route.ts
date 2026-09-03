import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError } from '@/lib/http';
import { escapeSpreadsheetFormula } from '@/lib/output-safety';
const memberHeaders = (n: number) => [
  `팀원${n}이름`,
  `팀원${n}소속`,
  `팀원${n}역할`,
  `팀원${n}이메일`,
  `팀원${n}연락처`,
  `팀원${n}생년월일`,
  `팀원${n}성별`,
  `팀원${n}거주지`,
  `팀원${n}구분`,
];
const headers = [
  '접수번호',
  '팀명',
  '참가유형',
  '참가분야',
  '대회 정보 습득 경로',
  '아이템명',
  '아이템요약',
  '팀장이름',
  '팀장소속',
  '팀장이메일',
  '팀장연락처',
  '팀장생년월일',
  '팀장성별',
  '거주지',
  '팀원수',
  ...memberHeaders(1),
  ...memberHeaders(2),
  ...memberHeaders(3),
  ...memberHeaders(4),
  '증빙자료수',
  '요청사항',
  '신청일시',
  '최종수정일시',
];
type ExportRow = {
  receipt_number: string;
  team_name: string;
  participation_type: string;
  industry: string;
  information_source: string | null;
  information_source_other: string | null;
  item_name: string;
  item_summary: string;
  leader_name: string;
  leader_org: string;
  leader_email: string;
  leader_phone: string;
  leader_birth_date: string;
  leader_gender: string;
  leader_residence: string;
  requests: string | null;
  created_at: string;
  updated_at: string;
  application_members: {
    name: string;
    role: string;
    is_leader: boolean;
    display_order: number;
    org: string;
    email: string;
    phone: string;
    birth_date: string;
    gender: string;
    residence: string;
  }[];
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
      'id,receipt_number,team_name,participation_type,industry,information_source,information_source_other,item_name,item_summary,leader_name,leader_org,leader_email,leader_phone,leader_birth_date,leader_gender,leader_residence,requests,created_at,updated_at,application_members(name,role,is_leader,display_order,org,email,phone,birth_date,gender,residence),application_files(count)',
    )
    .order('created_at', { ascending: false });
  if (ids?.length) q = q.in('id', ids);
  const { data, error } = await q;
  if (error) return jsonError('엑셀 데이터를 만들 수 없습니다.', 500);
  const rows = ((data ?? []) as ExportRow[]).map((v) => {
    const members = [...(v.application_members ?? [])].sort(
      (a, b) => a.display_order - b.display_order,
    );
    const memberCells = Array.from({ length: 4 }, (_, index) => {
      const member = members[index];
      return member
        ? [
            member.name,
            member.org,
            member.role,
            member.email,
            member.phone,
            member.birth_date,
            member.gender,
            member.residence,
            member.is_leader ? '팀장' : '팀원',
          ]
        : ['', '', '', '', '', '', '', '', ''];
    }).flat();
    return [
      v.receipt_number,
      v.team_name,
      v.participation_type,
      v.industry,
      v.information_source === '기타'
        ? `기타 (${v.information_source_other ?? ''})`
        : (v.information_source ?? ''),
      v.item_name,
      v.item_summary,
      v.leader_name,
      v.leader_org,
      v.leader_email,
      v.leader_phone,
      v.leader_birth_date,
      v.leader_gender,
      v.leader_residence,
      members.length,
      ...memberCells,
      v.application_files?.[0]?.count ?? 0,
      v.requests ?? '',
      v.created_at,
      v.updated_at,
    ];
  });
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
