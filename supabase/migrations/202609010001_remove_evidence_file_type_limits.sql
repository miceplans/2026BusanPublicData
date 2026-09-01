-- Evidence uploads may use any filename extension and MIME type.
alter table public.application_files
  drop constraint if exists application_files_extension_check,
  drop constraint if exists application_files_mime_type_check;

update storage.buckets
set file_size_limit = null,
    allowed_mime_types = null
where id = 'application-files';
