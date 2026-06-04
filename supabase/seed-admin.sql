-- Admin-only seed for MANCOM Secretary File System.
-- Use this after creating the admin account in Supabase Authentication.
--
-- 1. In Supabase Dashboard, create an Auth user:
--    Email: admin@mancom.gov
--    Password: choose a strong temporary password
-- 2. Run this script in the Supabase SQL editor.
--
-- This script looks up the Auth user UUID by email, then creates the
-- matching public.users profile required by RLS and role checks.

do $$
declare
  admin_auth_id uuid;
begin
  select id
  into admin_auth_id
  from auth.users
  where email = 'admin@mancom.gov'
  limit 1;

  if admin_auth_id is null then
    raise exception 'Auth user admin@mancom.gov was not found. Create the user in Supabase Authentication first.';
  end if;

  insert into public.users (id, fullname, email, role, status)
  values (
    admin_auth_id,
    'System Administrator',
    'admin@mancom.gov',
    'Administrator',
    'Active'
  )
  on conflict (id) do update set
    fullname = excluded.fullname,
    email = excluded.email,
    role = excluded.role,
    status = excluded.status;

  insert into public.activity_logs (user_id, action, description)
  values (
    admin_auth_id,
    'Admin Seed',
    'Initial administrator profile seeded.'
  );
end $$;
