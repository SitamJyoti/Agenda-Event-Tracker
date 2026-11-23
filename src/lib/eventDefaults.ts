import type { EventInput } from '../types'
import { toISODate } from './dates'

const pad = (n: number) => String(n).padStart(2, '0')

/** Defaults for a new event: the given date/time, or the next full hour today. One hour long. */
export function newEventDefaults(now: Date, date?: string, time?: string): EventInput {
  let startHour: number
  let startMinute = 0
  if (time) {
    const [h, m] = time.split(':').map(Number)
    startHour = h
    startMinute = m
  } else {
    startHour = Math.min(now.getHours() + 1, 22)
  }
  const start = `${pad(startHour)}:${pad(startMinute)}`
  const endHour = startHour + 1
  const end = endHour > 23 ? '23:59' : `${pad(endHour)}:${pad(startMinute)}`

  return {
    title: '',
    description: '',
    date: date ?? toISODate(now),
    startTime: start,
    endTime: end,
    location: '',
    category: 'other',
    status: 'upcoming',
  }
}
