import type { EventItem } from '../types'
import { formatDate, formatRange } from '../lib/dates'
import { CategoryBadge, StatusBadge } from './badges'

interface Props {
  event: EventItem
  showDate?: boolean
  onOpen(event: EventItem): void
}

export function EventRow({ event, showDate = true, onOpen }: Props) {
  const dim = event.status !== 'upcoming'
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(event)}
        className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <div className="w-24 shrink-0 text-xs text-slate-500">
          {showDate && <div className="font-semibold text-slate-700">{formatDate(event.date)}</div>}
          <div>{formatRange(event)}</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${dim ? 'text-slate-500' : 'text-slate-900'} ${event.status === 'cancelled' ? 'line-through' : ''}`}>
            {event.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <CategoryBadge category={event.category} />
            {event.location && <span className="truncate text-xs text-slate-500">{event.location}</span>}
          </div>
        </div>
        <StatusBadge status={event.status} />
      </button>
    </li>
  )
}
