import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { APPLICATION_STATUSES } from '@/types';
import { jsonError } from '@/lib/http';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  if (!(await requireAdmin()))
    return jsonError('관리자 로그인이 필요합니다.', 401);
  const p = request.nextUrl.searchParams;
  const page = Math.max(1, Number(p.get('page')) || 1);
  const size = Math.min(100, Math.max(10, Number(p.get('size')) || 20));
  let query = createAdminClient()
    .from('applications')
    .select(
      'id,receipt_number,team_name,leader_name,leader_email,leader_phone,participation_type,industry,item_name,status,created_at,updated_at,application_files(count)',
      { count: 'exact' },
    );
  const search = p.get('search')?.trim();
  if (search)
    query = query.or(
      `team_name.ilike.%${search.replace(/[%(),]/g, '')}%,leader_name.ilike.%${search.replace(/[%(),]/g, '')}%,leader_phone.ilike.%${search.replace(/[%(),]/g, '')}%`,
    );
  const status = p.get('status');
  if (status && APPLICATION_STATUSES.includes(status as never))
    query = query.eq('status', status);
  const from = p.get('from');
  const to = p.get('to');
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);
  const ascending = p.get('sort') === 'oldest';
  const { data, error, count } = await query
    .order('created_at', { ascending })
    .range((page - 1) * size, page * size - 1);
  if (error) return jsonError('신청 목록을 불러올 수 없습니다.', 500);
  return NextResponse.json({
    ok: true,
    items: data,
    total: count ?? 0,
    page,
    size,
  });
}
