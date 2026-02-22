# Scenario Engine Hardening — Implementation Prompt

You are working on a Next.js 16 app (React 19, Turbopack, App Router) called the Cedar Ridge District Simulator. It teaches users how to use Clever IDM (Identity Management) through interactive scenarios presented as help desk tickets.

Your job is to make the scenario engine **bulletproof for rapid content iteration**. The narrative content will be rewritten frequently. The engine must reliably render whatever scenarios are thrown at it, with zero friction between editing a scenario and seeing it work in the browser.

Do NOT rewrite any scenario content or narrative text. Do NOT change any scenario IDs, step IDs, correct answers, step types, or curriculum structure. You are hardening the **machine**, not the **content**.

---

## Architecture Overview

The system has these layers:

```
curriculum.js          → Courses → Modules (prerequisites, boss messages)
  scenarios.js         → Scenarios → Steps (goal, checkpoint, observe, resolution)
    characters.js      → NPC characters (Principal Jones, Sarah Chen, etc.)
    defaults/*.js      → Default IDM/dashboard data
    DataVariantContext  → Per-scenario data overrides (e.g. failed syncs)

InstructionalContext.jsx  → State machine (accept ticket → advance steps → complete → unlock next module)
DashboardShell.jsx        → Layout shell, navigation goal checking
RightPanel.jsx            → Switches between TicketInbox, InvestigationView, ConversationView
InvestigationView.jsx     → Primary scenario UI (ticket card + step checklist + interaction)
ConversationView.jsx      → Legacy scenario UI (iMessage-style, used when no ticketMessage)
CoachMark.jsx             → Spotlight overlay hint system
TicketInbox.jsx           → Ticket list with module grouping, locking, mode picker
```

State is persisted to localStorage key `pjs-state` with a versioned migration chain (currently v3).

### Step Types

Scenarios define steps with these types, which map to processor categories:

```javascript
STEP_TYPE_MAP = {
    task:       "goal",      // User must navigate to goalRoute or trigger goalAction
    observe:    "freetext",  // User types short answer, matched against correctAnswer
    checkpoint: "choice",    // Multiple choice, one correct
    resolution: "choice",    // Final multiple choice (ends scenario when nextStep is null)
    message:    "choice",    // Legacy alias
    action:     "choice",    // Legacy alias
    input:      "freetext",  // Legacy alias
}
```

### Key Files

- `src/context/InstructionalContext.jsx` — ~920 lines, the state machine
- `src/components/helpdesk/InvestigationView.jsx` — Primary scenario renderer
- `src/components/helpdesk/ConversationView.jsx` — Legacy scenario renderer
- `src/components/helpdesk/RightPanel.jsx` — Panel switcher
- `src/components/helpdesk/TicketInbox.jsx` — Ticket list + module locking
- `src/components/guidance/CoachMark.jsx` — Hint spotlight overlay
- `src/components/guidance/GuidancePanel.jsx` — "Training Guide" panel for task steps
- `src/components/layout/DashboardShell.jsx` — Shell with nav goal checking
- `src/context/DataVariantContext.jsx` — Scenario-specific data overrides
- `src/data/scenarios.js` — All 14 scenario definitions
- `src/data/curriculum.js` — Course/module hierarchy
- `src/data/characters.js` — NPC character data

---

## Task 1: Fix the RightPanel Bug

**File:** `src/components/helpdesk/RightPanel.jsx`

**Bug:** Lines 15 and 17 both render when `rightPanelView === "conversation"`:

```jsx
{rightPanelView === "conversation" && <GuidancePanel />}
{rightPanelView === "inbox" && <TicketInbox />}
{rightPanelView === "conversation" && <ConversationView />}
{rightPanelView === "investigation" && <InvestigationView />}
```

Both `GuidancePanel` and `ConversationView` render simultaneously for legacy-format scenarios. The `GuidancePanel` shows a "TRAINING GUIDE" banner that stacks on top of the conversation.

**Fix:** Remove the `GuidancePanel` line (line 15). The `GuidancePanel` component only renders for `task` and `input` step types anyway, and ConversationView has its own guidance rendering. The `GuidancePanel` should only appear alongside `InvestigationView`, not `ConversationView`.

Change to:

```jsx
{rightPanelView === "inbox" && <TicketInbox />}
{rightPanelView === "conversation" && <ConversationView />}
{rightPanelView === "investigation" && (
    <>
        <GuidancePanel />
        <InvestigationView />
    </>
)}
```

**Verify:** Accept a scenario that has a `ticketMessage` (all 14 current scenarios do). Confirm InvestigationView renders with the GuidancePanel above it. Then, if you can trigger a legacy scenario (one without `ticketMessage`), confirm ConversationView renders alone without a stacked GuidancePanel.

---

## Task 2: Add URL-Based Scenario Jumping for Testing

This is the single highest-impact change for content iteration speed. Currently, testing scenario #11 requires completing scenarios 1-10 first, or manually hacking localStorage.

**File:** `src/context/InstructionalContext.jsx`

**Add a dev-only URL parameter** that lets you jump straight to any scenario:

1. In the `InstructionalProvider` component, after state initialization, add a `useEffect` that checks for `?scenario=scenario_id&mode=guided` in the URL query string.

2. If the parameter exists and `process.env.NODE_ENV === "development"`:
   - Call `acceptTicket(scenarioId, mode === "guided")` automatically
   - Mark all prerequisite modules as complete so the scenario can run
   - Log a console message: `[DEV] Auto-loaded scenario: ${scenarioId}`

3. Also support `?step=step_id` to jump to a specific step within the scenario. After accepting the ticket, call `advanceStep` repeatedly until the current step matches the target step ID, or set `currentStepId` directly.

**Implementation detail:** You'll need to temporarily unlock the module that contains the target scenario. Compute which modules are prerequisites by walking the curriculum tree, and add them all to `completedModules`. Don't persist this to localStorage — it's dev-only.

**File:** `src/app/dashboard/[page]/page.js` (or wherever the dashboard route handler is)

Make sure the URL params survive the initial render. The `useEffect` in InstructionalContext should read from `window.location.search` (not Next.js router params, since this is a context provider).

**Verify:** Navigate to `http://localhost:3000/dashboard/dashboard?scenario=scenario_credential_building&mode=guided` and confirm the scenario loads immediately with the InvestigationView showing the first step.

---

## Task 3: Promote Scenario Validation to Build-Time Errors

**File:** `src/context/InstructionalContext.jsx`

Currently `validateScenarios()` (around line 253) runs in dev mode and logs warnings to the console. Authors miss these warnings constantly.

**Changes:**

1. Extract `validateScenarios()` into its own file: `src/data/validateScenarios.js`

2. Make it return an array of error objects instead of logging:
   ```javascript
   export function validateScenarios(scenarios, courses) {
       const errors = [];
       // ... existing checks, but push to errors[] instead of console.warn
       return errors;
   }
   ```

3. In `InstructionalContext.jsx`, call the validator and:
   - In development: throw an Error if any validation errors exist (this will show as a React error overlay, impossible to miss)
   - In production: log warnings only (don't crash the app for users)

4. **Add these additional validations** that are currently missing:

   a. **Every `nextStep` reference must point to a real step ID within the same scenario.** Currently only checks that choices have nextStep; doesn't verify the target exists.

   b. **Every `hint.target` must be a non-empty string.** Flag empty targets.

   c. **Resolution steps must have `nextStep: null` on at least one choice.** This is what ends the scenario. If all choices have non-null nextStep, the scenario can never complete.

   d. **Every step must have a `checklistLabel`.** Flag steps that will fall back to generic labels.

   e. **Every scenario must have `ticketSubject`, `ticketMessage`, `customerId`, and `moduleId`.** These are required for InvestigationView to render properly.

   f. **Every `customerId` must exist in CHARACTERS.** Import characters and cross-reference.

   g. **Every `moduleId` must exist in COURSES.** Import curriculum and cross-reference.

   h. **Freetext steps (`observe`, `input`) must have `correctAnswer` and `matchMode`.** Without these, the answer can never be validated.

   i. **Choice steps must have at least one choice with `correct: true`.** (Except retry steps where `scored: false`.)

5. Create a test file `src/__tests__/scenario-validation.test.js` that imports all scenarios and curriculum, runs the validator, and asserts zero errors. This ensures CI catches validation issues.

**Verify:** Temporarily break a scenario (e.g., set a `nextStep` to `"nonexistent_step_id"`) and confirm: (a) `npm run dev` shows a React error overlay, (b) `npx vitest run` fails, (c) `npm run build` succeeds (production mode only warns).

---

## Task 4: Fix Coach Mark Fragility

**File:** `src/components/guidance/CoachMark.jsx`

### 4a: Add retry limit and warning

The current retry mechanism loops indefinitely if a hint target doesn't exist (e.g., typo in target ID).

Find the retry logic (around line 45-63) and:
- Add a max retry count of 5
- After 5 retries, log a visible console.error: `[CoachMark] Hint target "${target}" not found after 5 retries. Check that a DOM element has id="${target}" or data-instruction-target="${target}".`
- Stop retrying after the limit

### 4b: Add viewport-aware positioning

The tooltip is hardcoded to render to the right of the target element (around line 82-86). If the target is near the right edge, the tooltip goes off-screen.

Replace the positioning logic with viewport-aware placement:

```javascript
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;
const tooltipWidth = 280; // approximate
const tooltipHeight = 80; // approximate

let top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
let left = targetRect.right + 16;

// If tooltip would go off right edge, place it to the left
if (left + tooltipWidth > viewportWidth - 16) {
    left = targetRect.left - tooltipWidth - 16;
}

// If tooltip would go off bottom, nudge up
if (top + tooltipHeight > viewportHeight - 16) {
    top = viewportHeight - tooltipHeight - 16;
}

// If tooltip would go off top, nudge down
if (top < 16) {
    top = 16;
}
```

### 4c: Fix empty hint message rendering

Around line 66, add a check for empty hint message:

```javascript
if (!targetRect || !currentStep?.hint?.message) return null;
```

**Verify:**
- Add a scenario step with `hint.target: "nonexistent_element_12345"`. Confirm a console error appears after ~750ms (5 retries at 150ms).
- Add a step with a hint targeting a sidebar element (right side of viewport). Confirm the tooltip appears to the LEFT of the target, not off-screen.

---

## Task 5: Fix InvestigationView Hint Button Check

**File:** `src/components/helpdesk/InvestigationView.jsx`

Find the hint button rendering (around line 231):

```jsx
{coachMarksEnabled && step._originalStep.hint && (
```

Change to:

```jsx
{coachMarksEnabled && step.hint && (
```

The normalized step already preserves the `hint` object. Using `_originalStep` is unnecessary indirection and could diverge if normalization ever transforms hints.

**Verify:** Accept scenario #1001 in guided mode. Confirm hint buttons appear on steps that have hints defined.

---

## Task 6: Memoize TicketInbox Module State Calculation

**File:** `src/components/helpdesk/TicketInbox.jsx`

Find the module state calculation (around line 89):

```javascript
const moduleStates = course.modules.map(mod => {
    const locked = isModuleLocked(mod, completedModules, completedScenarios);
    const complete = isModuleEffectivelyComplete(mod, completedScenarios);
    return { mod, locked, complete };
});
```

Wrap in `useMemo`:

```javascript
const moduleStates = useMemo(() => course.modules.map(mod => {
    const locked = isModuleLocked(mod, completedModules, completedScenarios);
    const complete = isModuleEffectivelyComplete(mod, completedScenarios);
    return { mod, locked, complete };
}), [course.modules, completedModules, completedScenarios]);
```

Also, in `isModuleEffectivelyComplete()` (around line 27), the inner `scenarios.find()` call is O(n) for each scenario ID. If you touch this function, convert to a Set lookup:

```javascript
const scenarioIdSet = new Set(scenarios.map(s => s.id));
// then use scenarioIdSet.has(sid) instead of scenarios.find(s => s.id === sid)
```

This Set can be created once at module scope since `scenarios` is a static import.

**Verify:** No functional change — just confirm all tests still pass and the inbox renders correctly.

---

## Task 7: Add Scenario Reset-to-Module Dev Tool

For rapid iteration, add a dev-only keyboard shortcut that resets progress to just before a specific module.

**File:** `src/context/InstructionalContext.jsx`

Add a `useEffect` that listens for `Ctrl+Shift+R` (development only):

1. On keypress, prompt via `window.prompt("Reset to which module? (1-7)")`
2. Based on the number, mark all modules before it as complete (with their scenarios), clear the target module and everything after
3. Navigate to the inbox

This lets an author jump to "I just finished Module 3, Module 4 is freshly unlocked" in one keystroke.

**Verify:** Press Ctrl+Shift+R, type "4", confirm Module 4 tickets are unlocked and Module 3 shows as complete.

---

## Execution Order

1. **Task 1** (RightPanel bug) — 5 minutes, zero risk
2. **Task 5** (hint button fix) — 2 minutes, zero risk
3. **Task 6** (memoization) — 5 minutes, zero risk
4. **Task 4** (coach mark fixes) — 15 minutes, low risk
5. **Task 3** (validation promotion) — 30 minutes, medium risk (new test file)
6. **Task 2** (URL scenario jumping) — 30 minutes, medium risk (dev-only feature)
7. **Task 7** (reset-to-module shortcut) — 15 minutes, low risk (dev-only feature)

---

## Verification Checklist

After all tasks are complete:

- [ ] `npx vitest run` — all tests pass (should be 221+ including new validation test)
- [ ] `npm run build` — compiles without errors
- [ ] Fresh browser (cleared localStorage) → welcome overlay → enter dashboard → accept ticket #1001 → complete all steps → scenario completes → Module 1 boss completion message shows → Module 2 unlocks
- [ ] URL param `?scenario=scenario_credential_building&mode=guided` loads scenario directly in dev mode
- [ ] Intentionally broken scenario (bad nextStep reference) shows React error overlay in dev mode
- [ ] Coach mark hint on a right-edge element positions tooltip to the left
- [ ] Coach mark with nonexistent target logs error after retries, doesn't loop forever
- [ ] `Ctrl+Shift+R` → type "3" → Module 3 is freshly unlocked, Modules 1-2 complete
- [ ] No console errors on a clean page load
- [ ] The RightPanel renders InvestigationView (not ConversationView + GuidancePanel stacked) for current scenarios

---

## What NOT to Do

- Do NOT change any text in `scenarios.js`, `curriculum.js`, `characters.js`, or `chat.js`
- Do NOT change scenario IDs, step IDs, step types, correct answers, or curriculum structure
- Do NOT add new scenarios or modules
- Do NOT change the localStorage key or state version (keep `pjs-state` v3)
- Do NOT change how scoring works
- Do NOT add dependencies — use only what's already in package.json
- Do NOT modify the provisioning wizard or IDM page components
- Do NOT change the authentication system
