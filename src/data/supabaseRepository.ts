import type { SupabaseClient } from '@supabase/supabase-js'
import type { Category, EventInput, EventItem, Status } from '../types'
import { RepositoryError, type EventRepository } from './repository'

interface Row {
  id: string
  title: string
  description: string
  date: string
  start_time: string
  end_time: string
  location: string
  category: Category
  status: Status
  created_at: string
}

const COLUMNS = 'id,title,description,date,start_time,end_time,location,category,status,created_at'

const fromRow = (r: Row): EventItem => ({
  id: r.id,
  title: r.title,
  description: r.description,
  date: r.date,
  startTime: r.start_time.slice(0, 5), // Postgres returns HH:MM:SS
  endTime: r.end_time.slice(0, 5),
  location: r.location,
  category: r.category,
  status: r.status,
  createdAt: r.created_at,
})

const toRow = (i: EventInput) => ({
  title: i.title,
  description: i.description,
  date: i.date,
  start_time: i.startTime,
  end_time: i.endTime,
  location: i.location,
  category: i.category,
  status: i.status,
})

/**
 * Every call goes through PostgREST with the signed-in user's JWT, so Row Level Security
 * (see supabase/migrations) is the authorization boundary. user_id is never sent by the client.
 */
export function createSupabaseRepository(client: SupabaseClient): EventRepository {
  const fail = (action: string): never => {
    throw new RepositoryError(`Could not ${action}. Please try again.`)
  }

  return {
    async list() {
      const { data, error } = await client
        .from('events')
        .select(COLUMNS)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
      if (error) return fail('load your events')
      return (data as Row[]).map(fromRow)
    },
    async create(input) {
      const { data, error } = await client.from('events').insert(toRow(input)).select(COLUMNS).single()
      if (error) return fail('create the event')
      return fromRow(data as Row)
    },
    async update(id, input) {
      const { data, error } = await client
        .from('events')
        .update(toRow(input))
        .eq('id', id)
        .select(COLUMNS)
        .maybeSingle()
      if (error) return fail('update the event')
      if (!data) throw new RepositoryError('That event no longer exists.')
      return fromRow(data as Row)
    },
    async remove(id) {
      const { error } = await client.from('events').delete().eq('id', id)
      if (error) fail('delete the event')
    },
  }
}
