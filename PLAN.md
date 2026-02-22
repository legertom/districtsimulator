# District Simulator — AI-First Execution Plan

## Why this version exists
This plan is optimized for **LLM implementation** (Sonnet/GPT/Opus), not human coding speed.
The goal is to minimize context drift, reduce breakage, and ship in reliable increments.

---

## Core Operating Rules (Non-Negotiable)

1. **Small batch size:** each implementation task may touch **max 3–6 files**.
2. **One objective per task:** no mixed refactor + auth + data-layer in one run.
3. **Build/test gate every task:** run `npm run build` (and targeted test if available) after each task.
4. **Commit every green step:** each successful task ends with a commit.
5. **No opportunistic refactors:** only do what the current task asks.
6. **Visual parity first:** no UI behavior/appearance changes unless explicitly requested.
7. **Visual regression guard:** after each UI task, verify touched CSS modules for orphaned/renamed classes.
8. **Use semantic anchors, not line numbers** in prompts (line numbers drift quickly).
9. **If task exceeds context or starts sprawling, stop and split** into smaller subtasks.

---

## Target Architecture (Still the same destination)

- Reusable UI patterns normalized (`PageHeader`, `Modal`, `Pagination`, `FilterBar`)
- Scenario data extracted from page components into `src/data/defaults/*`
- Shared scenario state via `ScenarioContext`
- Authentication via NextAuth (Google + credentials)
- Deployment-ready env/setup for Vercel

---

## Execution Strategy (AI-Optimized)

Instead of 4 large phases, we execute **micro-phases** with checkpoints.

### Micro-Phase A — Baseline + Safety
**A1.** Capture baseline:
- Run build
- Snapshot current routes/pages behavior (quick manual list)
- Confirm branch and clean git status

**Exit criteria:** build is green; baseline documented.

---

### Micro-Phase B — Shared UI Components (create only)
**B1.** Add `PageHeader` (+ CSS module + barrel export)

**B2.** Add `Modal` (+ CSS module + barrel export)

**B3.** Add `Pagination` (+ CSS module + barrel export)

**B4.** Add `FilterBar` (+ CSS module + barrel export)

**Exit criteria:** components compile and export; no page refactors yet.

---

### Micro-Phase C — Incremental Component Adoption (page-by-page)
Refactor **one page per task** to use shared UI components.
Recommended order (lowest risk first):

1. `MyApplications.jsx`
2. `AddApplications.jsx`
3. `Badges.jsx`
4. `AccessLogs.jsx`
5. `PeoplePage.jsx`
6. `Library.jsx`
7. `SSOSettings.jsx`
8. `PortalSettings.jsx`
9. `Profile.jsx`
10. `AdminTeam.jsx`
11. `DataBrowser.jsx` (split into multiple tasks if needed)

**Exit criteria per task:**
- Visual/behavior parity maintained
- `npm run build` passes
- Commit created

---

### Micro-Phase D — Data Layer + ScenarioContext (combined) [DONE]
Create defaults and context together to avoid double-migrating imports.

**D1.** Add `src/data/defaults/` scaffold + `src/context/ScenarioContext.jsx` + app root provider wiring. [DONE]

**D2.** Extract and wire domains in batches: [DONE]
- Batch A (leaf): `team`, `applications`, `accessLogs`, `badges`, `people`
- Batch B (mid): `dashboard`, `chat`, `profile`, `ssoSettings`, `portalSettings`
- Batch C (complex/layout): `dataBrowser`, `sidebar`, `topNav`, `sisSync`

**Exit criteria per task:**
- No inline hardcoded domain data left in targeted components
- Components read through `useScenario()` for the migrated domain
- Build green
- Commit created

---

### Micro-Phase F — Auth (NextAuth) in safe slices [DONE]

**F1.** Install deps: `next-auth`, `bcryptjs`; add base auth config + route [DONE]

**F2.** Add login page UI (no route protection yet) [DONE]

**F3.** Add provider wrapper in layout + wire TopNav logout/session display [DONE]

**F4.** Add proxy protection for app routes (`src/proxy.js`, formerly `middleware.js` in older Next.js) [DONE]

**F5.** Add `.env.example` and local env guidance [DONE]

**Exit criteria:** unauthenticated users flow to `/login`, authenticated users can access app, build green.

---

### Micro-Phase G — Deployment Readiness

**G1.** Verify `.gitignore`, env docs, build output

**G2.** Produce operator checklist for Vercel + Google OAuth redirect URI

**Exit criteria:** deploy handoff checklist complete.

---

## Model-Specific Prompting Guidance

### For Sonnet 4.5
- Keep tasks tiny (3–5 files)
- Include exact expected output format ("changed files", "build result", "open questions")
- Forbid extra refactors explicitly

### For GPT-5.3
- Include acceptance tests + strict constraints
- Ask for deterministic patch set and rollback note

### For Opus 4.6
- Allow slightly broader slice, but still enforce file cap + no unrequested architecture expansion

---

## Standard Task Prompt Template (for any model)

Use this template per micro-task:

1. **Objective:** one sentence
2. **Allowed files:** explicit list
3. **Disallowed changes:** everything else
4. **Requirements:** bullets
5. **Validation:** `npm run build`
6. **Output format required:**
   - files changed
   - summary of edits
   - build result
   - risks/notes

---

## Definition of Done (Project)

- Shared UI patterns are normalized across target pages
- Data is externalized into `src/data/defaults/*`
- App reads scenario via `ScenarioContext`
- Auth works (Google + credentials), login flow complete
- Build passes cleanly
- Deployment checklist is complete and accurate

---

## Practical Reminder

This is an **LLM execution plan**, not a human sprint plan.
Speed comes from **tight loops + small green commits**, not giant prompts.