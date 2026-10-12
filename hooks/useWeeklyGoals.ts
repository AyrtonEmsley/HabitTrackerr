'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { emptyData, loadData, saveData, uid } from '@/lib/storage'
import type { AppData, DayIndex, Goal } from '@/lib/types'
import { addDays, getWeekRange, todayStr } from '@/lib/week'

export function useWeeklyGoals() {
  const [data, setData] = useState<AppData>(emptyData)
  const [ready, setReady] = useState(false)

  // Load after mount so server and client render the same HTML first.
  useEffect(() => {
    setData(loadData())
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) saveData(data)
  }, [data, ready])

  const saveGoal = useCallback(
    (input: { id?: string; name: string; emoji: string; targetPerWeek: number; targetMinutesPerWeek?: number }) => {
      const name = input.name.trim()
      const emoji = input.emoji.trim() || '🎯'
      const { targetPerWeek, targetMinutesPerWeek } = input
      setData((d) =>
        input.id
          ? {
              ...d,
              goals: d.goals.map((g) => (g.id === input.id ? { ...g, name, emoji, targetPerWeek, targetMinutesPerWeek } : g)),
            }
          : { ...d, goals: [...d.goals, { id: uid(), name, emoji, targetPerWeek, targetMinutesPerWeek }] },
      )
    },
    [],
  )

  const deleteGoal = useCallback((id: string) => {
    setData((d) => ({
      goals: d.goals.filter((g) => g.id !== id),
      sessions: d.sessions.filter((s) => s.goalId !== id),
      logs: d.logs.filter((l) => l.goalId !== id),
    }))
  }, [])

  const addSession = useCallback((input: { goalId: string; dayOfWeek: DayIndex; time?: string; durationMinutes?: number }) => {
    setData((d) => ({
      ...d,
      sessions: [
        ...d.sessions,
        { id: uid(), goalId: input.goalId, dayOfWeek: input.dayOfWeek, time: input.time || undefined, durationMinutes: input.durationMinutes },
      ],
    }))
  }, [])

  const deleteSession = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      sessions: d.sessions.filter((s) => s.id !== id),
      // keep the logs, just unlink them from the deleted plan
      logs: d.logs.map((l) => (l.plannedSessionId === id ? { ...l, plannedSessionId: undefined } : l)),
    }))
  }, [])

  /** Tap a planned session: log it (with its planned minutes), or undo the log if already logged that day. */
  const toggleSession = useCallback((sessionId: string, date: string) => {
    setData((d) => {
      const session = d.sessions.find((s) => s.id === sessionId)
      if (!session) return d
      const existing = d.logs.find((l) => l.plannedSessionId === sessionId && l.date === date)
      return existing
        ? { ...d, logs: d.logs.filter((l) => l.id !== existing.id) }
        : {
            ...d,
            logs: [
              ...d.logs,
              { id: uid(), goalId: session.goalId, date, plannedSessionId: sessionId, minutes: session.durationMinutes },
            ],
          }
    })
  }, [])

  const addLog = useCallback((goalId: string, date: string, minutes?: number) => {
    setData((d) => ({ ...d, logs: [...d.logs, { id: uid(), goalId, date, minutes }] }))
  }, [])

  const removeLog = useCallback((id: string) => {
    setData((d) => ({ ...d, logs: d.logs.filter((l) => l.id !== id) }))
  }, [])

  const loadExample = useCallback(() => {
    const mon = getWeekRange(todayStr()).start
    const day = (i: number) => addDays(mon, i)
    const kb: Goal = { id: uid(), name: 'Kickboxing', emoji: '🥊', targetPerWeek: 3, targetMinutesPerWeek: 180 }
    const gym: Goal = { id: uid(), name: 'Gym', emoji: '🏋️', targetPerWeek: 3, targetMinutesPerWeek: 150 }
    const planned: DayIndex[] = [0, 2, 3, 4]
    const sessions = planned.map((dayOfWeek) => ({ id: uid(), goalId: kb.id, dayOfWeek, time: '19:00', durationMinutes: 60 }))
    setData({
      goals: [kb, gym],
      sessions,
      logs: [
        { id: uid(), goalId: kb.id, date: day(0), plannedSessionId: sessions[0].id, minutes: 60 },
        { id: uid(), goalId: gym.id, date: day(1), minutes: 60 },
        { id: uid(), goalId: gym.id, date: day(2), minutes: 45 },
        { id: uid(), goalId: kb.id, date: day(3), plannedSessionId: sessions[2].id, minutes: 60 },
        { id: uid(), goalId: kb.id, date: day(4), plannedSessionId: sessions[3].id, minutes: 60 },
        { id: uid(), goalId: gym.id, date: day(5), minutes: 60 },
      ],
    })
  }, [])

  const resetAll = useCallback(() => setData(emptyData()), [])

  const actions = useMemo(
    () => ({ saveGoal, deleteGoal, addSession, deleteSession, toggleSession, addLog, removeLog, loadExample, resetAll }),
    [saveGoal, deleteGoal, addSession, deleteSession, toggleSession, addLog, removeLog, loadExample, resetAll],
  )

  return { data, ready, actions }
}

export type Actions = ReturnType<typeof useWeeklyGoals>['actions']
