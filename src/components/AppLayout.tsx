import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { secondaryButtonClass } from '../lib/styles'

function navLinkClass({ isActive }: { isActive: boolean }): string {
    return isActive
        ? 'text-sm font-medium text-indigo-600'
        : 'text-sm text-slate-600 hover:text-slate-900'
}

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
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 px-4 py-3">
                    <nav aria-label="Main" className="flex items-center gap-6">
                        <Link to="/" className="font-semibold text-slate-900">
                            Study Planner
                        </Link>
                        <NavLink to="/subjects" className={navLinkClass}>
                            Subjects
                        </NavLink>
                    </nav>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-600">{user?.email}</span>
                        <button type="button" onClick={handleLogout} className={secondaryButtonClass}>
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