# Remediation Plan — 2026-02-16

## Goals
- Increase correctness and reliability
- Keep codebase DRY/readable
- Reduce regression risk during parity work

## Planned Workstreams
1. **Code correctness & lint hygiene**
   - Resolve outstanding lint blockers
   - Keep build/lint green continuously
2. **Test coverage foundation**
   - Add unit/data-contract tests for core scenario data
   - Add initial E2E smoke tests (next phase)
3. **Workflow parity hardening**
   - Prioritize IDM and modal-heavy workflows
   - Require explicit state/transition documentation
4. **Process safety**
   - Branch-first changes
   - Small coherent commits
   - Push only after local validation

## Executed in this pass
- Created branch: `qa/remediation-report-and-tests`
- Fixed lint blockers (context + JSX entity + font setup)
- Added Vitest + Testing Library baseline
- Added test scripts and initial tests
- Produced QA, architecture, and ops-readiness reports

## Next Implementation Steps
1. Add Playwright with 3 smoke flows:
   - login -> portal
   - portal launch -> dashboard
   - dashboard -> portal
2. Add CI config to enforce lint/test/build on PR.
3. Build IDM workflow matrix into explicit implementation tasks.
