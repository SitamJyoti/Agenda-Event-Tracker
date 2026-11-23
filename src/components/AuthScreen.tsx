import { useState, type FormEvent } from 'react'
import type { AuthState } from '../hooks/useAuth'

export function AuthScreen({ auth }: { auth: AuthState }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ tone: 'error' | 'info'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (mode === 'signup' && password.length < 8) {
      setMessage({ tone: 'error', text: 'Use a password with at least 8 characters.' })
      return
    }
    setBusy(true)
    const result = mode === 'signin' ? await auth.signIn(email.trim(), password) : await auth.signUp(email.trim(), password)
    setBusy(false)
    if (result) setMessage({ tone: mode === 'signup' && result.startsWith('Check your email') ? 'info' : 'error', text: result })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Event Tracker</h1>
        <p className="mt-1 text-sm text-slate-600">{mode === 'signin' ? 'Sign in to see your events.' : 'Create an account to get started.'}</p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={mode === 'signup' ? 8 : undefined} required />
          </div>

          {message && (
            <p role="alert" className={`rounded-lg px-3 py-2 text-sm ${message.tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'}`}>
              {message.text}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-center text-sm text-indigo-700 hover:underline"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setMessage(null)
          }}
        >
          {mode === 'signin' ? 'New here? Create an account' : 'Have an account? Sign in'}
        </button>
      </div>
    </main>
  )
}
