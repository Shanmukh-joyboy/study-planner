import { format, parseISO } from 'date-fns'
import { Link } from 'react-router-dom'
import { formatDaysLeft, type ExamGroup } from '../../lib/progress'

const MAX_LISTED = 8

function urgencyClass(daysLeft: number): string {
    if (daysLeft <= 3) return 'bg-red-50 text-red-700'
    if (daysLeft <= 7) return 'bg-amber-50 text-amber-800'
    return 'bg-indigo-50 text-indigo-700'
}

export function ExamCard({ group }: { group: ExamGroup }) {
    const percent = Math.round((group.reviewed / group.total) * 100)
    const listed = group.unreviewed.slice(0, MAX_LISTED)
    const hidden = group.unreviewed.length - listed.length

    return (
        <article className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <Link
                        to={`/subjects/${group.subjectId}`}
                        className="flex items-center gap-2 font-semibold text-slate-900 hover:underline"
                    >
                        <span
                            aria-hidden="true"
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: group.color }}
                        />
                        <span className="truncate">{group.subjectName}</span>
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                        {format(parseISO(group.examDate), 'EEE, d MMM yyyy')}
                    </p>
                </div>
                <p
                    className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${urgencyClass(group.daysLeft)}`}
                >
                    {formatDaysLeft(group.daysLeft)}
                </p>
            </div>

            <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-600">
                    <span>
                        {group.reviewed} of {group.total} {group.total === 1 ? 'topic' : 'topics'} reviewed
                    </span>
                    <span>{percent}%</span>
                </div>
                <div
                    role="progressbar"
                    aria-label={`${group.subjectName} topics reviewed`}
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"
                >
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
                </div>
            </div>

            {listed.length > 0 ? (
                <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700">Not reviewed yet</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-600">
                        {listed.map((topic) => (
                            <li key={topic.id}>{topic.title}</li>
                        ))}
                    </ul>
                    {hidden > 0 && <p className="mt-1 text-sm text-slate-500">and {hidden} more</p>}
                </div>
            ) : (
                <p className="mt-4 text-sm font-medium text-emerald-700">
                    Every topic has been reviewed at least once.
                </p>
            )}
        </article>
    )
}