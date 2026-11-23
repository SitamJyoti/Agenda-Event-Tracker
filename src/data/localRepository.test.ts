import { beforeEach, describe, expect, it } from 'vitest'
import type { EventInput } from '../types'
import { createLocalRepository } from './localRepository'
import { RepositoryError } from './repository'

const input: EventInput = {
  title: 'Dinner',
  description: '',
  date: '2026-11-25',
  startTime: '19:00',
  endTime: '21:00',
  location: 'Home',
  category: 'personal',
  status: 'upcoming',
}

let data: Record<string, string>
const store = {
  getItem: (k: string) => data[k] ?? null,
  setItem: (k: string, v: string) => {
    data[k] = v
  },
}

beforeEach(() => {
  data = {}
})

describe('local repository', () => {
  it('creates, lists, updates and deletes events', async () => {
    const repo = createLocalRepository(store)
    expect(await repo.list()).toEqual([])

    const created = await repo.create(input)
    expect(created.id).toBeTruthy()
    expect(await repo.list()).toHaveLength(1)

    const updated = await repo.update(created.id, { ...input, title: 'Late dinner' })
    expect(updated.title).toBe('Late dinner')
    expect(updated.createdAt).toBe(created.createdAt)
    expect((await repo.list())[0].title).toBe('Late dinner')

    await repo.remove(created.id)
    expect(await repo.list()).toEqual([])
  })

  it('persists across repository instances', async () => {
    await createLocalRepository(store).create(input)
    expect(await createLocalRepository(store).list()).toHaveLength(1)
  })

  it('errors when updating a missing event', async () => {
    await expect(createLocalRepository(store).update('nope', input)).rejects.toBeInstanceOf(RepositoryError)
  })

  it('ignores corrupt or tampered stored data instead of crashing', async () => {
    data['event-tracker:v1:events'] = '{not json'
    expect(await createLocalRepository(store).list()).toEqual([])

    data['event-tracker:v1:events'] = JSON.stringify([{ id: 1, title: 'bad' }, null, 'x'])
    expect(await createLocalRepository(store).list()).toEqual([])
  })
})
