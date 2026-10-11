# Weekly Goals

Set weekly targets (e.g. kickboxing 3x), plan sessions on specific days, and log what you
actually did. Goals tick off when your logs reach the target. Planned sessions are only reminders.

Stack: Next.js (App Router) + TypeScript (strict). Data is stored in localStorage for now.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest: week logic
npm run typecheck
```

## Deploy

Push to GitHub, then import the repo at vercel.com/new. Next.js is auto-detected; no settings needed.

## Structure

- `lib/types.ts`    data types
- `lib/week.ts`     pure week/progress logic (tested in `lib/week.test.ts`)
- `lib/storage.ts`  the only file that touches localStorage (swap for Supabase later)
- `hooks/useWeeklyGoals.ts`  state + actions
- `components/`     UI

## Rules

Progress is derived from logs, never stored. Dates are `YYYY-MM-DD` strings. Weeks run Monday to Sunday.
