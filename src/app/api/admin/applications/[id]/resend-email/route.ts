import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendCompletionEmail } from '@/lib/email';
import { jsonError } from '@/lib/http';
export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return jsonError('관리자 로그인이 필요합니다.', 401);
  const { id } = await params;
  const db = createAdminClient();
  const { data: application } = await db
    .from('applications')
    .select('id,receipt_number,team_name,leader_email,created_at')
    .eq('id', id)
    .single();
  if (!application) return jsonError('신청 정보를 찾을 수 없습니다.', 404);
  await sendCompletionEmail({
    applicationId: application.id,
    receiptNumber: application.receipt_number,
    teamName: application.team_name,
    email: application.leader_email,
    createdAt: application.created_at,
  });
  await db.from('admin_audit_logs').insert({
    admin_user_id: admin.user.id,
    action: 'email_resend',
    target_type: 'application',
    target_id: id,
    change_summary: {},
  });
  return NextResponse.json({ ok: true });
}
