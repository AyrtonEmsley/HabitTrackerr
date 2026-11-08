'use client'

import { useState } from 'react'
import type { Actions } from '@/hooks/useWeeklyGoals'
import type { AppData } from '@/lib/types'
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from './icons'

type Props = {
  data: AppData
  actions: Actions
  onEditGoal: (goalId?: string) => void
}

export default function GoalsView({ data, actions, onEditGoal }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <div className="top">
        <h1>Goals</h1>
      </div>

      {data.goals.length === 0 ? (
        <div className="empty">
          <h2>No goals yet</h2>
          <p>A goal is something you want to do a set number of times each week.</p>
          <button className="btn" onClick={() => onEditGoal()}>
            Add a goal
          </button>
        </div>
      ) : (
        <>
          <div className="list">
            {data.goals.map((g, i) => (
              <div key={g.id} className="manage">
                <div className="reorder">
                  <button
                    type="button"
                    className="reorder-btn"
                    aria-label={`Move ${g.name} up`}
                    disabled={i === 0}
                    onClick={() => actions.moveGoal(g.id, -1)}
                  >
                    <ChevronUpIcon />
                  </button>
                  <button
                    type="button"
                    className="reorder-btn"
                    aria-label={`Move ${g.name} down`}
                    disabled={i === data.goals.length - 1}
                    onClick={() => actions.moveGoal(g.id, 1)}
                  >
                    <ChevronDownIcon />
                  </button>
                </div>
                <button type="button" className="manage-main" onClick={() => onEditGoal(g.id)}>
                  <span className="goal-emoji">{g.emoji ?? '🎯'}</span>
                  <span className="row-main">
                    <div className="row-name">{g.name}</div>
                    <div className="row-sub">
                      {g.targetPerWeek} {g.targetPerWeek === 1 ? 'time' : 'times'} a week
                    </div>
                  </span>
                  <span className="muted">Edit</span>
                </button>
              </div>
            ))}
          </div>
          <button className="add-row" style={{ marginTop: 10 }} onClick={() => onEditGoal()}>
            <PlusIcon /> Add a goal
          </button>
        </>
      )}

      <div className="group">
        <h3>Data</h3>
        <div className="stack">
          <button
            className="btn ghost block"
            onClick={() => {
              if (confirmReset) {
                actions.resetAll()
                setConfirmReset(false)
              } else setConfirmReset(true)
            }}
          >
            {confirmReset ? 'Tap again to erase everything' : 'Erase all data'}
          </button>
        </div>
        <p className="muted" style={{ fontSize: 13, margin: '8px 2px 0' }}>
          Everything is saved on this device in this browser.
        </p>
      </div>
    </>
  )
}
