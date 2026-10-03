import { useState } from 'react'
import { formatInterval } from '../lib/dates'
import { RATINGS, calculateNextReview, type Rating } from '../lib/sm2'
import { primaryButtonClass } from '../lib/styles'
import type { DueTopic } from '../types'

const RATING_LABEL: Record<Rating, string> = {
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy',
}

const RATING_CLASS: Record<Rating, string> = {
    again: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-100',
    hard: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 focus:ring-amber-100',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 focus:ring-emerald-100',
    easy: 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 focus:ring-sky-100',
}

interface ReviewCardProps {
    topic: DueTopic
    submitting: boolean
    onRate: (rating: Rating) => void
}

export function ReviewCard({ topic, submitting, onRate }: ReviewCardProps) {
    const [revealed, setRevealed] = useState(false)
    const today = new Date()

    return (
        <article className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: topic.subjects.color }}
                />
                {topic.subjects.name}
            </p>
            <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900">
                {topic.title}
            </h2>

            {revealed ? (
                <div className="mt-6 space-y-6">
                    <p className="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-slate-700">
                        {topic.notes ?? 'No notes saved for this topic.'}
                    </p>
                    <div>
                        <p className="mb-3 text-sm font-medium text-slate-700">How well did you recall it?</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {RATINGS.map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => onRate(rating)}
                                    className={`flex flex-col items-center rounded-xl border px-3 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:opacity-60 ${RATING_CLASS[rating]}`}
                                >
                                    <span>{RATING_LABEL[rating]}</span>
                                    <span className="mt-1 text-xs font-normal opacity-80">
                                        {formatInterval(calculateNextReview(topic, rating, today).interval_days)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-8">
                    <p className="mb-4 text-sm text-slate-600">
                        Try to recall everything you know about this topic, then reveal your notes.
                    </p>
                    <button type="button" onClick={() => setRevealed(true)} className={primaryButtonClass}>
                        Show notes
                    </button>
                </div>
            )}
        </article>
    )
}