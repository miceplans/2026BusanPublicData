import 'server-only';

import { revalidateTag, unstable_cache } from 'next/cache';

import { createAdminClient } from '@/lib/supabase/admin';

const APPLICATION_LIST_TAG = 'admin-application-list';

export type ApplicationListParams = {
  page: number;
  size: number;
  search: string;
  from: string;
  to: string;
  ascending: boolean;
};

export const getCachedApplicationList = unstable_cache(
  async ({ page, size, search, from, to, ascending }: ApplicationListParams) => {
    let query = createAdminClient()
      .from('applications')
      .select(
        'id,receipt_number,team_name,leader_name,leader_email,leader_phone,participation_type,industry,item_name,created_at,updated_at,application_files(count)',
        { count: 'exact' },
      );

    if (search) {
      const safeSearch = search.replace(/[%(),]/g, '');
      query = query.or(
        `team_name.ilike.%${safeSearch}%,leader_name.ilike.%${safeSearch}%,leader_phone.ilike.%${safeSearch}%`,
      );
    }
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error, count } = await query
      .order('created_at', { ascending })
      .range((page - 1) * size, page * size - 1);

    if (error) throw error;
    return { items: data, total: count ?? 0 };
  },
  ['admin-application-list'],
  { tags: [APPLICATION_LIST_TAG], revalidate: 60 },
);

export function invalidateApplicationList() {
  revalidateTag(APPLICATION_LIST_TAG, { expire: 0 });
}
