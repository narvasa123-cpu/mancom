create extension if not exists "pgcrypto";

create type public.user_role as enum ('Administrator', 'MANCOM Secretary', 'Staff');
create type public.account_status as enum ('Active', 'Inactive');
create type public.notification_status as enum ('Unread', 'Read');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  fullname text not null,
  email text not null unique,
  role public.user_role not null default 'Staff',
  status public.account_status not null default 'Active',
  last_login timestamptz,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  file_url text not null,
  file_path text,
  file_size bigint not null,
  file_type text not null,
  document_year integer not null default extract(year from now())::integer,
  tags text[] not null default '{}',
  uploaded_by uuid references public.users(id) on delete set null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.file_versions (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.files(id) on delete cascade,
  version integer not null,
  name text not null,
  file_url text,
  file_path text,
  file_size bigint not null,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (file_id, version)
);

create table public.file_notes (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.files(id) on delete cascade,
  note text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  status public.notification_status not null default 'Unread',
  created_at timestamptz not null default now()
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null default 'Event',
  event_date date not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.current_user_role() = 'Administrator'
$$;

create or replace function public.is_secretary_or_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.current_user_role() in ('Administrator', 'MANCOM Secretary')
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, fullname, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'fullname', split_part(new.email, '@', 1), 'Authenticated User'),
    new.email,
    'Staff',
    'Active'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.files enable row level security;
alter table public.file_versions enable row level security;
alter table public.file_notes enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.calendar_events enable row level security;

create policy "Users can read active users" on public.users
  for select to authenticated using (status = 'Active' or public.is_admin());

create policy "Administrators manage users" on public.users
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Users create own staff profile" on public.users
  for insert to authenticated
  with check (
    id = auth.uid()
    and email = auth.email()
    and role = 'Staff'
    and status = 'Active'
  );

create policy "Authenticated users read categories" on public.categories
  for select to authenticated using (true);

create policy "Secretaries manage categories" on public.categories
  for all to authenticated using (public.is_secretary_or_admin()) with check (public.is_secretary_or_admin());

create policy "Authenticated users read files" on public.files
  for select to authenticated using (true);

create policy "Secretaries insert files" on public.files
  for insert to authenticated with check (public.is_secretary_or_admin() and uploaded_by = auth.uid());

create policy "Secretaries update files" on public.files
  for update to authenticated using (public.is_secretary_or_admin()) with check (public.is_secretary_or_admin());

create policy "Admins delete files" on public.files
  for delete to authenticated using (public.is_admin());

create policy "Authenticated users read versions" on public.file_versions
  for select to authenticated using (true);

create policy "Secretaries manage versions" on public.file_versions
  for insert to authenticated with check (public.is_secretary_or_admin() and uploaded_by = auth.uid());

create policy "Authenticated users read notes" on public.file_notes
  for select to authenticated using (true);

create policy "Secretaries add notes" on public.file_notes
  for insert to authenticated with check (public.is_secretary_or_admin() and created_by = auth.uid());

create policy "Admins manage notes" on public.file_notes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins delete notes" on public.file_notes
  for delete to authenticated using (public.is_admin());

create policy "Secretaries read logs" on public.activity_logs
  for select to authenticated using (public.is_secretary_or_admin());

create policy "Authenticated users create logs" on public.activity_logs
  for insert to authenticated with check (user_id = auth.uid());

create policy "Users read own notifications" on public.notifications
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "Users update own notifications" on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Secretaries create notifications" on public.notifications
  for insert to authenticated with check (public.is_secretary_or_admin());

create policy "Authenticated users read calendar" on public.calendar_events
  for select to authenticated using (true);

create policy "Secretaries manage calendar" on public.calendar_events
  for all to authenticated using (public.is_secretary_or_admin()) with check (public.is_secretary_or_admin());

insert into public.categories (name, description) values
  ('Memorandum', 'Internal memoranda and executive advisories'),
  ('Meeting Minutes', 'MANCOM minutes and attendance records'),
  ('Resolutions', 'Approved board and management resolutions'),
  ('Reports', 'Operational and administrative reports'),
  ('Financial Documents', 'Budget, audit, and procurement files'),
  ('Correspondence', 'Incoming and outgoing official letters'),
  ('Policies', 'Policies, guidelines, and circulars'),
  ('Other Documents', 'Supplementary reference materials')
on conflict (name) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mancom-files',
  'mancom-files',
  false,
  52428800,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'application/zip'
  ]
)
on conflict (id) do nothing;

create policy "Authenticated users read file objects" on storage.objects
  for select to authenticated using (bucket_id = 'mancom-files');

create policy "Secretaries upload file objects" on storage.objects
  for insert to authenticated with check (bucket_id = 'mancom-files' and public.is_secretary_or_admin());

create policy "Secretaries update file objects" on storage.objects
  for update to authenticated using (bucket_id = 'mancom-files' and public.is_secretary_or_admin());

create policy "Admins delete file objects" on storage.objects
  for delete to authenticated using (bucket_id = 'mancom-files' and public.is_admin());
