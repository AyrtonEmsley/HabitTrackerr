'use client'

import { useState } from 'react'
import type { Actions } from '@/hooks/useWeeklyGoals'
import type { AppData, DayIndex } from '@/lib/types'
import { DAY_NAMES, weekdayIndex } from '@/lib/week'

const EMOJIS = ['🥊', '🏋️', '🏃', '🚴', '🏊', '🧘', '⚽', '🥾', '🤸', '💪', '🎾', '🧗']

function Sheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  )
}

export function GoalSheet({ data, goalId, actions, onClose }: { data: AppData; goalId?: string; actions: Actions; onClose: () => void }) {
  const goal = goalId ? data.goals.find((g) => g.id === goalId) : undefined
  const [name, setName] = useState(goal?.name ?? '')
  const [emoji, setEmoji] = useState(goal?.emoji ?? '🎯')
  const [target, setTarget] = useState(goal?.targetPerWeek ?? 3)
  const [error, setError] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const save = () => {
    if (!name.trim()) {
      setError(true)
      return
    }
    actions.saveGoal({ id: goal?.id, name, emoji, targetPerWeek: target })
    onClose()
  }

  return (
    <Sheet onClose={onClose}>
      <h2>{goal ? 'Edit goal' : 'New goal'}</h2>
      <label className="f" htmlFor="g-name">
        Name
      </label>
      <input
        className="input"
        id="g-name"
        maxLength={40}
        autoFocus
        placeholder={error ? 'Give your goal a name' : 'Kickboxing'}
        style={error ? { borderColor: 'var(--danger)' } : undefined}
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          setError(false)
        }}
      />
      <label className="f" htmlFor="g-emoji">
        Emoji
      </label>
      <input className="input" id="g-emoji" maxLength={4} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
      <div className="emojis">
        {EMOJIS.map((e) => (
          <button key={e} type="button" onClick={() => setEmoji(e)} aria-label={`Use ${e}`}>
            {e}
          </button>
        ))}
      </div>
      <label className="f">Times per week</label>
      <div className="stepper">
        <button className="icon-btn" onClick={() => setTarget((t) => Math.max(1, t - 1))} aria-label="Fewer">
          −
        </button>
        <span className="val">{target}</span>
        <button className="icon-btn" onClick={() => setTarget((t) => Math.min(14, t + 1))} aria-label="More">
          +
        </button>
      </div>
      <div className="sheet-actions">
        <button className="btn block" onClick={save}>
          Save goal
        </button>
        {goal && (
          <button
            className="btn danger block"
            onClick={() => {
              if (confirmDelete) {
                actions.deleteGoal(goal.id)
                onClose()
              } else setConfirmDelete(true)
            }}
          >
            {confirmDelete ? 'Tap again to delete goal and its history' : 'Delete goal'}
          </button>
        )}
        <button className="btn ghost block" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Sheet>
  )
}

export function SlotSheet({ data, selected, actions, onClose }: { data: AppData; selected: string; actions: Actions; onClose: () => void }) {
  const [goalId, setGoalId] = useState(data.goals[0]?.id ?? '')
  const [day, setDay] = useState<DayIndex>(weekdayIndex(selected))
  const [time, setTime] = useState('19:00')

  return (
    <Sheet onClose={onClose}>
      <h2>Add a session</h2>
      <label className="f" htmlFor="s-goal">
        Goal
      </label>
      <select className="input" id="s-goal" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
        {data.goals.map((g) => (
          <option key={g.id} value={g.id}>
            {g.emoji} {g.name}
          </option>
        ))}
      </select>
      <label className="f" htmlFor="s-day">
        Day
      </label>
      <select className="input" id="s-day" value={day} onChange={(e) => setDay(Number(e.target.value) as DayIndex)}>
        {DAY_NAMES.map((d, i) => (
          <option key={d} value={i}>
            {d}
          </option>
        ))}
      </select>
      <label className="f" htmlFor="s-time">
        Time (optional)
      </label>
      <input className="input" id="s-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <div className="sheet-actions">
        <button
          className="btn block"
          disabled={!goalId}
          onClick={() => {
            actions.addSession({ goalId, dayOfWeek: day, time })
            onClose()
          }}
        >
          Add session
        </button>
        <button className="btn ghost block" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Sheet>
  )
}

export function LogSheet({ data, selected, actions, onClose }: { data: AppData; selected: string; actions: Actions; onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <h2>Log for {DAY_NAMES[weekdayIndex(selected)]}</h2>
      <div className="stack">
        {data.goals.map((g) => (
          <button
            key={g.id}
            className="pick"
            onClick={() => {
              actions.addLog(g.id, selected)
              onClose()
            }}
          >
            <span className="goal-emoji">{g.emoji ?? '🎯'}</span>
            {g.name}
          </button>
        ))}
      </div>
      <div className="sheet-actions">
        <button className="btn ghost block" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Sheet>
  )
}
