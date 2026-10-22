'use client'

import { useState } from 'react'
import type { Actions } from '@/hooks/useWeeklyGoals'
import type { AppData, DayIndex } from '@/lib/types'
import { DAY_NAMES, weekdayIndex } from '@/lib/week'

const EMOJIS = ['🥊', '🏋️', '🏃', '🚴', '🏊', '🧘', '⚽', '🥾', '🤸', '💪', '🎾', '🧗']

/** "60" -> 60, "" or "0" -> undefined */
function parseMinutes(s: string): number | undefined {
  const n = Math.round(Number(s))
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function MinutesInput({ id, value, onChange, placeholder }: { id: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      className="input"
      id={id}
      inputMode="numeric"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
    />
  )
}

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
  const [minutes, setMinutes] = useState(goal?.targetMinutesPerWeek ? String(goal.targetMinutesPerWeek) : '')
  const [sessionTypes, setSessionTypes] = useState(goal?.sessionTypes?.join(', ') ?? '')
  const [error, setError] = useState(false)
  const [needsTarget, setNeedsTarget] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const save = () => {
    setNeedsTarget(false)
    if (!name.trim()) {
      setError(true)
      return
    }
    if (target === 0 && !parseMinutes(minutes)) {
      setNeedsTarget(true)
      return
    }
    const types = Array.from(new Set(sessionTypes.split(',').map((type) => type.trim()).filter(Boolean))).slice(0, 12)
    actions.saveGoal({ id: goal?.id, name, emoji, targetPerWeek: target, targetMinutesPerWeek: parseMinutes(minutes), sessionTypes: types.length ? types : undefined })
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
      <label className="f">Sessions per week (0 = no session target)</label>
      <div className="stepper">
        <button className="icon-btn" onClick={() => setTarget((t) => Math.max(0, t - 1))} aria-label="Fewer">
          −
        </button>
        <span className="val">{target === 0 ? 'None' : target}</span>
        <button className="icon-btn" onClick={() => setTarget((t) => Math.min(14, t + 1))} aria-label="More">
          +
        </button>
      </div>
      <label className="f" htmlFor="g-minutes">
        Total time per week, in minutes (optional)
      </label>
      <MinutesInput id="g-minutes" value={minutes} onChange={setMinutes} placeholder="e.g. 180" />
      <p className="hint" style={needsTarget ? { color: 'var(--danger)' } : undefined}>
        {needsTarget
          ? 'Set a number of sessions, a time, or both.'
          : 'Set sessions, time, or both. With both, the goal ticks once you hit both.'}
      </p>
      <label className="f" htmlFor="g-types">Session types (optional)</label>
      <input className="input" id="g-types" maxLength={160} placeholder="e.g. Upper, Lower" value={sessionTypes} onChange={(e) => setSessionTypes(e.target.value)} />
      <p className="hint">Separate types with commas. Logging any type counts toward this goal&apos;s weekly total.</p>
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
  const [duration, setDuration] = useState('60')
  const [sessionType, setSessionType] = useState('')
  const goal = data.goals.find((g) => g.id === goalId)

  return (
    <Sheet onClose={onClose}>
      <h2>Add a session</h2>
      <label className="f" htmlFor="s-goal">
        Goal
      </label>
      <select className="input" id="s-goal" value={goalId} onChange={(e) => { setGoalId(e.target.value); setSessionType('') }}>
        {data.goals.map((g) => (
          <option key={g.id} value={g.id}>
            {g.emoji} {g.name}
          </option>
        ))}
      </select>
      {goal?.sessionTypes?.length ? (
        <>
          <label className="f" htmlFor="s-type">Session type</label>
          <select className="input" id="s-type" value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
            <option value="">No type</option>
            {goal.sessionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </>
      ) : null}
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
        Start time (optional)
      </label>
      <input className="input" id="s-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <label className="f" htmlFor="s-duration">
        Length, in minutes (optional)
      </label>
      <MinutesInput id="s-duration" value={duration} onChange={setDuration} placeholder="e.g. 60" />
      <p className="hint">Ticking this session logs this many minutes towards the goal's time target.</p>
      <div className="sheet-actions">
        <button
          className="btn block"
          disabled={!goalId}
          onClick={() => {
            actions.addSession({ goalId, dayOfWeek: day, time, durationMinutes: parseMinutes(duration), sessionType: sessionType || undefined })
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
  const [minutes, setMinutes] = useState('60')
  const [goalId, setGoalId] = useState(data.goals[0]?.id ?? '')
  const [sessionType, setSessionType] = useState('')
  const goal = data.goals.find((g) => g.id === goalId)

  return (
    <Sheet onClose={onClose}>
      <h2>Log for {DAY_NAMES[weekdayIndex(selected)]}</h2>
      <label className="f" htmlFor="l-minutes">
        How long, in minutes (optional)
      </label>
      <MinutesInput id="l-minutes" value={minutes} onChange={setMinutes} placeholder="e.g. 60" />
      <label className="f" htmlFor="l-goal">Goal</label>
      <select className="input" id="l-goal" value={goalId} onChange={(e) => { setGoalId(e.target.value); setSessionType('') }}>
        {data.goals.map((g) => <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}
      </select>
      {goal?.sessionTypes?.length ? (
        <>
          <label className="f" htmlFor="l-type">Session type</label>
          <select className="input" id="l-type" value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
            <option value="">No type</option>
            {goal.sessionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </>
      ) : null}
      <div className="sheet-actions">
        <button className="btn block" disabled={!goalId} onClick={() => { actions.addLog(goalId, selected, parseMinutes(minutes), sessionType || undefined); onClose() }}>
          Log session
        </button>
        <button className="btn ghost block" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Sheet>
  )
}
