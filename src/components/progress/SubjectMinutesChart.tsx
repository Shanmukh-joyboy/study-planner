import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { formatMinutes, type SubjectMinutes } from '../../lib/progress'

export function SubjectMinutesChart({ data }: { data: SubjectMinutes[] }) {
    return (
        <div
            role="img"
            aria-label="Bar chart of study minutes per subject"
            style={{ height: Math.max(160, data.length * 48 + 48) }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tickFormatter={(v: number) => formatMinutes(v)} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                    <Tooltip
                        cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                        formatter={(value) => [formatMinutes(Number(value)), 'Studied']}
                    />
                    <Bar dataKey="minutes" radius={[0, 6, 6, 0]}>
                        {data.map((entry) => (
                            <Cell key={entry.key} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}