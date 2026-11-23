import { useState } from 'react'
import type { EventItem, Status } from '../types'
import { formatDate, formatRange } from '../lib/dates'
import { CategoryBadge, StatusBadge } from './badges'
import { Modal } from './Modal'

interface Props {
  event: EventItem
  onClose(): void
  onEdit(): void
  onDelete(): void
  onSetStatus(status: Status): Promise<void>
}

export function EventDetail({ event, onClose, onEdit, onDelete, onSetStatus }: Props) {
  const [busy, setBusy] = useState(false)

  const setStatus = async (status: Status) => {
    setBusy(true)
    await onSetStatus(status)
    setBusy(false)
  }

  return (
    <Modal title={event.title} onClose={onClose}>
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={event.status} />
        <CategoryBadge category={event.category} />
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-slate-500">When</dt>
          <dd className="text-slate-900">
            {formatDate(event.date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            <br />
            {formatRange(event)}
          </dd>
        </div>
        {event.location && (
          <div>
            <dt className="font-medium text-slate-500">Location</dt>
            <dd className="text-slate-900">{event.location}</dd>
          </div>
        )}
        {event.description && (
          <div>
            <dt className="font-medium text-slate-500">Description</dt>
            <dd className="whitespace-pre-wrap text-slate-900">{event.description}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
        <div className="flex flex-wrap gap-2">
          {event.status === 'upcoming' ? (
            <>
              <button type="button" className="btn-secondary" disabled={busy} onClick={() => setStatus('completed')}>
                Mark completed
              </button>
              <button type="button" className="btn-secondary" disabled={busy} onClick={() => setStatus('cancelled')}>
                Cancel event
              </button>
            </>
          ) : (
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => setStatus('upcoming')}>
              Reopen
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="btn-danger-outline" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}
