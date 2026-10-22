import { describe, expect, it } from 'vitest'
import type { Goal, Log, PlannedSession } from './types'
import { addDays, getDayView, getProgress, getWeekRange, weekdayIndex } from './week'

const kickboxing: Goal = { id: 'kb', name: 'Kickboxing', targetPerWeek: 3 }
const gym: Goal = { id: 'gym', name: 'Gym', targetPerWeek: 3 }

// Week of Mon 5 Oct to Sun 11 Oct 2026
const week = getWeekRange('2026-10-07')
const log = (goalId: string, date: string, plannedSessionId?: string): Log => ({
  id: `${goalId}-${date}`,
  goalId,
  date,
  plannedSessionId,
})

describe('getWeekRange', () => {
  it('runs Monday to Sunday', () => {
    expect(week).toEqual({ start: '2026-10-05', end: '2026-10-11' })
  })
  it('keeps Sunday in the week that started on Monday', () => {
    expect(getWeekRange('2026-10-11').start).toBe('2026-10-05')
  })
  it('starts a new week on Monday', () => {
    expect(getWeekRange('2026-10-12').start).toBe('2026-10-12')
  })
  it('handles month and year boundaries', () => {
    expect(getWeekRange('2027-01-01')).toEqual({ start: '2026-12-28', end: '2027-01-03' })
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
  })
})

describe('weekdayIndex', () => {
  it('maps Monday to 0 and Sunday to 6', () => {
    expect(weekdayIndex('2026-10-05')).toBe(0)
    expect(weekdayIndex('2026-10-11')).toBe(6)
  })
})

describe('getProgress: the kickboxing and gym week', () => {
  // kickboxing planned Mon/Wed/Thu/Fri; Wednesday was missed
  const logs = [
    log('kb', '2026-10-05'),
    log('gym', '2026-10-06'),
    log('gym', '2026-10-07'),
    log('kb', '2026-10-08'),
    log('kb', '2026-10-09'),
    log('gym', '2026-10-10'),
  ]
  it('ticks kickboxing at 3/3 even though 4 were planned', () => {
    expect(getProgress(kickboxing, logs, week)).toMatchObject({ done: 3, target: 3, complete: true })
  })
  it('ticks gym at 3/3', () => {
    expect(getProgress(gym, logs, week)).toMatchObject({ done: 3, target: 3, complete: true })
  })
  it('is incomplete with 2/3', () => {
    expect(getProgress(kickboxing, logs.slice(0, 3), week).complete).toBe(false)
  })
  it('shows 0 with no logs', () => {
    expect(getProgress(gym, [], week)).toMatchObject({ done: 0, target: 3, complete: false })
  })
  it("ignores last week's and next week's logs", () => {
    const outside = [log('kb', '2026-10-04'), log('kb', '2026-10-12')]
    expect(getProgress(kickboxing, outside, week).done).toBe(0)
  })
  it('counts two logs on one day as two sessions', () => {
    const twice = [log('gym', '2026-10-06'), { ...log('gym', '2026-10-06'), id: 'second' }]
    expect(getProgress(gym, twice, week).done).toBe(2)
  })
  it('counts every session type towards the parent goal', () => {
    const typed = [
      { ...log('gym', '2026-10-05'), sessionType: 'Upper' },
      { ...log('gym', '2026-10-08'), sessionType: 'Lower' },
      { ...log('gym', '2026-10-11'), sessionType: 'Upper' },
    ]
    expect(getProgress(gym, typed, week)).toMatchObject({ done: 3, complete: true })
  })
})

describe('getDayView', () => {
  const sessions: PlannedSession[] = [
    { id: 's-mon', goalId: 'kb', dayOfWeek: 0, time: '19:00' },
    { id: 's-mon-am', goalId: 'gym', dayOfWeek: 0, time: '07:00' },
    { id: 's-wed', goalId: 'kb', dayOfWeek: 2, time: '19:00' },
  ]
  it('lists planned sessions for that weekday, earliest first', () => {
    const v = getDayView('2026-10-05', sessions, [])
    expect(v.planned.map((p) => p.session.id)).toEqual(['s-mon-am', 's-mon'])
  })
  it('links a log to its planned session and leaves the rest as extra', () => {
    const logs = [log('kb', '2026-10-05', 's-mon'), log('gym', '2026-10-05')]
    const v = getDayView('2026-10-05', sessions, logs)
    expect(v.planned.find((p) => p.session.id === 's-mon')?.log).not.toBeNull()
    expect(v.planned.find((p) => p.session.id === 's-mon-am')?.log).toBeNull()
    expect(v.extra).toHaveLength(1)
  })
  it('repeats weekly sessions on any week', () => {
    expect(getDayView('2026-10-14', sessions, []).planned).toHaveLength(1)
  })
})
