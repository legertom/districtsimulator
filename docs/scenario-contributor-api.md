# Scenario Contributor API

You are helping a contributor add a new training scenario to the Cedar Ridge District Simulator. This document is your complete specification. Follow it exactly.

---

## What This Project Is

A browser-based training simulator that teaches IT administrators how to use Clever IDM (Identity Management). Trainees receive helpdesk-style tickets and complete step-by-step investigations inside a simulated admin console. Each ticket is a "scenario."

## What You Are Building

A scenario is a JSON-like object in `src/data/scenarios.js` that defines:
- A helpdesk ticket (who sent it, what they need)
- A sequence of steps the trainee must complete (navigate pages, answer questions, type observations)

The engine is fully data-driven. You will **never** modify engine code. You will only add data.

---

## Files You Will Touch

| File | Action | Required |
|------|--------|----------|
| `src/data/scenarios.js` | Add your scenario object to the `scenarios` array | Always |
| `src/data/curriculum.js` | Add your scenario's `id` to a module's `scenarioIds` array | Always |
| `src/data/characters.js` | Add a new character object | Only if you need a new ticket sender |

**Do not modify any other files** unless your scenario requires a new `goalAction` target (rare — ask the repo owner first).

---

## Scenario Object Schema

```javascript
{
    // ── REQUIRED ──────────────────────────────────────────────────
    id: "scenario_your_snake_case_name",   // Unique. Always prefixed "scenario_"
    title: "Short Human Title",            // Internal reference only
    description: "One sentence shown on the ticket card in the inbox.",
    customerId: "principalJones",          // Key from CHARACTERS (see below)
    moduleId: "mod_overview",              // Key from COURSES modules (see below)
    ticketSubject: "Short subject line",   // Shown as ticket subject in inbox
    ticketMessage: "The full message the customer wrote. This is what the trainee reads when they open the ticket. Write it in the customer's voice — casual, realistic, sometimes confused.",
    steps: [ /* see Step Types below */ ],

    // ── OPTIONAL ──────────────────────────────────────────────────
    ticketPriority: "normal",              // "low" | "normal" | "high"
    ticketNumber: 1015,                    // Display number (e.g. "#1015")
    nextScenario: null,                    // Chain to another scenario ID, or null
    settings: {},                          // Usually empty — see Data Overrides below
}
```

---

## Step Types

There are exactly 4 step types. Every step requires `id`, `type`, and `checklistLabel`.

### 1. `task` — Trainee navigates or clicks something

```javascript
{
    id: "step_nav_idm",
    type: "task",
    checklistLabel: "Navigate to the IDM page",       // Shown in sidebar checklist
    goalRoute: "idm",                                  // OR goalAction: "some-action-id"
    nextStep: "step_next",                             // Step ID to advance to
    guideMessage: "Open the IDM page under User management.",  // Guidance panel text
    hint: {
        target: "idm",                                 // DOM element to spotlight
        message: "Click 'IDM' in the sidebar.",         // Tooltip text
    },
    autoShowHint: true,                                // Show hint immediately in guided mode
}
```

**Rules:**
- Must have either `goalRoute` (sidebar nav click) or `goalAction` (button click) — never both, never neither
- `goalRoute` values: see Nav ID Reference below
- `goalAction` values: see Action Target Reference below
- `hint.target` must match an element `id`, `data-instruction-target`, or `data-nav-id` in the DOM

### 2. `checkpoint` — Multiple choice question

```javascript
{
    id: "step_identify_provider",
    type: "checkpoint",
    checklistLabel: "Identify the provider",
    question: "What provider do you see on the IDM page?",
    choices: [
        { label: "Google Workspace", nextStep: "step_next", correct: true },
        { label: "Microsoft Entra ID", nextStep: "step_wrong_branch", unguidedNextStep: "step_next", correct: false },
    ],
    hint: {
        target: "google-provider-card",
        message: "Look at the provider card at the top.",
    },
    autoShowHint: false,
}
```

**Rules:**
- `choices` array with 2-4 options
- At least one choice must have `correct: true`
- Wrong choices (`correct: false`) must have both `nextStep` (wrong-path branch) AND `unguidedNextStep` (skip branch in unguided mode)
- Wrong-path branches should teach, then rejoin the main path
- For retry steps (wrong-path targets), set `scored: false` and omit `correct` on choices

**Retry step pattern:**
```javascript
{
    id: "step_wrong_branch",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Identify the provider (retry)",
    question: "Look again — what logo and name do you see?",
    choices: [
        { label: "Google Workspace", nextStep: "step_next" },
    ],
}
```

### 3. `observe` — Trainee types a free-text answer

```javascript
{
    id: "step_read_user_count",
    type: "observe",
    checklistLabel: "Note how many users IDM manages",
    question: "How many Google accounts is IDM managing?",
    correctAnswer: "40",
    matchMode: "exact",           // See Match Modes below
    successStep: "step_next",     // Where to go on correct answer
    guideMessage: "Look at the notification card for the user count.",
    hint: {
        target: "managed-users-notification",
        message: "Check the Tasks tab notification card.",
    },
    autoShowHint: false,
}
```

**Rules:**
- Must have `correctAnswer` and `successStep`
- `matchMode` defaults to `"exact"` if omitted

### 4. `resolution` — Final multiple choice (ends the scenario)

```javascript
{
    id: "step_resolution",
    type: "resolution",
    checklistLabel: "Report back to the customer",
    question: "Choose the best summary to report back:",
    choices: [
        { label: "Everything is healthy. Syncs run regularly and we manage 40 users.", nextStep: null, correct: true },
        { label: "IDM is down. We need to call support immediately.", nextStep: null, correct: false },
    ],
}
```

**Rules:**
- At least one choice must have `nextStep: null` (this ends the scenario)
- Typically the last step in the scenario
- Still requires `correct: true/false` on choices

---

## Match Modes (for `observe` steps)

| Mode | `correctAnswer` type | Behavior |
|------|---------------------|----------|
| `"exact"` | `string` | Case-insensitive exact match |
| `"includes"` | `string` | Answer must contain substring |
| `"regex"` | `string` | Regex test, case-insensitive |
| `"oneOf"` | `string[]` | Must exactly match any element in array |

---

## Available Characters (`customerId` values)

| ID | Name | Role | School |
|----|------|------|--------|
| `boss` | Alex Rivera | Senior IT Administrator | (district-level) |
| `principalJones` | Principal Jones | Principal | Cedar Ridge Elementary |
| `sarahChen` | Sarah Chen | IT Coordinator | Cedar Ridge Middle School |
| `marcusThompson` | Marcus Thompson | District Technology Director | (district-level) |
| `lisaWilson` | Lisa Wilson | School Secretary | Cedar Ridge Elementary |

To add a new character, append to the `CHARACTERS` object in `src/data/characters.js`:

```javascript
yourCharacterId: {
    id: "yourCharacterId",
    firstName: "First",
    lastName: "Last",
    role: "Their Role",
    school: "School Name" | null,     // null for district-level staff
    avatar: "FL",                      // Two-letter initials
    avatarColor: "#hex",               // Unique color
},
```

---

## Available Modules (`moduleId` values)

| Module ID | Title | When to use |
|-----------|-------|-------------|
| `mod_overview` | IDM Overview & Navigation | General IDM page orientation |
| `mod_provisioning_basics` | Provisioning Wizard Basics | Wizard navigation and concepts |
| `mod_credentials` | Credential Configuration | Email formats, SIS variables |
| `mod_ou_management` | OU Organization | Google OU trees, sub-OUs |
| `mod_groups` | Group Configuration | Google Groups setup |
| `mod_review_provision` | Review & Provisioning | Pre-launch review, sync management |
| `mod_troubleshooting` | Troubleshooting | Failed syncs, missing accounts, diagnostics |

Add your scenario's `id` to the matching module's `scenarioIds` array in `src/data/curriculum.js`.

**Do not create new modules.** If your scenario doesn't fit an existing module, discuss with the repo owner.

---

## Nav ID Reference (`goalRoute` values)

| Nav ID | Label |
|--------|-------|
| `dashboard` | Dashboard |
| `my-applications` | My applications |
| `add-applications` | Add applications |
| `data-browser` | Data browser |
| `sis-sync` | SIS sync |
| `sso-settings` | SSO settings |
| `access-logs` | Access logs |
| `idm` | IDM |
| `license-manager` | License manager |
| `admin-team` | Admin team |
| `portal-settings` | Portal settings |
| `profile` | Profile |

All sidebar items are already targetable for hints via `data-nav-id`.

---

## Action Target Reference (`goalAction` values)

These are pre-wired in page components. Use them as `goalAction` and `hint.target`:

| Action ID | What it does |
|-----------|-------------|
| `edit-provisioning` | Edit Google provisioning button |
| `pause-sync` | Pause/Resume Google sync button |
| `download-recent-accounts` | Download recent accounts button |
| `idm-tab-tasks` | Click the Tasks tab |
| `idm-tab-sync-history` | Click the Sync History tab |
| `idm-tab-exports` | Click the Exports tab |
| `idm-tab-events` | Click the Events tab |
| `wizard-step-{id}` | Wizard sidebar step buttons (e.g., `wizard-step-credentials`) |
| `edit-credential-{type}` | Edit button on credential card (e.g., `edit-credential-students`) |
| `edit-format-link-{type}` | "Edit your format" link (e.g., `edit-format-link-students`) |

**If your scenario needs an action target that doesn't exist**, you cannot add it yourself. Note it in your PR description and the repo owner will wire it up.

---

## Data Overrides (for troubleshooting scenarios)

If your scenario needs custom data displayed on the IDM page (e.g., failed syncs, error events), use `settings.dataOverrides`:

```javascript
settings: {
    dataOverrides: {
        idm: {
            syncHistory: [
                { destination: "Google", dateTime: "Feb 20, 2026; 04:45:53 a.m.", creates: 0, matches: 30, updates: 0, archives: 0, issues: 7, status: "Failed" },
                // ... more rows
            ],
            events: [
                { date: "Feb 20, 2026; 04:45:53 a.m.", event: "Failed", destination: "Google Workspace", user: "Betty Bauch", sisId: "teacher-4455", destinationUsername: "betty.bauch@cedarridgesd.org", userType: "Teacher", modifiedFields: [{ field: "Error", value: "Primary email already exists in Google" }] },
                // ... more rows
            ],
        },
    },
},
```

Arrays are replaced wholesale. Only use this for troubleshooting/diagnostic scenarios.

---

## Validation Rules (your scenario will be rejected if it violates these)

1. **Unique IDs** — `id` must be unique across all scenarios. Step `id`s must be unique within your scenario.
2. **Valid references** — Every `nextStep`, `successStep`, `unguidedNextStep` must point to a step ID that exists in your scenario, or be `null`.
3. **Task density >= 40%** — At least 40% of your steps must be `task` or `observe` type. If your scenario is mostly `checkpoint` steps, the linter will reject it.
4. **Required fields** — See each step type's rules above.
5. **Correct answers** — `checkpoint` and `resolution` choices must have `correct: true/false` (unless `scored: false`). At least one must be `correct: true`.
6. **Resolution termination** — `resolution` steps must have at least one choice with `nextStep: null`.
7. **Unguided paths** — Wrong choices (non-resolution) that have `nextStep` must also define `unguidedNextStep`.
8. **Customer exists** — `customerId` must be a key in `CHARACTERS`.
9. **Module exists** — `moduleId` must be a module ID in `COURSES`.

---

## Complete Workflow

### 1. Branch

```bash
git checkout main && git pull
git checkout -b scenario/short-descriptive-name
```

### 2. Write the scenario

Add your scenario object to the end of the `scenarios` array in `src/data/scenarios.js`. Place it in the section for its module (scenarios are grouped by module with comment headers).

### 3. Register it

In `src/data/curriculum.js`, add your scenario's `id` to the appropriate module's `scenarioIds` array.

### 4. Validate

Run all three checks. Fix any errors before proceeding.

```bash
npm run lint:scenarios    # Static analysis — checks IDs, references, task density
npm test                  # Vitest — runs scenario validation tests
npm run build             # Next.js build — catches import/syntax errors
```

### 5. Test locally

```bash
npm run dev
```

Open the browser, find your ticket in the inbox, and test:
- [ ] Ticket appears with correct subject, message, priority, and customer
- [ ] All steps complete in sequence (guided mode)
- [ ] Wrong-path branches show feedback and rejoin the main path
- [ ] Hints spotlight the correct DOM elements
- [ ] Free-text answers validate correctly (try wrong answers too)
- [ ] Resolution step ends the scenario
- [ ] Repeat in unguided mode (toggle coach marks off)

### 6. Commit and push

```bash
git add src/data/scenarios.js src/data/curriculum.js
git commit -m "feat: add scenario — [short description]"
git push -u origin scenario/short-descriptive-name
```

### 7. Open a PR

Title: `feat: add scenario — [short description]`

Body should include:
- **Module**: Which module it belongs to
- **Customer**: Which character sends the ticket
- **Training goal**: What the trainee learns (1 sentence)
- **Step count**: Total steps / task steps / checkpoint steps / observe steps
- **New targets needed**: Any `goalAction` or `hint.target` values that don't exist yet (or "None")

---

## Scenario Design Guidelines

### Voice and tone
- Ticket messages should sound like real people. Customers are friendly but sometimes confused.
- Questions should be clear and specific. The trainee should know exactly what you're asking.
- Retry steps should be encouraging, not punitive. "Look again" not "Wrong."

### Structure
- Start with a `task` step to navigate to the relevant page
- Alternate between `task` (do something) and `checkpoint`/`observe` (prove you understood it)
- End with a `resolution` step that summarizes the investigation
- Keep scenarios to 8-15 steps. Shorter is better.
- Wrong-path branches should be 1 step that teaches and rejoins

### Interactivity
- The 40% task density rule exists for a reason — scenarios should be hands-on, not quizzes
- Every `checkpoint` question should require looking at the actual UI, not just guessing
- `observe` steps should ask for specific values the trainee must find on the page

---

## Full Example

Here is a complete, valid scenario you can use as a template:

```javascript
{
    id: "scenario_sync_health_check",
    title: "Sync Health Check",
    description: "Investigate whether Google syncs are running on schedule and report any gaps.",
    customerId: "sarahChen",
    moduleId: "mod_overview",
    ticketSubject: "Are our Google syncs still running?",
    ticketPriority: "normal",
    ticketNumber: 1016,
    ticketMessage: "Hey! Our principal asked me if Clever is still syncing with Google. I told her 'probably' but she wants a real answer. Can you check and let me know the status?",
    nextScenario: null,
    settings: {},

    steps: [
        // 1. Navigate to IDM
        {
            id: "step_nav_idm",
            type: "task",
            checklistLabel: "Navigate to the IDM page",
            goalRoute: "idm",
            nextStep: "step_open_sync_tab",
            guideMessage: "Open the IDM page under User management.",
            hint: { target: "idm", message: "Click 'IDM' in the sidebar." },
            autoShowHint: true,
        },
        // 2. Open Sync History tab
        {
            id: "step_open_sync_tab",
            type: "task",
            checklistLabel: "Open the Sync History tab",
            goalAction: "idm-tab-sync-history",
            nextStep: "step_assess_status",
            guideMessage: "Click the Sync History tab.",
            hint: { message: "Click 'Sync History' near the top of the page." },
            autoShowHint: true,
        },
        // 3. Assess sync status
        {
            id: "step_assess_status",
            type: "checkpoint",
            checklistLabel: "Assess the sync status",
            question: "Looking at the Sync History table, what's the status of recent syncs?",
            choices: [
                { label: "All syncs completed successfully", nextStep: "step_find_last_date", correct: true },
                { label: "Multiple syncs have failed", nextStep: "step_status_wrong", unguidedNextStep: "step_find_last_date", correct: false },
            ],
            hint: { message: "Check the Status column in the table." },
            autoShowHint: false,
        },
        // 3a. Wrong branch
        {
            id: "step_status_wrong",
            type: "checkpoint",
            scored: false,
            checklistLabel: "Assess sync status (retry)",
            question: "Look at the Status column again — what do the entries say?",
            choices: [
                { label: "They show Success", nextStep: "step_find_last_date" },
            ],
        },
        // 4. Find the most recent sync date
        {
            id: "step_find_last_date",
            type: "observe",
            checklistLabel: "Find the most recent sync date",
            question: "What date and time was the most recent sync?",
            correctAnswer: "feb",
            matchMode: "includes",
            successStep: "step_resolution",
            guideMessage: "Look at the first row in the Sync History table.",
            hint: { message: "The most recent sync is the top row of the table." },
            autoShowHint: false,
        },
        // 5. Resolution
        {
            id: "step_resolution",
            type: "resolution",
            checklistLabel: "Report back to Sarah",
            question: "What should you tell Sarah?",
            choices: [
                { label: "Syncs are running on schedule. The most recent one completed successfully. Everything looks healthy.", nextStep: null, correct: true },
                { label: "Syncs have stopped and need to be restarted. Contact Clever support.", nextStep: null, correct: false },
            ],
        },
    ],
},
```

**Step count: 6 total / 2 task / 1 observe / 2 checkpoint / 1 resolution**
**Task density: 3/6 = 50%** (task + observe = interactive steps, meets the 40% minimum)
