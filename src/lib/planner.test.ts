import { describe, expect, it } from 'vitest'
import {
    DAY_END_MINUTES,
    DAY_START_MINUTES,
    clampStart,
    layoutOverlaps,
    minutesToTime,
    resizedDuration,
    snapMinutes,
    timeToMinutes,
    validateSessionTiming,
} from './planner'

describe('planner helpers', () => {
    it('converts between times and minutes', () => {
        expect(timeToMinutes('09:30')).toBe(570)
        expect(timeToMinutes('09:30:00')).toBe(570)
        expect(minutesToTime(570)).toBe('09:30')
        expect(minutesToTime(DAY_START_MINUTES)).toBe('06:00')
    })

    it('clamps a start so the block stays inside the day', () => {
        expect(clampStart(5 * 60, 60)).toBe(DAY_START_MINUTES)
        expect(clampStart(21 * 60 + 30, 60)).toBe(DAY_END_MINUTES - 60)
        expect(clampStart(540, 60)).toBe(540)
    })

    it('snaps resized durations to the slot size within limits', () => {
        expect(snapMinutes(7)).toBe(0)
        expect(snapMinutes(8)).toBe(15)
        expect(resizedDuration(540, 60, 32)).toBe(90)
        expect(resizedDuration(540, 60, 5)).toBe(60)
        expect(resizedDuration(540, 60, -1000)).toBe(15)
        expect(resizedDuration(21 * 60, 30, 1000)).toBe(60)
    })

    it('validates start time and duration', () => {
        expect(validateSessionTiming('09:00', 60)).toBeNull()
        expect(validateSessionTiming('', 60)).not.toBeNull()
        expect(validateSessionTiming('05:00', 60)).not.toBeNull()
        expect(validateSessionTiming('09:00', 10)).not.toBeNull()
        expect(validateSessionTiming('21:30', 60)).not.toBeNull()
    })

    it('places overlapping sessions in side-by-side lanes', () => {
        const laidOut = layoutOverlaps([
            { id: 'a', start: 540, end: 600 },
            { id: 'b', start: 570, end: 630 },
            { id: 'c', start: 700, end: 760 },
        ])
        expect(laidOut.map((entry) => [entry.item.id, entry.lane, entry.lanes])).toEqual([
            ['a', 0, 2],
            ['b', 1, 2],
            ['c', 0, 1],
        ])
    })
})