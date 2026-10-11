import type { DayIndex, DayView, Goal, Log, PlannedSession, Progress, WeekRange } from './types'

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
export const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (n: number) => String(n).padStart(2, '0')

// Dates are "YYYY-MM-DD" strings. All maths happens in UTC so time zones can't shift a day.
export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
export function fmtDate(dt: Date): string {
  return dt.toISOString().slice(0, 10)
}
export function addDays(s: string, n: number): string {
  const d = parseDate(s)
  d.setUTCDate(d.getUTCDate() + n)
  return fmtDate(d)
}
/** 0 = Monday ... 6 = Sunday */
export function weekdayIndex(s: string): DayIndex {
  return ((parseDate(s).getUTCDay() + 6) % 7) as DayIndex
}
/** Today in the device's local time, as YYYY-MM-DD. Only call on the client. */
export function todayStr(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`
}

/** Monday..Sunday containing the given date. */
export function getWeekRange(date: string): WeekRange {
  const start = addDays(date, -weekdayIndex(date))
  return { start, end: addDays(start, 6) }
}
export function getWeekDates(date: string): string[] {
  const { start } = getWeekRange(date)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/** Progress is derived from logs only. Planned sessions never count. */
export function getProgress(goal: Goal, logs: Log[], week: WeekRange): Progress {
  const done = logs.filter((l) => l.goalId === goal.id && l.date >= week.start && l.date <= week.end).length
  return { done, target: goal.targetPerWeek, complete: done >= goal.targetPerWeek }
}

/** Planned sessions for that weekday (with their log, if any) plus logs that weren't tied to a plan. */
export function getDayView(date: string, sessions: PlannedSession[], logs: Log[]): DayView {
  const dow = weekdayIndex(date)
  const dayLogs = logs.filter((l) => l.date === date)
  const planned = sessions
    .filter((s) => s.dayOfWeek === dow)
    .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'))
    .map((session) => ({
      session,
      log: dayLogs.find((l) => l.plannedSessionId === session.id) ?? null,
    }))
  const linked = new Set(planned.flatMap((p) => (p.log ? [p.log.id] : [])))
  const extra = dayLogs.filter((l) => !linked.has(l.id))
  return { planned, extra }
}

export function fmtShort(s: string): string {
  const d = parseDate(s)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}
export function fmtTime(t?: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${pad(m)}${h >= 12 ? 'pm' : 'am'}`
}
