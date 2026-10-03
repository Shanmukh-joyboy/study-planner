interface EmptyStateProps {
    title: string
    description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
            <div
                aria-hidden="true"
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
            </div>
            <p className="font-semibold text-slate-900">{title}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">{description}</p>
        </div>
    )
}