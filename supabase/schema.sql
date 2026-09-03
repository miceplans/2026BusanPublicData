-- 전체 스키마 스냅샷: 실제 운영 DB와 동일한 최종 상태(마이그레이션 202609030003 적용 후)입니다.
-- 신규 환경 구축 시 이 파일을 적용하면 운영 DB와 동일한 구조가 만들어집니다.
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
do $$ begin create type public.email_delivery_status as enum ('pending','sent','retrying','failed','configuration_missing'); exception when duplicate_object then null; end $$;

create table if not exists public.applications (
 id uuid primary key default gen_random_uuid(), receipt_number text not null unique, team_name text not null,
 normalized_team_name text not null unique, password_hash text not null, leader_name text not null,
 credential_type text not null default 'phone_last_four' check (credential_type = 'phone_last_four'),
 leader_email text not null, leader_phone text not null, leader_region text not null default '',
 participation_type text not null check (participation_type in ('예비창업팀','신규창업기업')),
 industry text not null check (industry in ('해양','에너지테크','미래모빌리티','융합부품·소재','라이프스타일','디지털테크','금융','문화관광','바이오헬스')),
 item_name text not null, item_summary text not null,
 proposal_background text not null, introduction_and_differentiation text not null,
 feasibility_and_business_viability text not null, expected_effects text not null,
 is_busan_based boolean not null,
 eligibility_confirmed boolean not null check (eligibility_confirmed), exclusion_confirmed boolean not null check (exclusion_confirmed),
 privacy_agreed_at timestamptz not null, requests text,
 additional_data jsonb not null default '{}'::jsonb check (jsonb_typeof(additional_data) = 'object'),
 is_edit_locked boolean not null default false,
 idempotency_key uuid not null unique,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.application_members (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id) on delete cascade,
 name text not null, role text not null, is_leader boolean not null default false, display_order smallint not null check (display_order between 1 and 4),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(application_id, display_order)
);
create unique index if not exists application_one_leader_idx on public.application_members(application_id) where is_leader;
create table if not exists public.application_files (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id) on delete cascade,
 object_key text not null unique, original_name text not null, evidence_type text, extension text not null,
 mime_type text not null, size_bytes bigint not null check (size_bytes > 0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.email_logs (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id) on delete cascade,
 email_type text not null check (email_type = 'application_completed'), idempotency_key text not null unique,
 status public.email_delivery_status not null default 'pending', attempt_count smallint not null default 0 check (attempt_count between 0 and 4),
 next_retry_at timestamptz, sent_at timestamptz, provider_message_id text, error_code text, error_summary text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.admin_profiles (user_id uuid primary key references auth.users(id) on delete cascade, role text not null default 'administrator', is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.admin_audit_logs (id uuid primary key default gen_random_uuid(), admin_user_id uuid references auth.users(id) on delete set null, action text not null, target_type text not null, target_id uuid, change_summary jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());

create or replace function public.register_initial_admin(p_user_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform pg_advisory_xact_lock(hashtext('register_initial_admin'));
  if exists (select 1 from public.admin_profiles where is_active = true) then
    raise exception 'initial administrator already registered';
  end if;
  insert into public.admin_profiles (user_id, role, is_active)
  values (p_user_id, 'administrator', true);
end;
$$;
revoke all on function public.register_initial_admin(uuid) from public, anon, authenticated;
grant execute on function public.register_initial_admin(uuid) to service_role;
create table if not exists public.request_rate_limits (
 action text not null, identifier_hash text not null,
 window_started_at timestamptz not null default now(), request_count integer not null default 0 check (request_count >= 0),
 updated_at timestamptz not null default now(), primary key(action, identifier_hash)
);
alter table public.request_rate_limits enable row level security;
revoke all on public.request_rate_limits from anon, authenticated;
create or replace function public.consume_rate_limit(
  p_action text, p_identifier_hash text, p_limit integer, p_window_seconds integer
) returns table(allowed boolean, retry_after_seconds integer)
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_row public.request_rate_limits%rowtype; v_now timestamptz := clock_timestamp();
begin
  if p_limit < 1 or p_window_seconds < 1 then raise exception 'invalid rate limit configuration'; end if;
  insert into public.request_rate_limits(action, identifier_hash, request_count)
  values (p_action, p_identifier_hash, 1)
  on conflict (action, identifier_hash) do update set
   request_count = case when request_rate_limits.window_started_at <= v_now - make_interval(secs => p_window_seconds) then 1 else request_rate_limits.request_count + 1 end,
   window_started_at = case when request_rate_limits.window_started_at <= v_now - make_interval(secs => p_window_seconds) then v_now else request_rate_limits.window_started_at end,
   updated_at = v_now returning * into v_row;
  allowed := v_row.request_count <= p_limit;
  retry_after_seconds := greatest(1, ceil(extract(epoch from (v_row.window_started_at + make_interval(secs => p_window_seconds) - v_now)))::integer);
  return next;
end; $$;
revoke all on function public.consume_rate_limit(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text,text,integer,integer) to service_role;
create table if not exists public.site_settings (
 id boolean primary key default true check (id), is_public boolean not null default false,
 application_starts_at timestamptz, application_ends_at timestamptz,
 editing_enabled boolean not null default false,
 completion_message text not null default '참가 신청이 정상적으로 접수되었습니다.', contact text,
 email_sender_name text not null default '행사 운영사무국', completion_email_body text,
 item_summary_max_length integer check (item_summary_max_length between 1 and 10000), evidence_label text, evidence_purpose text,
 privacy_retention_policy text, audit_log_retention_policy text,
 email_retry_intervals_minutes smallint[] not null default array[1,5,30]::smallint[] check (cardinality(email_retry_intervals_minutes) = 3),
 created_at timestamptz not null default now(), faqs jsonb not null default '[]'::jsonb,
 updated_at timestamptz not null default now(),
 check (application_ends_at is null or application_starts_at is null or application_ends_at > application_starts_at)
);
insert into public.site_settings(id) values (true) on conflict (id) do nothing;
create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists applications_updated_at on public.applications; create trigger applications_updated_at before update on public.applications for each row execute function public.set_updated_at();
drop trigger if exists application_members_updated_at on public.application_members; create trigger application_members_updated_at before update on public.application_members for each row execute function public.set_updated_at();
drop trigger if exists application_files_updated_at on public.application_files; create trigger application_files_updated_at before update on public.application_files for each row execute function public.set_updated_at();
drop trigger if exists email_logs_updated_at on public.email_logs; create trigger email_logs_updated_at before update on public.email_logs for each row execute function public.set_updated_at();
drop trigger if exists admin_profiles_updated_at on public.admin_profiles; create trigger admin_profiles_updated_at before update on public.admin_profiles for each row execute function public.set_updated_at();
drop trigger if exists settings_updated_at on public.site_settings; create trigger settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
alter table public.applications enable row level security; alter table public.application_members enable row level security;
alter table public.application_files enable row level security; alter table public.email_logs enable row level security;
alter table public.admin_profiles enable row level security; alter table public.admin_audit_logs enable row level security;
alter table public.site_settings enable row level security;
revoke all on all tables in schema public from anon, authenticated;
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('application-files','application-files',false,null,null)
on conflict (id) do update
set public=false, file_size_limit=null, allowed_mime_types=null;
drop policy if exists "deny direct application file access" on storage.objects;
create policy "deny direct application file access" on storage.objects for all using (false) with check (false);
create index if not exists applications_created_at_idx on public.applications(created_at desc);
create index if not exists applications_team_name_trgm_idx on public.applications using gin(team_name gin_trgm_ops);
create index if not exists applications_leader_name_trgm_idx on public.applications using gin(leader_name gin_trgm_ops);
create index if not exists applications_leader_email_trgm_idx on public.applications using gin(leader_email gin_trgm_ops);
create index if not exists applications_leader_phone_trgm_idx on public.applications using gin(leader_phone gin_trgm_ops);
create index if not exists application_members_application_idx on public.application_members(application_id, display_order);
create index if not exists application_files_application_idx on public.application_files(application_id, created_at);
create index if not exists email_retry_idx on public.email_logs(status,next_retry_at) where status in ('pending','retrying');
create index if not exists email_logs_application_idx on public.email_logs(application_id, created_at desc);
create index if not exists audit_created_idx on public.admin_audit_logs(created_at desc);
create index if not exists audit_admin_created_idx on public.admin_audit_logs(admin_user_id, created_at desc);
create index if not exists audit_target_idx on public.admin_audit_logs(target_type, target_id, created_at desc);
