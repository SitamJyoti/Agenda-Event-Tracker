import type { EventInput, EventItem } from '../types'

/** Storage-agnostic contract. Inputs are already sanitized and validated by the caller. */
export interface EventRepository {
  list(): Promise<EventItem[]>
  create(input: EventInput): Promise<EventItem>
  update(id: string, input: EventInput): Promise<EventItem>
  remove(id: string): Promise<void>
}

/** Safe, user-facing error. Internal details are logged nowhere near the UI. */
export class RepositoryError extends Error {}
