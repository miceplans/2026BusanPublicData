import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError } from '@/lib/http';
export async function GET() {
  if (!(await requireAdmin()))
    return jsonError('관리자 로그인이 필요합니다.', 401);
  const { data, error } = await createAdminClient()
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return jsonError('감사 이력을 불러올 수 없습니다.', 500);
  return NextResponse.json({ ok: true, items: data });
}
