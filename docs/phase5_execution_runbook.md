# Phase 5 Execution Runbook (Dashboard State Variations)

## Objective
Implement a scenario-driven data overlay system so dashboard pages can render default data OR scenario-specific error states.

## Scope (Phase 5)
- Add `DataVariantContext` with `DataVariantProvider` and `useDataVariant()`.
- Implement `applyOverrides()` with strict semantics:
  - Arrays: replace
  - Objects: shallow merge (1 level)
  - Primitives: replace
- Wrap dashboard shell so all page components can consume variant data.
- Migrate IDM page to variant data source.
- Add unit tests for merge semantics and no-active-scenario fallback behavior.

## Out of Scope (Phase 5)
- New troubleshooting scenarios content (Phase 6)
- Full migration of every page to use `useDataVariant`

## File Lanes
- Lane A (core): `src/context/DataVariantContext.jsx`
- Lane B (integration): `src/components/layout/DashboardShell.jsx`, IDM page component(s)
- Lane C (tests): `src/__tests__/*` for merge semantics/provider behavior

## Milestones
- M0: Baseline sync and quality gate pass
- M1: Core context + applyOverrides implemented
- M2: Dashboard integration + IDM page migration
- M3: Unit tests for overlay semantics + fallback behavior
- M4: Full project gate (`lint`, `test`, `e2e`, `build`)
- M5: Commit series complete and PR opened (no merge to main)

## Quality Gates
```bash
npm run lint
npm test
npm run e2e
npm run build
```

## Commit Policy
- Frequent, focused commits with clear messages.
- Never include unrelated files.
- Never push to `main` directly.

## Rollback
- Revert latest phase5 commits in order.
- Since no persistence shape changes are introduced, rollback is low-risk.
