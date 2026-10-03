import { useState, type FormEvent, type ReactNode } from 'react'
import { inputClass, labelClass, primaryButtonClass } from '../lib/styles'

interface AuthFormProps {
    title: string
    submitLabel: string
    onSubmit: (email: string, password: string) => Promise<string | null>
    footer: ReactNode
}

export function AuthForm({ title, submitLabel, onSubmit, footer }: AuthFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [info, setInfo] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setInfo(null)
        setSubmitting(true)
        try {
            setInfo(await onSubmit(email, password))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-xl shadow-indigo-100/60 backdrop-blur">
                <div
                    aria-hidden="true"
                    className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-md shadow-indigo-300/60"
                >
                    S
                </div>
                <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className={labelClass}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className={labelClass}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    {error && (
                        <p role="alert" className="text-sm text-red-600">
                            {error}
                        </p>
                    )}
                    {info && (
                        <p role="status" className="text-sm text-green-700">
                            {info}
                        </p>
                    )}
                    <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full`}>
                        {submitting ? 'Please wait…' : submitLabel}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
            </div>
        </main>
    )
}