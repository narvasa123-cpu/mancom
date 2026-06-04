import { ShieldCheck, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, Field, Page, inputClass } from '../components/ui'
import { useAuth } from '../contexts/authContext'
import { roles } from '../data/mockData'
import { isSupabaseConfigured } from '../lib/supabase'
import { formatDateTime } from '../lib/utils'
import { updateUserStatus } from '../services/documentService'

export function UsersPage({ data }) {
  const { user: currentUser } = useAuth()
  const [form, setForm] = useState({ fullname: '', email: '', role: roles.STAFF })
  const [status, setStatus] = useState('')

  function addUser(event) {
    event.preventDefault()
    if (!form.fullname || !form.email) return
    if (isSupabaseConfigured) {
      setStatus('Create the login in Supabase Authentication first, then insert the matching profile row with the user id. Frontend account creation is disabled for security.')
      return
    }
    data.setUsers((items) => [
      { id: crypto.randomUUID(), ...form, status: 'Active', created_at: new Date().toISOString(), last_login: null },
      ...items,
    ])
    data.addActivity('User Added', `${form.fullname} was added as ${form.role}.`, currentUser.id)
    setForm({ fullname: '', email: '', role: roles.STAFF })
  }

  async function toggleStatus(user) {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    setStatus('')
    try {
      const savedUser = await updateUserStatus(user.id, nextStatus)
      data.setUsers((items) => items.map((item) => item.id === user.id ? { ...item, ...savedUser, status: nextStatus } : item))
      data.addActivity('User Status Updated', `${user.fullname} status was changed to ${nextStatus}.`, currentUser.id)
    } catch (error) {
      setStatus(error.message || 'Unable to update user status.')
    }
  }

  return (
    <Page title="User Management" description="Administrator-only management for authorized personnel, roles, and account status.">
      {(status || data.error) && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{status || data.error}</div>}
      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-red-700" />
            <h3 className="text-lg font-bold">Add User</h3>
          </div>
          <form onSubmit={addUser} className="space-y-4">
            <Field label="Full Name"><input className={inputClass} value={form.fullname} onChange={(event) => setForm((state) => ({ ...state, fullname: event.target.value }))} /></Field>
            <Field label="Email"><input type="email" className={inputClass} value={form.email} onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))} /></Field>
            <Field label="Role">
              <select className={inputClass} value={form.role} onChange={(event) => setForm((state) => ({ ...state, role: event.target.value }))}>
                {Object.values(roles).map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </Field>
            <Button type="submit"><UserPlus className="h-4 w-4" />Add User</Button>
          </form>
        </Card>

        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-red-800 text-white">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-red-50/50">
                    <td className="px-4 py-4 font-semibold">{user.fullname}</td>
                    <td className="px-4 py-4 text-slate-500">{user.email}</td>
                    <td className="px-4 py-4">{user.role}</td>
                    <td className="px-4 py-4"><Badge tone={user.status === 'Active' ? 'green' : 'slate'}>{user.status}</Badge></td>
                    <td className="px-4 py-4">{user.last_login ? formatDateTime(user.last_login) : 'No login yet'}</td>
                    <td className="px-4 py-4 text-right"><Button variant="outline" onClick={() => toggleStatus(user)}>{user.status === 'Active' ? 'Deactivate' : 'Activate'}</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </Page>
  )
}
