import { useState, type ReactNode } from 'react'
import { format } from 'date-fns'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import { ReviewCard } from '../components/ReviewCard'
import { StatCard } from '../components/StatCard'
import { useDueTopics, useReviewTopic } from '../hooks/useTopics'
import { toISODate } from '../lib/dates'
import { getErrorMessage } from '../lib/errors'
import { calculateNextReview, type Rating } from '../lib/sm2'
import type { DueTopic } from '../types'

export function TodayPage() {
    const now = new Date()
    const due = useDueTopics(toISODate(now))
    const review = useReviewTopic()
    const [reviewed, setReviewed] = useState(0)
    const [reviewError, setReviewError] = useState<string | null>(null)

    async function handleRate(topic: DueTopic, rating: Rating) {
        setReviewError(null)
        try {
            await review.mutateAsync({ id: topic.id, ...calculateNextReview(topic, rating, new Date()) })
            setReviewed((count) => count + 1)
        } catch (err) {
            setReviewError(getErrorMessage(err))
        }
    }

    let content: ReactNode
    if (due.isPending) {
        content = <LoadingMessage label="Loading today's reviews…" />
    } else if (due.isError) {
        content = (
            <ErrorMessage message={getErrorMessage(due.error)} onRetry={() => void due.refetch()} />
        )
    } else if (due.data.length === 0) {
        content = (
            <EmptyState
                title={reviewed > 0 ? 'Session complete' : "You're all caught up"}
                description={
                    reviewed > 0
                        ? `You reviewed ${reviewed} ${reviewed === 1 ? 'topic' : 'topics'}. Come back tomorrow for the next ones.`
                        : 'Nothing is due right now. Add topics under Subjects, or come back tomorrow.'
                }
            />
        )
    } else {
        const [current, ...rest] = due.data
        content = (
            <div className="space-y-4">
                <ReviewCard
                    key={current.id}
                    topic={current}
                    submitting={review.isPending}
                    onRate={(rating) => void handleRate(current, rating)}
                />
                {reviewError && (
                    <p role="alert" className="text-sm text-red-600">
                        {reviewError}
                    </p>
                )}
                {rest.length > 0 && (
                    <p className="text-sm text-slate-600">
                        {rest.length} more {rest.length === 1 ? 'topic' : 'topics'} after this one.
                    </p>
                )}
            </div>
        )
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Today</h1>
                <p className="mt-1 text-slate-600">{format(now, 'EEEE, d MMMM')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
                <StatCard label="Due today" value={due.data?.length ?? '–'} />
                <StatCard label="Reviewed this session" value={reviewed} />
            </div>
            {content}
        </section>
    )
}