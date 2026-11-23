import { describe, expect, it } from 'vitest'
import type { EventItem } from '../types'
import { DEFAULT_FILTERS, dueReminders, filterEvents, upcomingEvents } from './filters'
import { newEventDefaults } from './eventDefaults'

const make = (over: Partial<EventItem>): EventItem => ({
  id: crypto.randomUUID(),
  createdAt: '2026-11-01T00:00:00Z',
  title: 'Event',
  description: '',
  date: '2026-11-23',
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  category: 'work',
  status: 'upcoming',
  ...over,
})

const events = [
  make({ title: 'Lunch', date: '2026-11-24', startTime: '12:00', endTime: '13:00', category: 'social' }),
  make({ title: 'Standup', description: 'Daily sync', date: '2026-11-23', startTime: '09:00', endTime: '09:15', category: 'meeting' }),
  make({ title: 'Old review', date: '2026-11-20', status: 'completed' }),
  make({ title: 'Dentist', date: '2026-11-23', startTime: '08:00', endTime: '09:00', category: 'health', status: 'cancelled' }),
]

describe('filterEvents', () => {
  it('sorts chronologically by default', () => {
    expect(filterEvents(events, DEFAULT_FILTERS).map((e) => e.title)).toEqual(['Old review', 'Dentist', 'Standup', 'Lunch'])
  })
  it('can sort newest first', () => {
    expect(filterEvents(events, { ...DEFAULT_FILTERS, order: 'desc' })[0].title).toBe('Lunch')
  })
  it('searches title and description, case-insensitively', () => {
    expect(filterEvents(events, { ...DEFAULT_FILTERS, query: 'SYNC' }).map((e) => e.title)).toEqual(['Standup'])
    expect(filterEvents(events, { ...DEFAULT_FILTERS, query: 'lunch' })).toHaveLength(1)
  })
  it('filters by category, status and date range', () => {
    expect(filterEvents(events, { ...DEFAULT_FILTERS, category: 'health' })).toHaveLength(1)
    expect(filterEvents(events, { ...DEFAULT_FILTERS, status: 'completed' })).toHaveLength(1)
    const ranged = filterEvents(events, { ...DEFAULT_FILTERS, dateFrom: '2026-11-23', dateTo: '2026-11-23' })
    expect(ranged.map((e) => e.title)).toEqual(['Dentist', 'Standup'])
  })
})

describe('upcomingEvents', () => {
  it('excludes finished, completed and cancelled events', () => {
    const now = new Date(2026, 10, 23, 9, 30)
    expect(upcomingEvents(events, now).map((e) => e.title)).toEqual(['Lunch'])
  })
})

describe('dueReminders', () => {
  it('reports events starting within the window and in-progress events', () => {
    const now = new Date(2026, 10, 23, 8, 30)
    const r = dueReminders(events, now)
    expect(r).toHaveLength(1)
    expect(r[0]).toMatchObject({ kind: 'soon', minutesUntil: 30 })
    expect(r[0].event.title).toBe('Standup')

    const during = dueReminders(events, new Date(2026, 10, 23, 9, 5))
    expect(during[0]).toMatchObject({ kind: 'in-progress' })
  })
  it('ignores events beyond the window, cancelled and completed events', () => {
    const now = new Date(2026, 10, 23, 7, 0)
    expect(dueReminders(events, now)).toHaveLength(0) // Standup is 2h away, Dentist cancelled
  })
})

describe('newEventDefaults', () => {
  it('uses the next hour and a one-hour duration', () => {
    const d = newEventDefaults(new Date(2026, 10, 23, 14, 20))
    expect(d).toMatchObject({ date: '2026-11-23', startTime: '15:00', endTime: '16:00' })
  })
  it('never produces an end before the start late in the day', () => {
    const d = newEventDefaults(new Date(2026, 10, 23, 23, 30))
    expect(d.endTime > d.startTime).toBe(true)
    const c = newEventDefaults(new Date(2026, 10, 23, 9, 0), '2026-12-01', '23:30')
    expect(c.endTime).toBe('23:59')
  })
})
