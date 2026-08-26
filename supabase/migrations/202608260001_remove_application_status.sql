-- This service only receives documents and does not manage application statuses.
drop index if exists public.applications_status_created_at_idx;
drop index if exists public.applications_status_idx;

alter table public.applications
  drop column if exists status;

drop type if exists public.application_status;
