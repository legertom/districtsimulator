# Right Sidebar Redesign — Implementation Prompt

You are rewriting the right sidebar of a React training simulator game. The game simulates a help desk where the user (a new IT admin) receives support tickets from coworkers and investigates them by navigating a simulated UI.

The goal: transform the right sidebar from a "project management checklist" into a "conversational thread" that focuses the user on one thing at a time.

---

## PROJECT CONTEXT

- **Framework:** Next.js (App Router), React 18, CSS Modules
- **State management:** React Context (`InstructionalContext.jsx`)
- **Design tokens:** CSS custom properties defined in `src/app/globals.css`
- **Working directory:** `/Users/tomleger/repo/districtsimulator`

---

## IMPORTANT CONSTRAINTS

1. **Do NOT modify `InstructionalContext.jsx`** — all state, scoring, step progression, `acceptTicket`, `advanceStep`, `handleAction`, `skipTicket`, `returnToInbox`, `replayScenario`, `resetAllProgress`, and persistence logic stays exactly as-is. You are only changing rendering.
2. **Do NOT modify any scenario data** (`scenarios.js`, `curriculum.js`, `characters.js`).
3. **Do NOT modify `CoachMark.jsx`** — the spotlight overlay system is independent and works fine.
4. **Do NOT change `RightPanel.module.css`** — it's just a flex container.
5. **Do NOT touch `DashboardShell.jsx`** or the left sidebar.
6. **All CSS must use existing design tokens** from `globals.css` (e.g., `var(--clever-blue)`, `var(--gray-200)`, `var(--text-primary)`, etc.). Never introduce hardcoded colors except as fallbacks in `var()` expressions that already exist.
7. **Preserve all existing functionality:** mode picker (guided/unguided), coach marks toggle, hint toggle, scoring, completion cards, replay, skip, reset, boss messages, module locking/unlocking, and ticket notifications. Nothing should break.
8. **Keep the `ConversationView.jsx` file intact** — it's the legacy view. Only the investigation path and the inbox are being redesigned.

---

## PART 1: TICKET INBOX REDESIGN

### File: `src/components/helpdesk/TicketInbox.jsx`
### CSS: `src/components/helpdesk/TicketInbox.module.css`

### Current Problem
The inbox shows all 7 modules and all 14 tickets stacked vertically. Locked modules show with lock icons. The user sees the entire course syllabus at once, causing cognitive overload and breaking the "first day at a new job" fiction.

### New Behavior

**Show only three sections:**

1. **Completed modules** — collapsed to a single-line summary per module
2. **Current module** — fully expanded with boss intro + tickets
3. **Future/locked modules** — completely hidden

**Detailed rendering rules:**

#### Section 1: Completed modules (if any exist)
For each module where `complete === true && locked === false`:
- Render a single compact row:
  - Green checkmark `✓` on the left
  - `Module {N}` label (bold, small, uppercase, `--gray-600`)
  - Module title (regular weight, `--text-secondary`)
  - The boss completion message should NOT appear here (remove the `bossCompletion` block from completed modules — it clutters the compact view)
- These rows should have: `padding: 8px 16px`, `background: var(--gray-50)`, `border-bottom: 1px solid var(--gray-100)`, `font-size: 12px`, `opacity: 0.7`
- These rows are not clickable or expandable

#### Section 2: Current module (the first unlocked, incomplete module with authored scenarios)
This is the main focus area. Render exactly as the current inbox renders a module group, including:
- Module header with number and title (no lock icon, no check icon)
- Boss intro message (if not dismissed) — keep the existing `bossMessage` block exactly as-is
- Ticket cards — keep the existing `ticketCard` blocks exactly as-is
- Inline mode picker — keep exactly as-is
- If all tickets in the current module are complete but the module's `complete` flag is true (just finished), show the boss completion message in the existing `bossCompletion` style, then immediately below it, render the next module's tickets (repeat the "current module" logic for the next unlocked incomplete module)

#### Section 3: Future/locked modules
**Do not render them at all.** No lock icons, no grayed-out rows, nothing. They don't exist yet in the user's world.

#### Progress bar
Keep the progress bar as-is (the dots at the top). This gives a subtle sense of overall progress without overwhelming.

#### Header
Keep the header exactly as-is (`📥 Help Desk`, open badge, score badge, reset button).

### CSS Changes

Add these new classes to `TicketInbox.module.css`:

```css
/* ── Completed module row (compact) ── */

.completedModuleRow {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--gray-50);
    border-bottom: 1px solid var(--gray-100);
    font-size: 12px;
    opacity: 0.7;
}

.completedModuleCheck {
    color: var(--success);
    font-weight: 700;
    font-size: 13px;
    flex-shrink: 0;
}

.completedModuleNumber {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: var(--gray-600);
    font-size: 10px;
    flex-shrink: 0;
}

.completedModuleTitle {
    font-weight: 400;
    color: var(--text-secondary);
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
```

### JSX Changes

Replace the `ticketList` rendering section. The current code does:

```jsx
{moduleStates.map(({ mod, locked, complete }, modIdx) => {
    // renders ALL modules...
})}
```

Replace it with logic that:

1. Filters `moduleStates` into `completedModules` (complete && !locked) and finds the `currentModule` (first where !locked && !complete && has authored scenarios)
2. Renders completed modules as compact rows
3. Renders only the current module fully expanded
4. Renders nothing for locked/future modules

Here is the exact JSX for the `ticketList` div:

```jsx
<div className={styles.ticketList}>
    {/* Completed modules — compact rows */}
    {moduleStates.map(({ mod, locked, complete }, modIdx) => {
        if (!complete || locked) return null;
        const authored = mod.scenarioIds.filter(sid => scenarios.find(s => s.id === sid));
        if (authored.length === 0) return null;

        return (
            <div key={mod.id} className={styles.completedModuleRow}>
                <span className={styles.completedModuleCheck}>✓</span>
                <span className={styles.completedModuleNumber}>Module {modIdx + 1}</span>
                <span className={styles.completedModuleTitle}>{mod.title}</span>
            </div>
        );
    })}

    {/* Current module — fully expanded */}
    {moduleStates.map(({ mod, locked, complete }, modIdx) => {
        if (locked || complete) return null;

        const authoredScenarios = mod.scenarioIds
            .map(sid => scenarios.find(s => s.id === sid))
            .filter(Boolean);

        if (authoredScenarios.length === 0) return null;

        // Only render the FIRST unlocked incomplete module
        const isCurrentModule = moduleStates.findIndex(
            ms => !ms.locked && !ms.complete && ms.mod.scenarioIds.some(sid => scenarios.find(s => s.id === sid))
        ) === modIdx;

        if (!isCurrentModule) return null;

        return (
            <div key={mod.id} className={styles.moduleGroup}>
                <div className={styles.moduleHeader}>
                    <span className={styles.moduleNumber}>Module {modIdx + 1}</span>
                    <span className={styles.moduleTitle}>{mod.title}</span>
                </div>

                {authoredScenarios.map(scenario => {
                    const isDone = completedScenarios.has(scenario.id);
                    const scenarioScore = scores[scenario.id];
                    const isClickable = !isDone && !showModePicker;
                    const isPending = pendingScenarioId === scenario.id;
                    const customer = getCustomerInfo(scenario.customerId);
                    const priority = scenario.ticketPriority || "normal";

                    return (
                        <div key={scenario.id}>
                            <div
                                className={`${styles.ticketCard} ${
                                    styles[`priority_${priority}`]
                                } ${isDone ? styles.ticketDone : ""} ${
                                    isClickable ? styles.ticketClickable : ""
                                }`}
                                onClick={isClickable ? () => handleTicketClick(scenario.id) : undefined}
                                role={isClickable ? "button" : undefined}
                                tabIndex={isClickable ? 0 : undefined}
                            >
                                <div
                                    className={styles.ticketAvatar}
                                    style={{ backgroundColor: customer.avatarColor }}
                                >
                                    {customer.avatar}
                                </div>
                                <div className={styles.ticketContent}>
                                    <div className={styles.ticketTop}>
                                        <span className={styles.ticketNumber}>
                                            #{scenario.ticketNumber || "—"}
                                        </span>
                                        <span className={styles.ticketCustomer}>
                                            {customer.name}
                                        </span>
                                    </div>
                                    <div className={styles.ticketSubject}>
                                        {scenario.ticketSubject || scenario.description}
                                    </div>
                                    <div className={styles.ticketMeta}>
                                        {isDone && scenarioScore ? (
                                            <span className={styles.ticketScore}>
                                                ✓ <span className={styles.scoreModeLabel}>Guided:</span> {scenarioScore.guided?.correct || 0}/{scenarioScore.guided?.total || 0}
                                                {scenarioScore.guided?.timeMs ? ` · ${formatTime(scenarioScore.guided.timeMs)}` : ""}
                                                {scenarioScore.unguided && (
                                                    <>
                                                        <br />
                                                        <span className={styles.scoreModeLabel}>Unguided:</span> {scenarioScore.unguided.correct}/{scenarioScore.unguided.total}
                                                        {scenarioScore.unguided.timeMs ? ` · ${formatTime(scenarioScore.unguided.timeMs)}` : ""}
                                                    </>
                                                )}
                                            </span>
                                        ) : (
                                            <span className={styles.ticketOpen}>Open</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isPending && showModePicker && (
                                <div className={styles.modePicker}>
                                    <div className={styles.modePickerLabel}>
                                        How would you like to proceed?
                                    </div>
                                    <div className={styles.modeButtons}>
                                        <button
                                            className={styles.modeButton}
                                            onClick={() => handleModeSelect(true)}
                                        >
                                            <span className={styles.modeButtonIcon}>💡</span>
                                            <span className={styles.modeButtonText}>
                                                <strong>Guided</strong>
                                                <small>Coach marks will show you where to go</small>
                                            </span>
                                        </button>
                                        <button
                                            className={`${styles.modeButton} ${styles.modeButtonAlt}`}
                                            onClick={() => handleModeSelect(false)}
                                        >
                                            <span className={styles.modeButtonIcon}>🧭</span>
                                            <span className={styles.modeButtonText}>
                                                <strong>Unguided</strong>
                                                <small>Figure it out on your own</small>
                                            </span>
                                        </button>
                                    </div>
                                    <button
                                        className={styles.cancelPicker}
                                        onClick={handleCancelModePicker}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    })}
</div>
```

**Note:** The `locked` check on `isClickable` is removed because we only render the current (unlocked) module. The `ticketLocked` CSS class is no longer applied to any rendered tickets.

---

## PART 2: INVESTIGATION VIEW → THREAD VIEW

### Files to modify:
- `src/components/helpdesk/InvestigationView.jsx` (full rewrite of JSX, keep same hooks/context)
- `src/components/helpdesk/InvestigationView.module.css` (full rewrite)

### Files to leave alone:
- `src/components/helpdesk/TicketCard.jsx` — keep it, still used
- `src/components/helpdesk/TicketCard.module.css` — keep it, still used

### Current Problem
The InvestigationView pins the ticket message at the top, lists ALL steps as a visible checklist below it, and expands the current step inline. As the user progresses, the current step moves further and further down, requiring scrolling past completed work. The input area is embedded inside the step expansion, not in a persistent location. There is no bottom-anchored input area.

### New Layout (top to bottom)

```
┌─────────────────────────────┐
│ ← Back    #1001          💡 │  ← FIXED HEADER (flex-shrink: 0)
├─────────────────────────────┤
│                             │
│  [Scrollable thread area]   │  ← flex: 1, overflow-y: auto
│                             │
│  ┌─ PJ ──────────────────┐ │  ← TicketCard (first item in scroll)
│  │ Hi! Can you check     │ │
│  │ that everything's     │ │
│  │ working?              │ │
│  └───────────────────────┘ │
│                             │
│  ✓ Navigate to IDM page    │  ← Completed step (compact)
│  ✓ Identify the provider   │  ← Completed step (compact)
│                             │
│  ┌── Current Step ────────┐ │  ← Current step (expanded, blue border)
│  │ → Assess integration   │ │
│  │   health               │ │
│  │                        │ │
│  │ Based on the provider  │ │
│  │ card status badges...  │ │
│  │                        │ │
│  │ [Choice A]             │ │  ← Choices rendered IN the step card
│  │ [Choice B]             │ │     (NOT in the footer)
│  │                        │ │
│  │ [Show Hint]            │ │
│  └────────────────────────┘ │
│                             │
│  ○ Find the last sync...   │  ← Future steps (compact, dimmed)
│  ○ Evaluate whether...     │
│  ○ Report back to PJ       │
│                             │
│  <div ref={bottomRef} />    │  ← Scroll anchor
│                             │
├─────────────────────────────┤
│  [ Type your answer...   ]  │  ← FIXED FOOTER (flex-shrink: 0)
│  [Submit]    Skip this ticket│
└─────────────────────────────┘
```

### Detailed Rendering Rules

#### Header (fixed, flex-shrink: 0)
Keep the same structure as current: back button, title area, coach toggle.

**Change the title content:** Instead of showing `activeScenario.title` (e.g., "IDM Page Orientation"), show the ticket number and customer name:
```jsx
<span className={styles.headerTitle}>
    #{activeScenario?.ticketNumber || "—"} · {customer.name}
</span>
```

#### Thread Area (flex: 1, overflow-y: auto, padding: 12px)

This is the scrollable main content. Items appear in this order:

**Item 1: TicketCard**
Render `<TicketCard scenario={activeScenario} />` as the first item in the scroll area. It is NOT pinned/sticky — it scrolls up naturally as the user progresses. Remove `flex-shrink: 0` from `TicketCard.module.css` `.ticketCard` (it's no longer in a flex column that could shrink it).

**Items 2+: Step items**
Render each step from `stepList` (the existing `useMemo` that builds normalized steps with `_status`).

Rendering per status:

- **`completed`**: Compact single line. Shows `✓` icon + `checklistLabel`. Font size 13px, `opacity: 0.5`, no expansion, no border. Minimal padding: `6px 10px`.

- **`current`**: Expanded card with blue left border. Shows:
  - `→` icon + `checklistLabel` (or resolution badge)
  - `step.question` (if present)
  - For `goal` type steps: show `step.guideMessage` in italic gray text
  - For `choice` type steps: render choice buttons directly inside this card (same styling as current `choiceButtons`)
  - For `resolution` type steps: render choice buttons with the resolution badge
  - **Do NOT render freetext input here** — freetext input lives in the footer
  - If `coachMarksEnabled && step.hint`: show the hint toggle button
  - Styling: `background: var(--clever-blue-light)`, `border: 1px solid var(--clever-blue)`, `border-radius: 8px`, `padding: 10px 12px`

- **`future`**: Compact single line. Shows `○` icon + `checklistLabel`. Font size 13px, `opacity: 0.35`. Minimal padding: `6px 10px`.

**Completion Card**
When `scenarioJustCompleted` is truthy, render the completion card as the last item in the thread (after all steps). Keep the exact same completion card markup and CSS classes from the current InvestigationView. It should appear at the bottom of the scroll area, not replace the steps.

**Scroll Anchor**
Add `<div ref={bottomRef} />` at the very end of the thread area.

#### Auto-scroll behavior
Replace the current `currentStepRef` scrolling with bottom-anchoring:

```jsx
const bottomRef = useRef(null);

useEffect(() => {
    if (typeof bottomRef.current?.scrollIntoView === "function") {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
}, [currentStep?.id, scenarioJustCompleted]);
```

This means: whenever the step changes or the scenario completes, scroll to the bottom of the thread. The user can scroll up to see the ticket or completed steps, but new content always appears at the bottom.

#### Footer (fixed, flex-shrink: 0, border-top)

The footer is **always visible** at the bottom of the InvestigationView. Its content changes based on state:

**State 1: Scenario just completed**
```jsx
<div className={styles.footer}>
    <div className={styles.footerStatus}>Ticket resolved</div>
    <div className={styles.footerActions}>
        <button className={styles.replayButton} onClick={() => replayScenario(scenarioJustCompleted.scenarioId)}>
            ↺ Replay
        </button>
        <button className={styles.returnButton} onClick={returnToInbox}>
            Return to Inbox
        </button>
    </div>
</div>
```

**State 2: Current step is `freetext` (observe steps with text input)**
```jsx
<div className={styles.footer}>
    <div className={styles.inputWrapper}>
        <textarea
            className={styles.input}
            placeholder="Type your answer..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
        />
        <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!inputValue.trim()}
        >
            Submit
        </button>
    </div>
    <div className={styles.footerMeta}>
        <span className={styles.footerHint}>Press Enter to send</span>
        <button className={styles.skipButton} onClick={skipTicket}>
            Skip this ticket
        </button>
    </div>
</div>
```

**State 3: Current step is `goal` (navigation/task step)**
```jsx
<div className={styles.footer}>
    <div className={styles.footerStatus}>
        {currentStep.guideMessage || "Navigate to complete this step..."}
    </div>
    <div className={styles.footerMeta}>
        <span></span>
        <button className={styles.skipButton} onClick={skipTicket}>
            Skip this ticket
        </button>
    </div>
</div>
```

**State 4: Current step is `choice` or `resolution`**
Choices are rendered inside the step card in the thread area (not in the footer). The footer shows:
```jsx
<div className={styles.footer}>
    <div className={styles.footerStatus}>Choose an answer above</div>
    <div className={styles.footerMeta}>
        <span></span>
        <button className={styles.skipButton} onClick={skipTicket}>
            Skip this ticket
        </button>
    </div>
</div>
```

**State 5: No current step (edge case, shouldn't happen)**
```jsx
<div className={styles.footer}>
    <div className={styles.footerStatus}>Loading...</div>
</div>
```

**Footer CSS:**
```css
.footer {
    padding: 12px 16px;
    border-top: 1px solid var(--gray-200);
    background: white;
    flex-shrink: 0;
}

.footerStatus {
    font-size: 13px;
    color: var(--gray-600);
    font-style: italic;
    padding: 6px 0;
}

.footerActions {
    display: flex;
    gap: 8px;
    justify-content: center;
    padding-top: 4px;
}

.footerMeta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
}

.footerHint {
    font-size: 11px;
    color: var(--gray-500);
}
```

### Determining step type for footer rendering

Use the existing `STEP_TYPE_MAP` import that's already in the file. The map returns:
- `"goal"` for `task` type steps
- `"freetext"` for `observe` and `input` type steps
- `"choice"` for `checkpoint` and `resolution` type steps

So the footer logic is:
```jsx
const stepProc = currentStep ? STEP_TYPE_MAP[currentStep.type] : null;
```
Then branch on `stepProc`:
- `stepProc === "freetext"` → show textarea
- `stepProc === "goal"` → show navigation status
- `stepProc === "choice"` → show "choose above" hint
- `null` (no step) → show loading or nothing

### GuidancePanel removal from investigation view

Currently `RightPanel.jsx` renders `<GuidancePanel />` above `<InvestigationView />` when the view is "investigation". The GuidancePanel shows a dark bar with the guide message and hint toggle. **Remove it from the investigation view path** because:
- The guide message now appears in the footer (for goal steps) or is unnecessary (the step card shows the question)
- The hint toggle now lives inside the current step card

**Change in `RightPanel.jsx`:**

```jsx
// BEFORE:
{rightPanelView === "investigation" && (
    <>
        <GuidancePanel />
        <InvestigationView />
    </>
)}

// AFTER:
{rightPanelView === "investigation" && <InvestigationView />}
```

Keep the `GuidancePanel` import in case it's used elsewhere, but do not render it in the investigation path.

---

## PART 3: FULL CSS FOR InvestigationView.module.css

Replace the entire file with:

```css
/* ═══════════════════════════════════════════════
   InvestigationView — Thread-style ticket investigation
   Bottom-anchored feed with persistent input footer.
   Uses design tokens from globals.css only.
   ═══════════════════════════════════════════════ */

.investigation {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

/* ── Header ── */

.header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--gray-50);
    flex-shrink: 0;
}

.backButton {
    width: 30px;
    height: 30px;
    border-radius: 6px;
    border: 1px solid var(--gray-300);
    background: white;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: all 0.15s;
    flex-shrink: 0;
}

.backButton:hover {
    background: var(--gray-100);
    border-color: var(--gray-400);
}

.headerInfo {
    flex: 1;
    min-width: 0;
}

.headerTitle {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
}

.headerActions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
}

.coachToggle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--gray-300);
    background: var(--gray-100);
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    opacity: 0.5;
}

.coachToggle:hover {
    opacity: 1;
}

.coachToggleOn {
    background: var(--warning-bg);
    border-color: var(--warning);
    opacity: 1;
}

/* ── Thread area (scrollable feed) ── */

.thread {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

/* ── Step items ── */

.stepItem {
    display: flex;
    gap: 10px;
    padding: 6px 10px;
    border-radius: 8px;
    transition: background 0.15s;
    align-items: flex-start;
}

.step_current {
    background: var(--clever-blue-light, #eef3ff);
    border: 1px solid var(--clever-blue, #1464ff);
    padding: 10px 12px;
    margin: 4px 0;
}

.step_completed {
    opacity: 0.5;
}

.step_future {
    opacity: 0.35;
}

/* ── Step indicator icons ── */

.stepIndicator {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 14px;
    margin-top: 1px;
}

.stepCheck {
    color: var(--success, #16a34a);
    font-weight: 700;
    font-size: 13px;
}

.stepArrow {
    color: var(--clever-blue, #1464ff);
    font-weight: 700;
    font-size: 15px;
}

.stepCircle {
    color: var(--gray-400);
    font-size: 11px;
}

/* ── Step content ── */

.stepContent {
    flex: 1;
    min-width: 0;
}

.stepLabel {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.4;
}

.resolutionBadge {
    font-weight: 600;
    color: var(--clever-blue-dark, #0d4fcc);
}

/* ── Expanded current step ── */

.stepExpanded {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.stepQuestion {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
    margin: 0;
}

.navPrompt {
    font-size: 12px;
    color: var(--gray-600);
    font-style: italic;
}

/* ── Choices (buttons) — rendered inside the current step card ── */

.choiceButtons {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.choiceButton {
    text-align: left;
    padding: 10px 12px;
    border: 1px solid var(--gray-300);
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 13px;
    line-height: 1.4;
    color: var(--text-primary);
    transition: all 0.15s;
}

.choiceButton:hover {
    border-color: var(--clever-blue);
    background: white;
}

/* ── Hint button ── */

.hintButton {
    align-self: flex-start;
    background: none;
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 11px;
    color: var(--gray-600);
    cursor: pointer;
    transition: all 0.15s;
}

.hintButton:hover {
    border-color: var(--warning);
    color: var(--warning);
}

.hintActive {
    border-color: var(--warning);
    background: var(--warning-bg);
    color: #856404;
}

/* ── Completion card ── */

.completionCard {
    margin-top: 8px;
    padding: 20px;
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    animation: fadeIn 0.3s ease-out;
}

.completionIcon {
    font-size: 32px;
    margin-bottom: 8px;
}

.completionTitle {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.completionMessage {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.4;
    margin-bottom: 16px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}

.completionStats {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.completionStat {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.statLabel {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gray-600);
    font-weight: 600;
}

.statValue {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
}

/* ── Footer (persistent input area) ── */

.footer {
    padding: 12px 16px;
    border-top: 1px solid var(--gray-200);
    background: white;
    flex-shrink: 0;
}

.footerStatus {
    font-size: 13px;
    color: var(--gray-600);
    font-style: italic;
    padding: 4px 0;
}

.footerActions {
    display: flex;
    gap: 8px;
    justify-content: center;
    padding-top: 4px;
}

.footerMeta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
}

.footerHint {
    font-size: 11px;
    color: var(--gray-500);
}

.inputWrapper {
    display: flex;
    gap: 8px;
    align-items: flex-end;
}

.input {
    flex: 1;
    min-height: 36px;
    max-height: 80px;
    resize: vertical;
    padding: 8px 10px;
    border: 1px solid var(--gray-300);
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.4;
    font-family: inherit;
    outline: none;
}

.input:focus {
    border-color: var(--clever-blue);
}

.sendButton {
    background: var(--clever-blue);
    color: white;
    border: none;
    height: 36px;
    min-width: 64px;
    padding: 0 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: background 0.15s;
}

.sendButton:hover {
    background: var(--clever-blue-dark);
}

.sendButton:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.replayButton {
    padding: 8px 16px;
    border: 1px solid var(--gray-300);
    border-radius: 8px;
    background: white;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.replayButton:hover {
    background: var(--gray-100);
    border-color: var(--gray-400);
}

.returnButton {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: var(--clever-blue);
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.returnButton:hover {
    background: var(--clever-blue-dark);
}

.skipButton {
    background: none;
    border: none;
    color: var(--gray-500);
    font-size: 11px;
    cursor: pointer;
    text-decoration: underline;
    padding: 2px 4px;
    transition: color 0.2s;
}

.skipButton:hover {
    color: var(--error);
}

/* ── Animations ── */

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
```

---

## PART 4: FULL JSX FOR InvestigationView.jsx

Replace the entire component with:

```jsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import { normalizeStep, STEP_TYPE_MAP } from "@/context/InstructionalContext";
import { getCustomerInfo } from "@/data/characters";
import TicketCard from "./TicketCard";
import styles from "./InvestigationView.module.css";

export default function InvestigationView() {
    const {
        activeScenario,
        currentStep,
        normalizedCurrentStep,
        coachMarksEnabled,
        showHint,
        handleAction,
        skipTicket,
        returnToInbox,
        toggleCoachMarks,
        toggleHint,
        replayScenario,
        scenarioJustCompleted,
        scores,
        visitedStepIds,
    } = useInstructional();

    const [inputValue, setInputValue] = useState("");
    const bottomRef = useRef(null);
    const prevStepIdRef = useRef(currentStep?.id);

    // Build normalized step list with completion status
    const stepList = useMemo(() => {
        if (!activeScenario?.steps) return [];

        return activeScenario.steps.map((step) => {
            const norm = normalizeStep(step);
            let status = "future";

            if (scenarioJustCompleted) {
                status = visitedStepIds.has(step.id) ? "completed" : "future";
            } else if (step.id === currentStep?.id) {
                status = "current";
            } else if (visitedStepIds.has(step.id)) {
                status = "completed";
            }

            return { ...norm, _status: status, _originalStep: step };
        });
    }, [activeScenario, currentStep, scenarioJustCompleted, visitedStepIds]);

    // Reset input when step changes
    if (currentStep?.id !== prevStepIdRef.current) {
        prevStepIdRef.current = currentStep?.id;
        if (inputValue !== "") {
            setInputValue("");
        }
    }

    // Auto-scroll to bottom when step changes or scenario completes
    useEffect(() => {
        if (typeof bottomRef.current?.scrollIntoView === "function") {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentStep?.id, scenarioJustCompleted]);

    const handleSend = () => {
        const text = inputValue.trim();
        if (!text) return;
        handleAction({ type: "submitted_answer", text });
        setInputValue("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (ms) => {
        if (!ms) return "—";
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}m ${sec.toString().padStart(2, "0")}s`;
    };

    const customer = getCustomerInfo(activeScenario?.customerId);
    const stepProc = currentStep ? STEP_TYPE_MAP[currentStep.type] : null;

    return (
        <div className={styles.investigation}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={returnToInbox}
                    title="Return to inbox"
                >
                    ←
                </button>
                <div className={styles.headerInfo}>
                    <span className={styles.headerTitle}>
                        #{activeScenario?.ticketNumber || "—"} · {customer.name}
                    </span>
                </div>
                <div className={styles.headerActions}>
                    {(currentStep || scenarioJustCompleted) && (
                        <button
                            className={`${styles.coachToggle} ${coachMarksEnabled ? styles.coachToggleOn : ""}`}
                            onClick={toggleCoachMarks}
                            title={coachMarksEnabled ? "Disable coach marks" : "Enable coach marks"}
                        >
                            💡
                        </button>
                    )}
                </div>
            </div>

            {/* ── Thread area (scrollable) ── */}
            <div className={styles.thread}>
                {/* Ticket message — scrolls with content */}
                <TicketCard scenario={activeScenario} />

                {/* Step feed */}
                {stepList.map((step) => {
                    const isCurrent = step._status === "current";
                    const isCompleted = step._status === "completed";
                    const isStepResolution = step.type === "resolution";
                    const stepType = STEP_TYPE_MAP[step.type];

                    return (
                        <div
                            key={step.id}
                            className={`${styles.stepItem} ${styles[`step_${step._status}`]}`}
                            role="listitem"
                            aria-current={isCurrent ? "step" : undefined}
                        >
                            {/* Step indicator */}
                            <div className={styles.stepIndicator}>
                                {isCompleted ? (
                                    <span className={styles.stepCheck}>✓</span>
                                ) : isCurrent ? (
                                    <span className={styles.stepArrow}>→</span>
                                ) : (
                                    <span className={styles.stepCircle}>○</span>
                                )}
                            </div>

                            <div className={styles.stepContent}>
                                {/* Label */}
                                <div className={styles.stepLabel}>
                                    {isStepResolution && isCurrent ? (
                                        <span className={styles.resolutionBadge}>
                                            📤 Report back to {customer.name}
                                        </span>
                                    ) : (
                                        step.checklistLabel
                                    )}
                                </div>

                                {/* Current step: expanded with question + interaction */}
                                {isCurrent && !scenarioJustCompleted && (
                                    <div className={styles.stepExpanded}>
                                        {step.question && (
                                            <p className={styles.stepQuestion}>{step.question}</p>
                                        )}

                                        {/* Goal step: navigation hint */}
                                        {stepType === "goal" && (
                                            <div className={styles.navPrompt}>
                                                {step.guideMessage || "Navigate to complete this step..."}
                                            </div>
                                        )}

                                        {/* Choice/resolution: buttons in the card */}
                                        {stepType === "choice" && step.choices && (
                                            <div className={styles.choiceButtons}>
                                                {step.choices.map((choice, idx) => (
                                                    <button
                                                        key={`${choice.label}-${idx}`}
                                                        className={styles.choiceButton}
                                                        onClick={() => handleAction(choice)}
                                                    >
                                                        {choice.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Hint toggle */}
                                        {coachMarksEnabled && step.hint && (
                                            <button
                                                className={`${styles.hintButton} ${showHint ? styles.hintActive : ""}`}
                                                onClick={toggleHint}
                                            >
                                                {showHint ? "Hide Hint" : "Show Hint"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Completion card */}
                {scenarioJustCompleted && (
                    <div className={styles.completionCard}>
                        <div className={styles.completionIcon}>✅</div>
                        <div className={styles.completionTitle}>
                            {coachMarksEnabled ? "Excellent Work with Guidance!" : "Strong Independent Performance!"}
                        </div>
                        <div className={styles.completionMessage}>
                            {coachMarksEnabled
                                ? "With coach marks and guidance, you successfully navigated this investigation. Consider trying the unguided mode to test your independence."
                                : "You successfully completed this investigation unaided — demonstrating strong independent problem-solving skills."}
                        </div>
                        <div className={styles.completionStats}>
                            <div className={styles.completionStat}>
                                <span className={styles.statLabel}>Mode</span>
                                <span className={styles.statValue}>
                                    {coachMarksEnabled ? "📍 Guided" : "🧭 Unguided"}
                                </span>
                            </div>
                            <div className={styles.completionStat}>
                                <span className={styles.statLabel}>Score</span>
                                <span className={styles.statValue}>
                                    {scenarioJustCompleted.scores.correct}/{scenarioJustCompleted.scores.total}
                                </span>
                            </div>
                            <div className={styles.completionStat}>
                                <span className={styles.statLabel}>Time</span>
                                <span className={styles.statValue}>
                                    {formatTime(scenarioJustCompleted.scores.timeMs)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scroll anchor */}
                <div ref={bottomRef} />
            </div>

            {/* ── Footer (persistent) ── */}
            {scenarioJustCompleted ? (
                <div className={styles.footer}>
                    <div className={styles.footerStatus}>Ticket resolved</div>
                    <div className={styles.footerActions}>
                        <button className={styles.replayButton} onClick={() => replayScenario(scenarioJustCompleted.scenarioId)}>
                            ↺ Replay
                        </button>
                        <button className={styles.returnButton} onClick={returnToInbox}>
                            Return to Inbox
                        </button>
                    </div>
                </div>
            ) : stepProc === "freetext" ? (
                <div className={styles.footer}>
                    <div className={styles.inputWrapper}>
                        <textarea
                            className={styles.input}
                            placeholder="Type your answer..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                        >
                            Submit
                        </button>
                    </div>
                    <div className={styles.footerMeta}>
                        <span className={styles.footerHint}>Press Enter to send</span>
                        <button className={styles.skipButton} onClick={skipTicket}>
                            Skip this ticket
                        </button>
                    </div>
                </div>
            ) : stepProc === "goal" ? (
                <div className={styles.footer}>
                    <div className={styles.footerStatus}>
                        {currentStep?.guideMessage || "Navigate to complete this step..."}
                    </div>
                    <div className={styles.footerMeta}>
                        <span />
                        <button className={styles.skipButton} onClick={skipTicket}>
                            Skip this ticket
                        </button>
                    </div>
                </div>
            ) : currentStep ? (
                <div className={styles.footer}>
                    <div className={styles.footerStatus}>Choose an answer above</div>
                    <div className={styles.footerMeta}>
                        <span />
                        <button className={styles.skipButton} onClick={skipTicket}>
                            Skip this ticket
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.footer}>
                    <div className={styles.footerStatus}>Loading...</div>
                </div>
            )}
        </div>
    );
}
```

---

## PART 5: TicketCard.module.css CHANGE

Remove `flex-shrink: 0` from `.ticketCard` since it's no longer pinned in a flex column:

```css
/* Change this line: */
flex-shrink: 0;
/* To: (just remove it entirely) */
```

---

## PART 6: RightPanel.jsx CHANGE

Remove `GuidancePanel` from the investigation view path:

```jsx
// BEFORE:
{rightPanelView === "investigation" && (
    <>
        <GuidancePanel />
        <InvestigationView />
    </>
)}

// AFTER:
{rightPanelView === "investigation" && <InvestigationView />}
```

You may keep or remove the `GuidancePanel` import — either is fine.

---

## COMPLETION REPORT

When you are done, write a completion report as a comment block at the top of `InvestigationView.jsx` (above the "use client" directive). The report must contain:

```
/**
 * SIDEBAR REDESIGN — Completion Report
 * =====================================
 * Date: [current date]
 *
 * CHANGES MADE:
 * 1. TicketInbox.jsx — [describe what changed]
 * 2. TicketInbox.module.css — [describe what changed]
 * 3. InvestigationView.jsx — [describe what changed]
 * 4. InvestigationView.module.css — [describe what changed]
 * 5. RightPanel.jsx — [describe what changed]
 * 6. TicketCard.module.css — [describe what changed]
 *
 * FILES NOT MODIFIED (confirmed):
 * - InstructionalContext.jsx
 * - scenarios.js
 * - curriculum.js
 * - characters.js
 * - CoachMark.jsx
 * - ConversationView.jsx
 * - ConversationView.module.css
 * - DashboardShell.jsx
 * - GuidancePanel.jsx
 * - GuidancePanel.module.css
 *
 * FUNCTIONALITY PRESERVED:
 * - [ ] Mode picker (guided/unguided) works
 * - [ ] Coach marks toggle works
 * - [ ] Hint toggle works inside current step
 * - [ ] Choice buttons trigger handleAction
 * - [ ] Freetext input triggers handleAction with submitted_answer
 * - [ ] Goal/task steps advance when navigation goal is met
 * - [ ] Skip ticket works
 * - [ ] Completion card shows with correct scores
 * - [ ] Replay button works
 * - [ ] Return to inbox works
 * - [ ] Back button returns to inbox
 * - [ ] Progress bar dots still render
 * - [ ] Boss intro messages still render for current module
 * - [ ] Reset all progress works
 * - [ ] Locked modules are hidden (not shown)
 * - [ ] Completed modules show as compact rows
 * - [ ] Only current module shows expanded tickets
 * - [ ] Thread auto-scrolls to bottom on step change
 * - [ ] TicketCard scrolls with thread (not pinned)
 * - [ ] Footer changes based on step type
 * - [ ] GuidancePanel no longer renders in investigation view
 *
 * KNOWN ISSUES OR DEVIATIONS:
 * - [list any deviations from the spec or issues encountered]
 */
```

Fill in every checkbox. If you could not verify something, note it. If you deviated from the spec, explain why.

---

## TESTING CHECKLIST

After making all changes, verify:

1. Run `npm run build` (or `next build`) — must compile with zero errors
2. If the dev server is running, check that the app loads without console errors
3. Walk through Scenario 1A mentally:
   - Inbox should show only Module 1 (no other modules visible)
   - Click ticket → mode picker appears
   - Select Guided → InvestigationView loads
   - Header shows `#1001 · Principal Jones`
   - TicketCard is first item in thread, scrollable
   - Step 1 (task) shows as current, footer shows navigation status
   - After completing step 1, it collapses to `✓ Navigate to IDM page`
   - Step 2 (checkpoint) shows with choice buttons in the card
   - Footer shows "Choose an answer above"
   - Step 3 (observe/freetext) shows question, footer shows textarea
   - Continue through all steps to completion card
   - Completion card appears at bottom of thread
   - Footer shows "Ticket resolved" with Replay/Return buttons
4. Return to inbox — ticket shows completed score
5. Complete all Module 1 tickets — Module 1 should collapse to compact row, Module 2 should appear expanded
