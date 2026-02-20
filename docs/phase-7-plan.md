# Phase 7: Module 2 Scenarios — Provisioning Wizard Basics

## Context

Module 1 (IDM Overview & Navigation) is complete with 2 authored scenarios. Module 2 has zero authored scenarios — `isModuleEffectivelyComplete()` currently auto-satisfies it, allowing Module 3 to be unlocked. Adding Module 2 scenarios will activate the prerequisite chain: Module 3 will become locked until Module 2 is completed.

The provisioning wizard is fully built at `src/components/pages/GoogleProvisioningWizard/` with all 8 steps, but the wizard's `goToStep()` function doesn't call `checkActionGoal`, so the scenario engine can't detect wizard step navigation yet.

**Goal:** Author 2 Module 2 scenarios, wire up `checkActionGoal` in the wizard, and update tests.

## Branch
Work on `codex/integration-claude-security` — run `git checkout codex/integration-claude-security && git pull` before starting.

## Protected files (DO NOT MODIFY)
CoachMark.jsx, Sidebar.jsx, DataTable.jsx, tests/e2e/*, auth/security files

---

## Step 1: Wire `checkActionGoal` into the Wizard

**File:** `src/components/pages/GoogleProvisioningWizard/index.jsx`

3 changes:

1. **Import** `useInstructional`:
   ```js
   import { useInstructional } from "@/context/InstructionalContext";
   ```

2. **Call the hook** inside the component (after `const [toast, setToast]`):
   ```js
   const { checkActionGoal } = useInstructional();
   ```

3. **Modify `goToStep`** (line 81) to fire action goals, guarding against no-op clicks:
   ```js
   const goToStep = (stepId) => {
       if (stepId === activeStep) return;
       checkActionGoal(`wizard-step-${stepId}`);
       setStep(stepId);
   };
   ```

**Why this is safe:** Sidebar step buttons already have `data-instruction-target="wizard-step-${step.id}"` (line 137). These elements are always rendered (the sidebar is static), so coach mark hints can anchor safely — no conditionally-rendered target bug.

---

## Step 2: Author `scenario_wizard_navigation` (11 steps)

**Metadata:**
```js
id: "scenario_wizard_navigation",
customerId: "principalJones",
moduleId: "mod_provisioning_basics",
ticketSubject: "How do I set up Google provisioning?",
ticketPriority: "normal",
ticketNumber: 1003,
```

**Steps:**

| # | ID | Type | Content | Validation |
|---|-----|------|---------|------------|
| 1 | `step_wn_intro` | `message` | "I need to understand the Google provisioning wizard. Can you show me?" | Action: "Let me navigate to the IDM page first." → step 2 |
| 2 | `step_wn_nav_idm` | `task` | "I'll wait while you get to the IDM page." | `goalRoute: "idm"` → step 3. Hint → sidebar `idm`. autoShowHint |
| 3 | `step_wn_open_wizard` | `task` | "Now open the provisioning wizard." | `goalAction: "edit-provisioning"` → step 4. Hint → `edit-provisioning`. autoShowHint |
| 4 | `step_wn_count_steps` | `input` | "I can see the wizard sidebar. How many steps are there?" | `correctAnswer: "8"`, `matchMode: "exact"`. Hint → `wizard-step-connect` |
| 5 | `step_wn_first_step` | `input` | "What's the first step called?" | `correctAnswer: ["connect to google", "connect"]`, `matchMode: "oneOf"` |
| 6 | `step_wn_last_step` | `input` | "And the last step?" | `correctAnswer: ["preview and provision", "preview"]`, `matchMode: "oneOf"` |
| 7 | `step_wn_connected` | `message` | "Is Google already connected for this district?" | Actions: "Yes, it shows connected" (correct → step 8) / "No, it needs setup" (→ step 7a) |
| 7a | `step_wn_connected_wrong` | `message` | "Check again — the Connect step should show a status." | Action: "You're right, Google is already connected" → step 8 |
| 8 | `step_wn_mgmt_level` | `task` | "Click on the Management Level step so we can check the setting." | `goalAction: "wizard-step-management-level"` → step 9. Hint → `wizard-step-management-level`. autoShowHint |
| 9 | `step_wn_check_level` | `input` | "What management level is currently selected?" | `correctAnswer: ["full", "full provisioning"]`, `matchMode: "oneOf"`. successStep → step 10 |
| 10 | `step_wn_done` | `message` | "Now I understand the wizard layout. 8 steps, Google connected, full provisioning. Thanks!" | Action → `nextStep: null` |

**Answer sources:** `WIZARD_STEPS.length` = 8, `WIZARD_STEPS[0].label` = "Connect to Google", `WIZARD_STEPS[7].label` = "Preview and provision", `DEFAULT_PROVISIONING_STATE.googleConnected` = true, `DEFAULT_PROVISIONING_STATE.managementLevel` = "full"

---

## Step 3: Author `scenario_wizard_concepts` (13 steps)

**Metadata:**
```js
id: "scenario_wizard_concepts",
customerId: "marcusThompson",
moduleId: "mod_provisioning_basics",
ticketSubject: "Explain the provisioning steps before we change anything",
ticketPriority: "normal",
ticketNumber: 1004,
```

This is a conceptual/quiz scenario — mostly `message` steps with multiple-choice. No navigation required (the learner doesn't need to be in the wizard).

**Steps:**

| # | ID | Type | Content | Validation |
|---|-----|------|---------|------------|
| 1 | `step_wc_intro` | `message` | "Before we make any changes, I want to make sure we understand each step. Walk me through the 8-step wizard." | Action: "Sure, let's go through them." → step 2 |
| 2 | `step_wc_connect` | `message` | "What does the 'Connect to Google' step do?" | Actions: "Links Clever to a Google Workspace domain via OAuth" (correct → step 3) / "Imports all Google users into Clever" (→ step 2a) |
| 2a | `step_wc_connect_wrong` | `message` | "That's not quite right — connecting is about authorization, not importing users." | Action: "It authorizes Clever to manage accounts in Google Workspace" → step 3 |
| 3 | `step_wc_mgmt` | `message` | "What's the difference between Full and Password-Only management?" | Actions: "Full manages accounts, OUs, and groups; Password-Only just sets passwords" (correct → step 4) / "Full is for admins, Password-Only is for students" (→ step 3a) |
| 3a | `step_wc_mgmt_wrong` | `message` | "Not exactly. The difference is about what Clever controls in Google, not who it applies to." | Action: "Full provisioning manages accounts, OUs, and groups; Password-Only just manages passwords" → step 4 |
| 4 | `step_wc_users` | `message` | "Which user types can be provisioned?" | Actions: "Students, Teachers, and Staff" (correct → step 5) / "Only Students" (→ step 4a) |
| 4a | `step_wc_users_wrong` | `message` | "IDM can provision more than just students. What other user types does a school district have?" | Action: "Students, Teachers, and Staff" → step 5 |
| 5 | `step_wc_credentials` | `input` | "Step 4 is 'Set login credentials.' Which step number is that?" | `correctAnswer: "4"`, `matchMode: "exact"`. successStep → step 6 |
| 6 | `step_wc_ous` | `message` | "What are OUs used for in Google Workspace?" | Actions: "Organizing user accounts into folders for policy and management" (correct → step 7) / "Tracking attendance" (→ step 6a) |
| 6a | `step_wc_ous_wrong` | `message` | "OUs are a Google concept, not an attendance feature. Think about how Google organizes accounts." | Action: "OUs organize accounts into a folder structure for applying policies" → step 7 |
| 7 | `step_wc_preview` | `message` | "What happens at 'Preview and Provision'?" | Actions: "You see a preview of changes before they're applied to Google" (correct → step 8) / "It automatically syncs everything" (→ step 7a) |
| 7a | `step_wc_preview_wrong` | `message` | "Not automatic — the preview step lets you review before committing." | Action: "It shows you what will be created, updated, or archived before you apply changes" → step 8 |
| 8 | `step_wc_done` | `message` | "Good overview. Now I understand the pipeline: connect, set management level, choose users, configure credentials, organize OUs, set up groups, review, then preview and provision." | Action → `nextStep: null` |

---

## Step 4: Update Tests

**File:** `src/__tests__/TicketInbox.test.jsx`

**What breaks:** The test at lines 47-58 (`"un-authored modules auto-satisfy prerequisites (Fix 1)"`) currently asserts Module 3 is NOT locked. Once Module 2 has authored scenarios, Module 3 WILL be locked (Module 2 is its prerequisite and isn't completed in the default context).

**Changes:**

1. **Replace** the auto-satisfy test with a test that verifies Module 3 is correctly locked:
   ```js
   it("Module 3 is locked when prerequisite Module 2 is not completed", () => {
       renderInbox();
       expect(screen.getByText("Complete previous modules to unlock")).toBeInTheDocument();
   });
   ```

2. **Add** a test that Module 2 scenarios render:
   ```js
   it("renders Module 2 scenarios", () => {
       renderInbox();
       expect(screen.getByText("Provisioning Wizard Basics")).toBeInTheDocument();
       expect(screen.getByText("How do I set up Google provisioning?")).toBeInTheDocument();
       expect(screen.getByText("Explain the provisioning steps before we change anything")).toBeInTheDocument();
   });
   ```

3. **Add** a test that Module 3 unlocks when prerequisites are met:
   ```js
   it("Module 3 unlocks when Modules 1-2 are completed", () => {
       renderInbox({
           completedScenarios: new Set([
               "scenario_idm_orientation", "scenario_idm_tab_exploration",
               "scenario_wizard_navigation", "scenario_wizard_concepts",
           ]),
           completedModules: new Set(["mod_overview", "mod_provisioning_basics"]),
       });
       const ticket = screen.getByText("Change student email format to first initial + last name");
       expect(ticket).toBeInTheDocument();
       expect(screen.queryByText("Complete previous modules to unlock")).not.toBeInTheDocument();
   });
   ```

4. **Update** the "clicking open ticket" and "mode picker" tests: Module 3's credential ticket may now be locked in the default context. These tests click on the Module 3 ticket — they need `completedModules` override to unlock it, OR we target a Module 1/2 ticket instead. Simpler fix: pass the needed overrides.

---

## Verification

1. **Lint:** `npx eslint src/data/scenarios.js src/components/pages/GoogleProvisioningWizard/index.jsx src/__tests__/TicketInbox.test.jsx`
2. **Tests:** `npx vitest run` — all tests pass
3. **Build:** `npm run build` — no compilation errors
4. **Dev console:** Start dev server, check for zero `[Scenario "scenario_wizard_*"]` validation warnings
5. **Manual smoke:** Inbox shows Module 2 header with 2 tickets (#1003, #1004); Module 3 is now locked; complete Module 1 → Module 2 unlocks; complete Module 2 → Module 3 unlocks
