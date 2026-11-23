import { useState, type FormEvent, type ReactNode } from 'react'
import { CATEGORIES, STATUSES, type EventInput, type FieldErrors } from '../types'
import type { ActionResult } from '../hooks/useEvents'
import { LIMITS, prepareEvent } from '../lib/validation'
import { Modal } from './Modal'
import { titleCase } from './badges'

interface Props {
  heading: string
  initial: EventInput
  submitLabel: string
  onSubmit(input: EventInput): Promise<ActionResult>
  onClose(): void
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export function EventForm({ heading, initial, submitLabel, onSubmit, onClose }: Props) {
  const [values, setValues] = useState<EventInput>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const set = <K extends keyof EventInput>(key: K, value: EventInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const aria = (key: keyof EventInput) => ({
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const prepared = prepareEvent(values)
    if (!prepared.ok) {
      setErrors(prepared.errors)
      return
    }
    setErrors({})
    setBusy(true)
    const result = await onSubmit(prepared.value)
    setBusy(false)
    if (!result.ok) setFormError(result.message)
  }

  return (
    <Modal title={heading} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field id="title" label="Title" error={errors.title}>
          <input
            id="title"
            className="input"
            value={values.title}
            maxLength={LIMITS.title}
            onChange={(e) => set('title', e.target.value)}
            autoFocus
            required
            {...aria('title')}
          />
        </Field>

        <Field id="description" label="Description" error={errors.description}>
          <textarea
            id="description"
            className="input min-h-20"
            rows={3}
            value={values.description}
            maxLength={LIMITS.description}
            onChange={(e) => set('description', e.target.value)}
            {...aria('description')}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="date" label="Date" error={errors.date}>
            <input id="date" type="date" className="input" value={values.date} onChange={(e) => set('date', e.target.value)} required {...aria('date')} />
          </Field>
          <Field id="startTime" label="Start" error={errors.startTime}>
            <input id="startTime" type="time" className="input" value={values.startTime} onChange={(e) => set('startTime', e.target.value)} required {...aria('startTime')} />
          </Field>
          <Field id="endTime" label="End" error={errors.endTime}>
            <input id="endTime" type="time" className="input" value={values.endTime} onChange={(e) => set('endTime', e.target.value)} required {...aria('endTime')} />
          </Field>
        </div>

        <Field id="location" label="Location" error={errors.location}>
          <input
            id="location"
            className="input"
            value={values.location}
            maxLength={LIMITS.location}
            onChange={(e) => set('location', e.target.value)}
            {...aria('location')}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="category" label="Category" error={errors.category}>
            <select id="category" className="input" value={values.category} onChange={(e) => set('category', e.target.value as EventInput['category'])} {...aria('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {titleCase(c)}
                </option>
              ))}
            </select>
          </Field>
          <Field id="status" label="Status" error={errors.status}>
            <select id="status" className="input" value={values.status} onChange={(e) => set('status', e.target.value as EventInput['status'])} {...aria('status')}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}
