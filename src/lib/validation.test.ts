import { describe, expect, it } from 'vitest'
import type { EventInput } from '../types'
import { isValidISODate, isValidTime } from './dates'
import { prepareEvent, validateEvent } from './validation'

const valid: EventInput = {
  title: 'Team sync',
  description: 'Weekly',
  date: '2026-11-23',
  startTime: '09:00',
  endTime: '10:00',
  location: 'Room 4',
  category: 'meeting',
  status: 'upcoming',
}

describe('date helpers', () => {
  it('rejects impossible calendar dates', () => {
    expect(isValidISODate('2026-02-31')).toBe(false)
    expect(isValidISODate('2026-13-01')).toBe(false)
    expect(isValidISODate('26-01-01')).toBe(false)
    expect(isValidISODate('2028-02-29')).toBe(true)
  })
  it('validates 24h times', () => {
    expect(isValidTime('23:59')).toBe(true)
    expect(isValidTime('24:00')).toBe(false)
    expect(isValidTime('9:00')).toBe(false)
  })
})

describe('validateEvent', () => {
  it('accepts a valid event', () => {
    expect(validateEvent(valid)).toEqual({})
  })
  it('requires a title', () => {
    expect(validateEvent({ ...valid, title: '' }).title).toBeDefined()
  })
  it('rejects end time not after start time', () => {
    expect(validateEvent({ ...valid, endTime: '09:00' }).endTime).toBeDefined()
    expect(validateEvent({ ...valid, endTime: '08:00' }).endTime).toBeDefined()
  })
  it('enforces length limits', () => {
    expect(validateEvent({ ...valid, title: 'x'.repeat(121) }).title).toBeDefined()
    expect(validateEvent({ ...valid, description: 'x'.repeat(2001) }).description).toBeDefined()
    expect(validateEvent({ ...valid, location: 'x'.repeat(201) }).location).toBeDefined()
  })
  it('rejects unknown category or status', () => {
    expect(validateEvent({ ...valid, category: 'bogus' as never }).category).toBeDefined()
    expect(validateEvent({ ...valid, status: 'bogus' as never }).status).toBeDefined()
  })
})

describe('prepareEvent', () => {
  it('trims and strips control characters', () => {
    const r = prepareEvent({ ...valid, title: '  Hi\u0000 there  ' })
    expect(r.ok && r.value.title).toBe('Hi there')
  })
  it('treats whitespace-only titles as empty', () => {
    expect(prepareEvent({ ...valid, title: '   ' }).ok).toBe(false)
  })
  it('keeps markup as plain text (React escapes it on render)', () => {
    const r = prepareEvent({ ...valid, title: '<img src=x onerror=alert(1)>' })
    expect(r.ok && r.value.title).toBe('<img src=x onerror=alert(1)>')
  })
})
