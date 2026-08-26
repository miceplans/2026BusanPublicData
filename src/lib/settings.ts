import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SiteSettings } from '@/types';

export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await createAdminClient()
    .from('site_settings')
    .select('*')
    .eq('id', true)
    .single();
  if (error || !data) throw new Error('운영 설정을 불러올 수 없습니다.');
  return data as SiteSettings;
}
export function applicationEditable(settings: SiteSettings) {
  return settings.editing_enabled;
}
