'use client'

import type { Actions } from '@/hooks/useWeeklyGoals'
import type { AppData } from '@/lib/types'
import { DAY_NAMES, fmtTime } from '@/lib/week'
import { CloseIcon, PlusIcon } from './icons'

type Props = {
  data: AppData
  actions: Actions
  onAddGoal: () => void
  onAddSession: () => void
}

export default function ScheduleView({ data, actions, onAddGoal, onAddSession }: Props) {
  if (data.goals.length === 0) {
    return (
      <>
        <div className="top">
          <h1>Schedule</h1>
        </div>
        <div className="empty">
          <h2>Add a goal first</h2>
          <p>Scheduled sessions belong to a goal.</p>
          <button className="btn" onClick={onAddGoal}>
            Add a goal
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="top">
        <h1>Schedule</h1>
      </div>
      <p className="muted" style={{ margin: '-6px 2px 12px' }}>
        Planned sessions repeat every week and show up as reminders. Only what you log counts towards a goal.
      </p>

      {DAY_NAMES.map((dayName, i) => {
        const slots = data.sessions
          .filter((s) => s.dayOfWeek === i)
          .sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'))
        if (slots.length === 0) return null
        return (
          <div key={dayName} className="group">
            <h3>{dayName}</h3>
            <div className="list">
              {slots.map((s) => {
                const g = data.goals.find((x) => x.id === s.goalId)
                if (!g) return null
                return (
                  <div key={s.id} className="row">
                    <span className="goal-emoji">{g.emoji ?? '🎯'}</span>
                    <span className="row-main">
                      <div className="row-name">{g.name}</div>
                      <div className="row-sub">{s.time ? fmtTime(s.time) : 'Any time'}</div>
                    </span>
                    <button className="x" onClick={() => actions.deleteSession(s.id)} aria-label={`Remove ${g.name} on ${dayName}`}>
                      <CloseIcon />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {data.sessions.length === 0 && (
        <div className="empty" style={{ marginBottom: 10 }}>
          <h2>Nothing scheduled</h2>
          <p>Add the days you plan to train, like kickboxing at 7pm on Tuesdays.</p>
        </div>
      )}

      <button className="add-row" style={{ marginTop: 16 }} onClick={onAddSession}>
        <PlusIcon /> Add a session
      </button>
    </>
  )
}
