import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { jsonError } from '@/lib/http';
import { getCachedApplicationList } from '@/lib/admin-application-list';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  if (!(await requireAdmin()))
    return jsonError('관리자 로그인이 필요합니다.', 401);
  const p = request.nextUrl.searchParams;
  const page = Math.max(1, Number(p.get('page')) || 1);
  const size = Math.min(100, Math.max(10, Number(p.get('size')) || 20));
  const search = p.get('search')?.trim() ?? '';
  const from = p.get('from');
  const to = p.get('to');
  const ascending = p.get('sort') === 'oldest';
  let result;
  try {
    result = await getCachedApplicationList({
      page,
      size,
      search,
      from: from ?? '',
      to: to ?? '',
      ascending,
    });
  } catch {
    return jsonError('신청 목록을 불러올 수 없습니다.', 500);
  }
  return NextResponse.json({
    ok: true,
    items: result.items,
    total: result.total,
    page,
    size,
  });
}
