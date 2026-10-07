import { format, parseISO } from 'date-fns'
import { HEATMAP_WEEKS, formatMinutes, type HeatmapCell, type HeatmapLevel } from '../../lib/progress'

const LEVEL_CLASS: Record<HeatmapLevel, string> = {
    0: 'bg-slate-100',
    1: 'bg-indigo-200',
    2: 'bg-indigo-300',
    3: 'bg-indigo-500',
    4: 'bg-indigo-700',
}

const WEEKDAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']

function monthLabel(weeks: HeatmapCell[][], index: number): string {
    const month = format(parseISO(weeks[index][0].date), 'MMM')
    if (index === 0) return month
    return month === format(parseISO(weeks[index - 1][0].date), 'MMM') ? '' : month
}

interface ActivityHeatmapProps {
    weeks: HeatmapCell[][]
    studyDays: number
}

export function ActivityHeatmap({ weeks, studyDays }: ActivityHeatmapProps) {
    return (
        <div>
            <div className="overflow-x-auto pb-2">
                <div
                    role="img"
                    aria-label={`Study activity over the last ${HEATMAP_WEEKS} weeks: ${studyDays} study days`}
                    className="inline-flex gap-2"
                >
                    <div className="grid grid-rows-7 gap-1 pt-5 text-[10px] text-slate-500">
                        {WEEKDAY_LABELS.map((label, i) => (
                            <span key={i} className="h-3.5">
                                {label}
                            </span>
                        ))}
                    </div>
                    <div>
                        <div className="mb-1 flex h-4 gap-1 text-[10px] text-slate-500">
                            {weeks.map((week, i) => (
                                <span key={week[0].date} className="w-3.5 shrink-0 whitespace-nowrap">
                                    {monthLabel(weeks, i)}
                                </span>
                            ))}
                        </div>
                        <div className="grid grid-flow-col grid-rows-7 gap-1">
                            {weeks.flat().map((cell) => (
                                <div
                                    key={cell.date}
                                    title={`${format(parseISO(cell.date), 'd MMM yyyy')}: ${cell.minutes > 0 ? formatMinutes(cell.minutes) : 'no study'
                                        }`}
                                    className={`h-3.5 w-3.5 rounded-sm ${cell.future ? 'opacity-0' : LEVEL_CLASS[cell.level]
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-slate-500">
                <span>Less</span>
                {([0, 1, 2, 3, 4] as const).map((level) => (
                    <span key={level} className={`h-3 w-3 rounded-sm ${LEVEL_CLASS[level]}`} />
                ))}
                <span>More</span>
            </div>
        </div>
    )
}