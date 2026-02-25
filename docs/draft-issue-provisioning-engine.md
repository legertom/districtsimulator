# Draft GitHub Issue: Dynamic Provisioning Engine + Wizard State Persistence

## Title
Provisioning Engine: Dynamic IDM results from wizard configuration

## Labels
`enhancement`, `sprint:feb-23-27`

## Body

## Goal
Make the IDM provisioning experience realistic and per-user. When a user configures the provisioning wizard and clicks "Provision", the app should dynamically generate IDM events from the actual Data Browser records, persist the wizard configuration to the database, and reflect the results across the IDM page and profile pages.

## Context
Currently:
- Wizard config lives only in **localStorage** (device-specific, not per-user)
- IDM events and sync history are **static mock data** in `src/data/defaults/idm.js` (10 hardcoded names that don't match Data Browser records)
- Clicking "Provision" in the wizard only sets `idmSetupComplete = true` and shows a toast — no actual computation happens
- The `wizard_state` Supabase table exists but has never been used

After this issue:
- Wizard config persisted to **Supabase `wizard_state` table** per user (same dual-write pattern as progress)
- Clicking "Provision" generates **dynamic IDM events** from real Data Browser records using the wizard's credential/OU templates
- IDM Events tab shows **generated events** (not hardcoded ones)
- Sync History shows **computed counts** (e.g., "Created 200 students, 45 teachers, 15 staff")
- Profile pages (Issue #20) match by **person ID** instead of name heuristics

## Part 1: Wizard State Persistence

### API Route
- [ ] Restore `src/app/api/progress/wizard/route.js` (GET/PUT)
  - GET: Return authenticated user's wizard state from `wizard_state` table
  - PUT: Upsert wizard config as JSONB blob
  - Auth checks: same pattern as `/api/progress/session`

### Client Functions
- [ ] Add to `src/lib/progressApi.js`:
  - `fetchWizardStateFromApi()` — GET from `/api/progress/wizard`
  - `saveWizardStateToApi(wizardData)` — PUT to `/api/progress/wizard`
  - `createDebouncedWizardSave()` — returns `{ debouncedSave, cancel, flush }`

### Wizard Integration
- [ ] Modify `src/components/pages/GoogleProvisioningWizard/index.jsx`:
  - Phase 1: Load from localStorage (instant, as now)
  - Phase 2: Fetch from Supabase, merge if newer (same pattern as InstructionalContext)
  - On state change: dual-write to localStorage + debounced API save
  - On unmount: flush pending saves

### InstructionalContext Integration
- [ ] Modify Phase 2 in `src/context/InstructionalContext.jsx`:
  - Parallel fetch: progress + session state + wizard state
  - Apply wizard state to localStorage if DB version is newer

## Part 2: Provisioning Engine

### Engine Function
- [ ] Create `src/lib/provisioningEngine.js`:
  - `generateProvisioningResults(wizardConfig, dataBrowserData)` → `{ events, syncSummary }`
  - Iterates over selected user types (students/teachers/staff based on `provisionStudents`/`provisionTeachers`/`provisionStaff`)
  - For each person record, generates an IDM event:
    - Applies email template → `destinationUsername`
    - Applies OU template → `currentOU`
    - Generates a mock Clever ID
    - Sets event type to "Created"
    - Includes `modifiedFields` and `allModifiedData`
  - Computes sync summary: `{ creates, matches, updates, archives, issues }`

### Template Application
- [ ] `applyEmailTemplate(template, domain, person)` — handles `{{name.first}}`, `{{name.last}}`, `{{name.first_initial}}`, etc.
- [ ] `applyOUTemplate(template, person)` — handles `{{school_name}}`, `{{student.grade}}`, `{{staff.department}}`, etc.
- [ ] Handle fallback email formats when primary generates duplicates

### State Storage
- [ ] Store generated results in `wizard_state.metadata` JSONB column:
  ```json
  {
    "wizard_data": { ...full wizard config... },
    "provisioning_results": {
      "events": [...generated events...],
      "sync_summary": { creates: 200, matches: 0, updates: 0, archives: 0, issues: 0 },
      "generated_at": "2026-02-26T..."
    }
  }
  ```

## Part 3: Wire Dynamic Data to UI

### IDM Page
- [ ] Modify `src/components/pages/IDM.jsx`:
  - When `idmSetupComplete === true`, read generated events from wizard state (not static defaults)
  - Events tab: show generated events (with Data Browser person IDs for linking)
  - Sync History: show computed sync summary as the most recent entry
  - Fall back to static defaults if no generated data exists

### Profile Pages (depends on Issue #20)
- [ ] Modify `src/components/pages/profiles/CleverIDMSection.jsx`:
  - Match by person ID (from generated events) instead of name heuristics
  - Show actual provisioned data from generated events

### Preview Step
- [ ] Modify `src/components/pages/GoogleProvisioningWizard/steps/PreviewStep.jsx`:
  - On "Refresh Preview": run provisioning engine, store results in wizard state
  - Show computed counts (accounts to create/update/archive)
  - Show preview details table with real person names

## Part 4: Tests

- [ ] Unit tests for `provisioningEngine.js`:
  - Email template application (various formats)
  - OU template application
  - Event generation from student/teacher/staff records
  - Sync summary computation
- [ ] Unit tests for wizard state API (fetchWizardStateFromApi, saveWizardStateToApi)
- [ ] Integration: verify generated events appear on IDM page
- [ ] Integration: verify profile IDM section matches by person ID

## Deliverable
Realistic, per-user provisioning flow: configure wizard → provision → see results on IDM page and profiles. Wizard state and provisioning results persisted to Supabase per user.

## Dependencies
- Issue #20 (Profile pages) — for the profile-level IDM integration
- `wizard_state` table must exist in Supabase (already verified)

## Notes
- The `wizard_state` table already exists with columns: `id`, `user_id`, `wizard_data` (jsonb), `created_at`, `updated_at`
- A `/api/progress/wizard` route was previously created and deleted — can use git history as reference
- Dual-write pattern (localStorage + Supabase) is well-established in the codebase
- The `DEFAULT_PROVISIONING_STATE` in `idm-provisioning.js` should remain as the initial state for returning users, but generated results should override the static preview data
