import { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventItem } from '../types'
import { toISODate, toTime } from '../lib/dates'
import { CATEGORY_COLORS } from './badges'

interface Props {
  events: EventItem[]
  onOpen(event: EventItem): void
  onCreate(date: string, time?: string): void
}

export function CalendarView({ events, onOpen, onCreate }: Props) {
  const byId = useMemo(() => new Map(events.map((e) => [e.id, e])), [events])

  const calendarEvents = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        start: `${e.date}T${e.startTime}:00`,
        end: `${e.date}T${e.endTime}:00`,
        backgroundColor: CATEGORY_COLORS[e.category],
        borderColor: CATEGORY_COLORS[e.category],
        classNames: e.status === 'upcoming' ? [] : [`fc-${e.status}`],
      })),
    [events],
  )

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{ today: 'Today', month: 'Month', week: 'Week', day: 'Day' }}
        events={calendarEvents}
        height="auto"
        contentHeight={640}
        nowIndicator
        dayMaxEvents={3}
        eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
        scrollTime="07:00:00"
        eventClick={(info) => {
          const found = byId.get(info.event.id)
          if (found) onOpen(found)
        }}
        dateClick={(info) => onCreate(toISODate(info.date), info.allDay ? undefined : toTime(info.date))}
      />
      <p className="mt-2 px-1 text-xs text-slate-500">Select a day or time slot to create an event. Select an event to view it.</p>
    </div>
  )
}
