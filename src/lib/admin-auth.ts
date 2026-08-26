import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function requireAdmin() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;
  const { data } = await createAdminClient()
    .from('admin_profiles')
    .select('role,is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();
  return data ? { user, role: data.role as string } : null;
}
