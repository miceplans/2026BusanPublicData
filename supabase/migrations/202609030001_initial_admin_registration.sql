create or replace function public.register_initial_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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
