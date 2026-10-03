import type { ReactNode } from 'react'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import { SubjectForm } from '../components/SubjectForm'
import { SubjectItem } from '../components/SubjectItem'
import { useCreateSubject, useSubjects } from '../hooks/useSubjects'
import { getErrorMessage } from '../lib/errors'

export function SubjectsPage() {
    const subjects = useSubjects()
    const create = useCreateSubject()

    let content: ReactNode
    if (subjects.isPending) {
        content = <LoadingMessage label="Loading subjects…" />
    } else if (subjects.isError) {
        content = (
            <ErrorMessage
                message={getErrorMessage(subjects.error)}
                onRetry={() => void subjects.refetch()}
            />
        )
    } else if (subjects.data.length === 0) {
        content = (
            <EmptyState
                title="No subjects yet"
                description="Add your first subject above, for example Operating Systems."
            />
        )
    } else {
        content = (
            <ul className="space-y-3">
                {subjects.data.map((subject) => (
                    <SubjectItem key={subject.id} subject={subject} />
                ))}
            </ul>
        )
    }

    return (
        <section className="space-y-6">
            <h1 className="text-2xl font-semibold text-slate-900">Subjects</h1>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">New subject</h2>
                <SubjectForm
                    submitLabel="Add subject"
                    onSubmit={async (input) => {
                        await create.mutateAsync(input)
                    }}
                />
            </div>
            {content}
        </section>
    )
}