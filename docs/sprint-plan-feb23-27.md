# Sprint Plan: Feb 23-27, 2026

## Current State

- **IDM Scenario:** 2 scenarios authored (Setting Up IDM + Exploring IDM Tabs) with guided/unguided modes
- **Data persistence:** All localStorage — no database
- **Scenario data flow:** Context system exists but not exercised end-to-end across IDM
- **Profiles:** Admin profile only. Students/teachers/staff are detail panels in Data Browser — no dedicated routes, no IDM info

---

## Monday, Feb 23 — Database Foundation

**Goal:** Stand up Supabase and design the schema for user progress.

- Set up Supabase project and connect to the app (env vars, client library)
- Design and apply migrations for core tables:
  - `user_progress` — completed scenarios, scores (guided/unguided), module completion
  - `wizard_state` — IDM provisioning wizard state (replaces localStorage)
  - `session_state` — active scenario, current step, coach marks preferences
- Create API routes (`/api/progress/*`) for read/write operations
- Wire NextAuth user sessions to the database user records
- Verify auth flow still works with DB backing

**Deliverable:** Supabase connected, schema deployed, API routes stubbed and returning data.

---

## Tuesday, Feb 24 — Progress Persistence + Scenario Data Audit

**Goal:** Migrate InstructionalContext from localStorage to DB. Audit scenario data flow.

### Morning — Progress persistence

- Refactor `InstructionalContext` to read/write from API routes instead of localStorage (keep localStorage as offline fallback)
- Migrate state versioning/migration logic to work with DB records
- Save/load: completed scenarios, scores, `idmSetupComplete`, current step
- Test: complete a scenario step, refresh, verify state persists from DB

### Afternoon — Scenario data flow audit

- Trace `DataVariantContext.applyOverrides()` end-to-end — verify scenario overrides reach IDM destination list, sync history, events
- Ensure `defaultScenario.idm` data renders correctly in all 4 IDM tabs
- Fix any data gaps where components read directly from defaults instead of going through context
- Verify the wizard state feeds back into the IDM dashboard after provisioning

**Deliverable:** User progress saves to Supabase. Scenario data flows cleanly from context to every IDM tab.

---

## Wednesday, Feb 25 — Finalize IDM Tutorial Scenario

**Goal:** Polish both IDM scenarios to be demo-ready.

### Scenario 1A — Setting Up IDM (11 steps)

- Play through end-to-end in guided mode — fix broken step transitions, stale goalActions, missing coach marks
- Play through in unguided mode — verify branching and scoring
- Ensure checkpoint assessments grade correctly
- Verify the wizard physically advances in lockstep with scenario steps
- Polish dialogue/copy for Sam character

### Scenario 1B — Exploring IDM Tabs (8 steps)

- End-to-end playthrough — verify tab navigation goals trigger correctly
- Ensure sync history, exports, and events tabs show meaningful data
- Fix checkpoint answer validation issues
- Test resolution/completion flow and score recording

### Edge cases

- Browser refresh mid-scenario (state recovery from DB)
- Switching between guided/unguided mid-flow
- Completing 1A then immediately starting 1B

**Deliverable:** Both IDM scenarios play through cleanly start-to-finish in both modes. Progress saves to DB.

---

## Thursday, Feb 26 — Clever Profiles (Students, Teachers, Staff)

**Goal:** Build dedicated profile pages with Clever IDM provisioning info.

### Profile pages

- Create `/dashboard/student-profile/[id]`, `/dashboard/teacher-profile/[id]`, `/dashboard/staff-profile/[id]`
- Register routes in `dashboard-pages.js` and page router

### Student profile

- Identity, demographics, contact, enrollment (linked sections)
- **Clever IDM section:** provisioned apps, account status, sync state, OU path, email format applied

### Teacher profile

- Identity, contact, sections taught
- **Clever IDM section:** provisioned apps, account status, sync state, OU path, credentials format

### Staff profile

- Identity, contact
- **Clever IDM section:** provisioned apps, account status, sync state, OU path

### Navigation

- Link from Data Browser detail panels to full profile pages
- Link from IDM preview/provision results to affected user profiles

**Deliverable:** Three profile page types with IDM provisioning info. Navigable from Data Browser and IDM.

---

## Friday, Feb 27 — Integration, Testing, Polish

**Goal:** Everything works together as a cohesive experience.

- Full flow test: Login → Start IDM scenario → Complete provisioning → Check IDM tabs → View profiles with IDM info → Confirm progress saved
- DB persistence: complete scenario, log out, log back in, progress intact
- Data consistency: IDM data matches profiles matches Data Browser
- Loading states, error handling, graceful localStorage fallback
- Consistent styling, navigation breadcrumbs on profile pages
- Remove dead localStorage-only code paths

---

## By End of Friday

1. **Supabase database** storing user progress, wizard state, and session data
2. **IDM tutorial (both scenarios)** polished and playable end-to-end
3. **Scenario data flowing** consistently through IDM, Data Browser, and profiles
4. **Student, Teacher, and Staff profile pages** with demographics, enrollment, and Clever IDM info
5. **Integrated experience** where provisioning visibly affects profiles and persists across sessions
