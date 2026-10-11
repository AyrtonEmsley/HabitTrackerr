'use client'

import { useEffect, useRef, useState } from 'react'
import type { Actions } from '@/hooks/useWeeklyGoals'
import type { AppData } from '@/lib/types'
import {
  DAY_LETTERS,
  DAY_NAMES,
  addDays,
  fmtShort,
  fmtTime,
  getDayView,
  getProgress,
  getWeekDates,
  getWeekRange,
  parseDate,
  todayStr,
  weekdayIndex,
} from '@/lib/week'
import { CheckIcon, CloseIcon, PlusIcon } from './icons'

type Props = {
  data: AppData
  selected: string
  onSelect: (date: string) => void
  actions: Actions
  onAddGoal: () => void
  onOpenLog: () => void
}

export default function TodayView({ data, selected, onSelect, actions, onAddGoal, onOpenLog }: Props) {
  const week = getWeekRange(selected)
  const today = todayStr()
  const isThisWeek = week.start === getWeekRange(today).start
  const goalById = (id: string) => data.goals.find((g) => g.id === id)

  // Animate a goal card when it newly reaches its target.
  const prev = useRef<{ week: string; done: Set<string> } | null>(null)
  const [justCompleted, setJustCompleted] = useState<string | null>(null)
  useEffect(() => {
    const range = getWeekRange(selected)
    const done = new Set(data.goals.filter((g) => getProgress(g, data.logs, range).complete).map((g) => g.id))
    const before = prev.current
    if (before && before.week === range.start) {
      const newly = Array.from(done).find((id) => !before.done.has(id))
      if (newly) {
        setJustCompleted(newly)
        window.setTimeout(() => setJustCompleted(null), 700)
      }
    }
    prev.current = { week: range.start, done }
  }, [data.goals, data.logs, selected])

  const header = (
    <div className="top">
      <div>
        <h1>{isThisWeek ? 'This week' : `Week of ${fmtShort(week.start)}`}</h1>
        <div className="range">
          {fmtShort(week.start)} to {fmtShort(week.end)}
        </div>
      </div>
      <div className="nav">
        <button className="icon-btn" onClick={() => onSelect(addDays(selected, -7))} aria-label="Previous week">
          ‹
        </button>
        <button className="icon-btn" onClick={() => onSelect(addDays(selected, 7))} aria-label="Next week">
          ›
        </button>
      </div>
    </div>
  )

  if (data.goals.length === 0) {
    return (
      <>
        {header}
        <div className="empty">
          <h2>Set your first weekly goal</h2>
          <p>Pick something you want to do a few times a week, like gym 3 times. Then schedule the days you plan to do it.</p>
          <div className="stack">
            <button className="btn" onClick={onAddGoal}>
              Add a goal
            </button>
            <button className="btn ghost" onClick={actions.loadExample}>
              Load an example week
            </button>
          </div>
        </div>
      </>
    )
  }

  const view = getDayView(selected, data.sessions, data.logs)
  const dow = weekdayIndex(selected)

  return (
    <>
      {header}
      {!isThisWeek && (
        <div className="jump">
          <button className="pill-btn" onClick={() => onSelect(today)}>
            Jump to this week
          </button>
        </div>
      )}

      <div className="goals">
        {data.goals.map((g) => {
          const p = getProgress(g, data.logs, week)
          return (
            <div key={g.id} className={`goal ${p.complete ? 'complete' : ''} ${justCompleted === g.id ? 'just' : ''}`}>
              <div className="goal-head">
                <div className="goal-emoji">{g.emoji ?? '🎯'}</div>
                <div className="goal-name">{g.name}</div>
                {p.complete && (
                  <div className="tick" aria-label="Goal complete">
                    <CheckIcon />
                  </div>
                )}
                <div className="goal-count">
                  {Math.min(p.done, p.target)}/{p.target}
                </div>
              </div>
              <div className="segs" role="img" aria-label={`${p.done} of ${p.target} done`}>
                {Array.from({ length: g.targetPerWeek }, (_, i) => (
                  <div key={i} className={`seg ${i < p.done ? 'on' : ''}`} />
                ))}
              </div>
              {p.done > p.target && <div className="bonus">+{p.done - p.target} extra this week</div>}
            </div>
          )
        })}
      </div>

      <div className="strip">
        {getWeekDates(selected).map((d, i) => {
          const n = data.logs.filter((l) => l.date === d).length
          return (
            <button
              key={d}
              className={`day ${d === selected ? 'sel' : ''} ${d === today ? 'today' : ''}`}
              onClick={() => onSelect(d)}
              aria-label={`${DAY_NAMES[i]} ${fmtShort(d)}, ${n} logged`}
            >
              <span className="l">{DAY_LETTERS[i]}</span>
              <span className="n">{parseDate(d).getUTCDate()}</span>
              <span className="dots">
                {Array.from({ length: Math.min(n, 3) }, (_, k) => (
                  <span key={k} className="dot" />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="day-title">
        <h2>{DAY_NAMES[dow]}</h2>
        <span className="muted">
          {fmtShort(selected)}
          {selected === today ? ' · today' : ''}
        </span>
      </div>

      {view.planned.length > 0 && (
        <div className="list">
          {view.planned.map(({ session, log }) => {
            const g = goalById(session.goalId)
            if (!g) return null
            return (
              <button
                key={session.id}
                className={`row ${log ? 'done' : ''}`}
                onClick={() => actions.toggleSession(session.id, selected)}
                aria-pressed={!!log}
              >
                <span className="check">
                  <CheckIcon />
                </span>
                <span className="row-main">
                  <div className="row-name">
                    {g.emoji} {g.name}
                  </div>
                  <div className="row-sub">
                    {log ? 'Done' : 'Planned'}
                    {session.time ? ` · ${fmtTime(session.time)}` : ''}
                  </div>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {view.extra.length > 0 && (
        <>
          <div className="sub-h">{view.planned.length ? 'Also logged' : 'Logged'}</div>
          <div className="list">
            {view.extra.map((l) => {
              const g = goalById(l.goalId)
              if (!g) return null
              return (
                <div key={l.id} className="row done">
                  <span className="check">
                    <CheckIcon />
                  </span>
                  <span className="row-main">
                    <div className="row-name">
                      {g.emoji} {g.name}
                    </div>
                    <div className="row-sub">Done</div>
                  </span>
                  <button className="x" onClick={() => actions.removeLog(l.id)} aria-label={`Remove ${g.name} log`}>
                    <CloseIcon />
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {view.planned.length === 0 && view.extra.length === 0 && (
        <p className="muted" style={{ margin: '0 2px 10px' }}>
          Nothing planned or logged for {DAY_NAMES[dow]}.
        </p>
      )}

      <button className="add-row" onClick={onOpenLog}>
        <PlusIcon /> Log something else
      </button>
    </>
  )
}
