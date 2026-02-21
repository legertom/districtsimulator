# Principal Architecture Review — District Simulator

**Date:** February 21, 2026  
**Reviewer:** Principal Software Architect (Opus-class review)  
**Scope:** Macro architecture, domain boundaries, state management, scenario engine, data layer, testing, release, scalability  
**Codebase stats:** ~78k total LOC · 106 source files (`.js/.jsx`) · ~15k source LOC · 48 CSS modules · 2k LOC scenario data · 848 LOC context engine · 19 unit tests · 4 E2E specs

---

## 1 · Executive Assessment

**TL;DR:** This is a well-structured training simulator that punches above its weight class. The domain model (scenarios → curriculum → scoring) is sound, the data-defaults/overlay system is architecturally novel, and the instructional engine is impressively capable. The codebase is **ready for its current mission** — 11 scenarios across 6 modules — but has clear structural limits that will bind at ~20–30 scenarios and ~3 concurrent content authors.

**Overall grade: B+**  
Production-quality for a single-vertical simulator. The risks are not about what's broken — they're about what will slow down if the product needs to scale horizontally (new IDPs beyond Google, multiple courses, white-label deployments).

---

## 2 · Strengths (Preserve These)

### 2.1 Declarative Scenario Engine
The step-graph model (`scenarios.js` → `InstructionalContext`) is the crown jewel. It supports branching, retry loops, guided/unguided modes, answer matching, scoring, and persistence — all driven from a single JS array. This is a surprisingly complete finite-state-machine that didn't need to be one, and it works.

### 2.2 Data Defaults/Variant Overlay System
The `DataVariantContext` + `applyOverrides()` pattern cleanly separates base mock data from scenario-specific overrides. This is the right architecture for "same UI, different data states." Only IDM currently uses `useDataVariant`; the other 15+ pages use the older `useScenario` — but the pattern is proven and ready to propagate.

### 2.3 Clean Domain Boundary in `/data/defaults/`
Each domain (IDM, portal, sidebar, team, applications, etc.) gets its own file exporting typed constants. The barrel `index.js` composes them into a single `defaultScenario` shape. This is textbook separation-of-concerns for static mock data.

### 2.4 Curriculum Abstraction
`curriculum.js` introduces courses → modules → scenarios with prerequisites and boss dialogue. This is a pedagogical model layered on top of the scenario engine — clean and extensible. The `SCENARIO_TO_MODULE` reverse lookup is O(1) and avoids N² scans.

### 2.5 Security Posture
For a training simulator, the security stack is surprisingly mature: CSP headers (dev vs. prod), rate limiting, provider gating, audit logging, redirect validation. The auth is intentionally hardcoded (`admin@clever.com`/`password`) — a documented decision, not an oversight.

### 2.6 CI Pipeline
Two-stage CI (quality → e2e) with lint, custom scenario linting, protected-path checking, unit tests, build, and Playwright E2E. The `lint-scenarios.mjs` custom linter validates scenario graph integrity at CI time. This is rare and valuable.

---

## 3 · Risks & Debt Hotspots

### 3.1 🔴 Dual Context Systems — `ScenarioContext` vs `DataVariantContext`

| Signal | Detail |
|--------|--------|
| `useScenario` consumers | **18 components** (Sidebar, TopNav, ChatPanel, PeoplePage, Profile, AdminTeam, PortalLobby, DataBrowser, AccessLogs, Badges, etc.) |
| `useDataVariant` consumers | **1 component** (IDM.jsx) |
| Root cause | `ScenarioContext` was the Phase 1 approach. `DataVariantContext` was introduced in Phase 5 with overlay semantics. Migration stalled. |

**Impact:** Two competing state trees for the same concept (mock data). Components reading from `useScenario` ignore scenario overrides. If a scenario tries to override portal data, the PortalLobby page won't see it because it reads from `useScenario()` which returns the static `defaultScenario`.

**Severity: HIGH** — This is the #1 architectural debt item. It blocks scenario variant expansion to any page except IDM.

### 3.2 🔴 Scenario File Monolith (2,024 LOC)

`src/data/scenarios.js` is a single file containing all 11 scenario definitions with ~2k lines of step graphs. At 20+ scenarios this will be:
- Unmergeable in multi-author workflows
- Impossible for AI assistants to hold in context
- A CI bottleneck (every scenario change re-lints the whole file)

### 3.3 🟡 InstructionalContext God Object (848 LOC)

This context manages: active scenario, step progression, scoring (v2 mode-aware), coach marks, hints, navigation goal checking, action goal checking, conversation history, ticket history, visited steps, module completion, localStorage persistence, state migration, dev-mode validation, and replay. It exposes **32 context values**.

It works correctly. But it's a single point of complexity that makes testing, debugging, and extension harder than it needs to be.

### 3.4 🟡 Wizard Step Components — LOC Concentration

| File | LOC | Concern |
|------|-----|---------|
| `OrganizeOUsStep.jsx` | 950 | OU tree rendering, drag semantics, modal, preview — all inline |
| `IDM.jsx` | 781 | 4-tab IDM page with provider card, sync history, exports, events — all in one component |
| `CredentialFormatEditorModal.jsx` | 539 | Format token editor with validation, preview, drag-and-drop |
| `FormatEditorModal.jsx` | 575 | OU sub-format editor — functionally duplicate with `CredentialFormatEditorModal` |
| `SetCredentialsStep.jsx` | 516 | 3-card credential layout with edit modals |

The `FormatEditorModal` ↔ `CredentialFormatEditorModal` pair is the most concerning: they implement the same token editor with different variable sets. This is a DRY violation that will compound with each new IDP.

### 3.5 🟡 145 Inline Styles in Wizard/IDM

The wizard steps and IDM page use `style={{ ... }}` extensively (~145 occurrences). This bypasses CSS modules, prevents theming, and makes responsive design harder.

### 3.6 🟡 Route/Page Definition Triplication

Dashboard pages are defined in three places that must stay in sync:
1. `src/lib/routing.js` — `DASHBOARD_PAGE_KEYS` array
2. `src/lib/dashboard-pages.js` — `DASHBOARD_PAGE_COMPONENTS` map
3. `src/components/layout/Sidebar.jsx` — nav items (via `src/data/defaults/sidebar.js`)

Adding a new page requires touching all three. There is no single-source-of-truth page registry.

### 3.7 🟢 No TypeScript

Pure JS with JSDoc-style comments. This is fine for the current size but will become a velocity drag at 200+ source files. The `normalizeStep()` function and `applyOverrides()` are the kind of shape-polymorphic code that TypeScript excels at catching errors in.

### 3.8 🟢 localStorage-Only Persistence

Progress (scores, completed scenarios, coach marks state) lives exclusively in `localStorage`. There's no server-side persistence, no user accounts with progress, no analytics pipeline. This is fine for a training tool but limits:
- Cross-device continuity
- Manager dashboards
- Cohort analytics

---

## 4 · Domain Boundary Map

```
┌──────────────────────────────────────────────────────────────┐
│                        Next.js App Shell                      │
│  /login ── /dashboard/[page] ── /dashboard/idm/provisioning  │
└───────┬──────────┬──────────────────┬────────────────────────┘
        │          │                  │
   ┌────▼────┐ ┌───▼───────┐ ┌───────▼──────────┐
   │  Auth   │ │ Dashboard │ │ Wizard (8 steps) │
   │ NextAuth│ │ 25 pages  │ │ IDM Provisioning │
   └─────────┘ └───┬───────┘ └──────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │Helpdesk │ │Guidance │ │ Layout  │
   │TicketInb│ │CoachMark│ │Sidebar  │
   │InvestigV│ │GuidePanl│ │TopNav   │
   │ConversV │ └─────────┘ │DashShell│
   │RightPanl│             └─────────┘
   └────┬────┘
        │
   ┌────▼──────────────────────────────────┐
   │         Instructional Engine          │
   │  InstructionalContext (848 LOC)       │
   │  ├─ Scenario FSM (step graph walker) │
   │  ├─ Scoring (v2 guided/unguided)     │
   │  ├─ Goal checking (nav + action)     │
   │  ├─ Coach marks / hints              │
   │  ├─ State persistence (localStorage) │
   │  └─ Dev validation                   │
   └────┬──────────────────────────────────┘
        │
   ┌────▼──────────────────────────────────┐
   │            Data Layer                 │
   │  scenarios.js (11 scenarios, 2k LOC)  │
   │  curriculum.js (6 modules, 1 course)  │
   │  characters.js (5 characters)         │
   │  defaults/ (17 domain files + barrel) │
   │  DataVariantContext (overlay engine)   │
   │  ScenarioContext (legacy, 18 consumers│
   └───────────────────────────────────────┘
```

**Key observation:** The domain boundaries are mostly clean. The biggest violation is the `ScenarioContext` ↔ `DataVariantContext` split, which creates two parallel data access paths through the same conceptual layer.

---

## 5 · Target Architecture (North Star)

### 5.1 Unified Data Context
Merge `ScenarioContext` and `DataVariantContext` into a single `SimulatorDataContext` that:
- Holds the `defaultScenario` shape as base data
- Applies active scenario overrides via `applyOverrides()`
- Exposes a single `useSimulatorData()` hook
- All 18 `useScenario()` consumers migrate to `useSimulatorData()`

### 5.2 Scenario-Per-File Architecture
```
src/data/scenarios/
  index.js                    ← barrel: export { scenarios } = [...all]
  scenario_idm_orientation.js
  scenario_idm_tab_exploration.js
  scenario_wizard_navigation.js
  ...
```
Each file exports a single scenario object. The barrel collects them. Lint, CI, and git diffs operate per-file.

### 5.3 Engine Decomposition
```
src/engine/
  InstructionalProvider.jsx   ← slim provider, delegates to hooks
  useScenarioFSM.js           ← step graph walking, branching
  useScoring.js               ← v2 mode-aware scoring
  useGoalChecking.js          ← navigation + action goal matching
  usePersistence.js           ← localStorage save/load/migrate
  useCoachMarks.js            ← hints, guided mode
  validation.js               ← dev-mode scenario graph validation
  types.js                    ← JSDoc/TS type definitions
```

### 5.4 Page Registry (Single Source of Truth)
```js
// src/lib/page-registry.js
export const PAGES = [
  { id: "dashboard", component: () => import("@/components/pages/DashboardHome"), nav: { section: "Dashboard", icon: "🏠" } },
  { id: "idm", component: () => import("@/components/pages/IDM"), nav: { section: "User management", icon: "🔑" } },
  // ...
];
```
Routing, sidebar, and component resolution all derive from this single array.

### 5.5 Format Editor Unification
Merge `FormatEditorModal` and `CredentialFormatEditorModal` into a single `TokenFormatEditor` component parameterized by:
- Variable set (SIS vs email variables)
- Preview function
- Domain suffix (for email) or path prefix (for OUs)

---

## 6 · Pragmatic 30/60-Day Plan

### Days 1–30: Foundation Fixes (Unblock Scaling)

#### Week 1–2: Context Unification
**Goal:** Single data access path for all components.

| Task | Files | Est. |
|------|-------|------|
| Rename `DataVariantContext` → `SimulatorDataContext` | `src/context/DataVariantContext.jsx` | 1h |
| Add `useScenario()` backward-compat re-export | `src/context/ScenarioContext.jsx` | 30m |
| Migrate 18 `useScenario()` consumers to `useSimulatorData()` | `src/components/pages/*.jsx`, `src/components/layout/*.jsx`, `src/components/chat/*.jsx` | 4h |
| Delete `ScenarioContext.jsx` | — | 10m |
| Update tests (`DataVariantContext.test.jsx`) | `src/__tests__/` | 1h |

**Validation:** Every page reflects scenario overrides when active. `npm test` green.

#### Week 2–3: Scenario File Split
**Goal:** One scenario per file, merge-conflict-free multi-author workflows.

| Task | Files | Est. |
|------|-------|------|
| Create `src/data/scenarios/` directory | — | 5m |
| Extract each of 11 scenarios into individual files | `src/data/scenarios/scenario_*.js` | 2h |
| Create barrel `src/data/scenarios/index.js` | — | 30m |
| Update imports in `InstructionalContext.jsx`, `TicketInbox.jsx`, tests | 5 files | 1h |
| Update `lint-scenarios.mjs` to scan directory | `scripts/lint-scenarios.mjs` | 1h |

**Validation:** `npm run lint:scenarios` passes. `npm test` green. Git blame per-scenario.

#### Week 3–4: Format Editor DRY
**Goal:** Single token editor component.

| Task | Files | Est. |
|------|-------|------|
| Create `src/components/ui/TokenFormatEditor.jsx` | new file | 4h |
| Refactor `CredentialFormatEditorModal` to delegate to `TokenFormatEditor` | existing | 2h |
| Refactor `FormatEditorModal` to delegate to `TokenFormatEditor` | existing | 2h |
| Delete duplicated logic | — | 30m |

**Validation:** OU format editing and credential format editing both work. E2E wizard spec passes.

### Days 31–60: Engine Hardening (Enable Growth)

#### Week 5–6: InstructionalContext Decomposition
**Goal:** God object → composable hooks.

| Task | Files | Est. |
|------|-------|------|
| Extract `useScenarioFSM()` (step walking, branching, advance) | `src/engine/useScenarioFSM.js` | 4h |
| Extract `useScoring()` (v2 mode-aware, increment, finalize) | `src/engine/useScoring.js` | 2h |
| Extract `usePersistence()` (save/load/migrate) | `src/engine/usePersistence.js` | 2h |
| Extract `useGoalChecking()` (nav + action goal) | `src/engine/useGoalChecking.js` | 1h |
| Slim `InstructionalProvider.jsx` to composition root | `src/engine/InstructionalProvider.jsx` | 2h |
| Move dev validation to `src/engine/validation.js` | new file | 1h |
| Port all 19 unit tests, add new hook-level tests | `src/__tests__/engine/` | 4h |

**Validation:** All existing tests pass. Engine coverage ≥ 85%. Context API unchanged (no consumer changes needed).

#### Week 7–8: Page Registry + Inline Style Cleanup
**Goal:** Single-source page definitions. CSS module coverage.

| Task | Files | Est. |
|------|-------|------|
| Create `src/lib/page-registry.js` | new file | 2h |
| Derive `DASHBOARD_PAGE_KEYS` from registry | `src/lib/routing.js` | 1h |
| Derive `DASHBOARD_PAGE_COMPONENTS` from registry | `src/lib/dashboard-pages.js` | 1h |
| Derive sidebar nav items from registry | `src/data/defaults/sidebar.js` | 2h |
| Audit and migrate top-30 inline styles to CSS modules | wizard steps, IDM.jsx | 4h |

**Validation:** Adding a new page requires editing exactly 1 file. `npm run lint` clean.

---

## 7 · Scalability Projections

| Dimension | Current Capacity | After 30-Day Plan | After 60-Day Plan |
|-----------|-----------------|--------------------|--------------------|
| Scenarios | 11 (fine) | 30+ (file-per) | 50+ |
| Content authors | 1 (merge conflicts) | 3+ (no conflicts) | 5+ |
| IDPs (Google, MS, etc.) | 1 (hardcoded Google) | 1 (same) | 2+ (format editor reuse) |
| Courses | 1 | 1 | 3+ (engine supports it) |
| Pages with variant support | 1 (IDM only) | 25 (all pages) | 25 |
| Context API surface | 32 values | 32 values | ~12 hooks |

---

## 8 · What NOT to Change

1. **The step-graph FSM model.** It's working. Don't replace it with a state machine library. The simplicity is a feature.
2. **CSS modules.** The existing module-per-component pattern is clean. Don't switch to Tailwind or styled-components mid-stream.
3. **Auth hardcoding.** Documented decision. Leave it until there's a real user management requirement.
4. **Vitest + Playwright split.** The dual test runner setup is correct for this project's needs.
5. **The `applyOverrides()` semantics.** Array-replace, object-shallow-merge, primitive-replace — this is the right overlay model. Don't change it.

---

## 9 · Summary Risk Matrix

| Risk | Severity | Likelihood | Effort to Fix | Priority |
|------|----------|------------|---------------|----------|
| Dual context systems | 🔴 High | Certain (blocks variant expansion) | ~6h | **P0** |
| Scenario monolith | 🔴 High | Near-term (>20 scenarios) | ~4h | **P0** |
| Format editor duplication | 🟡 Medium | On next IDP | ~8h | **P1** |
| InstructionalContext size | 🟡 Medium | On next major feature | ~16h | **P1** |
| Route triplication | 🟡 Medium | On next new page | ~6h | **P2** |
| Inline styles | 🟢 Low | Cosmetic/theming | ~4h | **P2** |
| No TypeScript | 🟢 Low | At 200+ files | ~40h | **P3** |
| localStorage-only persistence | 🟢 Low | On analytics requirement | ~20h | **P3** |

---

*This review is designed to be actionable within the current team velocity. Every recommendation has a concrete file path and estimated LOE. The 30-day plan addresses the two P0 items; the 60-day plan addresses P1 items. P2/P3 items are tracked but not scheduled.*
