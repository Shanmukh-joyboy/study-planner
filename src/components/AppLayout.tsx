import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AppLayout() {
    const { user, signOut } = useAuth()
    const [error, setError] = useState<string | null>(null)

    async function handleLogout() {
        setError(null)
        try {
            await signOut()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not log out')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <span className="font-semibold text-slate-900">Study Planner</span>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-600">{user?.email}</span>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </header>
            {error && (
                <p role="alert" className="mx-auto max-w-5xl px-4 pt-4 text-sm text-red-600">
                    {error}
                </p>
            )}
            <main className="mx-auto max-w-5xl px-4 py-8">
                <Outlet />
            </main>
        </div>
    )
}