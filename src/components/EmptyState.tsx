interface EmptyStateProps {
    title: string
    description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <div className="rounded-md border border-dashed border-slate-300 p-8 text-center">
            <p className="font-medium text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
    )
}