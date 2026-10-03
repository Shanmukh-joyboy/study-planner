interface StatCardProps {
    label: string
    value: number | string
}

export function StatCard({ label, value }: StatCardProps) {
    return (
        <div className="min-w-36 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
            <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-600">{label}</p>
        </div>
    )
}