-- Evidence uploads no longer have application-level count or size limits.
alter table public.site_settings
  drop column if exists evidence_max_total_bytes,
  drop column if exists evidence_max_bytes,
  drop column if exists evidence_max_files;
