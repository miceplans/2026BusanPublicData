-- Allow email_logs to record password reset notification emails.
alter table public.email_logs drop constraint if exists email_logs_email_type_check;
alter table public.email_logs
  add constraint email_logs_email_type_check
  check (email_type in ('application_completed', 'password_reset'));
