import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { secondaryButtonClass } from '../lib/styles'

function navLinkClass({ isActive }: { isActive: boolean }): string {
    return isActive
        ? 'rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700'
        : 'rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
        <div className="min-h-screen">
            <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 px-4 py-3">
                    <nav aria-label="Main" className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
                            <span
                                aria-hidden="true"
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm shadow-indigo-300/60"
                            >
                                S
                            </span>
                            Study Planner
                        </Link>
                        <NavLink to="/subjects" className={navLinkClass}>
                            Subjects
                        </NavLink>
                    </nav>
                    <div className="flex items-center gap-3">
                        <span
                            aria-hidden="true"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
                        >
                            {user?.email?.charAt(0).toUpperCase()}
                        </span>
                        <span className="hidden text-sm text-slate-600 sm:inline">{user?.email}</span>
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
            <main className="mx-auto max-w-5xl px-4 py-10">
                <Outlet />
            </main>
        </div>
    )
}