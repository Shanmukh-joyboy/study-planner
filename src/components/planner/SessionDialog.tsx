import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import {
    useCreateSession,
    useDeleteSession,
    useTopicOptions,
    useUpdateSession,
} from '../../hooks/useSessions'
import { toISODate } from '../../lib/dates'
import { getErrorMessage } from '../../lib/errors'
import {
    DEFAULT_DURATION_MINUTES,
    MIN_DURATION_MINUTES,
    SLOT_MINUTES,
    minutesToTime,
    validateSessionTiming,
} from '../../lib/planner'
import {
    dangerButtonClass,
    inputClass,
    labelClass,
    primaryButtonClass,
    secondaryButtonClass,
} from '../../lib/styles'
import type { SessionWithTopic } from '../../types'

interface SessionDialogProps {
    session?: SessionWithTopic
    defaults?: { date: string; startMinutes: number }
    onClose: () => void
}

export function SessionDialog({ session, defaults, onClose }: SessionDialogProps) {
    const id = useId()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const topics = useTopicOptions()
    const create = useCreateSession()
    const update = useUpdateSession()
    const remove = useDeleteSession()

    const [topicId, setTopicId] = useState(session?.topic_id ?? '')
    const [date, setDate] = useState(session?.date ?? defaults?.date ?? toISODate(new Date()))
    const [startTime, setStartTime] = useState(
        session ? session.start_time.slice(0, 5) : minutesToTime(defaults?.startMinutes ?? 9 * 60),
    )
    const [duration, setDuration] = useState(
        String(session?.duration_minutes ?? DEFAULT_DURATION_MINUTES),
    )
    const [completed, setCompleted] = useState(session?.completed ?? false)
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)
    const [confirmingDelete, setConfirmingDelete] = useState(false)

    useEffect(() => {
        const dialog = dialogRef.current
        if (dialog && !dialog.open) dialog.showModal()
    }, [])

    function closeDialog() {
        dialogRef.current?.close()
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)

        const minutes = Number(duration)
        const problem = date ? validateSessionTiming(startTime, minutes) : 'Choose a date'
        if (problem) {
            setError(problem)
            return
        }

        const input = {
            topic_id: topicId || null,
            date,
            start_time: startTime,
            duration_minutes: minutes,
        }

        setBusy(true)
        try {
            if (session) {
                await update.mutateAsync({ id: session.id, changes: { ...input, completed } })
            } else {
                await create.mutateAsync(input)
            }
            closeDialog()
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setBusy(false)
        }
    }

    async function handleDelete() {
        if (!session) return
        setError(null)
        setBusy(true)
        try {
            await remove.mutateAsync(session.id)
            closeDialog()
        } catch (err) {
            setError(getErrorMessage(err))
            setConfirmingDelete(false)
        } finally {
            setBusy(false)
        }
    }

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === e.currentTarget) closeDialog()
            }}
            aria-labelledby={`${id}-title`}
            className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/40"
        >
            <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
                <h2 id={`${id}-title`} className="text-lg font-semibold text-slate-900">
                    {session ? 'Edit session' : 'New session'}
                </h2>

                <div>
                    <label htmlFor={`${id}-topic`} className={labelClass}>
                        Topic (optional)
                    </label>
                    <select
                        id={`${id}-topic`}
                        value={topicId}
                        onChange={(e) => setTopicId(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">No topic</option>
                        {topics.data?.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                                {topic.subjects.name} · {topic.title}
                            </option>
                        ))}
                    </select>
                    {topics.isError && (
                        <p className="mt-1 text-sm text-red-600">Could not load your topics.</p>
                    )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                        <label htmlFor={`${id}-date`} className={labelClass}>
                            Date
                        </label>
                        <input
                            id={`${id}-date`}
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor={`${id}-start`} className={labelClass}>
                            Start
                        </label>
                        <input
                            id={`${id}-start`}
                            type="time"
                            step={SLOT_MINUTES * 60}
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor={`${id}-duration`} className={labelClass}>
                            Minutes
                        </label>
                        <input
                            id={`${id}-duration`}
                            type="number"
                            min={MIN_DURATION_MINUTES}
                            step={SLOT_MINUTES}
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                {session && (
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={completed}
                            onChange={(e) => setCompleted(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-300"
                        />
                        Mark as completed
                    </label>
                )}

                {error && (
                    <p role="alert" className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex gap-2">
                        <button type="submit" disabled={busy} className={primaryButtonClass}>
                            {busy ? 'Saving…' : 'Save'}
                        </button>
                        <button type="button" onClick={closeDialog} className={secondaryButtonClass}>
                            Cancel
                        </button>
                    </div>
                    {session &&
                        (confirmingDelete ? (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={busy}
                                    className={dangerButtonClass}
                                >
                                    Confirm delete
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmingDelete(false)}
                                    className={secondaryButtonClass}
                                >
                                    Keep
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setConfirmingDelete(true)}
                                className={secondaryButtonClass}
                            >
                                Delete
                            </button>
                        ))}
                </div>
            </form>
        </dialog>
    )
}