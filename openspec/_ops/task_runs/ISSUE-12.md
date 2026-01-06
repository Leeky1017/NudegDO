# ISSUE-12

- Issue: #12
- Branch: task/12-persona-coach
- PR: <fill-after-created>

## Plan
- Add Coach persona module (`src/personas/coach.ts`)
- Cover system prompt + offline fallbacks + confirmation generator
- Run unit tests + typecheck, record evidence

## Runs

### 2026-01-06 23:41 npm ci
- Command:
  - `npm ci`
- Key output:
  - `added 116 packages, and audited 117 packages in 3s`
- Evidence:
  - `package-lock.json`

### 2026-01-06 23:42 tests + typecheck
- Command:
  - `npm test`
  - `npm run typecheck`
- Key output:
  - `Test Files  5 passed (5)`
  - `Tests  34 passed (34)`
- Evidence:
  - `rulebook/tasks/issue-12-persona-coach/evidence/2026-01-06-tests.txt`
