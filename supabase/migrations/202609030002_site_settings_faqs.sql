alter table public.site_settings
  add column if not exists faqs jsonb not null default '[]'::jsonb;
