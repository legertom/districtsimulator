# Architecture Report — 2026-02-16

## Current Architecture Snapshot
- Framework: Next.js App Router
- Auth: NextAuth (credentials + Google scaffold)
- Data model: centralized `defaultScenario` with domain slices
- UI structure:
  - Portal lobby mode
  - Dashboard app shell mode (sidebar + content + guidance/chat)

## Strengths
1. **Mode separation** (portal vs dashboard) is explicit and easy to reason about.
2. **Data-driven defaults** are consolidated under `src/data/defaults`.
3. **Parity batching approach** (tracker + audit docs) supports iterative delivery.

## Weaknesses
1. Some page components are still large and could be split into smaller units.
2. Workflow logic is distributed across page-level UI and instructional context without a formal state machine.
3. Route parity and workflow parity are tracked in docs, but enforcement is procedural (not automated).

## Architectural Recommendations
1. Introduce workflow modules for complex journeys (especially IDM):
   - explicit step/state descriptors
   - reusable modal flow primitives
2. Extract portal card/grid into focused components if complexity grows further.
3. Add automated parity guards:
   - route inventory checks
   - schema tests for launch targets

## Target State
- Stable two-mode app shell
- Strong data-contract tests
- E2E checks for key user journeys
- Workflow parity represented as data + testable transitions
