# District Simulator — Post-Review Maintenance Prompt

> **Purpose:** Copy this entire prompt into a fresh AI coding session to carry out all maintenance tasks identified in the senior architect code review of commits `0ddb669..13b37c1` on the `main` branch.

---

## Context

You are working on **District Simulator**, a Next.js 16 + React 19 training simulator for the Clever Dashboard. The codebase lives at the repo root. Key tech: NextAuth v4 for auth, Supabase for persistence, Vitest + Testing Library for unit tests, CSS Modules for styling.

A senior architect reviewed the last 5 commits and identified the following issues. Your job is to fix them all, in priority order. **Run `npm test -- --run` after each group of changes to confirm tests pass.** Run `npm run lint` at the end to confirm zero errors.

---

## Task 1 (P0): Fix 10 Broken Tests

Two test files have assertions that reference old strings from before a narrative/UI rewrite. The scenarios and components were updated but the tests were not. Fix the tests to match the **current** code — do NOT change the components or scenarios.

### File: `src/__tests__/TicketInbox.test.jsx`

**6 tests failing.** The root cause is that TicketInbox now only renders **completed modules** (as compact rows) and the **first unlocked incomplete module** (fully expanded). Locked/future modules are **completely hidden** — no "locked" labels, no ticket cards. The test was written for an older layout that rendered all modules with lock indicators.

Here are the specific string mismatches to fix:

| Test | Old assertion | What the code actually renders | Fix |
|------|--------------|-------------------------------|-----|
| "renders module headers from curriculum" | `"IDM Overview & Navigation"` | Module 1 title is now `"IDM Setup"` (see `src/data/curriculum.js:24`). Also, locked modules are hidden, so only Module 1's header renders in the default (no completions) state. | Assert `"IDM Setup"` exists. Remove assertions for locked module titles (`"Provisioning Wizard Basics"`, `"Credential Configuration"`, `"OU Organization"`, `"Group Configuration"`, `"Review & Provisioning"`) since they are hidden. |
| "renders ticket cards for authored scenarios" | `"Welcome! Can you check on our Google sync?"` | First scenario's `ticketSubject` is now `"Your first task: set up IDM"` (see `src/data/scenarios.js:28`). Second is `"Explore the IDM tabs"`. Only Module 1 tickets render (modules 2-6 are locked/hidden). | Assert the two Module 1 ticket subjects that actually render: `"Your first task: set up IDM"` and `"Explore the IDM tabs"`. Remove all assertions for tickets from locked modules (Modules 2-6). |
| "downstream modules are locked..." | `screen.getAllByText("Complete previous modules to unlock")` | Locked modules are **completely hidden** now — no lock text is rendered. | Change assertion: instead of looking for lock text, assert that locked module titles (`"Provisioning Wizard Basics"` etc.) are **not** in the document via `queryByText(...).not.toBeInTheDocument()`. |
| "clicking open ticket shows mode picker" | `"Welcome! Can you check on our Google sync?"` | Same ticket subject change as above. | Use `"Your first task: set up IDM"` to find the ticket, then click it. |
| "full curriculum unlocks when all modules are completed" | `"Welcome! Can you check on our Google sync?"` | Same. Also, when ALL modules are completed, the inbox shows compact completed rows (just `"✓ Module N Title"`) — there are no expanded ticket cards visible. | Rewrite this test: when all modules+scenarios are complete, assert that completed module rows appear (e.g., text `"IDM Setup"`, `"Provisioning Wizard Basics"`, etc.) and that there is no `"Complete previous modules to unlock"` text. |
| "mode picker calls acceptTicket with correct args" | `"Welcome! Can you check on our Google sync?"` | Same ticket subject change. | Use `"Your first task: set up IDM"` to find the ticket. |

**Important:** The test for `"Module 3 unlocks when Modules 1-2 are completed"` (line 65) currently passes — **do not modify it**. Same for `"completed ticket shows score"` (line 80) and `"displays score badge with globalScore"` (line 95).

### File: `src/__tests__/InvestigationView.test.jsx`

**4 tests failing.** Root causes:

| Test | Issue | Fix |
|------|-------|-----|
| "shows navigation prompt for goal (task) step" | `guideMessage` text `"Open the IDM page from the sidebar."` now appears **twice** in the DOM — once in the step card's `.navPrompt` div (line 274 of InvestigationView.jsx) and once in the footer's `.footerStatus` div (line 390). The `getByText` call fails because it finds multiple matches. | Change to `screen.getAllByText("Open the IDM page from the sidebar.")` and assert `length >= 1`, OR use `screen.getByText(...)` scoped to a specific container. Simplest fix: `expect(screen.getAllByText("Open the IDM page from the sidebar.").length).toBeGreaterThanOrEqual(1);` |
| "renders input field for observe/freetext step" | Placeholder is `"Type your answer..."` (with ellipsis) but test looks for `"Type your answer"` (without ellipsis). | Change to `screen.getByPlaceholderText("Type your answer...")` (with the trailing `...`). |
| "handles text input submission" | Same placeholder mismatch as above. | Same fix — add `...` to the placeholder string. |
| "shows completion card when scenario is just completed" | Test expects `/Excellent Work with Guidance!/` but the guided completion title is now `"Nice work following the thread."` | Change the regex to match the new text: `screen.getByText(/Nice work following the thread/)`. Also, the completion card no longer renders a `"Replay"` text inside the card itself — the replay button is in the footer and says `"↺ Replay"`. Update the assertion to `screen.getByText(/Replay/)`. |

---

## Task 2 (P0): Add `session.user.id` Null-Check to API Routes

All three API routes check `session?.user?.email` but then use `session.user.id` in the Supabase query. If the profile upsert failed silently during login, `session.user.id` would be `null`, causing the query to filter by `user_id = null`.

**Files to modify:**
- `src/app/api/progress/route.js` — lines 10-13 (GET) and lines 48-51 (PUT)
- `src/app/api/progress/session/route.js` — lines 10-13 (GET) and lines 44-47 (PUT)
- `src/app/api/progress/wizard/route.js` — lines 10-13 (GET) and lines 40-43 (PUT)

**Change (same pattern in all 6 handlers):**

```js
// BEFORE:
if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
}

// AFTER:
if (!session?.user?.email || !session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## Task 3 (P1): Add Input Validation to PUT API Routes

The PUT handlers in all three API routes accept arbitrary JSON from the client with no validation. Add basic validation.

**File: `src/app/api/progress/route.js`** — In the `PUT` handler, after `const body = await request.json();`, add:

```js
// Basic input validation
if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
}
if (body.completed_scenarios && !Array.isArray(body.completed_scenarios)) {
    return Response.json({ error: "completed_scenarios must be an array" }, { status: 400 });
}
if (body.completed_modules && !Array.isArray(body.completed_modules)) {
    return Response.json({ error: "completed_modules must be an array" }, { status: 400 });
}
if (body.scores && typeof body.scores !== "object") {
    return Response.json({ error: "scores must be an object" }, { status: 400 });
}
```

**File: `src/app/api/progress/session/route.js`** — In the `PUT` handler, after `const body = await request.json();`, add:

```js
if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
}
```

**File: `src/app/api/progress/wizard/route.js`** — In the `PUT` handler, after `const body = await request.json();`, add:

```js
if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
}
if (body.wizard_data && typeof body.wizard_data !== "object") {
    return Response.json({ error: "wizard_data must be an object" }, { status: 400 });
}
```

---

## Task 4 (P1): Flush Debounced Save on Unmount (Don't Just Cancel)

**File: `src/lib/progressApi.js`**

The `createDebouncedApiSave` function returns `{ debouncedSave, cancel }` but there's no `flush`. When the component unmounts, the cleanup effect calls `cancel()` which **discards** the pending save. It should flush instead.

Change the `createDebouncedApiSave` function to also return a `flush`:

```js
export function createDebouncedApiSave() {
    let timer = null;
    let pendingState = null;

    function debouncedSave(state) {
        pendingState = state;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            pendingState = null;
            saveProgressToApi(state);
        }, DEBOUNCE_MS);
    }

    function cancel() {
        if (timer) clearTimeout(timer);
        timer = null;
        pendingState = null;
    }

    function flush() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        if (pendingState) {
            saveProgressToApi(pendingState);
            pendingState = null;
        }
    }

    return { debouncedSave, cancel, flush };
}
```

**File: `src/context/InstructionalContext.jsx`** — Change the unmount cleanup (around line 370-372):

```js
// BEFORE:
useEffect(() => {
    return () => debouncedApiSaveRef.current?.cancel();
}, []);

// AFTER:
useEffect(() => {
    return () => debouncedApiSaveRef.current?.flush();
}, []);
```

**File: `src/__tests__/progressApi.test.js`** — Add a test for `flush`:

```js
it("flush fires the pending save immediately", () => {
    const { debouncedSave, flush } = createDebouncedApiSave();

    debouncedSave({ completedScenarios: ["s1"] });
    expect(fetch).not.toHaveBeenCalled();

    flush();

    // Should fire immediately, not wait for timer
    expect(fetch).toHaveBeenCalledTimes(1);
});

it("flush is a no-op when nothing is pending", () => {
    const { flush } = createDebouncedApiSave();

    flush();

    expect(fetch).not.toHaveBeenCalled();
});
```

---

## Task 5 (P2): Consolidate Duplicate STATE_VERSION

`STATE_VERSION = 3` is defined in both `src/lib/progressApi.js:8` and `src/context/InstructionalContext.jsx:26`. If these drift, migrations break silently.

**Fix:** Export it from `InstructionalContext.jsx` and import it in `progressApi.js`.

In `src/context/InstructionalContext.jsx` line 26, add `export`:
```js
export const STATE_VERSION = 3;
```

In `src/lib/progressApi.js`, change:
```js
// BEFORE (lines 1 and 8):
import { migrateState } from "@/context/InstructionalContext";
const STATE_VERSION = 3;

// AFTER:
import { migrateState, STATE_VERSION } from "@/context/InstructionalContext";
// (delete the local const STATE_VERSION = 3; line)
```

---

## Task 6 (P2): Fix Lint Errors

### WelcomeOverlay unescaped entities

**File: `src/components/onboarding/WelcomeOverlay.jsx`** — Replace all unescaped `'` (apostrophes) in JSX text content with `&apos;`. There are 8 occurrences on lines 51, 52, 55, 57, 58, and 75. For example:

```jsx
// BEFORE:
I'll be your onboarding buddy.
// AFTER:
I&apos;ll be your onboarding buddy.
```

Do this for every apostrophe in JSX text on those lines. Do NOT change apostrophes inside JS strings or attribute values — only in JSX text content between tags.

### DataBrowser useMemo missing deps

**File: `src/components/pages/DataBrowser.jsx`** — Around line 298, there's a `useMemo` with missing dependencies `dataForTab` and `searchKeys`. Add them to the dependency array.

---

## Task 7 (P2): Delete Dead Code

Three files were created in commit `70c6ae3` but are never imported or used anywhere:

1. **`src/app/api/progress/session/route.js`** — Not called by any client code. The `progressApi.js` layer only uses `/api/progress`.
2. **`src/app/api/progress/wizard/route.js`** — Same.
3. **`src/lib/supabase/client.js`** — Browser-side Supabase client, never imported. All DB access goes through server-side API routes.

**Before deleting**, confirm with a search that no file imports from these paths:
```bash
grep -r "progress/session" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"
grep -r "progress/wizard" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"
grep -r "supabase/client" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"
```

If zero results for each (excluding the route files themselves and test files), delete them. If any file imports them, do NOT delete — leave a TODO comment instead.

---

## Verification Checklist

After all changes, run these commands and confirm they pass:

```bash
# 1. All tests pass
npm test -- --run
# Expected: 0 failed

# 2. Lint is clean
npm run lint
# Expected: 0 errors, 0 warnings (or at most the ChatView setState-in-effect warning which is a false positive)

# 3. Build succeeds
npm run build
# Expected: no build errors

# 4. Scenario validation passes
npm run lint:scenarios
# Expected: 0 errors
```

---

## Commit Guidance

Create **one commit per task group** with clear messages:

1. `fix: update TicketInbox and InvestigationView tests to match current UI`
2. `fix: add session.user.id null-check to all progress API routes`
3. `feat: add input validation to progress API PUT handlers`
4. `fix: flush debounced API save on unmount instead of canceling`
5. `refactor: consolidate duplicate STATE_VERSION constant`
6. `fix: resolve all ESLint errors (unescaped entities, missing deps)`
7. `chore: remove unused API routes and browser Supabase client`

Do NOT batch all changes into a single commit.
