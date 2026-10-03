import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useDraggable } from '@dnd-kit/core'
import {
    DAY_START_MINUTES,
    SLOT_PX,
    formatTimeRange,
    minutesToPx,
    resizedDuration,
    timeToMinutes,
} from '../../lib/planner'
import type { SessionChanges, SessionWithTopic } from '../../types'

const NO_TOPIC_COLOR = '#64748b'

interface SessionBlockProps {
    session: SessionWithTopic
    lane: number
    lanes: number
    onEdit: () => void
    onChange: (changes: SessionChanges) => void
}

export function SessionBlock({ session, lane, lanes, onEdit, onChange }: SessionBlockProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: session.id,
    })
    const [resizePreview, setResizePreview] = useState<number | null>(null)
    const resizeStartY = useRef<number | null>(null)

    const start = timeToMinutes(session.start_time)
    const duration = resizePreview ?? session.duration_minutes
    const color = session.topics?.subjects.color ?? NO_TOPIC_COLOR
    const title = session.topics?.title ?? 'Study session'
    const range = formatTimeRange(start, duration)

    const style: CSSProperties = {
        top: Math.max(0, minutesToPx(start - DAY_START_MINUTES)),
        height: minutesToPx(duration),
        left: `calc(${(lane / lanes) * 100}% + 2px)`,
        width: `calc(${100 / lanes}% - 4px)`,
        backgroundColor: `${color}26`,
        borderLeftColor: color,
        transform: transform
            ? `translate3d(${transform.x}px, ${Math.round(transform.y / SLOT_PX) * SLOT_PX}px, 0)`
            : undefined,
        zIndex: isDragging ? 30 : undefined,
    }

    function durationAt(clientY: number): number {
        const startY = resizeStartY.current ?? clientY
        return resizedDuration(start, session.duration_minutes, clientY - startY)
    }

    function handleResizeDown(e: ReactPointerEvent<HTMLDivElement>) {
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        resizeStartY.current = e.clientY
    }

    function handleResizeMove(e: ReactPointerEvent<HTMLDivElement>) {
        if (resizeStartY.current === null) return
        setResizePreview(durationAt(e.clientY))
    }

    function handleResizeUp(e: ReactPointerEvent<HTMLDivElement>) {
        if (resizeStartY.current === null) return
        const finalDuration = durationAt(e.clientY)
        resizeStartY.current = null
        e.currentTarget.releasePointerCapture(e.pointerId)
        setResizePreview(null)
        if (finalDuration !== session.duration_minutes) {
            onChange({ duration_minutes: finalDuration })
        }
    }

    function handleResizeCancel() {
        resizeStartY.current = null
        setResizePreview(null)
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            role="group"
            aria-label={`${title}, ${range}${session.completed ? ', completed' : ''}`}
            onClick={(e) => {
                e.stopPropagation()
                onEdit()
            }}
            className={`absolute cursor-grab select-none overflow-hidden rounded-lg border-l-4 px-2 py-1 text-xs shadow-sm ${isDragging ? 'cursor-grabbing opacity-90 shadow-lg ring-2 ring-indigo-300' : ''
                } ${session.completed ? 'opacity-60' : ''}`}
        >
            <div className="flex items-start gap-1.5">
                <button
                    type="button"
                    aria-pressed={session.completed}
                    aria-label="Completed"
                    onClick={(e) => {
                        e.stopPropagation()
                        onChange({ completed: !session.completed })
                    }}
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none focus:outline-none focus:ring-2 focus:ring-indigo-300 ${session.completed
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-400 bg-white/80'
                        }`}
                >
                    {session.completed ? '✓' : ''}
                </button>
                <div className="min-w-0">
                    <p
                        className={`truncate font-semibold text-slate-900 ${session.completed ? 'line-through' : ''
                            }`}
                    >
                        {title}
                    </p>
                    {duration >= 45 && <p className="truncate text-slate-600">{range}</p>}
                </div>
            </div>
            <div
                aria-hidden="true"
                onPointerDown={handleResizeDown}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeUp}
                onPointerCancel={handleResizeCancel}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize touch-none"
            />
        </div>
    )
}