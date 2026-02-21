# Phase 6 Execution Runbook (Troubleshooting Scenarios)

## Objective
Add three troubleshooting scenarios that use Phase 5 data variants and complete Module 7 curriculum integration.

## Scenarios
1. `scenario_sync_failure`
2. `scenario_missing_teacher`
3. `scenario_stale_provisioning`

## Required outcomes
- Scenarios are playable in guided + unguided modes.
- Each scenario activates distinct dashboard/IDM error-state overrides.
- Module 7 (`mod_troubleshooting`) is added to curriculum and unlock sequence is valid.
- All new scored choices include `correct` and Phase 4 branching contract where applicable.

## Implementation sequence
1. Define scenario data overrides + narrative steps in `src/data/scenarios.js`.
2. Add troubleshooting module to `src/data/curriculum.js`.
3. Add/adjust instruction targets in existing pages only if required.
4. Add tests:
   - curriculum module presence + scenario mapping
   - scenario contract/lint coverage
   - e2e smoke for one troubleshooting scenario path
5. Run full gates.

## Gates
- `npm run lint`
- `npm test`
- `npm run e2e`
- `npm run build`

## Commit policy
- Frequent focused commits.
- No unrelated files.
- No push to main.
