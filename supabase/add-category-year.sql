-- Adds a year to categories so historical files can be grouped by category year.
-- Run this once in the Supabase SQL editor for existing databases.

alter table public.categories
add column if not exists category_year integer;

update public.categories
set category_year = extract(year from created_at)::integer
where category_year is null;

alter table public.categories
alter column category_year set not null,
alter column category_year set default extract(year from now())::integer;

alter table public.categories
drop constraint if exists categories_name_key;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_name_category_year_key'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
    add constraint categories_name_category_year_key unique (name, category_year);
  end if;
end $$;
