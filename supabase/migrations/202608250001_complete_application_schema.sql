-- 2026 Busan AI startup competition application schema completion.
-- This migration is intentionally rerunnable and contains no credentials or sample PII.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

do $$
begin
  create type public.application_status as enum (
    '접수완료', '검토중', '보완요청', '예선통과', '예선탈락', '본선수상', '최종탈락', '접수취소'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.email_delivery_status as enum (
    'pending', 'sent', 'retrying', 'failed', 'configuration_missing'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null unique,
  team_name text not null,
  normalized_team_name text not null unique,
  password_hash text not null,
  leader_name text not null,
  leader_email text not null,
  leader_phone text not null,
  participation_type text not null check (participation_type in ('예비창업팀', '신규창업기업')),
  industry text not null check (industry in ('해양', '에너지테크', '미래모빌리티', '융합부품·소재', '라이프스타일', '디지털테크', '금융', '문화관광', '바이오헬스')),
  item_name text not null,
  item_summary text not null,
  is_busan_based boolean not null,
  eligibility_confirmed boolean not null check (eligibility_confirmed),
  exclusion_confirmed boolean not null check (exclusion_confirmed),
  privacy_agreed_at timestamptz not null,
  requests text,
  additional_data jsonb not null default '{}'::jsonb check (jsonb_typeof(additional_data) = 'object'),
  status public.application_status not null default '접수완료',
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.applications
  add column if not exists additional_data jsonb not null default '{}'::jsonb;

create table if not exists public.application_members (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  name text not null,
  role text not null,
  is_leader boolean not null default false,
  display_order smallint not null check (display_order between 1 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id, display_order)
);

alter table public.application_members
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists application_one_leader_idx
  on public.application_members(application_id) where is_leader;

create table if not exists public.application_files (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  object_key text not null unique,
  original_name text not null,
  evidence_type text,
  extension text not null check (extension in ('jpg', 'jpeg', 'png', 'webp')),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.application_files
  add column if not exists evidence_type text,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  email_type text not null check (email_type = 'application_completed'),
  idempotency_key text not null unique,
  status public.email_delivery_status not null default 'pending',
  attempt_count smallint not null default 0 check (attempt_count between 0 and 4),
  next_retry_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  error_code text,
  error_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'administrator',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_profiles
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  change_summary jsonb not null default '{}'::jsonb check (jsonb_typeof(change_summary) = 'object'),
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  is_public boolean not null default false,
  application_starts_at timestamptz,
  application_ends_at timestamptz,
  editing_enabled boolean not null default false,
  completion_message text not null default '참가 신청이 정상적으로 접수되었습니다.',
  contact text,
  email_sender_name text not null default '행사 운영사무국',
  completion_email_body text,
  item_summary_max_length integer check (item_summary_max_length between 1 and 10000),
  evidence_label text,
  evidence_purpose text,
  evidence_max_files smallint not null default 5 check (evidence_max_files between 1 and 20),
  evidence_max_bytes bigint not null default 10485760 check (evidence_max_bytes between 1 and 52428800),
  evidence_max_total_bytes bigint not null default 31457280 check (evidence_max_total_bytes between 1 and 209715200),
  privacy_retention_policy text,
  audit_log_retention_policy text,
  email_retry_intervals_minutes smallint[] not null default array[1,5,30]::smallint[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (application_ends_at is null or application_starts_at is null or application_ends_at > application_starts_at),
  check (evidence_max_total_bytes >= evidence_max_bytes),
  check (cardinality(email_retry_intervals_minutes) = 3)
);

alter table public.site_settings
  add column if not exists application_starts_at timestamptz,
  add column if not exists application_ends_at timestamptz,
  add column if not exists email_sender_name text not null default '행사 운영사무국',
  add column if not exists evidence_max_total_bytes bigint not null default 31457280,
  add column if not exists audit_log_retention_policy text,
  add column if not exists email_retry_intervals_minutes smallint[] not null default array[1,5,30]::smallint[],
  add column if not exists created_at timestamptz not null default now();

-- Existing rows receive the approved operational defaults.
update public.site_settings
set evidence_max_files = coalesce(evidence_max_files, 5),
    evidence_max_bytes = coalesce(evidence_max_bytes, 10485760),
    evidence_max_total_bytes = coalesce(evidence_max_total_bytes, 31457280)
where id = true;

alter table public.site_settings alter column evidence_max_files set default 5;
alter table public.site_settings alter column evidence_max_files set not null;
alter table public.site_settings alter column evidence_max_bytes set default 10485760;
alter table public.site_settings alter column evidence_max_bytes set not null;

insert into public.site_settings(id) values (true) on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_updated_at on public.applications;
create trigger applications_updated_at before update on public.applications
for each row execute function public.set_updated_at();
drop trigger if exists application_members_updated_at on public.application_members;
create trigger application_members_updated_at before update on public.application_members
for each row execute function public.set_updated_at();
drop trigger if exists application_files_updated_at on public.application_files;
create trigger application_files_updated_at before update on public.application_files
for each row execute function public.set_updated_at();
drop trigger if exists email_logs_updated_at on public.email_logs;
create trigger email_logs_updated_at before update on public.email_logs
for each row execute function public.set_updated_at();
drop trigger if exists admin_profiles_updated_at on public.admin_profiles;
create trigger admin_profiles_updated_at before update on public.admin_profiles
for each row execute function public.set_updated_at();
drop trigger if exists settings_updated_at on public.site_settings;
create trigger settings_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.applications enable row level security;
alter table public.application_members enable row level security;
alter table public.application_files enable row level security;
alter table public.email_logs enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.site_settings enable row level security;

revoke all on table public.applications from anon, authenticated;
revoke all on table public.application_members from anon, authenticated;
revoke all on table public.application_files from anon, authenticated;
revoke all on table public.email_logs from anon, authenticated;
revoke all on table public.admin_profiles from anon, authenticated;
revoke all on table public.admin_audit_logs from anon, authenticated;
revoke all on table public.site_settings from anon, authenticated;

insert into storage.buckets(id, name, public)
values ('application-files', 'application-files', false)
on conflict (id) do update set public = false;

drop policy if exists "deny direct application file access" on storage.objects;
create policy "deny direct application file access"
on storage.objects for all
using (false)
with check (false);

create index if not exists applications_created_at_idx on public.applications(created_at desc);
create index if not exists applications_status_created_at_idx on public.applications(status, created_at desc);
create index if not exists applications_team_name_trgm_idx on public.applications using gin(team_name gin_trgm_ops);
create index if not exists applications_leader_name_trgm_idx on public.applications using gin(leader_name gin_trgm_ops);
create index if not exists applications_leader_email_trgm_idx on public.applications using gin(leader_email gin_trgm_ops);
create index if not exists applications_leader_phone_trgm_idx on public.applications using gin(leader_phone gin_trgm_ops);
create index if not exists application_members_application_idx on public.application_members(application_id, display_order);
create index if not exists application_files_application_idx on public.application_files(application_id, created_at);
create index if not exists email_retry_idx on public.email_logs(status, next_retry_at) where status in ('pending', 'retrying');
create index if not exists email_logs_application_idx on public.email_logs(application_id, created_at desc);
create index if not exists audit_created_idx on public.admin_audit_logs(created_at desc);
create index if not exists audit_admin_created_idx on public.admin_audit_logs(admin_user_id, created_at desc);
create index if not exists audit_target_idx on public.admin_audit_logs(target_type, target_id, created_at desc);

