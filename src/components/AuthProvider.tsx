import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type AuthContextValue } from '../lib/auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
            setLoading(false)
        })
        return () => subscription.unsubscribe()
    }, [])

    const value = useMemo<AuthContextValue>(
        () => ({
            user: session?.user ?? null,
            session,
            loading,
            signUp: async (email, password) => {
                const { data, error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
                return { needsConfirmation: data.session === null }
            },
            signIn: async (email, password) => {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            },
            signOut: async () => {
                const { error } = await supabase.auth.signOut()
                if (error) throw error
            },
        }),
        [session, loading],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}