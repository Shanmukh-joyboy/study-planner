import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDeleteSubject, useUpdateSubject } from '../hooks/useSubjects'
import { getErrorMessage } from '../lib/errors'
import { dangerButtonClass, secondaryButtonClass } from '../lib/styles'
import type { Subject } from '../types'
import { SubjectForm } from './SubjectForm'

export function SubjectItem({ subject }: { subject: Subject }) {
    const [editing, setEditing] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const update = useUpdateSubject()
    const remove = useDeleteSubject()

    async function handleDelete() {
        setError(null)
        try {
            await remove.mutateAsync(subject.id)
        } catch (err) {
            setError(getErrorMessage(err))
            setConfirming(false)
        }
    }

    return (
        <li className="rounded-lg border border-slate-200 bg-white p-4">
            {editing ? (
                <SubjectForm
                    initial={{ name: subject.name, color: subject.color }}
                    submitLabel="Save"
                    onSubmit={async (input) => {
                        await update.mutateAsync({ id: subject.id, ...input })
                        setEditing(false)
                    }}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        to={`/subjects/${subject.id}`}
                        className="flex min-w-0 items-center gap-3 font-medium text-slate-900 hover:underline"
                    >
                        <span
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 rounded-full"
                            style={{ backgroundColor: subject.color }}
                        />
                        <span className="truncate">{subject.name}</span>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        {confirming ? (
                            <>
                                <span className="text-sm text-slate-600">Delete this subject and its topics?</span>
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
                                    aria-label={`Edit ${subject.name}`}
                                    className={secondaryButtonClass}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirming(true)}
                                    aria-label={`Delete ${subject.name}`}
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