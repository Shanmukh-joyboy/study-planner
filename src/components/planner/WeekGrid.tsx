import { useState } from 'react'
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    pointerWithin,
    rectIntersection,
    useSensor,
    useSensors,
    type CollisionDetection,
    type DragEndEvent,
} from '@dnd-kit/core'
import { addDays, format, isToday } from 'date-fns'
import { toISODate } from '../../lib/dates'
import {
    GRID_HOURS,
    HOUR_PX,
    clampStart,
    layoutOverlaps,
    minutesToTime,
    pxToMinutes,
    snapMinutes,
    timeToMinutes,
} from '../../lib/planner'
import type { SessionChanges, SessionWithTopic } from '../../types'
import { DayColumn, type PositionedSession } from './DayColumn'

const GRID_COLUMNS = 'grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]'

// Prefer the column under the pointer; fall back to overlap (used by keyboard dragging).
const collisionDetection: CollisionDetection = (args) => {
    const pointerHits = pointerWithin(args)
    return pointerHits.length > 0 ? pointerHits : rectIntersection(args)
}

interface WeekGridProps {
    weekStart: Date
    sessions: SessionWithTopic[]
    onEdit: (session: SessionWithTopic) => void
    onCreate: (date: string, startMinutes: number) => void
    onChange: (id: string, changes: SessionChanges) => Promise<void>
}

export function WeekGrid({ weekStart, sessions, onEdit, onCreate, onChange }: WeekGridProps) {
    const [pending, setPending] = useState<Record<string, SessionChanges>>({})
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor),
    )

    // Show a change immediately while it saves, then drop the override once fresh data arrives.
    const merged = sessions.map((s) => (pending[s.id] ? { ...s, ...pending[s.id] } : s))

    async function commit(id: string, changes: SessionChanges) {
        setPending((current) => ({ ...current, [id]: { ...current[id], ...changes } }))
        await onChange(id, changes)
        setPending((current) => {
            const next = { ...current }
            delete next[id]
            return next
        })
    }

    function handleDragEnd({ active, over, delta }: DragEndEvent) {
        if (!over) return
        const session = merged.find((s) => s.id === active.id)
        if (!session) return

        const currentStart = timeToMinutes(session.start_time)
        const newStart = clampStart(
            currentStart + snapMinutes(pxToMinutes(delta.y)),
            session.duration_minutes,
        )
        const newDate = String(over.id)
        if (newDate === session.date && newStart === currentStart) return

        void commit(session.id, { date: newDate, start_time: minutesToTime(newStart) })
    }

    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
        <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragEnd={handleDragEnd}>
            <div className="max-h-[75vh] overflow-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm">
                <div className="min-w-[760px]">
                    <div className={`${GRID_COLUMNS} sticky top-0 z-20 border-b border-slate-200 bg-white`}>
                        <div />
                        {days.map((day) => (
                            <div key={toISODate(day)} className="py-2 text-center">
                                <p className="text-xs font-medium uppercase text-slate-500">{format(day, 'EEE')}</p>
                                <p
                                    className={`mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${isToday(day) ? 'bg-indigo-600 text-white' : 'text-slate-900'
                                        }`}
                                >
                                    {format(day, 'd')}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className={GRID_COLUMNS}>
                        <div>
                            {GRID_HOURS.map((hour) => (
                                <div
                                    key={hour}
                                    style={{ height: HOUR_PX }}
                                    className="pr-2 pt-0.5 text-right text-xs text-slate-500"
                                >
                                    {String(hour).padStart(2, '0')}:00
                                </div>
                            ))}
                        </div>
                        {days.map((day) => {
                            const date = toISODate(day)
                            const items = layoutOverlaps(
                                merged
                                    .filter((s) => s.date === date)
                                    .map<PositionedSession>((session) => {
                                        const start = timeToMinutes(session.start_time)
                                        return { session, start, end: start + session.duration_minutes }
                                    }),
                            )
                            return (
                                <DayColumn
                                    key={date}
                                    date={date}
                                    isToday={isToday(day)}
                                    items={items}
                                    onCreateAt={onCreate}
                                    onEdit={onEdit}
                                    onChange={(id, changes) => void commit(id, changes)}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>
        </DndContext>
    )
}