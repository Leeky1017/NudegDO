# Proposal (ISSUE-1)

## Summary

ADDED
- `src/storage/localStorage.ts`: `TaskStorage` implementation for persisting tasks/settings in browser `localStorage`, plus import/export.

ADDED
- Unit tests for `TaskStorage` and minimal TS test tooling.

## Notes
- Uses `localStorage` key prefix `nudgedo_` per spec.
- JSON parse failures return safe defaults and log errors (no silent failures).

