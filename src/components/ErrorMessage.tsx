import { secondaryButtonClass } from '../lib/styles'

interface ErrorMessageProps {
    message: string
    onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{message}</p>
            {onRetry && (
                <button type="button" onClick={onRetry} className={`mt-3 ${secondaryButtonClass}`}>
                    Try again
                </button>
            )}
        </div>
    )
}