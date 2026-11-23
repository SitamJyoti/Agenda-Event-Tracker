import type { Category, EventItem, Status } from '../types'
import { byStart, eventEnd, eventStart } from './dates'

export interface EventFilters {
  query: string
  category: Category | 'all'
  status: Status | 'all'
  dateFrom: string
  dateTo: string
  order: 'asc' | 'desc'
}

export const DEFAULT_FILTERS: EventFilters = {
  query: '',
  category: 'all',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  order: 'asc',
}

export function filterEvents(events: EventItem[], f: EventFilters): EventItem[] {
  const q = f.query.trim().toLowerCase()
  const out = events.filter((e) => {
    if (q && !e.title.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q)) return false
    if (f.category !== 'all' && e.category !== f.category) return false
    if (f.status !== 'all' && e.status !== f.status) return false
    if (f.dateFrom && e.date < f.dateFrom) return false
    if (f.dateTo && e.date > f.dateTo) return false
    return true
  })
  out.sort(byStart)
  return f.order === 'desc' ? out.reverse() : out
}

/** Upcoming-status events that have not finished yet, soonest first. */
export function upcomingEvents(events: EventItem[], now: Date): EventItem[] {
  return events
    .filter((e) => e.status === 'upcoming' && eventEnd(e) >= now)
    .sort(byStart)
}

export function eventsOnDate(events: EventItem[], isoDate: string): EventItem[] {
  return events.filter((e) => e.date === isoDate).sort(byStart)
}

export const REMINDER_WINDOW_MINUTES = 60

export interface Reminder {
  event: EventItem
  kind: 'in-progress' | 'soon'
  minutesUntil: number
}

/**
 * Real reminder logic: events still marked "upcoming" that are happening now or
 * start within the window. Cancelled and completed events never remind.
 */
export function dueReminders(
  events: EventItem[],
  now: Date,
  windowMinutes = REMINDER_WINDOW_MINUTES,
): Reminder[] {
  const reminders: Reminder[] = []
  for (const event of events) {
    if (event.status !== 'upcoming') continue
    const start = eventStart(event)
    const end = eventEnd(event)
    if (start <= now && now < end) {
      reminders.push({ event, kind: 'in-progress', minutesUntil: 0 })
    } else if (start > now) {
      const minutesUntil = Math.ceil((start.getTime() - now.getTime()) / 60000)
      if (minutesUntil <= windowMinutes) reminders.push({ event, kind: 'soon', minutesUntil })
    }
  }
  return reminders.sort((a, b) => byStart(a.event, b.event))
}
