export const roles = {
  ADMIN: 'Administrator',
  SECRETARY: 'MANCOM Secretary',
  STAFF: 'Staff',
}

export const currentUser = {
  id: 'demo-admin',
  fullname: 'Maria Santos',
  email: 'secretary@mancom.gov',
  role: roles.ADMIN,
  status: 'Active',
  last_login: '2026-06-04T07:45:00+08:00',
}

export const categories = [
  { id: 'cat-1', name: 'Memorandum', category_year: 2026, description: 'Internal memoranda and executive advisories', created_at: '2026-01-12' },
  { id: 'cat-2', name: 'Meeting Minutes', category_year: 2026, description: 'MANCOM minutes and attendance records', created_at: '2026-01-20' },
  { id: 'cat-3', name: 'Resolutions', category_year: 2026, description: 'Approved board and management resolutions', created_at: '2026-02-02' },
  { id: 'cat-4', name: 'Reports', category_year: 2025, description: 'Operational and administrative reports', created_at: '2026-02-18' },
  { id: 'cat-5', name: 'Financial Documents', category_year: 2025, description: 'Budget, audit, and procurement files', created_at: '2026-03-03' },
  { id: 'cat-6', name: 'Correspondence', category_year: 2023, description: 'Incoming and outgoing official letters', created_at: '2026-03-19' },
  { id: 'cat-7', name: 'Policies', category_year: 2024, description: 'Policies, guidelines, and circulars', created_at: '2026-04-05' },
  { id: 'cat-8', name: 'Other Documents', category_year: 2026, description: 'Supplementary reference materials', created_at: '2026-04-16' },
]

export const users = [
  currentUser,
  { id: 'user-2', fullname: 'Jose Reyes', email: 'j.reyes@mancom.gov', role: roles.SECRETARY, status: 'Active', last_login: '2026-06-03T16:22:00+08:00' },
  { id: 'user-3', fullname: 'Ana Cruz', email: 'ana.cruz@mancom.gov', role: roles.STAFF, status: 'Active', last_login: '2026-06-02T09:18:00+08:00' },
  { id: 'user-4', fullname: 'Ramon Dela Pena', email: 'ramon.dp@mancom.gov', role: roles.STAFF, status: 'Inactive', last_login: '2026-05-25T11:04:00+08:00' },
]

export const files = [
  {
    id: 'file-1',
    title: 'MANCOM Regular Meeting Minutes - May 2026',
    description: 'Approved minutes with attendance and action items.',
    category_id: 'cat-2',
    file_url: '#',
    file_size: 2487000,
    file_type: 'pdf',
    document_year: 2026,
    tags: ['minutes', 'may', 'action-items'],
    uploaded_by: 'user-2',
    version: 3,
    created_at: '2026-05-31T10:20:00+08:00',
    updated_at: '2026-06-02T14:00:00+08:00',
    important: true,
  },
  {
    id: 'file-2',
    title: 'Budget Utilization Report Q2',
    description: 'Financial utilization report for second quarter monitoring.',
    category_id: 'cat-5',
    file_url: '#',
    file_size: 786000,
    file_type: 'xlsx',
    document_year: 2025,
    tags: ['budget', 'finance', 'q2'],
    uploaded_by: 'demo-admin',
    version: 1,
    created_at: '2026-05-29T13:15:00+08:00',
    updated_at: '2026-05-29T13:15:00+08:00',
    important: false,
  },
  {
    id: 'file-3',
    title: 'Policy on Document Retention',
    description: 'Updated policy on file retention and disposal timelines.',
    category_id: 'cat-7',
    file_url: '#',
    file_size: 1349000,
    file_type: 'docx',
    document_year: 2024,
    tags: ['policy', 'retention', 'records'],
    uploaded_by: 'demo-admin',
    version: 2,
    created_at: '2026-05-22T08:40:00+08:00',
    updated_at: '2026-05-28T09:12:00+08:00',
    important: true,
  },
  {
    id: 'file-4',
    title: 'Resolution No. 2026-014',
    description: 'Approved resolution for process improvement program.',
    category_id: 'cat-3',
    file_url: '#',
    file_size: 925000,
    file_type: 'pdf',
    document_year: 2026,
    tags: ['resolution', 'process-improvement'],
    uploaded_by: 'user-2',
    version: 1,
    created_at: '2026-05-19T15:22:00+08:00',
    updated_at: '2026-05-19T15:22:00+08:00',
    important: false,
  },
  {
    id: 'file-5',
    title: 'Executive Correspondence Archive',
    description: 'Compressed archive of signed correspondence scans.',
    category_id: 'cat-6',
    file_url: '#',
    file_size: 12564000,
    file_type: 'zip',
    document_year: 2023,
    tags: ['correspondence', 'archive', 'signed'],
    uploaded_by: 'user-3',
    version: 1,
    created_at: '2026-05-17T12:02:00+08:00',
    updated_at: '2026-05-17T12:02:00+08:00',
    important: false,
  },
]

export const fileNotes = [
  { id: 'note-1', file_id: 'file-1', note: 'Secretary verified the corrections from the May 28 MANCOM session.', created_by: 'user-2', created_at: '2026-06-02T14:18:00+08:00' },
  { id: 'note-2', file_id: 'file-1', note: 'Mark as reference for next executive agenda.', created_by: 'demo-admin', created_at: '2026-06-03T09:12:00+08:00' },
  { id: 'note-3', file_id: 'file-3', note: 'Needs legal office acknowledgement before office-wide circulation.', created_by: 'demo-admin', created_at: '2026-05-28T10:42:00+08:00' },
]

export const fileVersions = [
  { id: 'v-1', file_id: 'file-1', version: 1, name: 'Document_v1.pdf', uploaded_by: 'user-2', created_at: '2026-05-20T10:00:00+08:00', file_size: 2213000 },
  { id: 'v-2', file_id: 'file-1', version: 2, name: 'Document_v2.pdf', uploaded_by: 'user-2', created_at: '2026-05-27T11:30:00+08:00', file_size: 2391000 },
  { id: 'v-3', file_id: 'file-1', version: 3, name: 'Document_v3.pdf', uploaded_by: 'user-2', created_at: '2026-05-31T10:20:00+08:00', file_size: 2487000 },
  { id: 'v-4', file_id: 'file-3', version: 1, name: 'Document_v1.docx', uploaded_by: 'demo-admin', created_at: '2026-05-22T08:40:00+08:00', file_size: 1203000 },
  { id: 'v-5', file_id: 'file-3', version: 2, name: 'Document_v2.docx', uploaded_by: 'demo-admin', created_at: '2026-05-28T09:12:00+08:00', file_size: 1349000 },
]

export const activityLogs = [
  { id: 'log-1', user_id: 'demo-admin', action: 'User Login', description: 'Administrator signed in from secure browser session.', created_at: '2026-06-04T07:45:00+08:00' },
  { id: 'log-2', user_id: 'user-2', action: 'File Updated', description: 'Updated MANCOM Regular Meeting Minutes - May 2026 to version 3.', created_at: '2026-06-02T14:00:00+08:00' },
  { id: 'log-3', user_id: 'demo-admin', action: 'File Download', description: 'Downloaded Policy on Document Retention.', created_at: '2026-06-01T11:35:00+08:00' },
  { id: 'log-4', user_id: 'user-3', action: 'File Uploaded', description: 'Uploaded Executive Correspondence Archive.', created_at: '2026-05-17T12:02:00+08:00' },
  { id: 'log-5', user_id: 'user-2', action: 'Category Updated', description: 'Updated Meeting Minutes category description.', created_at: '2026-05-16T16:20:00+08:00' },
]

export const notifications = [
  { id: 'n-1', user_id: 'demo-admin', title: 'Important document added', message: 'Policy on Document Retention was marked important.', status: 'Unread', created_at: '2026-06-03T15:30:00+08:00' },
  { id: 'n-2', user_id: 'demo-admin', title: 'New file uploaded', message: 'MANCOM meeting minutes are available for review.', status: 'Unread', created_at: '2026-06-02T14:05:00+08:00' },
  { id: 'n-3', user_id: 'demo-admin', title: 'File updated', message: 'Resolution No. 2026-014 metadata was reviewed.', status: 'Read', created_at: '2026-05-30T09:00:00+08:00' },
]

export const calendarEvents = [
  { id: 'cal-1', title: 'MANCOM Meeting', type: 'Meeting', date: '2026-06-05', color: 'bg-red-600' },
  { id: 'cal-2', title: 'Budget report deadline', type: 'Deadline', date: '2026-06-12', color: 'bg-amber-500' },
  { id: 'cal-3', title: 'Minutes upload', type: 'Upload', date: '2026-06-17', color: 'bg-emerald-500' },
  { id: 'cal-4', title: 'Secretary review', type: 'Event', date: '2026-06-24', color: 'bg-red-800' },
]
