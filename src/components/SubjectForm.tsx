import { useId, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../lib/errors'
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import { validateSubjectName } from '../lib/validation'
import type { SubjectInput } from '../types'

const DEFAULT_COLOR = '#6366f1'

interface SubjectFormProps {
    initial?: SubjectInput
    submitLabel: string
    onSubmit: (input: SubjectInput) => Promise<void>
    onCancel?: () => void
}

export function SubjectForm({ initial, submitLabel, onSubmit, onCancel }: SubjectFormProps) {
    const id = useId()
    const [name, setName] = useState(initial?.name ?? '')
    const [color, setColor] = useState(initial?.color ?? DEFAULT_COLOR)
    const [nameError, setNameError] = useState<string | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const validation = validateSubjectName(name)
        setNameError(validation)
        setSubmitError(null)
        if (validation) return

        setSubmitting(true)
        try {
            await onSubmit({ name: name.trim(), color })
            if (!initial) setName('')
        } catch (err) {
            setSubmitError(getErrorMessage(err))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                    <label htmlFor={`${id}-name`} className={labelClass}>
                        Name
                    </label>
                    <input
                        id={`${id}-name`}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-invalid={nameError !== null}
                        aria-describedby={nameError ? `${id}-name-error` : undefined}
                        className={inputClass}
                    />
                    {nameError && (
                        <p id={`${id}-name-error`} role="alert" className="mt-1 text-sm text-red-600">
                            {nameError}
                        </p>
                    )}
                </div>
                <div>
                    <label htmlFor={`${id}-color`} className={labelClass}>
                        Color
                    </label>
                    <input
                        id={`${id}-color`}
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded-md border border-slate-300 bg-white p-1"
                    />
                </div>
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