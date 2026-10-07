import { addDays, differenceInCalendarDays, parseISO, startOfWeek, subDays, subWeeks } from 'date-fns'
import { toISODate } from './dates'
import type { CompletedSession, ExamTopic } from '../types'

export const HEATMAP_WEEKS = 26

export type DayTotals = Record<string, number>
export type ChartRange = 7 | 30 | 'all'

export function formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`
}

export function formatDaysLeft(days: number): string {
    if (days <= 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    return `${days} days`
}

/** Minutes studied per calendar day (key: yyyy-MM-dd). */
export function buildDayTotals(sessions: readonly { date: string; duration_minutes: number }[]): DayTotals {
    const totals: DayTotals = {}
    for (const session of sessions) {
        totals[session.date] = (totals[session.date] ?? 0) + session.duration_minutes
    }
    return totals
}

export function studyDaySet(totals: DayTotals): Set<string> {
    return new Set(Object.keys(totals).filter((date) => totals[date] > 0))
}

export function minutesInLastDays(totals: DayTotals, today: Date, days: number): number {
    let sum = 0
    for (let i = 0; i < days; i += 1) {
        sum += totals[toISODate(subDays(today, i))] ?? 0
    }
    return sum
}

export interface Streaks {
    current: number
    longest: number
}

/**
 * The current streak counts back from today, or from yesterday if today has no
 * study yet, so a streak isn't lost until a whole day passes without studying.
 */
export function calculateStreaks(studyDays: ReadonlySet<string>, today: Date): Streaks {
    let current = 0
    let cursor = studyDays.has(toISODate(today)) ? today : subDays(today, 1)
    while (studyDays.has(toISODate(cursor))) {
        current += 1
        cursor = subDays(cursor, 1)
    }

    let longest = 0
    let run = 0
    let previous: Date | null = null
    for (const iso of [...studyDays].sort()) {
        const day = parseISO(iso)
        run = previous && differenceInCalendarDays(day, previous) === 1 ? run + 1 : 1
        longest = Math.max(longest, run)
        previous = day
    }

    return { current, longest }
}

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4

export interface HeatmapCell {
    date: string
    minutes: number
    level: HeatmapLevel
    future: boolean
}

export function heatmapLevel(minutes: number): HeatmapLevel {
    if (minutes <= 0) return 0
    if (minutes < 30) return 1
    if (minutes < 60) return 2
    if (minutes < 120) return 3
    return 4
}

/** The Monday of the first week shown in the heatmap. */
export function heatmapStart(today: Date): Date {
    return startOfWeek(subWeeks(today, HEATMAP_WEEKS - 1), { weekStartsOn: 1 })
}

/** Weeks (Monday first) ending with the current week. Days after today are marked `future`. */
export function buildHeatmap(totals: DayTotals, today: Date): HeatmapCell[][] {
    const start = heatmapStart(today)
    const todayISO = toISODate(today)
    return Array.from({ length: HEATMAP_WEEKS }, (_, week) =>
        Array.from({ length: 7 }, (_, day) => {
            const date = toISODate(addDays(start, week * 7 + day))
            const minutes = totals[date] ?? 0
            return { date, minutes, level: heatmapLevel(minutes), future: date > todayISO }
        }),
    )
}

export function rangeStartISO(range: ChartRange, today: Date): string {
    return range === 'all' ? toISODate(heatmapStart(today)) : toISODate(subDays(today, range - 1))
}

export interface SubjectMinutes {
    key: string
    name: string
    color: string
    minutes: number
}

const NO_TOPIC_COLOR = '#64748b'

export function minutesBySubject(
    sessions: readonly CompletedSession[],
    sinceISO: string,
): SubjectMinutes[] {
    const bySubject = new Map<string, SubjectMinutes>()
    for (const session of sessions) {
        if (session.date < sinceISO) continue
        const key = session.topics?.subject_id ?? 'none'
        const entry = bySubject.get(key) ?? {
            key,
            name: session.topics?.subjects.name ?? 'No topic',
            color: session.topics?.subjects.color ?? NO_TOPIC_COLOR,
            minutes: 0,
        }
        entry.minutes += session.duration_minutes
        bySubject.set(key, entry)
    }
    return [...bySubject.values()].sort((a, b) => b.minutes - a.minutes)
}

export interface ExamGroup {
    key: string
    subjectId: string
    subjectName: string
    color: string
    examDate: string
    daysLeft: number
    total: number
    reviewed: number
    unreviewed: { id: string; title: string }[]
}

/** One group per subject and exam date, soonest first. */
export function groupExams(topics: readonly ExamTopic[], today: Date): ExamGroup[] {
    const groups = new Map<string, ExamGroup>()
    for (const topic of topics) {
        const key = `${topic.subject_id}|${topic.exam_date}`
        let group = groups.get(key)
        if (!group) {
            group = {
                key,
                subjectId: topic.subject_id,
                subjectName: topic.subjects.name,
                color: topic.subjects.color,
                examDate: topic.exam_date,
                daysLeft: differenceInCalendarDays(parseISO(topic.exam_date), today),
                total: 0,
                reviewed: 0,
                unreviewed: [],
            }
            groups.set(key, group)
        }
        group.total += 1
        if (topic.last_reviewed_at) {
            group.reviewed += 1
        } else {
            group.unreviewed.push({ id: topic.id, title: topic.title })
        }
    }
    return [...groups.values()].sort(
        (a, b) => a.daysLeft - b.daysLeft || a.subjectName.localeCompare(b.subjectName),
    )
}