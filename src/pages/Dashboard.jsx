import { CalendarClock, FilePlus2, Files, FolderTree, UploadCloud, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card, Page, StatCard } from '../components/ui'
import { formatDateTime } from '../lib/utils'

export function Dashboard({ data }) {
  const recentFiles = [...data.files].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
  const timeline = data.activityLogs.slice(0, 6)

  return (
    <Page
      title="Dashboard"
      description="Executive overview of MANCOM document activity, uploads, users, and secretary events."
      actions={<Link to="/upload"><Button><UploadCloud className="h-4 w-4" />Upload File</Button></Link>}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Files} label="Total Files" value={data.files.length} detail="Active official records in repository" />
        <StatCard icon={FolderTree} label="Total Categories" value={data.categories.length} detail="Managed document classifications" />
        <StatCard icon={Users} label="Total Users" value={data.users.length} detail="Authorized system accounts" />
        <StatCard icon={FilePlus2} label="Recent Uploads" value={recentFiles.length} detail="New uploads in the latest activity window" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Recent Uploads</h3>
              <p className="text-sm text-slate-500">Latest documents submitted by secretaries and staff</p>
            </div>
            <Link to="/files" className="text-sm font-semibold text-red-700">View all</Link>
          </div>
          <div className="space-y-3">
            {recentFiles.map((file) => (
              <div key={file.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 transition hover:border-red-100 hover:bg-red-50/40 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-700">
                    <Files className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{file.title}</p>
                    <p className="text-sm text-slate-500">Version {file.version} · {formatDateTime(file.created_at)}</p>
                  </div>
                </div>
                <Link to={`/files/${file.id}`} className="text-sm font-semibold text-red-700">Open details</Link>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <div className="mt-4 grid gap-3">
            <Link to="/upload"><Button className="w-full justify-start"><UploadCloud className="h-4 w-4" />Upload File</Button></Link>
            <Link to="/files"><Button variant="secondary" className="w-full justify-start"><Files className="h-4 w-4" />View Files</Button></Link>
            <Link to="/categories"><Button variant="secondary" className="w-full justify-start"><FolderTree className="h-4 w-4" />Manage Categories</Button></Link>
            <Link to="/users"><Button variant="secondary" className="w-full justify-start"><Users className="h-4 w-4" />Manage Users</Button></Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-red-700" />
            <h3 className="text-lg font-bold">Activity Calendar</h3>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
            {Array.from({ length: 30 }, (_, index) => {
              const day = index + 1
              const event = data.calendarEvents.find((item) => Number(item.date.slice(-2)) === day)
              return (
                <div key={day} className="min-h-16 rounded-xl border border-slate-100 bg-slate-50 p-2 text-left">
                  <span className="font-semibold text-slate-700">{day}</span>
                  {event && <div className={`mt-2 rounded-lg px-2 py-1 text-[11px] font-semibold text-white ${event.color}`}>{event.type}</div>}
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold">Activity Timeline</h3>
          <div className="mt-5 space-y-4">
            {timeline.map((log) => (
              <div key={log.id} className="relative border-l-2 border-red-100 pl-5">
                <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-red-600 ring-4 ring-red-50" />
                <p className="font-semibold text-slate-950">{log.action}</p>
                <p className="text-sm text-slate-500">{log.description}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDateTime(log.created_at)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </Page>
  )
}
