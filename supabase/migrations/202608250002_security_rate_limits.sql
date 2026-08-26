-- Persistent, atomic rate limits for public application endpoints.
create table if not exists public.request_rate_limits (
  action text not null,
  identifier_hash text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (action, identifier_hash)
);

alter table public.request_rate_limits enable row level security;
revoke all on public.request_rate_limits from anon, authenticated;

create or replace function public.consume_rate_limit(
  p_action text,
  p_identifier_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.request_rate_limits%rowtype;
  v_now timestamptz := clock_timestamp();
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit configuration';
  end if;

  insert into public.request_rate_limits(action, identifier_hash, request_count)
  values (p_action, p_identifier_hash, 1)
  on conflict (action, identifier_hash) do update
  set request_count = case
        when request_rate_limits.window_started_at <= v_now - make_interval(secs => p_window_seconds)
          then 1
        else request_rate_limits.request_count + 1
      end,
      window_started_at = case
        when request_rate_limits.window_started_at <= v_now - make_interval(secs => p_window_seconds)
          then v_now
        else request_rate_limits.window_started_at
      end,
      updated_at = v_now
  returning * into v_row;

  allowed := v_row.request_count <= p_limit;
  retry_after_seconds := greatest(
    1,
    ceil(extract(epoch from (v_row.window_started_at + make_interval(secs => p_window_seconds) - v_now)))::integer
  );
  return next;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;
