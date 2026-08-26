import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { getClientEnv } from '@/lib/env/client';
import { getServerEnv } from '@/lib/env/server';

export function createAdminClient() {
  const clientEnv = getClientEnv();
  const serverEnv = getServerEnv();

  return createClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
