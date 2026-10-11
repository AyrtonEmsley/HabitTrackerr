'use client'

import { useEffect, useState } from 'react'
import { useWeeklyGoals } from '@/hooks/useWeeklyGoals'
import { todayStr } from '@/lib/week'
import GoalsView from './GoalsView'
import ScheduleView from './ScheduleView'
import { GoalSheet, LogSheet, SlotSheet } from './Sheets'
import TabBar from './TabBar'
import TodayView from './TodayView'
import type { Tab } from './icons'

type SheetState = { type: 'goal'; goalId?: string } | { type: 'slot' } | { type: 'log' } | null

export default function App() {
  const { data, ready, actions } = useWeeklyGoals()
  const [tab, setTab] = useState<Tab>('today')
  const [selected, setSelected] = useState('')
  const [sheet, setSheet] = useState<SheetState>(null)

  // Today depends on the device clock, so set it after mount.
  useEffect(() => setSelected(todayStr()), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheet(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!ready || !selected) return <div id="app" />

  const closeSheet = () => setSheet(null)
  const openGoal = (goalId?: string) => setSheet({ type: 'goal', goalId })

  return (
    <>
      <div id="app">
        {tab === 'today' && (
          <TodayView
            data={data}
            selected={selected}
            onSelect={setSelected}
            actions={actions}
            onAddGoal={() => openGoal()}
            onOpenLog={() => (data.goals.length ? setSheet({ type: 'log' }) : setTab('goals'))}
          />
        )}
        {tab === 'goals' && <GoalsView data={data} actions={actions} onEditGoal={openGoal} />}
        {tab === 'schedule' && (
          <ScheduleView data={data} actions={actions} onAddGoal={() => openGoal()} onAddSession={() => setSheet({ type: 'slot' })} />
        )}
      </div>

      <TabBar
        tab={tab}
        onChange={(t) => {
          setTab(t)
          setSheet(null)
          window.scrollTo(0, 0)
        }}
      />

      {sheet?.type === 'goal' && <GoalSheet key={sheet.goalId ?? 'new'} data={data} goalId={sheet.goalId} actions={actions} onClose={closeSheet} />}
      {sheet?.type === 'slot' && <SlotSheet data={data} selected={selected} actions={actions} onClose={closeSheet} />}
      {sheet?.type === 'log' && <LogSheet data={data} selected={selected} actions={actions} onClose={closeSheet} />}
    </>
  )
}
