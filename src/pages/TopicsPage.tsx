import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import { TopicForm } from '../components/TopicForm'
import { TopicItem } from '../components/TopicItem'
import { useSubjects } from '../hooks/useSubjects'
import { useCreateTopic, useTopics } from '../hooks/useTopics'
import { getErrorMessage } from '../lib/errors'

const backLinkClass = 'text-sm font-medium text-indigo-600 hover:underline'

export function TopicsPage() {
    const { subjectId } = useParams<{ subjectId: string }>()
    const subjects = useSubjects()
    const topics = useTopics(subjectId)
    const create = useCreateTopic()

    if (subjects.isPending) return <LoadingMessage label="Loading…" />
    if (subjects.isError) {
        return (
            <ErrorMessage
                message={getErrorMessage(subjects.error)}
                onRetry={() => void subjects.refetch()}
            />
        )
    }

    const subject = subjects.data.find((s) => s.id === subjectId)
    if (!subject) {
        return (
            <div className="space-y-4">
                <ErrorMessage message="Subject not found." />
                <Link to="/subjects" className={backLinkClass}>
                    Back to subjects
                </Link>
            </div>
        )
    }

    let content: ReactNode
    if (topics.isPending) {
        content = <LoadingMessage label="Loading topics…" />
    } else if (topics.isError) {
        content = (
            <ErrorMessage
                message={getErrorMessage(topics.error)}
                onRetry={() => void topics.refetch()}
            />
        )
    } else if (topics.data.length === 0) {
        content = (
            <EmptyState
                title="No topics yet"
                description="Add the first topic you want to revise for this subject."
            />
        )
    } else {
        content = (
            <ul className="space-y-3">
                {topics.data.map((topic) => (
                    <TopicItem key={topic.id} topic={topic} />
                ))}
            </ul>
        )
    }

    return (
        <section className="space-y-6">
            <div>
                <Link to="/subjects" className={backLinkClass}>
                    ← All subjects
                </Link>
                <h1 className="mt-2 flex items-center gap-3 text-2xl font-semibold text-slate-900">
                    <span
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{ backgroundColor: subject.color }}
                    />
                    {subject.name}
                </h1>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">New topic</h2>
                <TopicForm
                    submitLabel="Add topic"
                    onSubmit={async (fields) => {
                        await create.mutateAsync({ subject_id: subject.id, ...fields })
                    }}
                />
            </div>
            {content}
        </section>
    )
}