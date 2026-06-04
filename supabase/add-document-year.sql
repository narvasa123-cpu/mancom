-- Adds a document year metadata field for historical files.
-- Run this once in the Supabase SQL editor for existing databases.

alter table public.files
add column if not exists document_year integer;

update public.files
set document_year = extract(year from created_at)::integer
where document_year is null;

alter table public.files
alter column document_year set not null,
alter column document_year set default extract(year from now())::integer;
