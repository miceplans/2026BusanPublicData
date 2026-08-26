import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendCompletionEmail } from '@/lib/email';
import { jsonError } from '@/lib/http';
export async function GET(request: NextRequest) {
  const secret = getServerEnv().CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`)
    return jsonError('권한이 없습니다.', 401);
  const db = createAdminClient();
  const { data: logs } = await db
    .from('email_logs')
    .select(
      'application_id,applications(receipt_number,team_name,leader_email,created_at)',
    )
    .eq('status', 'retrying')
    .lte('next_retry_at', new Date().toISOString())
    .limit(50);
  for (const log of logs ?? []) {
    const application = Array.isArray(log.applications)
      ? log.applications[0]
      : log.applications;
    if (application)
      await sendCompletionEmail({
        applicationId: log.application_id,
        receiptNumber: application.receipt_number,
        teamName: application.team_name,
        email: application.leader_email,
        createdAt: application.created_at,
      });
  }
  return NextResponse.json({ ok: true, processed: logs?.length ?? 0 });
}
