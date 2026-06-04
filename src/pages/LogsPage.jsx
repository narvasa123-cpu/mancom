import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card, Page, inputClass } from '../components/ui'
import { formatDateTime } from '../lib/utils'

export function LogsPage({ data }) {
  const [search, setSearch] = useState('')
  const logs = useMemo(() => {
    const term = search.toLowerCase()
    return data.activityLogs.filter((log) => [log.action, log.description, data.lookups.userById[log.user_id]?.fullname || ''].join(' ').toLowerCase().includes(term))
  }, [data.activityLogs, data.lookups.userById, search])

  return (
    <Page title="Activity Logs" description="Audit trail for login, logout, upload, download, edit, and delete events.">
      <Card className="p-0">
        <div className="relative border-b border-slate-200 p-4">
          <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className={`${inputClass} pl-9`} placeholder="Search activity logs..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-red-800 text-white">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-red-50/50">
                  <td className="px-4 py-4 font-semibold">{log.action}</td>
                  <td className="px-4 py-4 text-slate-600">{log.description}</td>
                  <td className="px-4 py-4">{data.lookups.userById[log.user_id]?.fullname || 'System'}</td>
                  <td className="px-4 py-4">{formatDateTime(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  )
}
