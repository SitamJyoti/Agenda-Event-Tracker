import { useCallback, useEffect, useState } from 'react'
import { RepositoryError, type EventRepository } from '../data/repository'
import type { EventInput, EventItem } from '../types'
import { byStart } from '../lib/dates'

export type LoadStatus = 'loading' | 'ready' | 'error'
export type ActionResult = { ok: true } | { ok: false; message: string }

const messageOf = (err: unknown): string =>
  err instanceof RepositoryError ? err.message : 'Something went wrong. Please try again.'

export function useEvents(repo: EventRepository) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setEvents((await repo.list()).sort(byStart))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [repo])

  useEffect(() => {
    void load()
  }, [load])

  const run = useCallback(async (action: () => Promise<void>): Promise<ActionResult> => {
    try {
      await action()
      return { ok: true }
    } catch (err) {
      return { ok: false, message: messageOf(err) }
    }
  }, [])

  const create = (input: EventInput) =>
    run(async () => {
      const item = await repo.create(input)
      setEvents((prev) => [...prev, item].sort(byStart))
    })

  const update = (id: string, input: EventInput) =>
    run(async () => {
      const item = await repo.update(id, input)
      setEvents((prev) => prev.map((e) => (e.id === id ? item : e)).sort(byStart))
    })

  const remove = (id: string) =>
    run(async () => {
      await repo.remove(id)
      setEvents((prev) => prev.filter((e) => e.id !== id))
    })

  return { events, status, reload: load, create, update, remove }
}
