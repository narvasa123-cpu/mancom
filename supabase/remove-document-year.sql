-- Removes the old file-level document_year field.
-- Category year is now the source of truth.

alter table public.files
drop column if exists document_year;
