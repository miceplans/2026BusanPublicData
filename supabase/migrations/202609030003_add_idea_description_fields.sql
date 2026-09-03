-- Add the four required idea-description sections to applications.
-- Existing rows receive an empty value so this migration remains safe on live data.

alter table public.applications
  add column if not exists proposal_background text not null default '',
  add column if not exists introduction_and_differentiation text not null default '',
  add column if not exists feasibility_and_business_viability text not null default '',
  add column if not exists expected_effects text not null default '';

alter table public.applications
  alter column proposal_background drop default,
  alter column introduction_and_differentiation drop default,
  alter column feasibility_and_business_viability drop default,
  alter column expected_effects drop default;
