# Phase 2-4 Implementation Plan (Revised)

**Branch:** `codex/curriculum-recovery` (commit `c798b73`)
**Prereqs complete:** Phase 0 (characters.js, curriculum.js, scenarios.js) + Phase 1 (engine hardening in InstructionalContext.jsx)
**Do NOT modify:** CoachMark.jsx, Sidebar.jsx, DataTable.jsx, tests/e2e/*, auth/security files

---

## Mandatory Fixes (from review)

### Fix 1: Un-authored module prerequisite deadlock prevention

**Problem:** curriculum.js defines 13 scenarios across 6 modules, but only 1 scenario exists in scenarios.js (`scenario_idm_credentials` in Module 3). Modules 1-2 have zero authored scenarios, so their prerequisites can never be satisfied, permanently locking Module 3+.

**Solution — auto-satisfy un-authored modules in the UI layer:**

Use the existing `SCENARIO_TO_MODULE` map from curriculum.js for module lookups instead of hardcoded `COURSES[0]`. Build a cross-course `MODULE_MAP` at import time for O(1) lookups:

```js
import { COURSES, SCENARIO_TO_MODULE } from "@/data/curriculum";

// Build once at module level — works across all courses:
const MODULE_MAP = {};
for (const course of COURSES) {
    for (const mod of course.modules) {
        MODULE_MAP[mod.id] = mod;
    }
}

function isModuleEffectivelyComplete(mod, completedScenarios) {
    const authored = mod.scenarioIds.filter(sid => scenarios.find(s => s.id === sid));
    if (authored.length === 0) return true; // no authored scenarios → auto-satisfy
    return authored.every(sid => completedScenarios.has(sid));
}

function isModuleLocked(mod, completedModules, completedScenarios) {
    return mod.prerequisites.some(preId => {
        if (completedModules.has(preId)) return false;
        const preMod = MODULE_MAP[preId];  // cross-course O(1) lookup
        if (!preMod) return true;          // unknown module = locked
        return !isModuleEffectivelyComplete(preMod, completedScenarios);
    });
}
```

**Behavior:** Module 1 (0 authored) → auto-satisfied → Module 2 unlocked → Module 2 (0 authored) → auto-satisfied → Module 3 unlocked. As scenarios are added in later phases, auto-satisfy stops and real prerequisites apply.

**Why UI-layer, not engine:** The engine's `completedModules` set should only contain modules genuinely completed. The inbox has the smarter "is locked?" check as a presentation concern.

**Why MODULE_MAP, not COURSES[0]:** The `COURSES[0]` lookup assumes a single course forever. `MODULE_MAP` is built from all courses at import time, so adding a second course (e.g., "Advanced IDM") later works without changing TicketInbox logic.

### Fix 2: Explicit completion state (no message-variant inference)

**Problem:** The old plan had ConversationView detect scenario completion by scanning `conversationHistory` for a `variant: "success"` message. Fragile — couples UI to a string constant in history data.

**Solution — add `scenarioJustCompleted` state to InstructionalContext:**

```js
const [scenarioJustCompleted, setScenarioJustCompleted] = useState(null);
// null when no scenario just finished
// { scenarioId, scores: { correct, total, timeMs } } after completion
```

- **Set** in `advanceStep(null)` after marking scenario complete
- **Clear** in `acceptTicket()` and `returnToInbox()`
- **Consumed** by ConversationView: `{scenarioJustCompleted && <CompletionCard ... />}`

No history scanning. No variant inference. Explicit state drives UI.

### Fix 3: Lint-gate strategy for protected files

**Current reality:** No pre-commit hooks. No build-time ESLint. ESLint configured (`eslint.config.mjs` with `next/core-web-vitals`) but only runs manually via `npm run lint`.

**Strategy:**

1. **Protected files are truly untouched.** Zero changes to:
   - `src/components/guidance/CoachMark.jsx`
   - `src/components/layout/Sidebar.jsx`
   - `src/components/ui/DataTable.jsx`
   - `tests/e2e/*`
   - Auth/security files

2. **Files we DO modify** (all in-scope for curriculum/instructional work):
   - `src/context/InstructionalContext.jsx` — engine (Phase 2)
   - `src/components/layout/DashboardShell.jsx` — layout swap (Phase 3D)
   - `src/components/guidance/GuidancePanel.jsx` — character name (Phase 4C)

3. **Verification after each commit — lint changed files only:**
   - `npx eslint <changed-files>` — lint only the files we touched in that commit (avoids flagging pre-existing warnings in protected or unrelated files)
   - `npm run build` — catches import resolution failures and type errors project-wide
   - Example: after Phase 2, run `npx eslint src/context/InstructionalContext.jsx`
   - Example: after Phase 3D, run `npx eslint src/components/helpdesk/*.jsx src/components/layout/DashboardShell.jsx`
   - Full `npm run lint` is NOT used because it may report pre-existing issues in files we are forbidden from modifying

### Fix 4: Test strategy for new live components

**Problem:** Only test is `ChatPanel.test.jsx` (166 lines, 7 tests) covering a soon-deprecated component. New components would have zero coverage.

**Solution — create test files for new components alongside them:**

#### `src/__tests__/ConversationView.test.jsx` (new, ~180 lines)

No ScenarioContext mock needed (ConversationView uses characters.js instead).

Mock context shape:
```js
const defaultContext = {
    activeScenario: { id: "test_scenario", customerId: "principalJones", description: "Test" },
    currentStep: { type: "input", actions: [] },
    conversationHistory: mockMessages,
    coachMarksEnabled: false,
    handleAction: vi.fn(),
    skipTicket: vi.fn(),
    returnToInbox: vi.fn(),
    toggleCoachMarks: vi.fn(),
    replayScenario: vi.fn(),
    scenarioJustCompleted: null,
};
```

Tests:
1. "renders customer info from characters.js" — avatar, name, school from CHARACTERS.principalJones
2. "renders conversation messages" — checks bubbles from conversationHistory
3. "handles text input submission via button" — same logic as ChatPanel test
4. "handles text input submission via Enter key" — same
5. "does not send empty messages" — same
6. "renders action buttons when currentStep has actions" — same
7. "scrolls to bottom on new messages" — same
8. "shows completion card when scenarioJustCompleted is set" — **NEW** (verifies Fix 2)

#### `src/__tests__/TicketInbox.test.jsx` (new, ~150 lines)

Mock context shape:
```js
const defaultContext = {
    completedScenarios: new Set(),
    completedModules: new Set(),
    globalScore: 0,
    scores: {},
    resetAllProgress: vi.fn(),
    acceptTicket: vi.fn(),
};
```

Tests:
1. "renders module headers from curriculum" — checks COURSES module titles appear
2. "renders ticket cards for authored scenarios" — scenario_idm_credentials appears
3. "skips un-authored scenarios without crashing" — Module 1/2 scenarios don't render
4. "un-authored modules auto-satisfy prerequisites" — Module 3 NOT locked (verifies Fix 1)
5. "completed ticket shows score" — set completedScenarios + scores, verify display
6. "locked module shows lock icon" — mock real prerequisite not met, verify lock
7. "clicking open ticket shows mode picker" — fire click, verify Guided/Unguided
8. "mode picker calls acceptTicket with correct args" — Guided → `(scenarioId, true)`

#### `src/__tests__/ChatPanel.test.jsx` — kept as-is

Still passes (backward-compat `history` works). Deleted later when ChatPanel.jsx is deleted.

---

## Phase 2: History Split + Explicit Completion State

**File modified:** `src/context/InstructionalContext.jsx`

### 2.1. Split history

Replace line 170:
```js
// Before:
const [history, setHistory] = useState(getInitialHistory);

// After:
const [ticketHistory, setTicketHistory] = useState(getInitialHistory);
const [conversationHistory, setConversationHistory] = useState([]);
```

Add backward-compatible computed value:
```js
const history = useMemo(
    () => [...ticketHistory, ...conversationHistory],
    [ticketHistory, conversationHistory]
);
```

### 2.2. Add explicit completion state (Fix 2)

```js
const [scenarioJustCompleted, setScenarioJustCompleted] = useState(null);
```

### 2.3. Redirect all setHistory calls

| Location | Line | Change |
|----------|------|--------|
| `addMessageToHistory` | ~245 | `setHistory` → `setConversationHistory` |
| `acceptTicket` | after 272 | Add `setConversationHistory([]); setScenarioJustCompleted(null);` |
| `acceptTicket` setTimeout | ~280 | `setHistory` → `setConversationHistory` |
| `skipTicket` | ~301 | `setHistory` → `setConversationHistory`; add `setRightPanelView("inbox"); setScenarioJustCompleted(null);` |
| `advanceStep` end | ~321 | `setHistory` → `setConversationHistory` |
| `advanceStep` end | after completedScenarios | Add `setScenarioJustCompleted({ scenarioId, scores: { correct, total, timeMs } })` |
| `handleAction` (×3) | ~385, ~411, ~426 | `setHistory` → `setConversationHistory` |
| `returnToInbox` | ~513 | Add `setConversationHistory([]); setScenarioJustCompleted(null);` |
| `resetAllProgress` | ~532 | → `setTicketHistory(getInitialHistory()); setConversationHistory([]); setScenarioJustCompleted(null);` |

### 2.4. Updated context value

Add: `ticketHistory`, `conversationHistory`, `scenarioJustCompleted`
Keep: `history` (backward compat)

### Phase 2 verification:
```bash
npx eslint src/context/InstructionalContext.jsx   # lint changed file only
npx vitest run   # ChatPanel.test.jsx still passes (reads computed history)
npm run build    # import resolution check
```

---

## Phase 3: Right Panel Architecture

### 3A. `src/components/helpdesk/RightPanel.jsx` + `.module.css`

~30 lines. Orchestrator:
```jsx
"use client";
import { useInstructional } from "@/context/InstructionalContext";
import GuidancePanel from "@/components/guidance/GuidancePanel";
import TicketInbox from "./TicketInbox";
import ConversationView from "./ConversationView";
import styles from "./RightPanel.module.css";

export default function RightPanel() {
    const { rightPanelView } = useInstructional();
    return (
        <div className={styles.panel}>
            {rightPanelView === "conversation" && <GuidancePanel />}
            {rightPanelView === "inbox" ? <TicketInbox /> : <ConversationView />}
        </div>
    );
}
```

### 3B. `src/components/helpdesk/TicketInbox.jsx` + `.module.css`

~200 + 180 lines.

**Context:** `completedScenarios`, `completedModules`, `globalScore`, `scores`, `resetAllProgress`, `acceptTicket`
**Data:** `scenarios`, `COURSES`, `CHARACTERS`, `getCustomerInfo`
**Local state:** `showModePicker`, `pendingScenarioId`
**Contains Fix 1:** `isModuleEffectivelyComplete()` + `isModuleLocked()` helper functions

Structure:
- Header: "📥 Help Desk" + score badge + reset
- Progress bar: dots per module
- Ticket list grouped by module (header per module)
  - Each authored ticket: avatar, #number, subject, status
  - Un-authored scenarios: skip silently (no card rendered)
  - Status: Open (clickable) → mode picker | Completed (✓ score) | Locked (🔒)
- Mode picker overlay: Guided / Unguided

CSS: design tokens only (`var(--gray-*)`, `var(--clever-blue)`, `var(--error)`, `var(--warning)`)

### 3C. `src/components/helpdesk/ConversationView.jsx` + `.module.css`

~220 + 200 lines.

**Context:** `activeScenario`, `currentStep`, `conversationHistory`, `coachMarksEnabled`, `handleAction`, `skipTicket`, `returnToInbox`, `toggleCoachMarks`, `replayScenario`, `scenarioJustCompleted`
**Data:** `getCustomerInfo` from characters.js
**Contains Fix 2:** completion card driven by `scenarioJustCompleted` state

Structure:
- Header: ← Back + avatar + name + school + coach toggle
- Messages: `conversationHistory` (customer/agent/system bubbles)
- Completion card (when `scenarioJustCompleted` is truthy):
  - ✅ Ticket Resolved + score + time + Replay + Return to Inbox
- Input area: action buttons / textarea+send / waiting hint / skip

CSS: migrated from ChatPanel, hex → CSS variables

### 3D. Modify `src/components/layout/DashboardShell.jsx`

```diff
- import ChatPanel from "@/components/chat/ChatPanel";
- import GuidancePanel from "@/components/guidance/GuidancePanel";
+ import RightPanel from "@/components/helpdesk/RightPanel";
```
```diff
- <GuidancePanel />
- <ChatPanel />
+ <RightPanel />
```

### 3E. ChatPanel.jsx — kept on disk, not imported

### 3F. New test files (Fix 4)

Create: `src/__tests__/ConversationView.test.jsx` (8 tests)
Create: `src/__tests__/TicketInbox.test.jsx` (8 tests)
Keep: `src/__tests__/ChatPanel.test.jsx` (unchanged)

### Phase 3 verification:
```bash
npx eslint src/components/helpdesk/*.jsx src/components/layout/DashboardShell.jsx   # lint changed files only
npx vitest run        # all tests pass (3 old + 16 new)
npm run build         # import resolution check
```

Manual:
- Inbox shows Module 3 ticket (Modules 1-2 auto-satisfied per Fix 1)
- Click → mode picker → conversation → complete → completion card (Fix 2)
- Back → inbox. Coach marks work. GuidancePanel above conversation.

---

## Phase 4: Characters & Narrative

### 4A. Boss message in TicketInbox

Section above ticket list:
- `currentModule` = first module where `!isModuleLocked()` AND `!isModuleEffectivelyComplete()` AND has authored scenarios
- Render: `CHARACTERS.boss` avatar + name + role + `bossIntro`
- Dismiss: local `useState(new Set())`
- Module completion: `bossCompletion` inline in module group

### 4B. Character avatars — done in 3B/3C

### 4C. Update `src/components/guidance/GuidancePanel.jsx`

```diff
- import { demoCustomer } from "@/data/demoIdentity";
+ import { getCharacterDisplayName } from "@/data/characters";
```
```diff
- `Find the answer and reply to ${demoCustomer.lastName}.`
+ `Find the answer and reply to ${activeScenario?.customerId ? getCharacterDisplayName(activeScenario.customerId) : "the customer"}.`
```

### 4D. WelcomeScreen — deferred

### Phase 4 verification:
```bash
npx eslint src/components/helpdesk/TicketInbox.jsx src/components/guidance/GuidancePanel.jsx   # lint changed files only
npx vitest run
npm run build
```

---

## Commit Strategy

Every commit runs **lint (changed files only) + build + tests**. No exceptions.

| # | Contents | Verification |
|---|----------|-------------|
| 1 | Phase 2: history split + `scenarioJustCompleted` | `npx eslint src/context/InstructionalContext.jsx` + `npm run build` + `npx vitest run` |
| 2 | Phase 3A-3C + 3F: new components + new tests | `npx eslint src/components/helpdesk/*.jsx` + `npm run build` + `npx vitest run` |
| 3 | Phase 3D: DashboardShell swap | `npx eslint src/components/layout/DashboardShell.jsx src/components/helpdesk/*.jsx` + `npm run build` + `npx vitest run` |
| 4 | Phase 4A + 4C: boss messages + GuidancePanel | `npx eslint src/components/helpdesk/TicketInbox.jsx src/components/guidance/GuidancePanel.jsx` + `npm run build` + `npx vitest run` |

All on `codex/curriculum-recovery`. No branch switching. No cherry-picking.
