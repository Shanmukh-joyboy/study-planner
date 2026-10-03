import type { CSSProperties, MouseEvent } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
    DAY_START_MINUTES,
    DEFAULT_DURATION_MINUTES,
    GRID_HEIGHT_PX,
    HOUR_PX,
    SLOT_MINUTES,
    clampStart,
    pxToMinutes,
    type LaidOut,
} from '../../lib/planner'
import type { SessionChanges, SessionWithTopic } from '../../types'
import { SessionBlock } from './SessionBlock'

export interface PositionedSession {
    session: SessionWithTopic
    start: number
    end: number
}

interface DayColumnProps {
    date: string
    isToday: boolean
    items: LaidOut<PositionedSession>[]
    onCreateAt: (date: string, startMinutes: number) => void
    onEdit: (session: SessionWithTopic) => void
    onChange: (id: string, changes: SessionChanges) => void
}

const columnStyle: CSSProperties = {
    height: GRID_HEIGHT_PX,
    backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${HOUR_PX - 1}px, #e2e8f0 ${HOUR_PX - 1}px, #e2e8f0 ${HOUR_PX}px)`,
}

export function DayColumn({ date, isToday, items, onCreateAt, onEdit, onChange }: DayColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: date })

    function handleClick(e: MouseEvent<HTMLDivElement>) {
        const top = e.currentTarget.getBoundingClientRect().top
        const slot = Math.floor(pxToMinutes(e.clientY - top) / SLOT_MINUTES) * SLOT_MINUTES
        onCreateAt(date, clampStart(DAY_START_MINUTES + slot, DEFAULT_DURATION_MINUTES))
    }

    return (
        <div
            ref={setNodeRef}
            onClick={handleClick}
            style={columnStyle}
            className={`relative cursor-cell border-l border-slate-200 ${isOver ? 'bg-indigo-100/50' : isToday ? 'bg-indigo-50/50' : ''
                }`}
        >
            {items.map(({ item, lane, lanes }) => (
                <SessionBlock
                    key={item.session.id}
                    session={item.session}
                    lane={lane}
                    lanes={lanes}
                    onEdit={() => onEdit(item.session)}
                    onChange={(changes) => onChange(item.session.id, changes)}
                />
            ))}
        </div>
    )
}