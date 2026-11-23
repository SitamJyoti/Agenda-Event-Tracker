import { useMemo } from 'react'
import type { EventItem } from '../types'
import { toISODate } from '../lib/dates'
import { eventsOnDate, upcomingEvents } from '../lib/filters'
import { EventRow } from './EventRow'

interface Props {
  events: EventItem[]
  now: Date
  onOpen(event: EventItem): void
  onCreate(): void
  onShowCalendar(): void
}

function Section({ title, empty, children, count }: { title: string; empty: string; children: React.ReactNode; count: number }) {
  return (
    <section aria-labelledby={`h-${title}`} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <h2 id={`h-${title}`} className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {count === 0 ? <p className="py-6 text-center text-sm text-slate-500">{empty}</p> : <ul className="space-y-2">{children}</ul>}
    </section>
  )
}

export function Dashboard({ events, now, onOpen, onCreate, onShowCalendar }: Props) {
  const data = useMemo(() => {
    const today = toISODate(now)
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const weekEndISO = toISODate(weekEnd)
    const upcoming = upcomingEvents(events, now)
    return {
      today: eventsOnDate(events, today),
      upcoming: upcoming.filter((e) => e.date > today).slice(0, 6),
      recent: [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
      todayOpen: upcoming.filter((e) => e.date === today).length,
      thisWeek: upcoming.filter((e) => e.date <= weekEndISO).length,
      totalUpcoming: upcoming.length,
    }
  }, [events, now])

  const stats = [
    { label: 'Still to go today', value: data.todayOpen },
    { label: 'Next 7 days', value: data.thisWeek },
    { label: 'All upcoming', value: data.totalUpcoming },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={onShowCalendar}>
            Open calendar
          </button>
          <button type="button" className="btn-primary" onClick={onCreate}>
            New event
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <dd className="text-2xl font-bold text-slate-900 sm:text-3xl">{s.value}</dd>
            <dt className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</dt>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Today's schedule" empty="Nothing scheduled today." count={data.today.length}>
          {data.today.map((e) => (
            <EventRow key={e.id} event={e} showDate={false} onOpen={onOpen} />
          ))}
        </Section>
        <Section title="Upcoming" empty="No upcoming events after today." count={data.upcoming.length}>
          {data.upcoming.map((e) => (
            <EventRow key={e.id} event={e} onOpen={onOpen} />
          ))}
        </Section>
        <div className="lg:col-span-2">
          <Section title="Recently created" empty="Events you create will show up here." count={data.recent.length}>
            {data.recent.map((e) => (
              <EventRow key={e.id} event={e} onOpen={onOpen} />
            ))}
          </Section>
        </div>
      </div>
    </div>
  )
}
