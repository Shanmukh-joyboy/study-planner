export const DAY_START_MINUTES = 6 * 60
export const DAY_END_MINUTES = 22 * 60
export const SLOT_MINUTES = 15
export const SLOT_PX = 16
export const MIN_DURATION_MINUTES = 15
export const DEFAULT_DURATION_MINUTES = 60

export function minutesToPx(minutes: number): number {
    return (minutes / SLOT_MINUTES) * SLOT_PX
}

export function pxToMinutes(px: number): number {
    return (px / SLOT_PX) * SLOT_MINUTES
}

export const HOUR_PX = minutesToPx(60)
export const GRID_HEIGHT_PX = minutesToPx(DAY_END_MINUTES - DAY_START_MINUTES)

export const GRID_HOURS: readonly number[] = Array.from(
    { length: (DAY_END_MINUTES - DAY_START_MINUTES) / 60 },
    (_, i) => DAY_START_MINUTES / 60 + i,
)

/** Accepts "HH:MM" or "HH:MM:SS" (Postgres returns the latter). */
export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

export function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function formatTimeRange(startMinutes: number, durationMinutes: number): string {
    return `${minutesToTime(startMinutes)} – ${minutesToTime(startMinutes + durationMinutes)}`
}

export function snapMinutes(minutes: number): number {
    return Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES
}

/** Keeps a block of the given duration inside the visible day. */
export function clampStart(startMinutes: number, durationMinutes: number): number {
    return Math.min(Math.max(startMinutes, DAY_START_MINUTES), DAY_END_MINUTES - durationMinutes)
}

/** New duration after dragging the bottom edge by deltaPx, snapped and kept inside the day. */
export function resizedDuration(
    startMinutes: number,
    durationMinutes: number,
    deltaPx: number,
): number {
    const snapped = snapMinutes(durationMinutes + pxToMinutes(deltaPx))
    return Math.min(Math.max(snapped, MIN_DURATION_MINUTES), DAY_END_MINUTES - startMinutes)
}

export function validateSessionTiming(startTime: string, durationMinutes: number): string | null {
    if (!/^\d{2}:\d{2}/.test(startTime)) return 'Choose a start time'
    const start = timeToMinutes(startTime)
    if (start < DAY_START_MINUTES || start >= DAY_END_MINUTES) {
        return `Start time must be between ${minutesToTime(DAY_START_MINUTES)} and ${minutesToTime(DAY_END_MINUTES)}`
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes < MIN_DURATION_MINUTES) {
        return `Duration must be a whole number of at least ${MIN_DURATION_MINUTES} minutes`
    }
    if (start + durationMinutes > DAY_END_MINUTES) {
        return `Sessions must end by ${minutesToTime(DAY_END_MINUTES)}`
    }
    return null
}

export interface LaidOut<T> {
    item: T
    lane: number
    lanes: number
}

/**
 * Places overlapping items side by side. Items that overlap (directly or through a chain)
 * form a cluster; each gets a lane index, and `lanes` is the cluster's lane count.
 */
export function layoutOverlaps<T extends { start: number; end: number }>(
    items: readonly T[],
): LaidOut<T>[] {
    const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end)
    const result: LaidOut<T>[] = []
    let cluster: { item: T; lane: number }[] = []
    let laneEnds: number[] = []
    let clusterEnd = -Infinity

    function flush() {
        for (const entry of cluster) {
            result.push({ ...entry, lanes: laneEnds.length })
        }
        cluster = []
        laneEnds = []
        clusterEnd = -Infinity
    }

    for (const item of sorted) {
        if (cluster.length > 0 && item.start >= clusterEnd) flush()
        let lane = laneEnds.findIndex((end) => end <= item.start)
        if (lane === -1) {
            lane = laneEnds.length
            laneEnds.push(item.end)
        } else {
            laneEnds[lane] = item.end
        }
        cluster.push({ item, lane })
        clusterEnd = Math.max(clusterEnd, item.end)
    }
    flush()

    return result
}