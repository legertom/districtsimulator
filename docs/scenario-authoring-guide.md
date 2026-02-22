# Scenario Authoring Guide

How to build new training scenarios for the District Simulator. This guide is intended for agents (human or AI) who need to rapidly create new ticket scenarios.

> **For AI-assisted contributors:** If you're using an AI assistant to build a new scenario and submit a PR, see [`scenario-contributor-api.md`](./scenario-contributor-api.md) — it's a self-contained spec optimized for that workflow.

---

## Quick Start

**To add a new scenario, you need to touch at most 2 files:**

1. `src/data/scenarios.js` — add a scenario object to the `scenarios` array
2. The target page component(s) — add `id` or `data-instruction-target` attributes to elements you want coach marks to highlight

No changes to the engine (`InstructionalContext.jsx`), chat panel, or guidance components are needed.

---

## Architecture Overview

```
scenarios.js          → Declarative scenario data (steps, answers, hints)
     ↓
InstructionalContext   → Engine that runs scenarios (don't modify)
     ↓
ChatPanel             → Renders ticket queue, messages, actions, input
CoachMark             → Renders spotlight overlay on hint targets
GuidancePanel         → Renders "TRAINING GUIDE" bar below TopNav
```

The system is **data-driven**: the engine reads scenario definitions and automatically handles ticket queuing, step progression, answer validation, coach marks, and scoring.

---

## Scenario Object Schema

```javascript
{
    id: "scenario_my_new_scenario",        // Unique ID, snake_case, prefixed with "scenario_"
    title: "Human-readable Title",          // Short title for internal reference
    description: "Help District Admin...", // Shown on the ticket card in chat
    nextScenario: "scenario_another" | null, // Chain to another scenario (or null for last)
    settings: {},                           // Reserved for page-specific flags (rarely needed)
    steps: [ /* array of step objects */ ]
}
```

### Chaining

Set `nextScenario` to link scenarios together. The user must manually click the next ticket — chaining just defines the intended order.

To insert a new scenario into an existing chain:
1. Find the scenario whose `nextScenario` points to what comes after yours
2. Change its `nextScenario` to your new scenario's ID
3. Set your scenario's `nextScenario` to the one that was previously next

---

## Step Types

There are 4 step types you'll commonly use:

### 1. `message` — Customer sends a message

The customer says something and the trainee picks a response.

```javascript
{
    id: "step_greeting",
    type: "message",
    text: "Hi! I need help with something.",
    sender: "customer",
    actions: [
        { label: "I can help with that!", nextStep: "step_next" },
        { label: "Let me check on that.", nextStep: "step_next" },
        // Wrong-path branch:
        { label: "Try the Help Center.", nextStep: "step_wrong_path" }
    ]
}
```

**Rules:**
- `sender` is almost always `"customer"` (the person they're helping)
- `actions` are button choices shown in the chat input area
- Each action needs `label` (button text) and `nextStep` (step ID to go to, or `null` to end)
- Use wrong-path branches to teach — let the user pick a wrong answer, get feedback, then redirect back

### 2. `task` — Navigate or perform an action

The trainee must navigate to a page or click a specific element.

```javascript
// Navigation task (checks sidebar nav):
{
    id: "step_go_to_page",
    type: "task",
    text: "OK, let me know when you get there.",        // Customer message (or null)
    sender: "customer",
    goalRoute: "data-browser",                           // Sidebar nav ID to match
    nextStep: "step_after_nav",
    guideMessage: "Navigate to the 'Data browser' page", // Shown in guidance panel
    hint: {
        target: "data-browser",                          // Element to spotlight
        message: "Click 'Data browser' in the sidebar."  // Tooltip text
    },
    autoShowHint: true                                   // Show hint immediately in guided mode
}

// Action task (checks button click):
{
    id: "step_click_button",
    type: "task",
    text: "Go ahead and click that button.",
    sender: "customer",
    goalAction: "edit-provisioning",                      // Action ID to match
    nextStep: "step_after_click",
    guideMessage: "Click the 'Edit Google provisioning' button.",
    hint: {
        target: "edit-provisioning",
        message: "Click the 'Edit Google provisioning' button."
    },
    autoShowHint: true
}
```

**Navigation goals** (`goalRoute`): The system detects these automatically when the user clicks a sidebar nav item. The sidebar nav ID must match exactly (check `src/data/defaults/sidebar.js` for IDs).

**Action goals** (`goalAction`): The target page component must call `checkActionGoal("your-action-id")` when the action happens. You'll need to wire this up in the page component (see "Adding Hint Targets" below).

### 3. `input` — Trainee types an answer

The trainee types a response that gets validated.

```javascript
{
    id: "step_answer_question",
    type: "input",
    text: "What's the District ID?",                     // Customer question (or null)
    sender: "customer",
    guideMessage: "Find and enter the District ID",      // Guidance panel text
    correctAnswer: "6f2a9c18b0d4e7a3c9f1d2b6",          // Expected answer
    matchMode: "exact",                                  // How to match (see below)
    successStep: "step_correct",                         // Go here when correct
    hint: {
        target: "district-id-val",                       // Element to spotlight
        message: "Look near the top of the page."        // Tooltip text
    },
    autoShowHint: true
}
```

### 4. `action` — Display choices without a message

Same as `message` but with `text: null` — just shows action buttons.

---

## Answer Match Modes

The `matchMode` field controls how `correctAnswer` is validated. If omitted, defaults to `"exact"`.

| Mode | `correctAnswer` type | Behavior | Example |
|------|---------------------|----------|---------|
| `"exact"` | `string` | Must match exactly (case-insensitive) | `"maytonlyceum.com"` |
| `"includes"` | `string` | Answer must contain this substring | `"edit google provisioning"` matches user typing "Click Edit Google provisioning" |
| `"regex"` | `string` (regex pattern) | Answer must match regex (case-insensitive) | `"^(yes|yeah|yep)$"` |
| `"oneOf"` | `string[]` (array) | Answer must exactly match any element | `["credentials", "4", "step 4", "set login credentials"]` |

### When to use each:

- **`exact`** — The answer is a specific value (IDs, names, exact strings)
- **`includes`** — The answer contains a keyword but might have extra words
- **`oneOf`** — Multiple valid phrasings of the same answer
- **`regex`** — Complex patterns (rarely needed)

---

## Hint Targets

Hints spotlight a specific DOM element using a yellow highlight + tooltip. The system finds elements in this order:

1. `document.getElementById(targetId)`
2. `document.querySelector('[data-instruction-target="targetId"]')`
3. `document.querySelector('[data-nav-id="targetId"]')`

### Adding Hint Targets to Page Components

To make an element targetable by coach marks, add an attribute:

```jsx
// Option A: HTML id (simplest, for unique elements)
<span id="district-id-val">{districtId}</span>

// Option B: data-instruction-target (preferred, more semantic)
<button data-instruction-target="edit-provisioning">
    Edit Google provisioning
</button>
```

### Wiring Up Action Goals

If your scenario has a `goalAction` task step, the page component must call `checkActionGoal()`:

```jsx
import { useInstructional } from "@/context/InstructionalContext";

export default function MyPage() {
    const { checkActionGoal } = useInstructional();

    return (
        <button
            data-instruction-target="my-action"
            onClick={() => {
                checkActionGoal("my-action");  // Fires goal detection
                doOriginalAction();             // Original click handler
            }}
        >
            Click Me
        </button>
    );
}
```

### Sidebar nav items are already targetable

Every sidebar item has `data-nav-id` set to its nav ID automatically. So hints like `{ target: "data-browser" }` work without any page modifications.

**Auto-expand behavior:** If your hint targets a child nav item (e.g., `"idm"` under "User management"), the sidebar automatically expands that parent section so the child element becomes visible for the coach mark spotlight. You don't need to handle this manually.

---

## Step-by-Step: Building a New Scenario

### Step 1: Define the training goal

What should the trainee learn? Write it as: *"The trainee should be able to [verb] [thing] in [page/area]."*

Example: *"The trainee should be able to find and update student login credentials in Clever IDM."*

### Step 2: Map the happy path

List the steps the trainee should take:

1. Navigate to IDM page
2. Click "Edit Google provisioning"
3. Identify the credentials step
4. Find the current email domain

### Step 3: Write the scenario data

Create the step objects following the patterns above. Tips:
- Start with a `message` step where the customer explains their need
- Use `task` steps for navigation
- Use `input` steps for knowledge checks
- End with a `message` step for the success confirmation
- Add 1-2 wrong-path branches for common mistakes

### Step 4: Add hint targets

For each `hint.target` in your steps, make sure the DOM element exists:
- Sidebar nav items: already have `data-nav-id` — no changes needed
- Page elements: add `id` or `data-instruction-target` to the component
- If the step uses `goalAction`: wire up `checkActionGoal()` in the component

### Step 5: Wire the chain

Update the previous scenario's `nextScenario` to point to your new scenario's ID.

### Step 6: Test

1. `npm run dev`
2. Open the browser console — any broken step references will show as warnings
3. Click your ticket in the chat panel
4. Test both Guided and Unguided modes
5. Verify hints spotlight the correct elements
6. Try wrong answers on input steps

---

## Sidebar Nav IDs Reference

These are the valid `goalRoute` values (from `src/data/defaults/sidebar.js`):

| Nav ID | Label | Parent |
|--------|-------|--------|
| `dashboard` | Dashboard | — |
| `my-applications` | My applications | Applications |
| `add-applications` | Add applications | Applications |
| `data-browser` | Data browser | Data & integrations |
| `sis-sync` | SIS sync | Data & integrations |
| `sso-settings` | SSO settings | Security |
| `access-logs` | Access logs | Security |
| `idm` | IDM | User management |
| `license-manager` | License manager | User management |
| `admin-team` | Admin team | User management |
| `portal-settings` | Portal settings | District |
| `profile` | Profile | District |

*(Check `src/data/defaults/sidebar.js` for the latest — this list may be out of date.)*

---

## Dynamic Data

Use `demoIdentity.js` for any values that should be consistent across scenarios:

```javascript
import { demoCustomer, demoDistrict } from "@/data/demoIdentity";

// Available fields:
demoCustomer.title      // "Principal"
demoCustomer.lastName   // "Jones"
demoCustomer.schoolName // "Lincoln Heights Elementary"

demoDistrict.id         // "6f2a9c18b0d4e7a3c9f1d2b6"
demoDistrict.sidebarName
demoDistrict.emailDomains.staff
demoDistrict.emailDomains.teachers
demoDistrict.techSupportEmail
```

Use these in scenario text with template literals:

```javascript
text: `Hi! I'm ${demoCustomer.title} ${demoCustomer.lastName} from ${demoCustomer.schoolName}.`
```

---

## Dev-Mode Validation

In development, the system automatically validates all scenarios on load and warns about:

- Missing or broken `nextStep` / `successStep` references
- Task steps without `goalRoute` or `goalAction`
- Input steps missing `correctAnswer` or `successStep`
- Broken `nextScenario` chains

Check the browser console for warnings like:
[Scenario "scenario_my_new"] Step "step_foo" → nextStep "step_typo" does not exist
```

### Automated CI Quality Guardrails (`npm run lint:scenarios`)

A strict static analyzer (`scripts/lint-scenarios.mjs`) runs in CI. Your scenario will fail if it violates these rules:

1. **Unique IDs**: Every scenario must have a unique `id`, and every step must have a unique `id` within that scenario.
2. **Valid References**: All references (`nextStep`, `successStep`, etc.) must point to a step that actually exists in the same scenario array.
3. **Task Density**: To ensure interactivity, **at least 40%** of the steps in any scenario must be `task` or `input` steps. If your scenario is mostly passive `message` steps, the linter will reject it.
4. **Input Schemas**: `input` steps must define a `correctAnswer`.

---

## Example: Complete Scenario

Here's the IDM email format change scenario as a reference template. It demonstrates navigation goals, action goals, knowledge checks with multiple match modes, wrong-path branches, and coach mark targets across nested wizard UIs:

```javascript
{
    id: "scenario_idm_credentials",
    title: "Changing IDM Student Email Format",
    description: `Help ${demoCustomer.title} ${demoCustomer.lastName} change the student email format in Clever IDM.`,
    nextScenario: null,
    settings: {},
    steps: [
        // 1. Customer explains what they need (message with choices)
        {
            id: "step_idm_request",
            type: "message",
            text: "Hi! We need to change student emails from first+last to first initial+last. Can you walk me through it?",
            sender: "customer",
            actions: [
                { label: "Absolutely! Let me pull up IDM.", nextStep: "step_nav_idm" },
                { label: "Sure — do you know where credentials are?", nextStep: "step_customer_unsure" }
            ]
        },
        // 2. Wrong-path branch (optional detour, always rejoins)
        {
            id: "step_customer_unsure",
            type: "message",
            text: "I think it's under Identity Management?",
            sender: "customer",
            actions: [
                { label: "That's right — let me go there.", nextStep: "step_nav_idm" }
            ]
        },
        // 3. Navigation goal — detect sidebar click
        {
            id: "step_nav_idm",
            type: "task",
            text: "Great, I'll wait.",
            sender: "customer",
            goalRoute: "idm",                     // ← Sidebar nav ID
            nextStep: "step_click_edit_provisioning",
            guideMessage: "Navigate to IDM under User management.",
            hint: { target: "idm", message: "Click 'IDM' in the sidebar." },
            autoShowHint: true
        },
        // 4. Action goal — detect button click
        {
            id: "step_click_edit_provisioning",
            type: "task",
            text: "Now we need the provisioning setup.",
            sender: "customer",
            goalAction: "edit-provisioning",       // ← Fires via checkActionGoal()
            nextStep: "step_find_credentials_step",
            guideMessage: "Click 'Edit Google provisioning'.",
            hint: { target: "edit-provisioning", message: "Click the Edit Google provisioning button." },
            autoShowHint: true
        },
        // 5. Choice with wrong-path branch
        {
            id: "step_find_credentials_step",
            type: "message",
            text: "Which wizard step for email format?",
            sender: "customer",
            actions: [
                { label: "Step 4 — Set login credentials", nextStep: "step_read_format" },
                { label: "Step 1 — Connect to Google", nextStep: "step_wrong_step" }
            ]
        },
        {
            id: "step_wrong_step",
            type: "message",
            text: "That doesn't sound right. Check the step list?",
            sender: "customer",
            actions: [
                { label: "It's Step 4 — Set login credentials.", nextStep: "step_read_format" }
            ]
        },
        // 6. Input with oneOf match mode — multiple acceptable answers
        {
            id: "step_read_format",
            type: "input",
            text: "What's the current student email format?",
            sender: "customer",
            guideMessage: "Check the Student credentials card.",
            correctAnswer: ["{{name.first}}{{name.last}}@maytonlyceum.com", "first name last name"],
            matchMode: "oneOf",                    // ← Accept multiple phrasings
            successStep: "step_knowledge_check",
            hint: { target: "email-format-students", message: "Look at the EMAIL field." },
            autoShowHint: true
        },
        // 7. Final knowledge check — exact answer
        {
            id: "step_knowledge_check",
            type: "input",
            text: "Using sample student Rogelio Waelchi, what would the new email be?",
            sender: "customer",
            correctAnswer: "rwaelchi@maytonlyceum.com",
            successStep: "step_success",
            hint: { message: "First initial 'r' + last name 'waelchi' + domain." },
            autoShowHint: false
        },
        // 8. Success — nextStep: null ends the scenario
        {
            id: "step_success",
            type: "message",
            text: "rwaelchi@maytonlyceum.com — perfect! Thank you!",
            sender: "customer",
            actions: [
                { label: "Happy to help!", nextStep: null },
                { label: "You're welcome!", nextStep: null }
            ]
        }
    ]
}
```

### Existing Hint Targets Reference

These `data-instruction-target` values are already wired up in components:

| Target ID | Component | Element |
|-----------|-----------|---------|
| `edit-provisioning` | IDM.jsx | Edit Google provisioning button |
| `pause-sync` | IDM.jsx | Pause/Resume Google sync button |
| `download-recent-accounts` | IDM.jsx | Download recent accounts button |
| `exports-tab-content` | IDM.jsx | Exports tab content area |
| `wizard-step-{id}` | GoogleProvisioningWizard | Wizard sidebar step buttons (e.g., `wizard-step-credentials`) |
| `credential-card-{type}` | SetCredentialsStep | Credential card (e.g., `credential-card-students`) |
| `edit-credential-{type}` | SetCredentialsStep | Edit button on credential card |
| `email-format-{type}` | SetCredentialsStep | Email format value display |
| `edit-format-link-{type}` | SetCredentialsStep | "Edit your format" link |

Sidebar items use `data-nav-id` (e.g., `data-nav-id="idm"`) and are auto-targetable without any setup.

---

## Checklist: Before Submitting a New Scenario

- [ ] Scenario has a unique `id` prefixed with `scenario_`
- [ ] All step `id`s are unique within the scenario
- [ ] All `nextStep`, `successStep`, and action `nextStep` values point to existing step IDs (or `null`)
- [ ] The final step's actions all have `nextStep: null`
- [ ] Every `task` step has either `goalRoute` or `goalAction`
- [ ] Every `input` step has `correctAnswer` and `successStep`
- [ ] Hint `target` values match an element ID, `data-instruction-target`, or `data-nav-id` in the DOM
- [ ] Action goals have corresponding `checkActionGoal()` calls in the page component
- [ ] The previous scenario's `nextScenario` points to your new scenario (if chaining)
- [ ] Tested in both Guided and Unguided modes
- [ ] No console warnings from dev-mode validation
- [ ] `npm run build` passes
