export function LoadingMessage({ label }: { label: string }) {
    return (
        <p role="status" className="text-slate-600">
            {label}
        </p>
    )
}