-- Creates public.users profiles for existing Supabase Auth users that do not
-- already have one. Missing users are created as Staff; update roles manually
-- after this script if an account should be Administrator or MANCOM Secretary.

insert into public.users (id, fullname, email, role, status)
select
  auth_users.id,
  coalesce(auth_users.raw_user_meta_data->>'fullname', split_part(auth_users.email, '@', 1), 'Authenticated User'),
  auth_users.email,
  'Staff',
  'Active'
from auth.users as auth_users
left join public.users as profiles on profiles.id = auth_users.id
where profiles.id is null
  and auth_users.email is not null;

-- Optional: promote your first administrator after the row exists.
-- Replace the email below, then run this statement separately if needed.
--
-- update public.users
-- set role = 'Administrator', fullname = 'System Administrator'
-- where email = 'admin@mancom.gov';
