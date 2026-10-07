import { useState, type ReactNode } from 'react'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import { StatCard } from '../components/StatCard'
import { ActivityHeatmap } from '../components/progress/ActivityHeatmap'
import { ExamCard } from '../components/progress/ExamCard'
import { SubjectMinutesChart } from '../components/progress/SubjectMinutesChart'
import { useCompletedSessions, useExamTopics } from '../hooks/useProgress'
import { toISODate } from '../lib/dates'
import { getErrorMessage } from '../lib/errors'
import {
    HEATMAP_WEEKS,
    buildDayTotals,
    buildHeatmap,
    calculateStreaks,
    formatMinutes,
    groupExams,
    heatmapStart,
    minutesBySubject,
    minutesInLastDays,
    rangeStartISO,
    studyDaySet,
    type ChartRange,
} from '../lib/progress'

const RANGE_OPTIONS: { value: ChartRange; label: string }[] = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 'all', label: `${HEATMAP_WEEKS} weeks` },
]

const cardClass =
    'rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur'

const segmentClass =
    'rounded-md px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-indigo-100'

function pluralDays(count: number): string {
    return `${count} ${count === 1 ? 'day' : 'days'}`
}

export function ProgressPage() {
    const today = new Date()
    const todayISO = toISODate(today)
    const sessions = useCompletedSessions(toISODate(heatmapStart(today)), todayISO)
    const exams = useExamTopics(todayISO)
    const [range, setRange] = useState<ChartRange>(30)

    let activity: ReactNode
    if (sessions.isPending) {
        activity = <LoadingMessage label="Loading your activity…" />
    } else if (sessions.isError) {
        activity = (
            <ErrorMessage
                message={getErrorMessage(sessions.error)}
                onRetry={() => void sessions.refetch()}
            />
        )
    } else {
        const totals = buildDayTotals(sessions.data)
        const studyDays = studyDaySet(totals)
        const streaks = calculateStreaks(studyDays, today)
        const subjectData = minutesBySubject(sessions.data, rangeStartISO(range, today))

        activity = (
            <>
                <div className="flex flex-wrap gap-3">
                    <StatCard label="Current streak" value={pluralDays(streaks.current)} />
                    <StatCard label="Longest streak" value={pluralDays(streaks.longest)} />
                    <StatCard label="Last 7 days" value={formatMinutes(minutesInLastDays(totals, today, 7))} />
                    <StatCard label={`Study days (${HEATMAP_WEEKS} weeks)`} value={studyDays.size} />
                </div>

                <div className={cardClass}>
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Activity</h2>
                    <ActivityHeatmap weeks={buildHeatmap(totals, today)} studyDays={studyDays.size} />
                </div>

                <div className={cardClass}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">Study time by subject</h2>
                        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                            {RANGE_OPTIONS.map((option) => (
                                <button
                                    key={option.label}
                                    type="button"
                                    aria-pressed={range === option.value}
                                    onClick={() => setRange(option.value)}
                                    className={`${segmentClass} ${range === option.value
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {subjectData.length === 0 ? (
                        <EmptyState
                            title="No completed sessions in this range"
                            description="Tick the circle on a session in the planner to log it as studied."
                        />
                    ) : (
                        <SubjectMinutesChart data={subjectData} />
                    )}
                </div>
            </>
        )
    }

    let examContent: ReactNode
    if (exams.isPending) {
        examContent = <LoadingMessage label="Loading exams…" />
    } else if (exams.isError) {
        examContent = (
            <ErrorMessage message={getErrorMessage(exams.error)} onRetry={() => void exams.refetch()} />
        )
    } else {
        const groups = groupExams(exams.data, today)
        examContent =
            groups.length === 0 ? (
                <EmptyState
                    title="No upcoming exams"
                    description="Set an exam date on a topic under Subjects and its countdown will appear here."
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {groups.map((group) => (
                        <ExamCard key={group.key} group={group} />
                    ))}
                </div>
            )
    }

    return (
        <section className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Progress</h1>
                <p className="mt-1 text-slate-600">
                    A study day is a day with at least one completed session in the planner.
                </p>
            </div>

            <div className="space-y-6">{activity}</div>

            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Exam countdowns</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        A topic counts as reviewed once you have rated it on the Today page at least once.
                    </p>
                </div>
                {examContent}
            </div>
        </section>
    )
}