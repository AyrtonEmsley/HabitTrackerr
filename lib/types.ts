/** 0 = Monday ... 6 = Sunday */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type Goal = {
  id: string
  name: string
  emoji?: string
  /** Sessions per week. 0 means no session target (time-only goal). */
  targetPerWeek: number
  /** Optional total time target for the week, in minutes. Set either target or both; with both, the goal needs sessions AND minutes. */
  targetMinutesPerWeek?: number
}

export type PlannedSession = {
  id: string
  goalId: string
  dayOfWeek: DayIndex
  time?: string // "19:00"
  durationMinutes?: number // planned length; copied onto the log when you tick it
}

export type Log = {
  id: string
  goalId: string
  date: string // "2026-10-12" (ISO date, no time zones)
  plannedSessionId?: string
  minutes?: number
  note?: string
}

export type AppData = {
  goals: Goal[]
  sessions: PlannedSession[]
  logs: Log[]
}

export type WeekRange = { start: string; end: string }
export type Progress = {
  done: number
  target: number
  minutesDone: number
  minutesTarget?: number
  complete: boolean
}
export type DayView = {
  planned: { session: PlannedSession; log: Log | null }[]
  extra: Log[]
}