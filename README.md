# MANCOM Secretary File System

A modern red-themed document management system for MANCOM Secretaries and authorized personnel. Built with React, Vite, Tailwind CSS, Supabase Authentication, Supabase Database, Supabase Storage, and Cloudflare Pages compatibility.

## Features

- Email/password login with remember me, forgot password, and password visibility toggle
- Role-based access for Administrator, MANCOM Secretary, and Staff
- Dashboard statistics, recent uploads, quick actions, activity timeline, and calendar preview
- File repository with instant search, category/type/year filters, sticky table headers, preview, download, delete, and details
- Secure upload flow with drag-and-drop, file type validation, file size validation, progress UI, metadata, tags, and version tracking
- Categories, notes, activity logs, notifications, user management, settings, and calendar modules
- Supabase-ready service layer with local demo fallback when environment variables are not configured
- Responsive desktop, tablet, and mobile layout

## Tech Stack

- React.js with Vite
- Tailwind CSS
- React Router
- React Hook Form
- Axios
- Lucide React Icons
- Framer Motion
- Supabase Auth, Postgres, Storage, and RLS

## Folder Structure

```text
src/
  components/
    FileTable.jsx
    Layout.jsx
    ProtectedRoute.jsx
    ui.jsx
  contexts/
    AuthContext.jsx
  data/
    mockData.js
  hooks/
    useAppData.js
  lib/
    supabase.js
    utils.js
  pages/
    CalendarPage.jsx
    CategoriesPage.jsx
    Dashboard.jsx
    FileDetails.jsx
    FilesPage.jsx
    Login.jsx
    LogsPage.jsx
    SettingsPage.jsx
    UploadPage.jsx
    UsersPage.jsx
  services/
    documentService.js
supabase/
  schema.sql
public/
  _redirects
```

## Local Development

```bash
npm install
npm run dev
```

The app runs in demo mode if Supabase variables are missing. Demo logins:

- `admin@mancom.gov`
- `secretary@mancom.gov`
- `staff@mancom.gov`

Any password is accepted in demo mode.

## Environment Variables

Copy `.env.example` to `.env.local` and set:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_SUPABASE_STORAGE_BUCKET=mancom-files
```

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. In Authentication, enable Email provider.
5. Create users in Supabase Auth.
6. Insert corresponding records in `public.users` using each auth user UUID.
7. Confirm the `mancom-files` storage bucket exists and has the RLS policies from the schema.

## Admin-Only Seed

For initial production setup, seed only the Administrator profile:

1. Create the admin user in Supabase Authentication.
2. Use `admin@mancom.gov` as the email, or update that email inside `supabase/seed-admin.sql`.
3. Run `supabase/seed-admin.sql` in the Supabase SQL editor.

No Secretary or Staff accounts are seeded by default. Add those later through the app's User Management page or with explicit profile inserts after creating their Auth accounts.

## Troubleshooting Auth Login

If login shows `Database error querying schema`, recreate the admin using Supabase Authentication:

1. Go to Supabase Dashboard.
2. Open Authentication, then Users.
3. Delete the broken `admin@mancom.gov` Auth user if it exists.
4. Create a new user with email `admin@mancom.gov`.
5. Set and confirm a password.
6. Run `supabase/seed-admin.sql`.

If the dashboard cannot delete the broken user, run this cleanup in SQL Editor, then create the user again from Authentication:

```sql
delete from public.activity_logs
where user_id in (select id from auth.users where email = 'admin@mancom.gov');

delete from public.users
where email = 'admin@mancom.gov';

delete from auth.identities
where user_id in (select id from auth.users where email = 'admin@mancom.gov');

delete from auth.users
where email = 'admin@mancom.gov';
```

Manual profile insert example:

```sql
insert into public.users (id, fullname, email, role, status)
values ('AUTH_USER_UUID', 'Maria Santos', 'secretary@mancom.gov', 'Administrator', 'Active');
```

## Cloudflare Pages Deployment

1. Push this repository to GitHub or GitLab.
2. Create a Cloudflare Pages project.
3. Set framework preset to `Vite`.
4. Build command: `npm run build`
5. Build output directory: `dist`
6. Add the same environment variables from `.env.example`.
7. Deploy.

The included `public/_redirects` file supports React Router history fallback on Cloudflare Pages.

## Security Notes

- Supabase RLS policies restrict user management to Administrators.
- Upload, edit, category, notes, calendar, and version actions are limited to Administrators and MANCOM Secretaries.
- Staff users can view and download files.
- Storage policies enforce authenticated access to the `mancom-files` bucket.
- Client-side validation checks file type and file size before upload.
- Server-side enforcement is handled through Supabase Storage MIME and size limits plus RLS.
