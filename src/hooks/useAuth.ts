import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface AuthState {
  /** True while the initial session lookup is running. */
  loading: boolean
  session: Session | null
  signIn(email: string, password: string): Promise<string | null>
  signUp(email: string, password: string): Promise<string | null>
  signOut(): Promise<void>
}

/** Returns generic messages so account existence and internals are not leaked. */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(supabase !== null)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Accounts are not configured.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? 'Incorrect email or password.' : null
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Accounts are not configured.'
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return 'Could not create the account. Check your details and try again.'
    // With email confirmation enabled there is no session yet.
    return data.session ? null : 'Check your email to confirm your account, then sign in.'
  }, [])

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
  }, [])

  return { loading, session, signIn, signUp, signOut }
}
