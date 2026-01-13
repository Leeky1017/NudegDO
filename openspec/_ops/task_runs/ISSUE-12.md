# ISSUE-12

- Issue: #12
- Branch: task/12-persona-coach
- PR: https://github.com/Leeky1017/NudegDO/pull/14

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

### 2026-01-06 23:43 PR merge
- Command:
  - `gh pr merge 14 --auto --squash`
- Key output:
  - `✓ Squashed and merged pull request Leeky1017/NudegDO#14`
- Evidence:
  - `openspec/_ops/task_runs/ISSUE-12.md`
