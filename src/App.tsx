import { lazy, Suspense, useMemo, useState } from 'react'
import type { EventItem, Status } from './types'
import { createLocalRepository } from './data/localRepository'
import { createSupabaseRepository } from './data/supabaseRepository'
import type { EventRepository } from './data/repository'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import { useEvents } from './hooks/useEvents'
import { useNow } from './hooks/useNow'
import { dueReminders } from './lib/filters'
import { newEventDefaults } from './lib/eventDefaults'
import { AuthScreen } from './components/AuthScreen'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Dashboard } from './components/Dashboard'
import { EventDetail } from './components/EventDetail'
import { EventForm } from './components/EventForm'
import { EventsView } from './components/EventsView'
import { Reminders } from './components/Reminders'
import { ToastProvider, useToast } from './components/Toast'

// FullCalendar is the heaviest dependency; load it only when the calendar is opened.
const CalendarView = lazy(() => import('./components/CalendarView').then((m) => ({ default: m.CalendarView })))

type View = 'dashboard' | 'calendar' | 'events'
type ModalState =
  | { kind: 'none' }
  | { kind: 'create'; date?: string; time?: string }
  | { kind: 'edit'; id: string }
  | { kind: 'detail'; id: string }
  | { kind: 'delete'; id: string }

const NAV: { view: View; label: string; icon: string }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10' },
  { view: 'calendar', label: 'Calendar', icon: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z' },
  { view: 'events', label: 'All events', icon: 'M4 6h16M4 12h16M4 18h10' },
]

function Icon({ path }: { path: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

function Tracker({ repo, userEmail, onSignOut }: { repo: EventRepository; userEmail?: string; onSignOut?: () => void }) {
  const { events, status, reload, create, update, remove } = useEvents(repo)
  const now = useNow()
  const toast = useToast()
  const [view, setView] = useState<View>('dashboard')
  const [modal, setModal] = useState<ModalState>({ kind: 'none' })

  const reminders = useMemo(() => dueReminders(events, now), [events, now])
  const find = (id: string) => events.find((e) => e.id === id)
  const close = () => setModal({ kind: 'none' })
  const open = (e: EventItem) => setModal({ kind: 'detail', id: e.id })
  const startCreate = (date?: string, time?: string) => setModal({ kind: 'create', date, time })

  const setStatus = async (event: EventItem, next: Status) => {
    const { id: _id, createdAt: _createdAt, ...input } = event
    const result = await update(event.id, { ...input, status: next })
    toast(result.ok ? 'success' : 'error', result.ok ? `Marked ${next}.` : result.message)
  }

  const current = modal.kind === 'edit' || modal.kind === 'detail' || modal.kind === 'delete' ? find(modal.id) : undefined

  return (
    <div className="min-h-screen bg-white text-slate-900 md:pl-56">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-slate-200 bg-slate-50 p-4 md:flex">
        <p className="mb-6 px-2 text-lg font-bold text-indigo-700">Event Tracker</p>
        <nav aria-label="Main" className="space-y-1">
          {NAV.map((n) => (
            <button key={n.view} type="button" onClick={() => setView(n.view)} aria-current={view === n.view ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${view === n.view ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Icon path={n.icon} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-2 text-xs text-slate-500">
          {userEmail ? (
            <>
              <p className="truncate">{userEmail}</p>
              <button type="button" className="mt-1 font-medium text-indigo-700 hover:underline" onClick={onSignOut}>Sign out</button>
            </>
          ) : (
            <p>Local mode: events are saved in this browser only.</p>
          )}
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <h1 className="text-lg font-semibold">{NAV.find((n) => n.view === view)?.label}</h1>
        <div className="flex items-center gap-1">
          <Reminders reminders={reminders} onOpen={open} />
          <button type="button" className="btn-primary ml-1" onClick={() => startCreate()}>New event</button>
          {userEmail && (
            <button type="button" className="btn-secondary ml-1 md:hidden" onClick={onSignOut}>Sign out</button>
          )}
        </div>
      </header>

      <main className="px-4 pb-28 pt-5 sm:px-6 md:pb-10">
        {status === 'loading' && <p className="py-20 text-center text-slate-500" role="status">Loading your events…</p>}
        {status === 'error' && (
          <div role="alert" className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-800">We couldn't load your events.</p>
            <button type="button" className="btn-secondary mt-3" onClick={() => void reload()}>Try again</button>
          </div>
        )}
        {status === 'ready' && (
          <>
            {!isSupabaseConfigured && (
              <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 md:hidden">Local mode: events are saved in this browser only.</p>
            )}
            {view === 'dashboard' && <Dashboard events={events} now={now} onOpen={open} onCreate={() => startCreate()} onShowCalendar={() => setView('calendar')} />}
            {view === 'calendar' && (
              <Suspense fallback={<p className="py-20 text-center text-slate-500" role="status">Loading calendar…</p>}>
                <CalendarView events={events} onOpen={open} onCreate={startCreate} />
              </Suspense>
            )}
            {view === 'events' && <EventsView events={events} onOpen={open} onCreate={() => startCreate()} />}
          </>
        )}
      </main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white md:hidden">
        {NAV.map((n) => (
          <button key={n.view} type="button" onClick={() => setView(n.view)} aria-current={view === n.view ? 'page' : undefined} className={`flex flex-col items-center gap-0.5 py-2 text-xs font-medium ${view === n.view ? 'text-indigo-700' : 'text-slate-500'}`}>
            <Icon path={n.icon} />
            {n.label}
          </button>
        ))}
      </nav>

      {modal.kind === 'create' && (
        <EventForm
          heading="New event"
          submitLabel="Create event"
          initial={newEventDefaults(now, modal.date, modal.time)}
          onClose={close}
          onSubmit={async (input) => {
            const result = await create(input)
            if (result.ok) {
              toast('success', 'Event created.')
              close()
            }
            return result
          }}
        />
      )}

      {modal.kind === 'edit' && current && (
        <EventForm
          heading="Edit event"
          submitLabel="Save changes"
          initial={{ title: current.title, description: current.description, date: current.date, startTime: current.startTime, endTime: current.endTime, location: current.location, category: current.category, status: current.status }}
          onClose={close}
          onSubmit={async (input) => {
            const result = await update(current.id, input)
            if (result.ok) {
              toast('success', 'Event updated.')
              close()
            }
            return result
          }}
        />
      )}

      {modal.kind === 'detail' && current && (
        <EventDetail
          event={current}
          onClose={close}
          onEdit={() => setModal({ kind: 'edit', id: current.id })}
          onDelete={() => setModal({ kind: 'delete', id: current.id })}
          onSetStatus={(s) => setStatus(current, s)}
        />
      )}

      {modal.kind === 'delete' && current && (
        <ConfirmDialog
          title="Delete this event?"
          message={`"${current.title}" will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete event"
          onCancel={() => setModal({ kind: 'detail', id: current.id })}
          onConfirm={async () => {
            const result = await remove(current.id)
            toast(result.ok ? 'success' : 'error', result.ok ? 'Event deleted.' : result.message)
            if (result.ok) close()
          }}
        />
      )}
    </div>
  )
}

function SupabaseApp() {
  const auth = useAuth()
  const repo = useMemo(() => (supabase ? createSupabaseRepository(supabase) : null), [])
  // Re-mount the tracker per user so one account's data never lingers in another's state.
  if (auth.loading) return <p className="py-20 text-center text-slate-500" role="status">Loading…</p>
  if (!auth.session || !repo) return <AuthScreen auth={auth} />
  return <Tracker key={auth.session.user.id} repo={repo} userEmail={auth.session.user.email} onSignOut={() => void auth.signOut()} />
}

function LocalApp() {
  const repo = useMemo(() => createLocalRepository(), [])
  return <Tracker repo={repo} />
}

export default function App() {
  return <ToastProvider>{isSupabaseConfigured ? <SupabaseApp /> : <LocalApp />}</ToastProvider>
}
