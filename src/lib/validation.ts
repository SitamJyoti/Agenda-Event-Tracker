import { CATEGORIES, STATUSES, type EventInput, type FieldErrors } from '../types'
import { isValidISODate, isValidTime } from './dates'

export const LIMITS = { title: 120, description: 2000, location: 200 } as const

// Strip control characters (keeps \n and \t in free text) and trim.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export function clean(value: unknown): string {
  return typeof value === 'string' ? value.replace(CONTROL, '').trim() : ''
}

export function sanitizeInput(raw: EventInput): EventInput {
  return {
    ...raw,
    title: clean(raw.title),
    description: clean(raw.description),
    location: clean(raw.location),
  }
}

export function validateEvent(input: EventInput): FieldErrors {
  const errors: FieldErrors = {}

  if (!input.title) errors.title = 'Title is required.'
  else if (input.title.length > LIMITS.title) errors.title = `Title must be ${LIMITS.title} characters or fewer.`

  if (input.description.length > LIMITS.description)
    errors.description = `Description must be ${LIMITS.description} characters or fewer.`

  if (input.location.length > LIMITS.location)
    errors.location = `Location must be ${LIMITS.location} characters or fewer.`

  if (!isValidISODate(input.date)) errors.date = 'Enter a valid date.'
  if (!isValidTime(input.startTime)) errors.startTime = 'Enter a valid start time.'
  if (!isValidTime(input.endTime)) errors.endTime = 'Enter a valid end time.'

  if (!errors.startTime && !errors.endTime && input.endTime <= input.startTime)
    errors.endTime = 'End time must be after the start time.'

  if (!(CATEGORIES as readonly string[]).includes(input.category)) errors.category = 'Choose a category.'
  if (!(STATUSES as readonly string[]).includes(input.status)) errors.status = 'Choose a status.'

  return errors
}

/** Sanitize, then validate. Returns the cleaned value only when it is valid. */
export function prepareEvent(
  raw: EventInput,
): { ok: true; value: EventInput } | { ok: false; errors: FieldErrors } {
  const value = sanitizeInput(raw)
  const errors = validateEvent(value)
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value }
}
