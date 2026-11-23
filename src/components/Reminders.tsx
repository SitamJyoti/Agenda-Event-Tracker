import { useEffect, useRef, useState } from 'react'
import type { EventItem } from '../types'
import type { Reminder } from '../lib/filters'
import { formatRange } from '../lib/dates'

interface Props {
  reminders: Reminder[]
  onOpen(event: EventItem): void
}

const describe = (r: Reminder) =>
  r.kind === 'in-progress' ? 'Happening now' : r.minutesUntil <= 1 ? 'Starting in 1 minute' : `Starts in ${r.minutesUntil} minutes`

export function Reminders({ reminders, onOpen }: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onClick = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        aria-label={reminders.length ? `Reminders, ${reminders.length} due` : 'Reminders, none due'}
        aria-expanded={open}
        aria-controls="reminder-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
        </svg>
        {reminders.length > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {reminders.length}
          </span>
        )}
      </button>

      {open && (
        <div id="reminder-panel" className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Next 60 minutes</p>
          {reminders.length === 0 ? (
            <p className="px-2 py-4 text-sm text-slate-500">No events starting soon.</p>
          ) : (
            <ul>
              {reminders.map((r) => (
                <li key={r.event.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                    onClick={() => {
                      setOpen(false)
                      onOpen(r.event)
                    }}
                  >
                    <span className="block truncate text-sm font-medium text-slate-900">{r.event.title}</span>
                    <span className="block text-xs text-slate-500">
                      <span className={r.kind === 'in-progress' ? 'font-semibold text-emerald-700' : 'font-semibold text-indigo-700'}>{describe(r)}</span>
                      {' · '}
                      {formatRange(r.event)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
