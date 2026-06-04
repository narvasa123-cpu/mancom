import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, Field, Page, inputClass } from '../components/ui'
import { useAuth } from '../contexts/authContext'
import { createCalendarEvent } from '../services/documentService'

export function CalendarPage({ data }) {
  const { user } = useAuth()
  const [view, setView] = useState('Month')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('Event')
  const [status, setStatus] = useState('')

  async function addEvent(event) {
    event.preventDefault()
    if (!title || !date) return
    setStatus('')
    try {
      const savedEvent = await createCalendarEvent({ title, event_date: date, type, created_by: user.id })
      data.setCalendarEvents((items) => [savedEvent, ...items])
      data.addActivity('Calendar Event Added', `${title} scheduled for ${date}.`, user.id)
      setTitle('')
      setDate('')
      setType('Event')
    } catch (error) {
      setStatus(error.message || 'Unable to add calendar event.')
    }
  }

  const eventDate = (event) => event?.event_date || event?.date || ''
  const eventDay = (event) => {
    const value = eventDate(event)
    if (!value) return NaN
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.getDate()
    return Number(String(value).slice(-2))
  }
  const eventColor = (event) => {
    if (event?.color) return event.color
    if (event?.type === 'Deadline') return 'bg-amber-500'
    if (event?.type === 'Upload') return 'bg-emerald-500'
    return 'bg-red-600'
  }

  return (
    <Page title="Activity Calendar" description="Track upload dates, meetings, document deadlines, and secretary events.">
      {(status || data.error) && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{status || data.error}</div>}
      <div className="flex rounded-xl border border-slate-200 bg-white p-1 w-fit">
        {['Month', 'Week'].map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === item ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-red-50'}`}>{item} View</button>)}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-red-700" />
            <h3 className="text-lg font-bold">June 2026 · {view}</h3>
          </div>
          <div className={view === 'Month' ? 'grid grid-cols-7 gap-2' : 'grid gap-3'}>
            {Array.from({ length: view === 'Month' ? 30 : 7 }, (_, index) => {
              const day = index + 1
              const event = data.calendarEvents.find((item) => eventDay(item) === day)
              return (
                <div key={day} className="min-h-28 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-700">{day}</p>
                  {event && <div className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold text-white ${eventColor(event)}`}>{event.title}</div>}
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold">Secretary Events</h3>
          <div className="mt-4 space-y-3">
            {data.calendarEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{event.title}</p>
                  <Badge tone={event.type === 'Deadline' ? 'amber' : 'red'}>{event.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{eventDate(event)}</p>
              </div>
            ))}
          </div>

          <form onSubmit={addEvent} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
            <Field label="Event Title"><input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
            <Field label="Type">
              <select className={inputClass} value={type} onChange={(event) => setType(event.target.value)}>
                {['Event', 'Meeting', 'Deadline', 'Upload'].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Date"><input type="date" className={inputClass} value={date} onChange={(event) => setDate(event.target.value)} /></Field>
            <Button type="submit">Add Event</Button>
          </form>
        </Card>
      </section>
    </Page>
  )
}
