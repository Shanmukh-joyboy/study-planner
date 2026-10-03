import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useDeleteTopic, useUpdateTopic } from '../hooks/useTopics'
import { getErrorMessage } from '../lib/errors'
import { dangerButtonClass, secondaryButtonClass } from '../lib/styles'
import type { Topic } from '../types'
import { TopicForm } from './TopicForm'

function formatDate(iso: string): string {
    return format(parseISO(iso), 'd MMM yyyy')
}

export function TopicItem({ topic }: { topic: Topic }) {
    const [editing, setEditing] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const update = useUpdateTopic()
    const remove = useDeleteTopic()

    async function handleDelete() {
        setError(null)
        try {
            await remove.mutateAsync(topic.id)
        } catch (err) {
            setError(getErrorMessage(err))
            setConfirming(false)
        }
    }

    return (
        <li className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur">
            {editing ? (
                <TopicForm
                    initial={{ title: topic.title, notes: topic.notes, exam_date: topic.exam_date }}
                    submitLabel="Save"
                    onSubmit={async (fields) => {
                        await update.mutateAsync({ id: topic.id, ...fields })
                        setEditing(false)
                    }}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 break-words">
                        <p className="font-medium text-slate-900">{topic.title}</p>
                        {topic.notes && (
                            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{topic.notes}</p>
                        )}
                        <p className="mt-2 text-xs text-slate-500">
                            Next review: {formatDate(topic.next_review_date)}
                            {topic.exam_date && ` · Exam: ${formatDate(topic.exam_date)}`}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {confirming ? (
                            <>
                                <span className="text-sm text-slate-600">Delete this topic?</span>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={remove.isPending}
                                    className={dangerButtonClass}
                                >
                                    {remove.isPending ? 'Deleting…' : 'Delete'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirming(false)}
                                    className={secondaryButtonClass}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    aria-label={`Edit ${topic.title}`}
                                    className={secondaryButtonClass}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirming(true)}
                                    aria-label={`Delete ${topic.title}`}
                                    className={secondaryButtonClass}
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
            {error && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                    {error}
                </p>
            )}
        </li>
    )
}