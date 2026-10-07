import { describe, expect, it } from 'vitest'
import {
    buildDayTotals,
    buildHeatmap,
    calculateStreaks,
    groupExams,
    heatmapLevel,
    minutesBySubject,
} from './progress'
import type { CompletedSession, ExamTopic } from '../types'

const TODAY = new Date(2026, 9, 3) // Saturday 3 Oct 2026

const days = (...dates: string[]) => new Set(dates)

describe('streaks', () => {
    it('counts consecutive days ending today', () => {
        const streaks = calculateStreaks(days('2026-10-01', '2026-10-02', '2026-10-03'), TODAY)
        expect(streaks).toEqual({ current: 3, longest: 3 })
    })

    it('keeps the streak alive when only yesterday was studied', () => {
        const streaks = calculateStreaks(days('2026-10-01', '2026-10-02'), TODAY)
        expect(streaks.current).toBe(2)
    })

    it('resets when the last study day is older than yesterday', () => {
        const streaks = calculateStreaks(days('2026-09-30'), TODAY)
        expect(streaks).toEqual({ current: 0, longest: 1 })
    })

    it('finds the longest run in the history', () => {
        const streaks = calculateStreaks(
            days('2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-20', '2026-09-21'),
            TODAY,
        )
        expect(streaks).toEqual({ current: 0, longest: 4 })
    })
})

describe('heatmap', () => {
    it('maps minutes to intensity levels', () => {
        const levels = [0, 1, 29, 30, 59, 60, 119, 120].map(heatmapLevel)
        expect(levels).toEqual([0, 1, 1, 2, 2, 3, 3, 4])
    })

    it('builds 26 Monday-first weeks ending with the current week', () => {
        const weeks = buildHeatmap({ '2026-10-03': 45 }, TODAY)
        expect(weeks).toHaveLength(26)
        expect(weeks[0][0].date).toBe('2026-04-06')
        expect(weeks[25][5]).toMatchObject({ date: '2026-10-03', minutes: 45, level: 2, future: false })
        expect(weeks[25][6]).toMatchObject({ date: '2026-10-04', future: true })
    })
})

describe('aggregation', () => {
    it('sums minutes per day', () => {
        const totals = buildDayTotals([
            { date: '2026-10-02', duration_minutes: 30 },
            { date: '2026-10-02', duration_minutes: 60 },
            { date: '2026-10-03', duration_minutes: 45 },
        ])
        expect(totals).toEqual({ '2026-10-02': 90, '2026-10-03': 45 })
    })

    it('totals minutes per subject since a date, largest first', () => {
        const os = { subject_id: 's1', subjects: { name: 'OS', color: '#111111' } }
        const dbms = { subject_id: 's2', subjects: { name: 'DBMS', color: '#222222' } }
        const sessions: CompletedSession[] = [
            { date: '2026-10-03', duration_minutes: 60, topics: os },
            { date: '2026-10-02', duration_minutes: 30, topics: os },
            { date: '2026-10-02', duration_minutes: 120, topics: dbms },
            { date: '2026-09-01', duration_minutes: 500, topics: os },
            { date: '2026-10-01', duration_minutes: 20, topics: null },
        ]
        const result = minutesBySubject(sessions, '2026-09-30')
        expect(result.map((entry) => [entry.name, entry.minutes])).toEqual([
            ['DBMS', 120],
            ['OS', 90],
            ['No topic', 20],
        ])
    })

    it('groups exam topics and counts the unreviewed ones', () => {
        const os = { name: 'OS', color: '#6366f1' }
        const dbms = { name: 'DBMS', color: '#10b981' }
        const topics: ExamTopic[] = [
            { id: 't1', title: 'Deadlocks', subject_id: 's1', exam_date: '2026-10-10', last_reviewed_at: null, subjects: os },
            { id: 't2', title: 'Paging', subject_id: 's1', exam_date: '2026-10-10', last_reviewed_at: '2026-10-01T10:00:00Z', subjects: os },
            { id: 't3', title: 'Joins', subject_id: 's2', exam_date: '2026-10-04', last_reviewed_at: null, subjects: dbms },
        ]
        const groups = groupExams(topics, TODAY)
        expect(groups.map((g) => [g.subjectName, g.daysLeft, g.total, g.reviewed])).toEqual([
            ['DBMS', 1, 1, 0],
            ['OS', 7, 2, 1],
        ])
        expect(groups[1].unreviewed).toEqual([{ id: 't1', title: 'Deadlocks' }])
    })
})