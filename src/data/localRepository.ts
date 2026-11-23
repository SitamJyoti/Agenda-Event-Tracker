import { CATEGORIES, STATUSES, type EventInput, type EventItem } from '../types'
import { isValidISODate, isValidTime } from '../lib/dates'
import { validateEvent } from '../lib/validation'
import { RepositoryError, type EventRepository } from './repository'

const STORAGE_KEY = 'event-tracker:v1:events'

type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>

function isEventItem(v: unknown): v is EventItem {
  if (!v || typeof v !== 'object') return false
  const e = v as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.createdAt === 'string' &&
    typeof e.title === 'string' &&
    typeof e.description === 'string' &&
    typeof e.location === 'string' &&
    typeof e.date === 'string' &&
    isValidISODate(e.date) &&
    typeof e.startTime === 'string' &&
    isValidTime(e.startTime) &&
    typeof e.endTime === 'string' &&
    isValidTime(e.endTime) &&
    (CATEGORIES as readonly unknown[]).includes(e.category) &&
    (STATUSES as readonly unknown[]).includes(e.status) &&
    Object.keys(validateEvent(e as unknown as EventInput)).length === 0
  )
}

/** Local-only storage used when Supabase is not configured. Events never leave this browser. */
export function createLocalRepository(store: KeyValueStore = window.localStorage): EventRepository {
  const read = (): EventItem[] => {
    try {
      const raw = store.getItem(STORAGE_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.filter(isEventItem) : []
    } catch {
      return []
    }
  }

  const write = (events: EventItem[]) => {
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch {
      throw new RepositoryError('Could not save to browser storage. It may be full or disabled.')
    }
  }

  return {
    async list() {
      return read()
    },
    async create(input) {
      const item: EventItem = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
      write([...read(), item])
      return item
    },
    async update(id, input) {
      const events = read()
      const index = events.findIndex((e) => e.id === id)
      if (index === -1) throw new RepositoryError('That event no longer exists.')
      const updated: EventItem = { ...events[index], ...input }
      events[index] = updated
      write(events)
      return updated
    },
    async remove(id) {
      write(read().filter((e) => e.id !== id))
    },
  }
}
