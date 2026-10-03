import { useId, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../lib/errors'
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import { validateNotes, validateTopicTitle } from '../lib/validation'
import type { TopicFields } from '../types'

interface TopicFormProps {
    initial?: TopicFields
    submitLabel: string
    onSubmit: (fields: TopicFields) => Promise<void>
    onCancel?: () => void
}

export function TopicForm({ initial, submitLabel, onSubmit, onCancel }: TopicFormProps) {
    const id = useId()
    const [title, setTitle] = useState(initial?.title ?? '')
    const [notes, setNotes] = useState(initial?.notes ?? '')
    const [examDate, setExamDate] = useState(initial?.exam_date ?? '')
    const [titleError, setTitleError] = useState<string | null>(null)
    const [notesError, setNotesError] = useState<string | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const titleProblem = validateTopicTitle(title)
        const notesProblem = validateNotes(notes)
        setTitleError(titleProblem)
        setNotesError(notesProblem)
        setSubmitError(null)
        if (titleProblem || notesProblem) return

        setSubmitting(true)
        try {
            await onSubmit({
                title: title.trim(),
                notes: notes.trim() || null,
                exam_date: examDate || null,
            })
            if (!initial) {
                setTitle('')
                setNotes('')
                setExamDate('')
            }
        } catch (err) {
            setSubmitError(getErrorMessage(err))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                    <label htmlFor={`${id}-title`} className={labelClass}>
                        Title
                    </label>
                    <input
                        id={`${id}-title`}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        aria-invalid={titleError !== null}
                        aria-describedby={titleError ? `${id}-title-error` : undefined}
                        className={inputClass}
                    />
                    {titleError && (
                        <p id={`${id}-title-error`} role="alert" className="mt-1 text-sm text-red-600">
                            {titleError}
                        </p>
                    )}
                </div>
                <div>
                    <label htmlFor={`${id}-exam`} className={labelClass}>
                        Exam date (optional)
                    </label>
                    <input
                        id={`${id}-exam`}
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className={inputClass}
                    />
                </div>
            </div>
            <div>
                <label htmlFor={`${id}-notes`} className={labelClass}>
                    Notes (optional)
                </label>
                <textarea
                    id={`${id}-notes`}
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    aria-invalid={notesError !== null}
                    aria-describedby={notesError ? `${id}-notes-error` : undefined}
                    className={inputClass}
                />
                {notesError && (
                    <p id={`${id}-notes-error`} role="alert" className="mt-1 text-sm text-red-600">
                        {notesError}
                    </p>
                )}
            </div>
            {submitError && (
                <p role="alert" className="text-sm text-red-600">
                    {submitError}
                </p>
            )}
            <div className="flex gap-2">
                <button type="submit" disabled={submitting} className={primaryButtonClass}>
                    {submitting ? 'Saving…' : submitLabel}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className={secondaryButtonClass}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    )
}