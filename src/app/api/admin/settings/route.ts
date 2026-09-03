import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/settings';
import { jsonError, validationError } from '@/lib/http';
const schema = z.object({
  is_public: z.boolean(),
  editing_enabled: z.boolean(),
  completion_message: z.string().min(1).max(2000),
  contact: z.string().max(1000).nullable(),
  completion_email_body: z.string().max(5000).nullable(),
  item_summary_max_length: z.number().int().min(1).max(10000).nullable(),
  evidence_label: z.string().max(200).nullable(),
  evidence_purpose: z.string().max(500).nullable(),
  privacy_retention_policy: z.string().max(2000).nullable(),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().min(1).max(500),
        answer: z.string().trim().min(1).max(5000),
      }),
    )
    .max(50),
});
export async function GET() {
  if (!(await requireAdmin()))
    return jsonError('관리자 로그인이 필요합니다.', 401);
  return NextResponse.json({ ok: true, settings: await getSettings() });
}
export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return jsonError('관리자 로그인이 필요합니다.', 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const db = createAdminClient();
  const { error } = await db
    .from('site_settings')
    .update(parsed.data)
    .eq('id', true);
  if (error) return jsonError('운영 설정을 저장할 수 없습니다.', 500);
  await db.from('admin_audit_logs').insert({
    admin_user_id: admin.user.id,
    action: 'settings_update',
    target_type: 'site_settings',
    change_summary: { fields: Object.keys(parsed.data) },
  });
  return NextResponse.json({ ok: true });
}
