-- Remove the administrator password-reset credential path.
-- Existing reset credentials are restored to the supported phone-last-four login.
update public.applications
set password_hash = crypt(
      right(regexp_replace(leader_phone, '[^0-9]', '', 'g'), 4),
      gen_salt('bf', 12)
    ),
    credential_type = 'phone_last_four'
where credential_type = 'admin_reset';

alter table public.applications
  drop constraint if exists applications_credential_type_check;
alter table public.applications
  add constraint applications_credential_type_check
  check (credential_type = 'phone_last_four');

-- Historical password-reset email rows are retained for audit purposes. New
-- password-reset email writes are no longer reachable from the application.
