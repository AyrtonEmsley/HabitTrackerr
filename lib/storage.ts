import type { AppData } from './types'

/**
 * The ONLY file that knows where data lives. To move to Supabase later,
 * replace these functions (and make them async). Nothing else should touch localStorage.
 */
const STORAGE_KEY = 'weekly-goals-v1'

export const emptyData = (): AppData => ({ goals: [], sessions: [], logs: [] })

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const d = JSON.parse(raw) as Partial<AppData>
      return { goals: d.goals ?? [], sessions: d.sessions ?? [], logs: d.logs ?? [] }
    }
  } catch {
    // storage unavailable or corrupt: start empty
  }
  return emptyData()
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage full or blocked: ignore
  }
}

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
