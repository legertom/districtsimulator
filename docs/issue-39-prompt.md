> Copy-paste this entire document into a new AI chat session pointed at the District Simulator repo.
> The bot should execute all tasks, run tests, lint, and commit.

# Issue #39 — Scenario 1: Summary + Provision + Integration

**Sprint:** mar-02-06 | **Day:** Friday | **Depends on:** Issues #35-38

## Overview

Complete the expanded Scenario 1 with Summary and Preview/Provision steps. Wire the scenario to the provisioning engine so users see dynamic results. Run full integration testing.

**2 tasks, 0 new files, 3 modified files. Follow task order.**

After this issue:
- Scenario 1 covers all 8 wizard steps end-to-end (~32 steps total)
- Summary step has comprehension checkpoints
- Preview step teaches "Refresh" and shows dynamic preview stats from the provisioning engine
- After provisioning, the scenario directs users to check the IDM Events tab where they see dynamic events
- Resolution wrap-up reflects the full configuration journey

---

## Important Context

### Current State After Issue #38

Scenario 1 now has steps through wizard step 6 (Configure Groups). The last step points to `step_setup_nav_summary` which was added as a temporary placeholder. Issue #38 also kept the existing `step_setup_provision` and `step_setup_resolution` steps.

### What This Issue Does

1. **Replace** the temporary `step_setup_nav_summary` placeholder with the real Summary steps
2. **Replace** the existing `step_setup_provision` step with a more detailed Preview + Provision flow
3. **Add** post-provisioning verification steps (check Events tab)
4. **Update** the `step_setup_resolution` wrap-up text
5. **Add** a `checkActionGoal` trigger for the "Refresh" button on PreviewStep

### The Provisioning Engine (from Issue #35)

When the user clicks "Refresh" on the Preview step, the provisioning engine runs and:
- Generates 40 IDM events (20 students, 10 teachers, 10 staff)
- Updates the preview stats (Accounts to Create: 40)
- Stores results in `localStorage("idm-provisioning-results")`

When the user clicks "Provision Google":
- Engine runs one final time
- Results + sync history stored in localStorage
- `idmSetupComplete` is set to true
- Wizard exits back to IDM page

After provisioning, the IDM Events tab (wired in Issue #36) shows the 40 dynamically generated events.

---

## Task 1: Add Refresh goalAction to PreviewStep

Modify `src/components/pages/GoogleProvisioningWizard/steps/PreviewStep.jsx`.

In the `handleRefresh` function (which was rewritten in Issue #35 to run the provisioning engine), add a `checkActionGoal` call:

Find the `handleRefresh` function. At the beginning of the function, add:
```js
checkActionGoal("wizard-refresh-preview");
```

This allows the scenario to detect when the user clicks "Refresh" on the preview step.

Also add a `data-instruction-target` attribute to the Refresh button for hint arrows. Find:
```jsx
<button className={styles.previewActionLink} onClick={handleRefresh}>
    <RefreshIcon /> Refresh
</button>
```
Change to:
```jsx
<button className={styles.previewActionLink} data-instruction-target="preview-refresh-btn" onClick={handleRefresh}>
    <RefreshIcon /> Refresh
</button>
```

**Commit 1:** `feat: add refresh goalAction and instruction target to PreviewStep`

---

## Task 2: Complete Scenario 1 Steps (Summary + Preview/Provision + Post-Verification)

Modify `src/data/scenarios.js`.

### 2A: Replace the temporary summary placeholder and existing provision/resolution steps

In the `scenario_idm_orientation` steps array, find and **remove** these three steps:
1. `step_setup_nav_summary` (the temporary placeholder from Issue #38)
2. `step_setup_provision` (the old provision step)
3. `step_setup_resolution` (the old resolution step)

**Replace all three** with the following new steps:

```js
// ══════════════════════════════════════════════════════════
//  WIZARD STEP 7: SUMMARY
// ══════════════════════════════════════════════════════════

// ── 24. Navigate to Summary ─────────────────────────
{
    id: "step_setup_nav_summary",
    type: "task",
    checklistLabel: "Move to the Summary step",
    goalAction: "wizard-step-summary",
    nextStep: "step_setup_summary_level_check",
    guideMessage: "Click 'Summary' in the wizard sidebar.",
    alexPrompt: "Almost done! The Summary gives you a bird's eye view of everything you just configured. Click \"Summary\" in the sidebar.",
    alexCorrectResponse: "Here's the complete configuration summary. Take a moment to review — this shows your management level, user types, credentials, OUs, and groups all in one place.",
    hint: {
        target: "wizard-step-summary",
        message: "Click 'Summary' in the wizard sidebar.",
    },
    autoShowHint: true,
},
// ── 25. Summary checkpoint — management level ───────
{
    id: "step_setup_summary_level_check",
    type: "checkpoint",
    checklistLabel: "Confirm management level in summary",
    question: "According to the summary, what management level is selected?",
    alexPrompt: "Look at the Management Level section of the summary. What option did we choose for Cedar Ridge?",
    alexCorrectResponse: "Full Provisioning and Password Management — the most comprehensive option. Clever handles account creation, updates, archiving, and passwords.",
    alexWrongResponse: "Check the first section of the summary — Management Level.",
    choices: [
        { label: "Full Provisioning and Password Management", nextStep: "step_setup_summary_users_check", correct: true },
        { label: "Password Management only", nextStep: "step_setup_summary_level_wrong", unguidedNextStep: "step_setup_summary_users_check", correct: false },
        { label: "Sync only", nextStep: "step_setup_summary_level_wrong", unguidedNextStep: "step_setup_summary_users_check", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_summary_level_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Confirm management level (retry)",
    question: "Look at the first card in the summary. We chose the most comprehensive option.",
    alexPrompt: "The summary shows the management level at the top. We chose the option that handles everything.",
    choices: [
        { label: "Full Provisioning and Password Management", nextStep: "step_setup_summary_users_check" },
    ],
},
// ── 26. Summary checkpoint — user types ─────────────
{
    id: "step_setup_summary_users_check",
    type: "checkpoint",
    checklistLabel: "Confirm user types in summary",
    question: "How many user types are being provisioned according to the summary?",
    alexPrompt: "Look at the Select Users section. How many user types did we enable?",
    alexCorrectResponse: "Three user types — the whole Cedar Ridge district is getting managed. That's 40 total accounts.",
    alexWrongResponse: "Count the user types listed under Select Users — we enabled all three.",
    choices: [
        { label: "3 — Students, Teachers, and Staff", nextStep: "step_setup_nav_preview", correct: true },
        { label: "2 — Students and Teachers", nextStep: "step_setup_summary_users_wrong", unguidedNextStep: "step_setup_nav_preview", correct: false },
        { label: "1 — Students only", nextStep: "step_setup_summary_users_wrong", unguidedNextStep: "step_setup_nav_preview", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_summary_users_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Confirm user types (retry)",
    question: "We enabled all three user types in step 3. The summary should show all of them.",
    alexPrompt: "Check the Select Users summary — we checked Students, Teachers, AND Staff.",
    choices: [
        { label: "3 — Students, Teachers, and Staff", nextStep: "step_setup_nav_preview" },
    ],
},

// ══════════════════════════════════════════════════════════
//  WIZARD STEP 8: PREVIEW AND PROVISION
// ══════════════════════════════════════════════════════════

// ── 27. Navigate to Preview ─────────────────────────
{
    id: "step_setup_nav_preview",
    type: "task",
    checklistLabel: "Move to Preview and Provision",
    goalAction: "wizard-step-preview",
    nextStep: "step_setup_refresh_preview",
    guideMessage: "Click 'Preview and provision' in the wizard sidebar.",
    alexPrompt: "Time for the moment of truth. Click \"Preview and provision\" in the sidebar to see what Clever will do with your configuration.",
    alexCorrectResponse: "This is the Preview step. Before provisioning, you should always refresh the preview to see exactly what will happen. Let's do that now.",
    hint: {
        target: "wizard-step-preview",
        message: "Click 'Preview and provision' in the wizard sidebar.",
    },
    autoShowHint: true,
},
// ── 28. Refresh the preview ─────────────────────────
{
    id: "step_setup_refresh_preview",
    type: "task",
    checklistLabel: "Refresh the preview",
    goalAction: "wizard-refresh-preview",
    nextStep: "step_setup_preview_assessment",
    guideMessage: "Click 'Refresh' to generate the preview.",
    alexPrompt: "Click the \"Refresh\" button to generate a fresh preview based on your configuration. This shows exactly what accounts will be created.",
    alexCorrectResponse: "Preview refreshed! Look at the numbers — the \"Accounts to Create\" count shows how many Google accounts Clever will make.",
    hint: {
        target: "preview-refresh-btn",
        message: "Click the 'Refresh' button to update the preview.",
    },
    autoShowHint: true,
},
// ── 29. Preview checkpoint — account count ──────────
{
    id: "step_setup_preview_assessment",
    type: "checkpoint",
    checklistLabel: "Confirm account count",
    question: "How many Google accounts will be created?",
    alexPrompt: "Look at the \"Accounts to Create\" number. How many Google accounts will Clever create for Cedar Ridge?",
    alexCorrectResponse: "40 accounts — 20 students, 10 teachers, 10 staff. Every user in the district gets a Google account.",
    alexWrongResponse: "Check the 'Accounts to Create' stat at the top of the preview.",
    choices: [
        { label: "40 accounts", nextStep: "step_setup_provision", correct: true },
        { label: "20 accounts", nextStep: "step_setup_preview_wrong", unguidedNextStep: "step_setup_provision", correct: false },
        { label: "0 accounts", nextStep: "step_setup_preview_wrong", unguidedNextStep: "step_setup_provision", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_preview_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Confirm account count (retry)",
    question: "We selected 20 students + 10 teachers + 10 staff. What's the total?",
    alexPrompt: "The preview shows all user types combined. Add them up: 20 + 10 + 10.",
    choices: [
        { label: "40 accounts", nextStep: "step_setup_provision" },
    ],
},
// ── 30. Provision Google ────────────────────────────
{
    id: "step_setup_provision",
    type: "task",
    checklistLabel: "Provision Google accounts",
    goalAction: "wizard-provision-google",
    nextStep: "step_setup_check_events",
    guideMessage: "Click the 'Provision Google' button.",
    alexPrompt: "Everything looks right. Go ahead — click \"Provision Google\" to create 40 Google accounts for Cedar Ridge.",
    alexCorrectResponse: "Provisioning complete! Clever has created Google accounts for all 40 users based on your configuration. Let's verify the results.",
    hint: {
        target: "provision-google-btn",
        message: "Click the 'Provision Google' button at the bottom.",
    },
    autoShowHint: true,
},
// ── 31. Check the Events tab ────────────────────────
{
    id: "step_setup_check_events",
    type: "task",
    checklistLabel: "Check the IDM Events tab",
    goalAction: "idm-tab-events",
    nextStep: "step_setup_events_assessment",
    guideMessage: "Click the 'Events' tab on the IDM page.",
    alexPrompt: "You're back on the IDM page. Click the \"Events\" tab to see every account that was just created.",
    alexCorrectResponse: "Here are all the provisioning events. Each row represents a Google account that Clever just created — you can see the user name, their new email address, and which OU they were placed in.",
    hint: {
        target: "events-tab",
        message: "Click the 'Events' tab to see provisioning results.",
    },
    autoShowHint: true,
},
// ── 32. Events checkpoint ───────────────────────────
{
    id: "step_setup_events_assessment",
    type: "checkpoint",
    checklistLabel: "Identify event types",
    question: "What type of event do you see for the provisioned users?",
    alexPrompt: "Look at the event rows. What does the \"Event\" column say for each user?",
    alexCorrectResponse: "Created — every single one. That means Clever made brand new Google accounts for all 40 users. If we ran a sync tomorrow, they'd show as \"Matched\" instead.",
    alexWrongResponse: "Look at the Event column in the table — the first word in each row tells you what happened.",
    choices: [
        { label: "Created — each user has a new Google account", nextStep: "step_setup_resolution", correct: true },
        { label: "Matched — existing accounts were linked", nextStep: "step_setup_events_wrong", unguidedNextStep: "step_setup_resolution", correct: false },
        { label: "Updated — existing accounts were modified", nextStep: "step_setup_events_wrong", unguidedNextStep: "step_setup_resolution", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_events_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Identify event types (retry)",
    question: "These are brand new accounts. What word describes creating something new?",
    alexPrompt: "This was the first provisioning run — no accounts existed before. Each one was newly 'Created'.",
    choices: [
        { label: "Created — new accounts were made", nextStep: "step_setup_resolution" },
    ],
},
// ── 33. Resolution ──────────────────────────────────
{
    id: "step_setup_resolution",
    type: "resolution",
    checklistLabel: "Wrap up",
    question: "How would you summarize what you just did?",
    alexPrompt: "OK — if someone asked you \"what did you set up today?\", what would you say?",
    alexCorrectResponse: "That's a great summary. You just completed your first full IDM setup — from connecting Google to verifying the provisioned accounts. Welcome to the team.",
    choices: [
        { label: "I connected Google Workspace, chose full provisioning, selected all user types, configured email templates and OUs, reviewed the summary, and provisioned 40 Google accounts.", nextStep: null, correct: true },
        { label: "I browsed the IDM page and checked some tabs.", nextStep: null, correct: false },
    ],
},
```

### 2B: Add goalAction for Events tab

The scenario step `step_setup_check_events` uses `goalAction: "idm-tab-events"`. This requires the IDM page to emit a `checkActionGoal` when the Events tab is clicked.

Modify `src/components/pages/IDM.jsx`. Find where the tab change handler is (where `setActiveTab` is called). When the "events" tab is selected, add:

```js
checkActionGoal("idm-tab-events");
```

Find the Tabs component or the `setActiveTab` call. If the IDM page uses the `Tabs` component from `@/components/ui`, look for the `onChange` or `onTabChange` handler. When `tab === "events"`:

```js
const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "events") {
        checkActionGoal("idm-tab-events");
    }
};
```

Also add a `data-instruction-target="events-tab"` attribute to the Events tab element for hint arrows.

**Commit 2:** `feat: complete Scenario 1 with summary, provision, and events verification steps`

---

## Verification

```bash
npx eslint src/           # 0 errors
npx vitest run            # all tests pass (scenario validation must pass)
```

### Full end-to-end scenario test (manual)

Run Scenario 1 from start to finish in the browser:

1. **Steps 1-8:** Navigate to IDM → Add Google → Connect → Management Level (Full) → Select Users (all 3) → User count checkpoint (40)
2. **Steps 9-18:** Set Login Credentials for each type (Edit → Next Step → Save × 3) → Email format checkpoint
3. **Steps 19-23:** Organize OUs → OU path checkpoint → Archive checkpoint → Configure Groups → Groups checkpoint (0 rules)
4. **Steps 24-26:** Summary → Management level checkpoint → User types checkpoint
5. **Steps 27-29:** Preview → Refresh (runs engine, shows 40 creates) → Account count checkpoint
6. **Step 30:** Provision Google → accounts created
7. **Steps 31-33:** Events tab → event type checkpoint (Created) → Resolution wrap-up

**Verify dynamic data:**
- [ ] After provisioning, IDM Events tab shows 40 "Created" events (not the old static 19)
- [ ] Each event has a real email (e.g., `annamariefeest@cedarridgesd.org`) and OU path
- [ ] "Open Profile" links work on generated events
- [ ] Profile "Clever IDM Information" card shows the provisioned email and Clever ID

**Verify scenario validation:**
- [ ] `npx vitest run src/__tests__/scenario-validation.test.js` passes
- [ ] All step IDs are unique
- [ ] All `nextStep` references point to valid step IDs
- [ ] All `unguidedNextStep` references point to valid step IDs

## File Summary

| Action | File |
|--------|------|
| Modify | `src/data/scenarios.js` |
| Modify | `src/components/pages/GoogleProvisioningWizard/steps/PreviewStep.jsx` |
| Modify | `src/components/pages/IDM.jsx` |
