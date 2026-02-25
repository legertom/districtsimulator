> Copy-paste this entire document into a new AI chat session pointed at the District Simulator repo.
> The bot should execute all tasks, run tests, lint, and commit.

# Issue #38 — Scenario 1 Expansion: Credentials, OUs, Groups

**Sprint:** mar-02-06 | **Day:** Thursday | **Depends on:** Issues #35-37

## Overview

Expand Scenario 1 (`scenario_idm_orientation`) to walk through ALL 8 wizard steps instead of skipping steps 4-6. The scenario uses the **basic interface only** — visual format builders and pre-configured defaults. The advanced formula editor is reserved for future troubleshooting scenarios (#22-32).

**2 tasks, 0 new files, 4 modified files. Follow task order.**

After this issue:
- Scenario 1 guides users through Credentials, OUs, and Groups steps (previously skipped)
- New `checkActionGoal` triggers in wizard step components enable the scenario to track user progress
- Checkpoint questions test comprehension of each wizard area
- All wizard interactions use the basic interface (visual builders, default values)

---

## Important Context

### Current Scenario 1 Flow (11 steps, in `src/data/scenarios.js`)

The current scenario has these steps:
1. `step_setup_nav_idm` — Navigate to IDM page
2. `step_setup_add_destination` — Add Google Workspace
3. `step_setup_connect_google` — Connect with Google
4. `step_setup_nav_level` — Navigate to Management Level
5. `step_setup_choose_full` — Select Full Provisioning
6. `step_setup_nav_users` — Navigate to Select Users
7. `step_setup_select_users` — Select all 3 user types
8. `step_setup_users_assessment` — Checkpoint: "How many total users?" (40)
8a. `step_setup_users_wrong` — Retry for wrong answer
9. `step_setup_nav_preview` — **SKIP to Preview** ← THIS IS WHAT WE'RE REMOVING
10. `step_setup_provision` — Provision Google
11. `step_setup_resolution` — Wrap up

### What Changes

- Steps 1-8a: **UNCHANGED** (keep exactly as-is)
- Step 9 (`step_setup_nav_preview`): **REPLACED** with `step_setup_nav_credentials` (navigate to credentials step)
- Steps 10-11: **MOVED** to Issue #39 (will become steps ~28-32 after new steps are inserted)
- New steps 9-22 cover Credentials, OUs, and Groups

### Existing goalAction triggers

The wizard already emits these `checkActionGoal` calls:
- `wizard-step-{stepId}` — when navigating between wizard steps (from `index.jsx` line 87)
- `wizard-connect-google` — when clicking Connect (from `ConnectStep.jsx` line 34)
- `wizard-select-full-provisioning` — when selecting full provisioning (from `ManagementLevelStep.jsx` line 20)
- `wizard-select-all-users` — when all 3 types are checked (from `SelectUsersStep.jsx` line 19)
- `wizard-provision-google` — when provisioning (from `PreviewStep.jsx` line 51)

### goalAction triggers we need to ADD

The credentials step needs new triggers for the scenario to track progress:
- `credential-edit-{userType}` — when clicking "Edit" on a credential card
- `credential-next-step-{userType}` — when clicking "Next Step" in edit view (section 1 → 2)
- `credential-save-{userType}` — when clicking "Save" in edit view (section 2 → back)

### Existing `data-instruction-target` attributes (for hint arrows)

- `credential-card-{userType}` — credential card container
- `edit-credential-{userType}` — Edit button on credential card
- `edit-format-link-{userType}` — "Edit your format" link in edit view

---

## Task 1: Add checkActionGoal Triggers to Wizard Steps

### 1A: SetCredentialsStep.jsx — Add action triggers

Modify `src/components/pages/GoogleProvisioningWizard/steps/SetCredentialsStep.jsx`.

**Add import** at the top (after existing imports):
```js
import { useInstructional } from "@/context/InstructionalContext";
```

**Add hook** inside the `CredentialEditView` function component (after the `const [section, setSection]` line):
```js
const { checkActionGoal } = useInstructional();
```

**Add trigger to `handleNextStep`** (around line 164). Modify the function:

**Before:**
```js
const handleNextStep = () => {
    if (section === 1) {
        setSection(2);
    } else {
        // Section 2 → save + return to overview
        updateState({
            credentials: {
                ...state.credentials,
                [userType]: {
                    ...state.credentials[userType],
                    completed: true,
                },
            },
        });
        onBack();
    }
};
```

**After:**
```js
const handleNextStep = () => {
    if (section === 1) {
        checkActionGoal(`credential-next-step-${userType}`);
        setSection(2);
    } else {
        // Section 2 → save + return to overview
        checkActionGoal(`credential-save-${userType}`);
        updateState({
            credentials: {
                ...state.credentials,
                [userType]: {
                    ...state.credentials[userType],
                    completed: true,
                },
            },
        });
        onBack();
    }
};
```

**Also add hook inside the main `SetCredentialsStep` component** (after `const [editingType, setEditingType]` around line 420):
```js
const { checkActionGoal } = useInstructional();
```

**Add trigger to `onEdit` callbacks** — where `setEditingType` is called. Modify each `onEdit` prop:

Find:
```js
onEdit={() => setEditingType("students")}
```
Change to:
```js
onEdit={() => { checkActionGoal("credential-edit-students"); setEditingType("students"); }}
```

Do the same for `"teachers"` and `"staff"`:
```js
onEdit={() => { checkActionGoal("credential-edit-teachers"); setEditingType("teachers"); }}
onEdit={() => { checkActionGoal("credential-edit-staff"); setEditingType("staff"); }}
```

### 1B: OrganizeOUsStep.jsx — Add action triggers (if needed)

Read `src/components/pages/GoogleProvisioningWizard/steps/OrganizeOUsStep.jsx` first. The wizard's `goToStep` already emits `wizard-step-ous`. If there are Edit buttons for individual OU types, add `checkActionGoal` triggers similar to the credentials pattern. If the OUs step only has a single view (overview + inline editing), no additional triggers may be needed since the scenario's OU steps are checkpoint-only (observing defaults, not clicking Edit).

At minimum, ensure the component imports `useInstructional` and has access to `checkActionGoal` if it doesn't already.

### 1C: ConfigureGroupsStep.jsx — Add action triggers (if needed)

Same approach as 1B. Read the file first. The scenario's groups steps are also checkpoint-only (confirming 0 rules configured). At minimum ensure `useInstructional` is imported.

**Commit 1:** `feat: add checkActionGoal triggers to credential/OU/group wizard steps`

---

## Task 2: Expand Scenario 1 Steps

Modify `src/data/scenarios.js`.

### 2A: Replace step 9 and add new credential/OU/group steps

Find step 9 (`step_setup_nav_preview`) in the `scenario_idm_orientation` steps array. **Remove** steps 9, 10, and 11 (`step_setup_nav_preview`, `step_setup_provision`, `step_setup_resolution`). They will be re-added in Issue #39 after the new steps.

**Replace** with the following new steps. These go immediately after step 8a (`step_setup_users_wrong`):

```js
// ══════════════════════════════════════════════════════════
//  WIZARD STEP 4: LOGIN CREDENTIALS
// ══════════════════════════════════════════════════════════

// ── 9. Navigate to Credentials ─────────────────────
{
    id: "step_setup_nav_credentials",
    type: "task",
    checklistLabel: "Move to the Login Credentials step",
    goalAction: "wizard-step-credentials",
    nextStep: "step_setup_edit_student_creds",
    guideMessage: "Click 'Set login credentials' in the wizard sidebar.",
    alexPrompt: "Now we need to set up how Clever creates email addresses and passwords for Google accounts. Click \"Set login credentials\" in the sidebar.",
    alexCorrectResponse: "This is the credentials step. You'll configure email formats and passwords for each user type — students, teachers, and staff. Let's start with students.",
    hint: {
        target: "wizard-step-credentials",
        message: "Click 'Set login credentials' in the wizard sidebar.",
    },
    autoShowHint: true,
},
// ── 10. Edit student credentials ────────────────────
{
    id: "step_setup_edit_student_creds",
    type: "task",
    checklistLabel: "Edit student credentials",
    goalAction: "credential-edit-students",
    nextStep: "step_setup_student_creds_next",
    guideMessage: "Click 'Edit' on the Student credentials card.",
    alexPrompt: "Start with students. Click \"Edit\" on the Student credentials card.",
    alexCorrectResponse: "This shows a sample student's Clever data — Rogelio Waelchi. You can see their SIS email, student number, and other fields. Click \"Next Step\" to see the email configuration.",
    hint: {
        target: "edit-credential-students",
        message: "Click 'Edit' on the Student credentials card.",
    },
    autoShowHint: true,
},
// ── 11. Student credentials — Next Step ─────────────
{
    id: "step_setup_student_creds_next",
    type: "task",
    checklistLabel: "View student email configuration",
    goalAction: "credential-next-step-students",
    nextStep: "step_setup_student_creds_save",
    guideMessage: "Click 'Next Step' to see the email format.",
    alexPrompt: "Click \"Next Step\" to see how student emails will be generated.",
    alexCorrectResponse: "Here's the email configuration. The format uses first name + last name to create emails like \"rogeliowaelchi@cedarridgesd.org\". The format is already configured — no changes needed for now.",
    hint: {
        target: null,
        message: "Click the 'Next Step' button at the bottom.",
    },
    autoShowHint: true,
},
// ── 12. Student credentials — Save ──────────────────
{
    id: "step_setup_student_creds_save",
    type: "task",
    checklistLabel: "Save student credentials",
    goalAction: "credential-save-students",
    nextStep: "step_setup_edit_teacher_creds",
    guideMessage: "Click 'Save' to confirm the student credentials.",
    alexPrompt: "The email format looks good. Click \"Save\" to confirm the student email and password settings.",
    alexCorrectResponse: "Student credentials saved. Now let's do the same for teachers.",
    hint: {
        target: null,
        message: "Click the 'Save' button at the bottom.",
    },
    autoShowHint: true,
},
// ── 13. Edit teacher credentials ────────────────────
{
    id: "step_setup_edit_teacher_creds",
    type: "task",
    checklistLabel: "Edit teacher credentials",
    goalAction: "credential-edit-teachers",
    nextStep: "step_setup_teacher_creds_next",
    guideMessage: "Click 'Edit' on the Teacher credentials card.",
    alexPrompt: "Now teachers. Click \"Edit\" on the Teacher credentials card.",
    alexCorrectResponse: "Here's the sample teacher data — Betty Bauch. Click \"Next Step\" to see the email format.",
    hint: {
        target: "edit-credential-teachers",
        message: "Click 'Edit' on the Teacher credentials card.",
    },
    autoShowHint: true,
},
// ── 14. Teacher credentials — Next Step ─────────────
{
    id: "step_setup_teacher_creds_next",
    type: "task",
    checklistLabel: "View teacher email configuration",
    goalAction: "credential-next-step-teachers",
    nextStep: "step_setup_teacher_creds_save",
    guideMessage: "Click 'Next Step' to see the email format.",
    alexPrompt: "Click \"Next Step\" to see the teacher email format.",
    alexCorrectResponse: "Same format as students — first name + last name. Teachers get emails like \"bettybauch@cedarridgesd.org\". Click \"Save\" to confirm.",
    hint: {
        target: null,
        message: "Click the 'Next Step' button.",
    },
    autoShowHint: true,
},
// ── 15. Teacher credentials — Save ──────────────────
{
    id: "step_setup_teacher_creds_save",
    type: "task",
    checklistLabel: "Save teacher credentials",
    goalAction: "credential-save-teachers",
    nextStep: "step_setup_edit_staff_creds",
    guideMessage: "Click 'Save' to confirm teacher credentials.",
    alexPrompt: "Click \"Save\" to confirm the teacher email and password settings.",
    alexCorrectResponse: "Teacher credentials saved. One more — staff.",
    hint: {
        target: null,
        message: "Click the 'Save' button.",
    },
    autoShowHint: true,
},
// ── 16. Edit staff credentials ──────────────────────
{
    id: "step_setup_edit_staff_creds",
    type: "task",
    checklistLabel: "Edit staff credentials",
    goalAction: "credential-edit-staff",
    nextStep: "step_setup_staff_creds_next",
    guideMessage: "Click 'Edit' on the Staff credentials card.",
    alexPrompt: "Last one — staff. Click \"Edit\" on the Staff credentials card.",
    alexCorrectResponse: "Here's the sample staff member — Oswaldo Pouros, a librarian. Click \"Next Step\" to see the email format.",
    hint: {
        target: "edit-credential-staff",
        message: "Click 'Edit' on the Staff credentials card.",
    },
    autoShowHint: true,
},
// ── 17. Staff credentials — Next + Save ─────────────
{
    id: "step_setup_staff_creds_next",
    type: "task",
    checklistLabel: "View staff email configuration",
    goalAction: "credential-next-step-staff",
    nextStep: "step_setup_staff_creds_save",
    guideMessage: "Click 'Next Step' to see the email format.",
    alexPrompt: "Click \"Next Step\" to see the staff email format.",
    alexCorrectResponse: "Same pattern — first name + last name. Click \"Save\" to confirm.",
    hint: {
        target: null,
        message: "Click the 'Next Step' button.",
    },
    autoShowHint: true,
},
{
    id: "step_setup_staff_creds_save",
    type: "task",
    checklistLabel: "Save staff credentials",
    goalAction: "credential-save-staff",
    nextStep: "step_setup_creds_assessment",
    guideMessage: "Click 'Save' to confirm staff credentials.",
    alexPrompt: "Click \"Save\" to confirm the staff email and password settings.",
    alexCorrectResponse: "All credentials configured. Let me quiz you on what we just set up.",
    hint: {
        target: null,
        message: "Click the 'Save' button.",
    },
    autoShowHint: true,
},
// ── 18. Credentials checkpoint ──────────────────────
{
    id: "step_setup_creds_assessment",
    type: "checkpoint",
    checklistLabel: "Confirm student email format",
    question: "What email format is being used for students?",
    alexPrompt: "Quick check — what email format did we just configure for students?",
    alexCorrectResponse: "That's right — first name followed by last name, at the Cedar Ridge domain. Simple and consistent across all user types.",
    alexWrongResponse: "Look at the student credentials card. The format combines two name parts with the district domain.",
    choices: [
        { label: "{{name.first}}{{name.last}}@cedarridgesd.org", nextStep: "step_setup_nav_ous", correct: true },
        { label: "{{name.first}}.{{name.last}}@cedarridgesd.org", nextStep: "step_setup_creds_wrong", unguidedNextStep: "step_setup_nav_ous", correct: false },
        { label: "Their SIS email from Clever", nextStep: "step_setup_creds_wrong", unguidedNextStep: "step_setup_nav_ous", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_creds_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Confirm email format (retry)",
    question: "The format combines first name and last name with no separator. Which one is it?",
    alexPrompt: "Look again — the format uses two name variables with no dot between them.",
    choices: [
        { label: "{{name.first}}{{name.last}}@cedarridgesd.org", nextStep: "step_setup_nav_ous" },
    ],
},

// ══════════════════════════════════════════════════════════
//  WIZARD STEP 5: ORGANIZE OUs
// ══════════════════════════════════════════════════════════

// ── 19. Navigate to OUs ─────────────────────────────
{
    id: "step_setup_nav_ous",
    type: "task",
    checklistLabel: "Move to the Organize OUs step",
    goalAction: "wizard-step-ous",
    nextStep: "step_setup_ou_assessment",
    guideMessage: "Click 'Organize OUs' in the wizard sidebar.",
    alexPrompt: "Next up: Organizational Units. OUs determine where in Google's directory each user account lives. Click \"Organize OUs\" in the sidebar.",
    alexCorrectResponse: "Here's the OU configuration. Each user type gets assigned to a specific location in Google's org unit tree. Let me test your understanding.",
    hint: {
        target: "wizard-step-ous",
        message: "Click 'Organize OUs' in the wizard sidebar.",
    },
    autoShowHint: true,
},
// ── 20. OU checkpoint — student path ────────────────
{
    id: "step_setup_ou_assessment",
    type: "checkpoint",
    checklistLabel: "Identify student OU path",
    question: "Looking at the Student OU configuration, what path template organizes students?",
    alexPrompt: "Look at the Student OUs card. What path template is used to organize students into sub-OUs?",
    alexCorrectResponse: "Right — students are organized by school and grade. A 5th grader at Santa Rosa would land in /Students/Santa Rosa Elementary School/5.",
    alexWrongResponse: "Check the Student OUs card — the path uses school name and grade variables.",
    choices: [
        { label: "/Students/{{school_name}}/{{student.grade}}", nextStep: "step_setup_ou_archive_assessment", correct: true },
        { label: "/Students", nextStep: "step_setup_ou_wrong", unguidedNextStep: "step_setup_ou_archive_assessment", correct: false },
        { label: "/Users/Students/{{student.grade}}", nextStep: "step_setup_ou_wrong", unguidedNextStep: "step_setup_ou_archive_assessment", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_ou_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Identify student OU path (retry)",
    question: "The student OU path includes both school name and grade. Which option shows that?",
    alexPrompt: "Look at the student OU card again. It has two variables: school name and grade.",
    choices: [
        { label: "/Students/{{school_name}}/{{student.grade}}", nextStep: "step_setup_ou_archive_assessment" },
    ],
},
// ── 21. OU checkpoint — archive behavior ────────────
{
    id: "step_setup_ou_archive_assessment",
    type: "checkpoint",
    checklistLabel: "Understand archive behavior",
    question: "What happens to users who are no longer in Clever?",
    alexPrompt: "Check the Archive OU card. What happens when a user is removed from Clever's data?",
    alexCorrectResponse: "Correct. Archived users get moved to the archive OU and their accounts are suspended. They're not deleted — they can be recovered if needed.",
    alexWrongResponse: "Look at the Archive OU card — it says 'Move to archive OU and suspend'.",
    choices: [
        { label: "They are moved to an archive OU and suspended", nextStep: "step_setup_nav_groups", correct: true },
        { label: "They are permanently deleted from Google", nextStep: "step_setup_ou_archive_wrong", unguidedNextStep: "step_setup_nav_groups", correct: false },
        { label: "Nothing happens — they stay in their current OU", nextStep: "step_setup_ou_archive_wrong", unguidedNextStep: "step_setup_nav_groups", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_ou_archive_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Understand archive behavior (retry)",
    question: "Clever IDM moves archived users and suspends them — it never permanently deletes.",
    alexPrompt: "Look at the Archive card again. The action says 'Move to archive OU and suspend'.",
    choices: [
        { label: "They are moved to an archive OU and suspended", nextStep: "step_setup_nav_groups" },
    ],
},

// ══════════════════════════════════════════════════════════
//  WIZARD STEP 6: CONFIGURE GROUPS
// ══════════════════════════════════════════════════════════

// ── 22. Navigate to Groups ──────────────────────────
{
    id: "step_setup_nav_groups",
    type: "task",
    checklistLabel: "Move to the Configure Groups step",
    goalAction: "wizard-step-groups",
    nextStep: "step_setup_groups_assessment",
    guideMessage: "Click 'Configure groups' in the wizard sidebar.",
    alexPrompt: "Last configuration step: Groups. Google Groups let you manage email distribution lists and access control. Click \"Configure groups\" in the sidebar.",
    alexCorrectResponse: "Groups are optional. Cedar Ridge hasn't set up any group rules yet — and that's fine for initial provisioning. Let's verify.",
    hint: {
        target: "wizard-step-groups",
        message: "Click 'Configure groups' in the wizard sidebar.",
    },
    autoShowHint: true,
},
// ── 23. Groups checkpoint ───────────────────────────
{
    id: "step_setup_groups_assessment",
    type: "checkpoint",
    checklistLabel: "Confirm group configuration",
    question: "How many group rules are configured for Cedar Ridge?",
    alexPrompt: "Look at the group cards. How many rules are configured for each user type?",
    alexCorrectResponse: "Zero rules — and that's intentional. Groups are optional and Cedar Ridge will set those up later. For now, we just need email accounts and OUs. Let's move on to the summary.",
    alexWrongResponse: "Check each group card — they all show '0 rules configured'.",
    choices: [
        { label: "0 — no rules configured for any user type", nextStep: "step_setup_nav_summary", correct: true },
        { label: "3 — one rule per user type", nextStep: "step_setup_groups_wrong", unguidedNextStep: "step_setup_nav_summary", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_groups_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Confirm group configuration (retry)",
    question: "Each user type card shows the number of rules configured. What's the count?",
    alexPrompt: "Look at each card — Students, Teachers, Staff. They all say 0 rules.",
    choices: [
        { label: "0 — no rules configured", nextStep: "step_setup_nav_summary" },
    ],
},
```

### 2B: Update step 8's nextStep reference

Currently step 8 (`step_setup_users_assessment`) points correct answers to `step_setup_nav_preview`. This needs to point to the new `step_setup_nav_credentials` instead.

Find in the `step_setup_users_assessment` step:
```js
{ label: "40 users total", nextStep: "step_setup_nav_preview", correct: true },
```
Change to:
```js
{ label: "40 users total", nextStep: "step_setup_nav_credentials", correct: true },
```

Also update `step_setup_users_wrong`:
```js
{ label: "40 users total", nextStep: "step_setup_nav_preview" },
```
Change to:
```js
{ label: "40 users total", nextStep: "step_setup_nav_credentials" },
```

And update the wrong-answer `unguidedNextStep` references:
```js
{ label: "20 users total", nextStep: "step_setup_users_wrong", unguidedNextStep: "step_setup_nav_preview", correct: false },
{ label: "30 users total", nextStep: "step_setup_users_wrong", unguidedNextStep: "step_setup_nav_preview", correct: false },
```
Change to:
```js
{ label: "20 users total", nextStep: "step_setup_users_wrong", unguidedNextStep: "step_setup_nav_credentials", correct: false },
{ label: "30 users total", nextStep: "step_setup_users_wrong", unguidedNextStep: "step_setup_nav_credentials", correct: false },
```

### 2C: Temporarily terminate the scenario

The last new step (`step_setup_groups_wrong` / correct path `step_setup_groups_assessment`) points `nextStep` to `step_setup_nav_summary`. This step doesn't exist yet — it will be added in Issue #39 tomorrow.

For now, add a **temporary placeholder** summary step so the scenario is valid:

```js
// ── TEMPORARY: Placeholder for Issue #39 ────────────
{
    id: "step_setup_nav_summary",
    type: "task",
    checklistLabel: "Move to the Summary step",
    goalAction: "wizard-step-summary",
    nextStep: "step_setup_provision",
    guideMessage: "Click 'Summary' in the wizard sidebar.",
    alexPrompt: "Let's review everything in the Summary. Click \"Summary\" in the sidebar.",
    alexCorrectResponse: "Here's the summary of your complete configuration. Tomorrow we'll add more detailed steps here.",
    hint: {
        target: "wizard-step-summary",
        message: "Click 'Summary' in the wizard sidebar.",
    },
    autoShowHint: true,
},
// ── Keep existing provision + resolution steps ──────
```

**Important:** Keep the existing `step_setup_provision` and `step_setup_resolution` steps AFTER this placeholder. They should remain at the end of the steps array so the scenario can still complete.

Update `step_setup_provision`'s `nextStep` if needed — it should still point to `step_setup_resolution`.

**Commit 2:** `feat: expand Scenario 1 with credentials, OUs, and groups steps`

---

## Verification

```bash
npx eslint src/           # 0 errors
npx vitest run            # all tests pass (scenario validation should pass)
```

Manual checks:
- [ ] Start Scenario 1 in the browser
- [ ] Complete steps 1-8 (navigate to IDM, add Google, connect, management level, select users, user count)
- [ ] After user count checkpoint, scenario should advance to "Set login credentials" (not "Preview and provision")
- [ ] Walk through all 3 credential types (Edit → Next Step → Save for each)
- [ ] Credentials checkpoint should ask about student email format
- [ ] Navigate to OUs — checkpoints should ask about student OU path and archive behavior
- [ ] Navigate to Groups — checkpoint should confirm 0 rules
- [ ] After groups, scenario should advance to Summary → Provision → Resolution (using placeholder + existing steps)

## File Summary

| Action | File |
|--------|------|
| Modify | `src/data/scenarios.js` |
| Modify | `src/components/pages/GoogleProvisioningWizard/steps/SetCredentialsStep.jsx` |
| Modify | `src/components/pages/GoogleProvisioningWizard/steps/OrganizeOUsStep.jsx` (if triggers needed) |
| Modify | `src/components/pages/GoogleProvisioningWizard/steps/ConfigureGroupsStep.jsx` (if triggers needed) |
