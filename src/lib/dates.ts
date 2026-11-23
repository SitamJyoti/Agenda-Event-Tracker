import type { EventItem } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')

/** Format a Date as local YYYY-MM-DD. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Format a Date as local HH:MM. */
export function toTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** True only for real calendar dates in YYYY-MM-DD form (rejects 2026-02-31). */
export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

/** Parse a stored local date + time into a Date in the viewer's timezone. */
export function eventStart(e: Pick<EventItem, 'date' | 'startTime'>): Date {
  const [y, m, d] = e.date.split('-').map(Number)
  const [hh, mm] = e.startTime.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm)
}

export function eventEnd(e: Pick<EventItem, 'date' | 'endTime'>): Date {
  const [y, m, d] = e.date.split('-').map(Number)
  const [hh, mm] = e.endTime.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm)
}

/** Chronological comparator: date, then start time, then title. */
export function byStart(a: EventItem, b: EventItem): number {
  return (
    a.date.localeCompare(b.date) ||
    a.startTime.localeCompare(b.startTime) ||
    a.title.localeCompare(b.title)
  )
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...opts,
  })
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatRange(e: Pick<EventItem, 'startTime' | 'endTime'>): string {
  return `${formatTime(e.startTime)} – ${formatTime(e.endTime)}`
}
