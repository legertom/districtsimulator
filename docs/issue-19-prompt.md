# Issue #19 — Finalize IDM Setup Scenario

> **Purpose:** Copy this entire prompt into a fresh AI coding session. It contains everything needed to close issue #19 on the District Simulator project.

---

## Context

**District Simulator** is a Next.js 16 + React 19 training app for the Clever Dashboard. Users complete interactive scenarios organized into modules. The app uses Supabase for persistence, NextAuth for auth, and Vitest for testing.

**Issue #19** has two remaining tasks:
1. **Remove `scenario_idm_tab_exploration`** — IDM tab skills will be taught in later modules instead of a standalone scenario.
2. **Wire mid-scenario state recovery** — Currently, if a user refreshes the browser mid-scenario, they lose their position and must restart from the inbox. The `session_state` table already exists in Supabase, but the API route and client-side wiring were prematurely deleted. They need to be restored and connected.

The Supabase project ID is `ykljehlhladqimrwlnrb`.

---

## Task 1: Remove `scenario_idm_tab_exploration`

### 1A. Delete the scenario from `src/data/scenarios.js`

Delete the entire scenario object for `scenario_idm_tab_exploration`. It spans from the comment on line 231 through line 407 (the closing `},` of the object). The next scenario (`scenario_wizard_navigation`) starts at line 414. Make sure to also remove the blank line(s) between the deleted block and the Module 2 comment.

The scenario to delete looks like:
```
// ── Scenario 1B: Exploring IDM Tabs ──────────────────────────
{
    id: "scenario_idm_tab_exploration",
    ...
},
```

### 1B. Remove the scenario from the curriculum

**File: `src/data/curriculum.js`**

In the `mod_overview` module (line 27-29), the `scenarioIds` array currently contains:
```js
scenarioIds: [
    "scenario_idm_orientation",
    "scenario_idm_tab_exploration",
],
```

Change it to:
```js
scenarioIds: [
    "scenario_idm_orientation",
],
```

This means Module 1 ("IDM Setup") now only requires completing `scenario_idm_orientation` to be considered complete.

### 1C. Update tests that reference the deleted scenario

**File: `src/__tests__/TicketInbox.test.jsx`**

Three places reference `scenario_idm_tab_exploration`:

1. **Line 42** — asserts that `"Explore the IDM tabs"` renders as a ticket card. After deletion, Module 1 only has one scenario. Change:
```js
// BEFORE (lines 38-43):
it("renders ticket cards for authored scenarios", () => {
    renderInbox();
    // Only Module 1 tickets render (modules 2-6 are locked/hidden)
    expect(screen.getByText("Your first task: set up IDM")).toBeInTheDocument();
    expect(screen.getByText("Explore the IDM tabs")).toBeInTheDocument();
});

// AFTER:
it("renders ticket cards for authored scenarios", () => {
    renderInbox();
    // Only Module 1 tickets render (modules 2-6 are locked/hidden)
    expect(screen.getByText("Your first task: set up IDM")).toBeInTheDocument();
    // scenario_idm_tab_exploration was removed — Module 1 now has only 1 scenario
});
```

2. **Line 59** — the "Module 3 unlocks" test includes `scenario_idm_tab_exploration` in `completedScenarios`. Since Module 1 now only requires `scenario_idm_orientation`, remove it:
```js
// BEFORE (lines 58-59):
completedScenarios: new Set([
    "scenario_idm_orientation", "scenario_idm_tab_exploration",
    "scenario_wizard_navigation", "scenario_wizard_concepts",
]),

// AFTER:
completedScenarios: new Set([
    "scenario_idm_orientation",
    "scenario_wizard_navigation", "scenario_wizard_concepts",
]),
```

3. **Line 104** — the "full curriculum unlocks" test also includes it. Remove it the same way:
```js
// BEFORE (lines 103-104):
completedScenarios: new Set([
    "scenario_idm_orientation", "scenario_idm_tab_exploration",
    "scenario_wizard_navigation", "scenario_wizard_concepts",

// AFTER:
completedScenarios: new Set([
    "scenario_idm_orientation",
    "scenario_wizard_navigation", "scenario_wizard_concepts",
```

No other files reference this scenario ID.

### 1D. Verify

```bash
npm test -- --run
npm run lint:scenarios
```

All tests should pass. Scenario validation should report zero errors.

---

## Task 2: Restore and Wire Mid-Scenario State Recovery

### Background

The Supabase database already has a `session_state` table with columns:
- `user_id` (UUID, FK to profiles, PK)
- `active_scenario_id` (text, nullable)
- `current_step_id` (text, nullable)
- `welcome_seen` (boolean)
- `metadata` (jsonb)
- `updated_at` (timestamptz)

An API route at `/api/progress/session` was created in commit `70c6ae3` but was deleted in commit `2a2f824` because it wasn't wired to any client code yet. The table still exists in Supabase. We need to:
1. Restore the API route
2. Add client-side session API functions to `progressApi.js`
3. Wire `InstructionalContext.jsx` to persist and recover `activeScenarioId` + `currentStepId`

### 2A. Restore `src/app/api/progress/session/route.js`

Create this file with the following exact content (this is the version that was deleted, with the auth and validation fixes from the maintenance pass already applied):

```js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/progress/session
 * Returns the authenticated user's active session state.
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
        .from("session_state")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return Response.json({
            active_scenario_id: null,
            current_step_id: null,
            welcome_seen: false,
            metadata: {},
        });
    }

    return Response.json(data);
}

/**
 * PUT /api/progress/session
 * Upserts the authenticated user's session state.
 * Body: { active_scenario_id, current_step_id, welcome_seen, metadata }
 */
export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const row = {
        user_id: session.user.id,
        active_scenario_id: body.active_scenario_id ?? null,
        current_step_id: body.current_step_id ?? null,
        welcome_seen: body.welcome_seen ?? false,
        metadata: body.metadata ?? {},
    };

    const { data, error } = await supabase
        .from("session_state")
        .upsert(row, { onConflict: "user_id" })
        .select()
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}
```

### 2B. Add session state API functions to `src/lib/progressApi.js`

Add the following functions at the end of the file, before the closing of the module (after the `createDebouncedApiSave` function):

```js
// ═══════════════════════════════════════════════════════════════
//  Session state persistence (active scenario + step position)
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch the user's active session state from the API.
 * Returns { active_scenario_id, current_step_id } or null on failure.
 */
export async function fetchSessionStateFromApi() {
    try {
        const res = await fetch("/api/progress/session");
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

/**
 * Save the user's active session state to the API.
 * Fire-and-forget with error logging.
 */
export async function saveSessionStateToApi(activeScenarioId, currentStepId) {
    try {
        await fetch("/api/progress/session", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                active_scenario_id: activeScenarioId ?? null,
                current_step_id: currentStepId ?? null,
            }),
        });
    } catch (err) {
        console.warn("[progressApi] Failed to save session state:", err);
    }
}

/**
 * Create a debounced save function for session state writes.
 * Returns { debouncedSave, cancel, flush }.
 */
export function createDebouncedSessionSave() {
    let timer = null;
    let pendingArgs = null;

    function debouncedSave(activeScenarioId, currentStepId) {
        pendingArgs = [activeScenarioId, currentStepId];
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            pendingArgs = null;
            saveSessionStateToApi(activeScenarioId, currentStepId);
        }, DEBOUNCE_MS);
    }

    function cancel() {
        if (timer) clearTimeout(timer);
        timer = null;
        pendingArgs = null;
    }

    function flush() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        if (pendingArgs) {
            saveSessionStateToApi(...pendingArgs);
            pendingArgs = null;
        }
    }

    return { debouncedSave, cancel, flush };
}
```

### 2C. Wire `InstructionalContext.jsx` to persist and recover session state

This is the most important part. Three changes are needed in `src/context/InstructionalContext.jsx`:

#### Change 1: Import the new functions

Update the import from `progressApi` (line 11-18) to include the new session functions:

```js
// BEFORE:
import {
    fetchProgressFromApi,
    saveProgressToApi,
    loadProgressFromLocalStorage,
    saveProgressToLocalStorage,
    clearLocalStorage,
    apiResponseToState,
    createDebouncedApiSave,
} from "@/lib/progressApi";

// AFTER:
import {
    fetchProgressFromApi,
    saveProgressToApi,
    loadProgressFromLocalStorage,
    saveProgressToLocalStorage,
    clearLocalStorage,
    apiResponseToState,
    createDebouncedApiSave,
    fetchSessionStateFromApi,
    saveSessionStateToApi,
    createDebouncedSessionSave,
} from "@/lib/progressApi";
```

#### Change 2: Recover session state on authenticated load

In the Phase 2 `useEffect` (around line 314-343), after fetching and applying progress data, also fetch session state and recover the active scenario if one exists.

```js
// REPLACE the entire Phase 2 useEffect with:
// ═══ Phase 2: async DB load (overlays localStorage once resolved) ═══
useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    (async () => {
        // Fetch progress and session state in parallel
        const [progressData, sessionData] = await Promise.all([
            fetchProgressFromApi(),
            fetchSessionStateFromApi(),
        ]);

        if (cancelled) return;

        // Apply progress data (DB is authoritative)
        if (progressData) {
            const dbState = apiResponseToState(progressData);
            setCompletedScenarios(new Set(dbState.completedScenarios));
            setCompletedModules(new Set(dbState.completedModules));
            setScores(dbState.scores);
            setCoachMarksEnabled(dbState.coachMarksEnabled);
            setIdmSetupComplete(dbState.idmSetupComplete);

            // Keep localStorage in sync
            saveProgressToLocalStorage({
                completedScenarios: dbState.completedScenarios,
                completedModules: dbState.completedModules,
                scores: dbState.scores,
                coachMarksEnabled: dbState.coachMarksEnabled,
                idmSetupComplete: dbState.idmSetupComplete,
            });
        }

        // Recover active scenario if one was in progress
        if (sessionData?.active_scenario_id && sessionData?.current_step_id) {
            const scenario = scenarios.find(s => s.id === sessionData.active_scenario_id);
            const step = scenario?.steps.find(s => s.id === sessionData.current_step_id);
            if (scenario && step) {
                // Build visited set: all steps from start up to and including the recovered step
                const visited = new Set();
                for (const s of scenario.steps) {
                    visited.add(s.id);
                    if (s.id === sessionData.current_step_id) break;
                }

                setActiveScenarioId(sessionData.active_scenario_id);
                setCurrentStepId(sessionData.current_step_id);
                setVisitedStepIds(visited);
                setShowHint(coachMarksEnabled && !!step.autoShowHint);
                setRightPanelView("chat");
                setConversationHistory([]);
                setScenarioJustCompleted(null);
            }
        }
    })();

    return () => { cancelled = true; };
}, [isAuthenticated]);
```

**Important note about the visited set:** The recovery builds `visitedStepIds` by including all steps from the start up to the current step. This is an approximation — if the user took a branching path, some steps in the linear scan may not have actually been visited. This is acceptable because: (a) most scenarios are linear, and (b) the worst case is that a couple of extra checkmarks appear in the InvestigationView checklist. A more precise approach would be to persist `visitedStepIds` in the session state metadata, but that's a future enhancement.

#### Change 3: Persist session state on scenario/step changes

Add a new `useEffect` that debounce-saves the active scenario and step to the API whenever they change. Place this right after the existing progress persistence `useEffect` (after line 372):

```js
// ═══ Persist session state (active scenario + step position) ═══
const debouncedSessionSaveRef = useRef(null);
if (!debouncedSessionSaveRef.current) {
    debouncedSessionSaveRef.current = createDebouncedSessionSave();
}

useEffect(() => {
    if (!isAuthenticated) return;
    debouncedSessionSaveRef.current.debouncedSave(activeScenarioId, currentStepId);
}, [activeScenarioId, currentStepId, isAuthenticated]);

// Cleanup session save timer on unmount
useEffect(() => {
    return () => debouncedSessionSaveRef.current?.flush();
}, []);
```

Also, when a scenario completes (in the `advanceStep` function, around line 656 where `setActiveScenarioId(null)` is called), the persist `useEffect` above will automatically fire with `(null, null)`, clearing the session state in the DB. No additional change needed there.

Similarly, `resetAllProgress` (around line 860-890) already sets `activeScenarioId` and `currentStepId` to null, which will trigger the persist effect. But you should also add an immediate (non-debounced) clear for safety:

In the `resetAllProgress` callback, after the existing `saveProgressToApi(...)` call (around line 882-889), add:

```js
// Also clear session state
saveSessionStateToApi(null, null);
```

### 2D. Add tests for the new session API functions

**File: `src/__tests__/progressApi.test.js`**

Add these test blocks at the end of the file, before the final `});`:

```js
// ═══════════════════════════════════════════════════════════════
//  Session state API
// ═══════════════════════════════════════════════════════════════

describe("fetchSessionStateFromApi", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns parsed data on 200", async () => {
        const mockData = { active_scenario_id: "s1", current_step_id: "step_1" };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockData),
        });

        const { fetchSessionStateFromApi } = await import("@/lib/progressApi");
        const result = await fetchSessionStateFromApi();
        expect(result).toEqual(mockData);
        expect(fetch).toHaveBeenCalledWith("/api/progress/session");
    });

    it("returns null on failure", async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 401 });

        const { fetchSessionStateFromApi } = await import("@/lib/progressApi");
        const result = await fetchSessionStateFromApi();
        expect(result).toBeNull();
    });
});

describe("saveSessionStateToApi", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("sends PUT with scenario and step IDs", async () => {
        const { saveSessionStateToApi } = await import("@/lib/progressApi");
        await saveSessionStateToApi("scenario_1", "step_3");

        expect(fetch).toHaveBeenCalledWith("/api/progress/session", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                active_scenario_id: "scenario_1",
                current_step_id: "step_3",
            }),
        });
    });

    it("sends nulls when clearing session", async () => {
        const { saveSessionStateToApi } = await import("@/lib/progressApi");
        await saveSessionStateToApi(null, null);

        expect(fetch).toHaveBeenCalledWith("/api/progress/session", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                active_scenario_id: null,
                current_step_id: null,
            }),
        });
    });
});

describe("createDebouncedSessionSave", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("debounces multiple rapid calls into one", () => {
        const { createDebouncedSessionSave } = require("@/lib/progressApi");
        const { debouncedSave } = createDebouncedSessionSave();

        debouncedSave("s1", "step_1");
        debouncedSave("s1", "step_2");
        debouncedSave("s1", "step_3");

        expect(fetch).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1000);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("flush fires pending save immediately", () => {
        const { createDebouncedSessionSave } = require("@/lib/progressApi");
        const { debouncedSave, flush } = createDebouncedSessionSave();

        debouncedSave("s1", "step_2");
        flush();
        expect(fetch).toHaveBeenCalledTimes(1);
    });
});
```

**Important:** The test file already imports `createDebouncedApiSave` from `@/lib/progressApi` at the top. The new session functions (`fetchSessionStateFromApi`, `saveSessionStateToApi`, `createDebouncedSessionSave`) need to be added to that top-level import as well. Add them to the existing import block around line 13:

```js
import {
    fetchProgressFromApi,
    saveProgressToApi,
    loadProgressFromLocalStorage,
    saveProgressToLocalStorage,
    clearLocalStorage,
    apiResponseToState,
    stateToApiPayload,
    createDebouncedApiSave,
    fetchSessionStateFromApi,
    saveSessionStateToApi,
    createDebouncedSessionSave,
} from "@/lib/progressApi";
```

Then update the `describe` blocks to use the top-level imports instead of dynamic `await import(...)`. Replace the dynamic imports in the test blocks above with direct usage of the imported functions (e.g., just call `fetchSessionStateFromApi()` directly).

---

## Task 3: Verify the `session_state` table exists in Supabase

The table should already exist from the original migration in commit `70c6ae3`. Confirm by running this SQL query against the Supabase project (`ykljehlhladqimrwlnrb`):

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'session_state'
ORDER BY ordinal_position;
```

Expected columns:
- `user_id` (uuid, NO)
- `active_scenario_id` (text, YES)
- `current_step_id` (text, YES)
- `welcome_seen` (boolean, YES)
- `metadata` (jsonb, YES)
- `updated_at` (timestamp with time zone, YES)

If the table does NOT exist, create it with this migration:

```sql
CREATE TABLE IF NOT EXISTS session_state (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    active_scenario_id TEXT,
    current_step_id TEXT,
    welcome_seen BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only read/write their own session state
ALTER TABLE session_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own session state"
    ON session_state
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_session_state_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_state_updated_at
    BEFORE UPDATE ON session_state
    FOR EACH ROW
    EXECUTE FUNCTION update_session_state_timestamp();
```

**Note:** The API route uses the service role key (bypasses RLS), so the RLS policies are defense-in-depth — they protect against direct client-side Supabase access if someone were to use the publishable key directly.

---

## Verification Checklist

After all changes, run:

```bash
# 1. All tests pass
npm test -- --run
# Expected: 0 failed

# 2. Scenario validation passes
npm run lint:scenarios
# Expected: 0 errors

# 3. Lint is clean (or at most pre-existing ChatView warning)
npm run lint

# 4. Build succeeds
npm run build
```

Then do a manual smoke test:
1. Start the dev server (`npm run dev`)
2. Log in
3. Accept a ticket (scenario_idm_orientation) in guided mode
4. Advance a few steps into the scenario
5. Hard-refresh the browser (Cmd+R / Ctrl+R)
6. Confirm you land back on the same step you were on (not the inbox)
7. Complete the scenario — confirm it saves to the inbox as completed
8. Confirm the inbox now shows only "Your first task: set up IDM" for Module 1 (the tab exploration scenario is gone)

---

## Commit Guidance

Create **two commits** (one per task):

1. `feat: remove scenario_idm_tab_exploration from Module 1`
   - `src/data/scenarios.js` — delete the scenario object
   - `src/data/curriculum.js` — remove from scenarioIds
   - `src/__tests__/TicketInbox.test.jsx` — update 3 references

2. `feat: wire mid-scenario state recovery via session_state API`
   - `src/app/api/progress/session/route.js` — restore API route
   - `src/lib/progressApi.js` — add session state functions
   - `src/context/InstructionalContext.jsx` — persist + recover session state
   - `src/__tests__/progressApi.test.js` — add session state tests

Do NOT batch into a single commit.
