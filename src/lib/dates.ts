import { format } from 'date-fns'

export function toISODate(date: Date): string {
    return format(date, 'yyyy-MM-dd')
}

export function formatInterval(days: number): string {
    if (days < 30) return days === 1 ? '1 day' : `${days} days`
    if (days < 365) return `${Math.round(days / 30)} mo`
    return `${(days / 365).toFixed(1)} yr`
}