import { addDays } from 'date-fns'
import { toISODate } from './dates'

export type Rating = 'again' | 'hard' | 'good' | 'easy'

export const RATINGS: readonly Rating[] = ['again', 'hard', 'good', 'easy']

/** SM-2 quality scores (0-5 scale) for each rating button. */
export const RATING_QUALITY: Record<Rating, number> = {
    again: 1,
    hard: 3,
    good: 4,
    easy: 5,
}

export const MIN_EASE_FACTOR = 1.3
const PASS_THRESHOLD = 3

export interface Sm2State {
    ease_factor: number
    interval_days: number
    repetitions: number
}

export interface Sm2Result extends Sm2State {
    next_review_date: string
}

function round2(value: number): number {
    return Math.round(value * 100) / 100
}

/**
 * SM-2 scheduling. Two deliberate choices:
 * - A lapse (quality < 3) resets repetitions and the interval but leaves the
 *   ease factor unchanged, as in the original SM-2 description.
 * - The interval from the third review on uses the updated ease factor, so
 *   Hard, Good and Easy preview different intervals.
 */
export function calculateNextReview(state: Sm2State, rating: Rating, today: Date): Sm2Result {
    const quality = RATING_QUALITY[rating]

    if (quality < PASS_THRESHOLD) {
        return {
            ease_factor: state.ease_factor,
            interval_days: 1,
            repetitions: 0,
            next_review_date: toISODate(addDays(today, 1)),
        }
    }

    const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    const easeFactor = Math.max(MIN_EASE_FACTOR, round2(state.ease_factor + delta))

    let intervalDays: number
    if (state.repetitions === 0) {
        intervalDays = 1
    } else if (state.repetitions === 1) {
        intervalDays = 6
    } else {
        intervalDays = Math.max(1, Math.round(state.interval_days * easeFactor))
    }

    return {
        ease_factor: easeFactor,
        interval_days: intervalDays,
        repetitions: state.repetitions + 1,
        next_review_date: toISODate(addDays(today, intervalDays)),
    }
}