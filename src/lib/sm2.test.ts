import { describe, expect, it } from 'vitest'
import { calculateNextReview, MIN_EASE_FACTOR, type Sm2State } from './sm2'

const TODAY = new Date(2026, 9, 3) // 3 Oct 2026 (months are 0-based)

const fresh: Sm2State = { ease_factor: 2.5, interval_days: 0, repetitions: 0 }
const mature: Sm2State = { ease_factor: 2.5, interval_days: 6, repetitions: 2 }

describe('calculateNextReview', () => {
    it('schedules a first successful review for tomorrow', () => {
        expect(calculateNextReview(fresh, 'good', TODAY)).toEqual({
            ease_factor: 2.5,
            interval_days: 1,
            repetitions: 1,
            next_review_date: '2026-10-04',
        })
    })

    it('uses 1 day then 6 days for the first two successful reviews', () => {
        const first = calculateNextReview(fresh, 'good', TODAY)
        const second = calculateNextReview(first, 'good', TODAY)
        expect(second.interval_days).toBe(6)
        expect(second.repetitions).toBe(2)
        expect(second.next_review_date).toBe('2026-10-09')
    })

    it('multiplies the interval by the ease factor from the third review on', () => {
        expect(calculateNextReview(mature, 'good', TODAY).interval_days).toBe(15)
    })

    it('gives longer intervals for easier ratings', () => {
        const hard = calculateNextReview(mature, 'hard', TODAY).interval_days
        const good = calculateNextReview(mature, 'good', TODAY).interval_days
        const easy = calculateNextReview(mature, 'easy', TODAY).interval_days
        expect([hard, good, easy]).toEqual([14, 15, 16])
    })

    it('adjusts the ease factor by rating', () => {
        expect(calculateNextReview(fresh, 'hard', TODAY).ease_factor).toBe(2.36)
        expect(calculateNextReview(fresh, 'good', TODAY).ease_factor).toBe(2.5)
        expect(calculateNextReview(fresh, 'easy', TODAY).ease_factor).toBe(2.6)
    })

    it('resets repetitions and keeps the ease factor on Again', () => {
        const state: Sm2State = { ease_factor: 2.1, interval_days: 30, repetitions: 5 }
        expect(calculateNextReview(state, 'again', TODAY)).toEqual({
            ease_factor: 2.1,
            interval_days: 1,
            repetitions: 0,
            next_review_date: '2026-10-04',
        })
    })

    it('never lets the ease factor drop below the minimum', () => {
        const state: Sm2State = { ease_factor: MIN_EASE_FACTOR, interval_days: 6, repetitions: 2 }
        expect(calculateNextReview(state, 'hard', TODAY).ease_factor).toBe(MIN_EASE_FACTOR)
    })

    it('does not mutate its input', () => {
        const state = Object.freeze({ ease_factor: 2.5, interval_days: 6, repetitions: 2 })
        expect(() => calculateNextReview(state, 'easy', TODAY)).not.toThrow()
        expect(state).toEqual({ ease_factor: 2.5, interval_days: 6, repetitions: 2 })
    })
})