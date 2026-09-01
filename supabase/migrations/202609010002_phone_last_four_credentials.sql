-- Use the leader phone number's final four digits as the application credential.
alter table public.applications
  add column if not exists credential_type text;

update public.applications
set password_hash = crypt(
      right(regexp_replace(leader_phone, '[^0-9]', '', 'g'), 4),
      gen_salt('bf', 12)
    ),
    credential_type = 'phone_last_four';

alter table public.applications
  alter column credential_type set default 'phone_last_four',
  alter column credential_type set not null;

alter table public.applications
  drop constraint if exists applications_credential_type_check;
alter table public.applications
  add constraint applications_credential_type_check
  check (credential_type in ('phone_last_four', 'admin_reset'));
