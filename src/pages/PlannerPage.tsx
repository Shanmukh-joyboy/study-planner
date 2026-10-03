import { useState, type ReactNode } from 'react'
import { addDays, addWeeks, format, isSameWeek, startOfWeek, subWeeks } from 'date-fns'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import { SessionDialog } from '../components/planner/SessionDialog'
import { WeekGrid } from '../components/planner/WeekGrid'
import { useSessions, useUpdateSession } from '../hooks/useSessions'
import { toISODate } from '../lib/dates'
import { getErrorMessage } from '../lib/errors'
import { primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import type { SessionChanges, SessionWithTopic } from '../types'

type DialogState =
    | { kind: 'create'; date: string; startMinutes: number }
    | { kind: 'edit'; session: SessionWithTopic }

function currentWeekStart(): Date {
    return startOfWeek(new Date(), { weekStartsOn: 1 })
}

export function PlannerPage() {
    const [weekStart, setWeekStart] = useState(currentWeekStart)
    const weekEnd = addDays(weekStart, 6)
    const sessions = useSessions(toISODate(weekStart), toISODate(weekEnd))
    const update = useUpdateSession()
    const [dialog, setDialog] = useState<DialogState | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)

    const isThisWeek = isSameWeek(new Date(), weekStart, { weekStartsOn: 1 })
    const defaultDate = toISODate(isThisWeek ? new Date() : weekStart)

    // Never rejects: errors are shown above the grid, so the grid can just await it.
    async function handleChange(id: string, changes: SessionChanges) {
        setActionError(null)
        try {
            await update.mutateAsync({ id, changes })
        } catch (err) {
            setActionError(getErrorMessage(err))
        }
    }

    let content: ReactNode
    if (sessions.isPending) {
        content = <LoadingMessage label="Loading your week…" />
    } else if (sessions.isError) {
        content = (
            <ErrorMessage
                message={getErrorMessage(sessions.error)}
                onRetry={() => void sessions.refetch()}
            />
        )
    } else {
        content = (
            <WeekGrid
                weekStart={weekStart}
                sessions={sessions.data}
                onEdit={(session) => setDialog({ kind: 'edit', session })}
                onCreate={(date, startMinutes) => setDialog({ kind: 'create', date, startMinutes })}
                onChange={handleChange}
            />
        )
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Weekly planner</h1>
                    <p className="mt-1 text-slate-600">
                        {format(weekStart, 'd MMM')} – {format(weekEnd, 'd MMM yyyy')}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        aria-label="Previous week"
                        onClick={() => setWeekStart((week) => subWeeks(week, 1))}
                        className={secondaryButtonClass}
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        disabled={isThisWeek}
                        onClick={() => setWeekStart(currentWeekStart())}
                        className={secondaryButtonClass}
                    >
                        This week
                    </button>
                    <button
                        type="button"
                        aria-label="Next week"
                        onClick={() => setWeekStart((week) => addWeeks(week, 1))}
                        className={secondaryButtonClass}
                    >
                        →
                    </button>
                    <button
                        type="button"
                        onClick={() => setDialog({ kind: 'create', date: defaultDate, startMinutes: 9 * 60 })}
                        className={primaryButtonClass}
                    >
                        Add session
                    </button>
                </div>
            </div>

            <p className="text-sm text-slate-600">
                Click an empty slot to add a session. Drag a block to move it, drag its bottom edge to
                resize it, and tick the circle to complete it.
            </p>

            {actionError && (
                <p role="alert" className="text-sm text-red-600">
                    {actionError}
                </p>
            )}

            {content}

            {dialog && (
                <SessionDialog
                    key={dialog.kind === 'edit' ? dialog.session.id : `new-${dialog.date}-${dialog.startMinutes}`}
                    session={dialog.kind === 'edit' ? dialog.session : undefined}
                    defaults={
                        dialog.kind === 'create'
                            ? { date: dialog.date, startMinutes: dialog.startMinutes }
                            : undefined
                    }
                    onClose={() => setDialog(null)}
                />
            )}
        </section>
    )
}