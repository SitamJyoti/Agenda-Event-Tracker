export const CATEGORIES = ['work', 'personal', 'meeting', 'social', 'health', 'other'] as const
export const STATUSES = ['upcoming', 'completed', 'cancelled'] as const

export type Category = (typeof CATEGORIES)[number]
export type Status = (typeof STATUSES)[number]

export interface EventInput {
  title: string
  description: string
  /** Local calendar date, YYYY-MM-DD */
  date: string
  /** Local time, HH:MM (24h) */
  startTime: string
  endTime: string
  location: string
  category: Category
  status: Status
}

export interface EventItem extends EventInput {
  id: string
  createdAt: string
}

export type FieldErrors = Partial<Record<keyof EventInput, string>>
