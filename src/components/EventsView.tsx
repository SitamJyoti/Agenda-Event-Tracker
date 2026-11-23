import { useMemo, useState } from 'react'
import { CATEGORIES, STATUSES, type EventItem } from '../types'
import { DEFAULT_FILTERS, filterEvents, type EventFilters } from '../lib/filters'
import { EventRow } from './EventRow'
import { titleCase } from './badges'

interface Props {
  events: EventItem[]
  onOpen(event: EventItem): void
  onCreate(): void
}

export function EventsView({ events, onOpen, onCreate }: Props) {
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS)
  const set = <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => setFilters((f) => ({ ...f, [key]: value }))

  const results = useMemo(() => filterEvents(events, filters), [events, filters])
  const isFiltered = JSON.stringify({ ...filters, order: 'asc' }) !== JSON.stringify({ ...DEFAULT_FILTERS })

  return (
    <div className="space-y-4">
      <form role="search" aria-label="Search and filter events" className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2 lg:grid-cols-6" onSubmit={(e) => e.preventDefault()}>
        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="f-query" className="mb-1 block text-xs font-medium text-slate-600">Search</label>
          <input id="f-query" type="search" className="input" placeholder="Title or description" value={filters.query} onChange={(e) => set('query', e.target.value)} />
        </div>
        <div>
          <label htmlFor="f-category" className="mb-1 block text-xs font-medium text-slate-600">Category</label>
          <select id="f-category" className="input" value={filters.category} onChange={(e) => set('category', e.target.value as EventFilters['category'])}>
            <option value="all">All</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-status" className="mb-1 block text-xs font-medium text-slate-600">Status</label>
          <select id="f-status" className="input" value={filters.status} onChange={(e) => set('status', e.target.value as EventFilters['status'])}>
            <option value="all">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-from" className="mb-1 block text-xs font-medium text-slate-600">From</label>
          <input id="f-from" type="date" className="input" value={filters.dateFrom} max={filters.dateTo || undefined} onChange={(e) => set('dateFrom', e.target.value)} />
        </div>
        <div>
          <label htmlFor="f-to" className="mb-1 block text-xs font-medium text-slate-600">To</label>
          <input id="f-to" type="date" className="input" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(e) => set('dateTo', e.target.value)} />
        </div>
        <div className="flex items-end justify-between gap-2 sm:col-span-2 lg:col-span-6">
          <div className="w-44">
            <label htmlFor="f-order" className="mb-1 block text-xs font-medium text-slate-600">Sort</label>
            <select id="f-order" className="input" value={filters.order} onChange={(e) => set('order', e.target.value as EventFilters['order'])}>
              <option value="asc">Oldest first</option>
              <option value="desc">Newest first</option>
            </select>
          </div>
          <button type="button" className="btn-secondary" disabled={!isFiltered} onClick={() => setFilters(DEFAULT_FILTERS)}>
            Clear filters
          </button>
        </div>
      </form>

      <p className="text-sm text-slate-600" aria-live="polite">
        {results.length} {results.length === 1 ? 'event' : 'events'}
        {isFiltered && events.length > 0 ? ` of ${events.length}` : ''}
      </p>

      {results.length > 0 ? (
        <ul className="space-y-2">
          {results.map((e) => <EventRow key={e.id} event={e} onOpen={onOpen} />)}
        </ul>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="font-medium text-slate-900">No events yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first event to start planning.</p>
          <button type="button" className="btn-primary mt-4" onClick={onCreate}>New event</button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="font-medium text-slate-900">No events match these filters</p>
          <button type="button" className="btn-secondary mt-4" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</button>
        </div>
      )}
    </div>
  )
}
