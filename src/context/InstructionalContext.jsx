"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from "react";
import { scenarios } from "@/data/scenarios";
import { COURSES, SCENARIO_TO_MODULE } from "@/data/curriculum";

export const InstructionalContext = createContext();

// ═══════════════════════════════════════════════════════════════
//  localStorage persistence
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "pjs-state";
const STATE_VERSION = 2;

// ═══════════════════════════════════════════════════════════════
//  State migration — chainable v(N)→v(N+1) transformers
// ═══════════════════════════════════════════════════════════════

/**
 * Migrate v1 flat scores to v2 per-mode shape.
 *
 * v1 shape: scores[scenarioId] = { correct, total, startTime, timeMs? }
 * v2 shape: scores[scenarioId] = { guided: { correct, total, startTime, timeMs? } | null,
 *                                   unguided: { correct, total, startTime, timeMs? } | null }
 *
 * Existing v1 scores are assumed to be guided (the only mode that existed).
 */
export function migrateV1toV2(state) {
    const migrated = { ...state, version: 2 };

    if (state.scores && typeof state.scores === "object") {
        const newScores = {};
        for (const [scenarioId, scoreVal] of Object.entries(state.scores)) {
            // Already v2 shape — pass through
            if (scoreVal && ("guided" in scoreVal || "unguided" in scoreVal)) {
                newScores[scenarioId] = scoreVal;
            } else if (scoreVal && typeof scoreVal === "object") {
                // v1 flat shape → wrap in guided bucket
                newScores[scenarioId] = { guided: scoreVal, unguided: null };
            } else {
                // Malformed — reset
                newScores[scenarioId] = { guided: null, unguided: null };
            }
        }
        migrated.scores = newScores;
    }

    return migrated;
}

/** Ordered migration chain. Each entry: [fromVersion, migrator]. */
const MIGRATIONS = [
    [1, migrateV1toV2],
];

/**
 * Run all necessary migrations on a parsed state object.
 * Returns the fully-migrated state or null if unrecoverable.
 */
export function migrateState(state) {
    if (!state || typeof state !== "object") return null;

    let current = state;
    for (const [fromVer, migrator] of MIGRATIONS) {
        if ((current.version ?? 1) === fromVer) {
            current = migrator(current);
        }
    }

    // After running all migrations the version must match current
    if (current.version !== STATE_VERSION) return null;
    return current;
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: STATE_VERSION,
            ...state,
        }));
    } catch { /* quota exceeded or private browsing */ }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);

        // Already current version — return as-is
        if (parsed.version === STATE_VERSION) return parsed;

        // Attempt migration chain
        const migrated = migrateState(parsed);
        if (migrated) {
            // Persist the migrated state so we don't re-migrate every load
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            return migrated;
        }

        // Unrecoverable — discard
        return null;
    } catch {
        return null;
    }
}

function clearPersistedState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// ═══════════════════════════════════════════════════════════════
//  Step normalizer — backward-compatible old/new schema bridge
// ═══════════════════════════════════════════════════════════════

/**
 * Maps all step type names (old + new) to internal processing categories.
 * - "choice"   → render choices/actions, advance on click
 * - "freetext" → validate typed answer
 * - "goal"     → wait for nav/action goal completion
 */
export const STEP_TYPE_MAP = {
    message:    "choice",    // legacy
    action:     "choice",    // legacy
    input:      "freetext",  // legacy
    task:       "goal",      // legacy (unchanged)
    observe:    "freetext",  // new: alias for input
    checkpoint: "choice",    // new: alias for message
    resolution: "choice",    // new: alias for message (terminal)
};

function defaultChecklistLabel(step) {
    const proc = STEP_TYPE_MAP[step.type];
    if (proc === "goal") return step.guideMessage ?? "Complete this step";
    if (proc === "freetext") return "Answer a question";
    return "Continue";
}

/**
 * Normalize a step to support both old and new schema fields.
 * Old scenarios use: text, actions, sender
 * New scenarios use: question, choices (no sender)
 * The normalizer resolves both via ?? fallback.
 */
export function normalizeStep(step) {
    if (!step) return null;
    return {
        ...step,
        // "question" is preferred, "text" is legacy fallback
        question:       step.question       ?? step.text    ?? null,
        // "choices" is preferred, "actions" is legacy fallback
        choices:        step.choices        ?? step.actions  ?? null,
        // checklistLabel defaults to a type-based generic if absent
        checklistLabel: step.checklistLabel ?? defaultChecklistLabel(step),
    };
}

// ═══════════════════════════════════════════════════════════════
//  Answer matching
// ═══════════════════════════════════════════════════════════════

/**
 * Flexible answer matching for input steps.
 * @param {string} userAnswer  — trimmed user input
 * @param {string|string[]} correctAnswer — expected answer(s)
 * @param {string} [matchMode="exact"] — "exact" | "includes" | "regex" | "oneOf"
 */
// ═══════════════════════════════════════════════════════════════
//  Choice target resolution (guided vs unguided branching)
// ═══════════════════════════════════════════════════════════════

/**
 * Resolve the next step for a choice/action based on mode.
 *
 * Rule (single source of truth):
 *   When coach marks are OFF (unguided) and the choice defines
 *   unguidedNextStep, use that. Otherwise fall back to nextStep.
 *
 * @param {object} choice — the choice/action object from the step
 * @param {boolean} coachMarksOn — current guided-mode flag
 * @returns {string|undefined} target step id
 */
export function resolveChoiceTarget(choice, coachMarksOn) {
    if (!coachMarksOn && choice.unguidedNextStep) {
        return choice.unguidedNextStep;
    }
    return choice.nextStep;
}

// ═══════════════════════════════════════════════════════════════
//  Score-mode helper
// ═══════════════════════════════════════════════════════════════

/** Return the mode key ("guided" | "unguided") for score operations. */
export function scoreModeKey(coachMarksOn) {
    return coachMarksOn ? "guided" : "unguided";
}

/** Create a fresh v2 score bucket for a given mode. */
function freshScoreBucket(mode) {
    return {
        guided: mode === "guided" ? { correct: 0, total: 0, startTime: Date.now() } : null,
        unguided: mode === "unguided" ? { correct: 0, total: 0, startTime: Date.now() } : null,
    };
}

/** Read the active bucket from a v2 score entry. */
function readBucket(scoreEntry, mode) {
    if (!scoreEntry) return null;
    return scoreEntry[mode] ?? null;
}

function checkAnswer(userAnswer, correctAnswer, matchMode = "exact") {
    const input = userAnswer.toLowerCase();

    switch (matchMode) {
        case "includes":
            return input.includes(String(correctAnswer).toLowerCase());
        case "regex":
            try {
                return new RegExp(correctAnswer, "i").test(userAnswer);
            } catch {
                return false;
            }
        case "oneOf":
            if (!Array.isArray(correctAnswer)) return input === String(correctAnswer).toLowerCase();
            return correctAnswer.some(a => input === String(a).toLowerCase());
        case "exact":
        default:
            return input === String(correctAnswer).toLowerCase();
    }
}

// ═══════════════════════════════════════════════════════════════
//  DEV-MODE validation
// ═══════════════════════════════════════════════════════════════

function validateScenarios() {
    if (process.env.NODE_ENV !== "development") return;

    const validTypes = new Set(Object.keys(STEP_TYPE_MAP));

    scenarios.forEach((scenario) => {
        const stepIds = new Set(scenario.steps.map(s => s.id));
        const prefix = `[Scenario "${scenario.id}"]`;

        if (!scenario.id) console.warn(`${prefix} Missing scenario id`);
        if (!scenario.description) console.warn(`${prefix} Missing description`);
        if (!scenario.steps?.length) console.warn(`${prefix} No steps defined`);

        scenario.steps.forEach((step) => {
            const sp = `${prefix} Step "${step.id}"`;
            const norm = normalizeStep(step);

            // Validate step type
            if (step.type && !validTypes.has(step.type)) {
                console.warn(`${sp} → unknown step type "${step.type}"`);
            }

            if (step.nextStep && !stepIds.has(step.nextStep)) {
                console.warn(`${sp} → nextStep "${step.nextStep}" does not exist`);
            }
            if (step.successStep && !stepIds.has(step.successStep)) {
                console.warn(`${sp} → successStep "${step.successStep}" does not exist`);
            }

            // Validate choices/actions (supports both old and new field names)
            const choices = norm.choices;
            if (choices) {
                choices.forEach((choice, i) => {
                    if (choice.nextStep && !stepIds.has(choice.nextStep)) {
                        console.warn(`${sp} → choices[${i}].nextStep "${choice.nextStep}" does not exist`);
                    }
                    if (choice.unguidedNextStep && !stepIds.has(choice.unguidedNextStep)) {
                        console.warn(`${sp} → choices[${i}].unguidedNextStep "${choice.unguidedNextStep}" does not exist`);
                    }
                });
            }

            // Validate goal steps (task type)
            const proc = STEP_TYPE_MAP[step.type];
            if (proc === "goal" && !step.goalRoute && !step.goalAction) {
                console.warn(`${sp} → goal step needs goalRoute or goalAction`);
            }

            // Validate freetext steps (input/observe type)
            if (proc === "freetext" && !step.correctAnswer) {
                console.warn(`${sp} → freetext step missing correctAnswer`);
            }
            if (proc === "freetext" && !step.successStep) {
                console.warn(`${sp} → freetext step missing successStep`);
            }
        });

        if (scenario.nextScenario) {
            const target = scenarios.find(s => s.id === scenario.nextScenario);
            if (!target) {
                console.warn(`${prefix} → nextScenario "${scenario.nextScenario}" does not exist`);
            }
        }

        // Validate curriculum reference
        if (scenario.moduleId && !SCENARIO_TO_MODULE[scenario.id]) {
            console.warn(`${prefix} → moduleId "${scenario.moduleId}" not found in curriculum.js`);
        }
    });

    // Validate curriculum → scenario references
    for (const course of COURSES) {
        for (const mod of course.modules) {
            for (const scenarioId of mod.scenarioIds) {
                if (!scenarios.find(s => s.id === scenarioId)) {
                    console.warn(`[Curriculum "${mod.id}"] → scenarioId "${scenarioId}" not in scenarios.js yet`);
                }
            }
        }
    }
}

validateScenarios();

// ═══════════════════════════════════════════════════════════════
//  Initial history (ticket cards)
// ═══════════════════════════════════════════════════════════════

function getInitialHistory() {
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return scenarios.map((scenario, idx) => ({
        id: Date.now() + idx,
        sender: "system",
        text: scenario.ticketSubject || scenario.description,
        timestamp: ts,
        variant: "ticket",
        scenarioId: scenario.id
    }));
}

// ═══════════════════════════════════════════════════════════════
//  Provider
// ═══════════════════════════════════════════════════════════════

export function InstructionalProvider({ children }) {
    const saved = useMemo(() => loadState(), []);

    // ── Core state ──
    const [activeScenarioId, setActiveScenarioId] = useState(null);
    const [currentStepId, setCurrentStepId] = useState(null);
    const [ticketHistory, setTicketHistory] = useState(getInitialHistory);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [coachMarksEnabled, setCoachMarksEnabled] = useState(saved?.coachMarksEnabled ?? true);
    const [currentNavId, setCurrentNavId] = useState(null);
    const [completedScenarios, setCompletedScenarios] = useState(
        () => new Set(saved?.completedScenarios ?? [])
    );

    // ── Per-scenario scoring ──
    const [scores, setScores] = useState(saved?.scores ?? {});

    // ── Module completion ──
    const [completedModules, setCompletedModules] = useState(
        () => new Set(saved?.completedModules ?? [])
    );

    // ── Right panel view ──
    const [rightPanelView, setRightPanelView] = useState("inbox");

    // ── Explicit completion state (Fix 2 — no message-variant inference) ──
    const [scenarioJustCompleted, setScenarioJustCompleted] = useState(null);

    // ── Visited step IDs for InvestigationView checklist ──
    // Tracks which steps the trainee actually visited (not index-based).
    // Prevents wrong-branch steps from showing as completed.
    const [visitedStepIds, setVisitedStepIds] = useState(() => new Set());

    // ── Refs to avoid stale closures in setTimeout callbacks ──
    const activeScenarioIdRef = useRef(activeScenarioId);
    const currentStepIdRef = useRef(currentStepId);
    const currentNavIdRef = useRef(currentNavId);
    const coachMarksEnabledRef = useRef(coachMarksEnabled);
    const advanceStepRef = useRef();

    useEffect(() => {
        activeScenarioIdRef.current = activeScenarioId;
        currentStepIdRef.current = currentStepId;
        currentNavIdRef.current = currentNavId;
        coachMarksEnabledRef.current = coachMarksEnabled;
    }, [activeScenarioId, currentStepId, currentNavId, coachMarksEnabled]);

    // ── Derived state ──
    const activeScenario = scenarios.find(s => s.id === activeScenarioId);
    const currentStep = currentStepId
        ? activeScenario?.steps.find(s => s.id === currentStepId)
        : null;
    const normalizedCurrentStep = normalizeStep(currentStep);
    const scenarioSettings = activeScenario?.settings ?? {};
    const waitingForTicket = !currentStepId;

    const globalScore = useMemo(
        () => Object.values(scores).reduce((sum, entry) => {
            // v2 shape: sum both guided and unguided buckets
            const g = entry?.guided?.correct ?? 0;
            const u = entry?.unguided?.correct ?? 0;
            return sum + g + u;
        }, 0),
        [scores]
    );
    const score = globalScore; // backward-compatible alias

    // Backward-compatible computed history — concatenates both arrays so
    // ChatPanel (which reads `history`) keeps working during transition.
    const history = useMemo(
        () => [...ticketHistory, ...conversationHistory],
        [ticketHistory, conversationHistory]
    );

    const timestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // ═══ Persist on change ═══
    useEffect(() => {
        saveState({
            completedScenarios: [...completedScenarios],
            completedModules: [...completedModules],
            scores,
            coachMarksEnabled,
        });
    }, [completedScenarios, completedModules, scores, coachMarksEnabled]);

    // ═══ Module completion check ═══
    const checkModuleCompletion = useCallback((justCompletedId) => {
        for (const course of COURSES) {
            for (const mod of course.modules) {
                if (!mod.scenarioIds.includes(justCompletedId)) continue;
                const allDone = mod.scenarioIds.every(sid =>
                    completedScenarios.has(sid) || sid === justCompletedId
                );
                if (allDone) {
                    setCompletedModules(prev => new Set([...prev, mod.id]));
                }
            }
        }
    }, [completedScenarios]);

    // ═══ Message helpers ═══
    const addMessageToHistory = useCallback((step) => {
        if (!step.text) return;
        setConversationHistory(prev => [
            ...prev,
            {
                id: Date.now(),
                sender: step.sender || "system",
                text: step.text,
                timestamp: timestamp(),
                isCurrentStep: true
            }
        ]);
    }, []);

    // ═══ Ticket lifecycle ═══

    const acceptTicket = useCallback((scenarioId, guided = true) => {
        const scenario = scenarios.find(s => s.id === scenarioId);
        if (!scenario) return;

        const firstStep = scenario.steps[0];
        if (!firstStep) return;

        // Choose panel view: new investigation format if ticketMessage exists,
        // otherwise fall back to legacy conversation view
        const panelView = scenario.ticketMessage ? "investigation" : "conversation";

        setCoachMarksEnabled(guided);
        setActiveScenarioId(scenarioId);
        setCurrentStepId(firstStep.id);
        setShowHint(guided && !!firstStep.autoShowHint);
        setRightPanelView(panelView);
        setConversationHistory([]);
        setScenarioJustCompleted(null);
        setVisitedStepIds(new Set([firstStep.id]));

        // Initialize per-scenario scoring (v2: mode-aware)
        const mode = scoreModeKey(guided);
        setScores(prev => {
            const existing = prev[scenarioId];
            return {
                ...prev,
                [scenarioId]: {
                    guided: mode === "guided"
                        ? { correct: 0, total: 0, startTime: Date.now() }
                        : (existing?.guided ?? null),
                    unguided: mode === "unguided"
                        ? { correct: 0, total: 0, startTime: Date.now() }
                        : (existing?.unguided ?? null),
                },
            };
        });

        // Legacy conversation view: push the first message into the chat
        if (panelView === "conversation") {
            setTimeout(() => {
                if (firstStep.text) {
                    setConversationHistory(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            sender: firstStep.sender || "system",
                            text: firstStep.text,
                            timestamp: timestamp(),
                            isCurrentStep: true
                        }
                    ]);
                }
            }, 400);
        }
    }, []);

    const skipTicket = useCallback(() => {
        const scenarioId = activeScenarioIdRef.current;
        if (!scenarioId) return;

        setCompletedScenarios(prev => new Set([...prev, scenarioId]));
        setConversationHistory(prev => [...prev, {
            id: Date.now(),
            sender: "system",
            text: "Ticket skipped.",
            timestamp: timestamp(),
            variant: "warning"
        }]);
        setActiveScenarioId(null);
        setCurrentStepId(null);
        setShowHint(false);
        setRightPanelView("inbox");
        setScenarioJustCompleted(null);
        setVisitedStepIds(new Set());
    }, []);

    // ═══ Step progression ═══

    const advanceStep = useCallback((nextStepId) => {
        const scenarioId = activeScenarioIdRef.current;

        if (!nextStepId) {
            // End of scenario
            setCompletedScenarios(prev => new Set([...prev, scenarioId]));
            setConversationHistory(prev => [...prev, {
                id: Date.now(),
                sender: "system",
                text: "Scenario completed!",
                timestamp: timestamp(),
                variant: "success"
            }]);

            // Finalize score timing and set explicit completion state (v2: mode-aware)
            const mode = scoreModeKey(coachMarksEnabledRef.current);
            setScores(prev => {
                const entry = prev[scenarioId] ?? { guided: null, unguided: null };
                const bucket = entry[mode] ?? { correct: 0, total: 0, startTime: Date.now() };
                const finalBucket = {
                    ...bucket,
                    timeMs: Date.now() - (bucket.startTime ?? Date.now()),
                };
                const updatedEntry = { ...entry, [mode]: finalBucket };

                // Set explicit completion state for ConversationView (Fix 2)
                setScenarioJustCompleted({
                    scenarioId,
                    mode,
                    scores: {
                        correct: finalBucket.correct ?? 0,
                        total: finalBucket.total ?? 0,
                        timeMs: finalBucket.timeMs,
                    }
                });
                return { ...prev, [scenarioId]: updatedEntry };
            });

            checkModuleCompletion(scenarioId);

            setActiveScenarioId(null);
            setCurrentStepId(null);
            setShowHint(false);
            return;
        }

        const scenario = scenarios.find(s => s.id === scenarioId);
        const nextStep = scenario?.steps.find(s => s.id === nextStepId);
        if (nextStep) {
            setCurrentStepId(nextStepId);
            setVisitedStepIds(prev => new Set([...prev, nextStepId]));
            setShowHint(coachMarksEnabledRef.current && !!nextStep.autoShowHint);
            addMessageToHistory(nextStep);

            if (nextStep.type === "task" && nextStep.goalRoute && nextStep.nextStep) {
                const navId = currentNavIdRef.current;
                if (navId === nextStep.goalRoute) {
                    setTimeout(() => advanceStepRef.current?.(nextStep.nextStep), 800);
                }
            }
        }
    }, [addMessageToHistory, checkModuleCompletion]);

    useEffect(() => {
        advanceStepRef.current = advanceStep;
    }, [advanceStep]);

    // ═══ Action handling ═══

    const handleAction = useCallback((action) => {
        const scenarioId = activeScenarioIdRef.current;
        const stepId = currentStepIdRef.current;
        const coachMarksOn = coachMarksEnabledRef.current;
        const mode = scoreModeKey(coachMarksOn);

        /** Mode-aware score increment helper */
        const incrementScore = (isCorrect) => {
            setScores(prev => {
                const entry = prev[scenarioId] ?? { guided: null, unguided: null };
                const bucket = entry[mode] ?? { correct: 0, total: 0, startTime: Date.now() };
                return {
                    ...prev,
                    [scenarioId]: {
                        ...entry,
                        [mode]: {
                            ...bucket,
                            total: bucket.total + 1,
                            correct: bucket.correct + (isCorrect ? 1 : 0),
                        },
                    },
                };
            });
        };

        if (action.type === 'submitted_answer') {
            const step = scenarios.find(s => s.id === scenarioId)
                ?.steps.find(s => s.id === stepId);

            const isCorrect = step?.correctAnswer && checkAnswer(
                action.text.trim(),
                step.correctAnswer,
                step.matchMode
            );

            setConversationHistory(prev => [
                ...prev,
                {
                    id: Date.now(),
                    sender: "agent",
                    text: action.text,
                    timestamp: timestamp()
                }
            ]);

            // Per-scenario scoring (v2: mode-aware)
            incrementScore(isCorrect);

            if (isCorrect) {
                setTimeout(() => advanceStep(step.successStep), 600);
            } else {
                setConversationHistory(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        sender: "system",
                        text: "That doesn't look quite right. Try again!",
                        timestamp: timestamp(),
                        variant: "warning"
                    }
                ]);
            }
            return;
        }

        // Standard button action (choice click)
        setConversationHistory(prev => [
            ...prev,
            {
                id: Date.now(),
                sender: "agent",
                text: action.label,
                timestamp: timestamp()
            }
        ]);

        // Score choices that have explicit correct flag (v2: mode-aware)
        if (typeof action.correct === "boolean") {
            incrementScore(action.correct);
        }

        // Resolve target step via guided/unguided branching rule
        const targetStep = resolveChoiceTarget(action, coachMarksOn);

        if (targetStep) {
            setTimeout(() => advanceStep(targetStep), 600);
        } else {
            setTimeout(() => advanceStep(null), 600);
        }
    }, [advanceStep]);

    // ═══ Hints and coach marks ═══

    const toggleHint = () => {
        setShowHint(prev => !prev);
    };

    const toggleCoachMarks = () => {
        setCoachMarksEnabled(prev => {
            const next = !prev;
            if (!next) setShowHint(false);
            return next;
        });
    };

    // ═══ Navigation / action goal checking ═══

    const checkNavigationGoal = useCallback((navId) => {
        setCurrentNavId(navId);

        const scenarioId = activeScenarioIdRef.current;
        const stepId = currentStepIdRef.current;

        const step = scenarios.find(s => s.id === scenarioId)
            ?.steps.find(s => s.id === stepId);

        if (step?.type === "task" && step.goalRoute === navId && step.nextStep) {
            advanceStep(step.nextStep);
        }
    }, [advanceStep]);

    const checkActionGoal = useCallback((actionId) => {
        const scenarioId = activeScenarioIdRef.current;
        const stepId = currentStepIdRef.current;

        const step = scenarios.find(s => s.id === scenarioId)
            ?.steps.find(s => s.id === stepId);

        if (step?.type === "task" && step.goalAction === actionId && step.nextStep) {
            advanceStep(step.nextStep);
        }
    }, [advanceStep]);

    // ═══ Replay a completed scenario ═══

    const replayScenario = useCallback((scenarioId) => {
        setCompletedScenarios(prev => {
            const next = new Set(prev);
            next.delete(scenarioId);
            return next;
        });
        // Clear both mode buckets for this scenario on replay
        setScores(prev => {
            const next = { ...prev };
            delete next[scenarioId];
            return next;
        });
        // Un-complete the module this scenario belongs to
        setCompletedModules(prev => {
            const next = new Set(prev);
            const mod = SCENARIO_TO_MODULE[scenarioId];
            if (mod) next.delete(mod.id);
            return next;
        });
        setActiveScenarioId(null);
        setCurrentStepId(null);
        setShowHint(false);
        setRightPanelView("inbox");
        setVisitedStepIds(new Set());
    }, []);

    // ═══ Return to inbox ═══

    const returnToInbox = useCallback(() => {
        setRightPanelView("inbox");
        setActiveScenarioId(null);
        setCurrentStepId(null);
        setShowHint(false);
        setConversationHistory([]);
        setScenarioJustCompleted(null);
        setVisitedStepIds(new Set());
    }, []);

    // ═══ Reset all progress ═══

    const resetAllProgress = useCallback(() => {
        clearPersistedState();
        setCompletedScenarios(new Set());
        setCompletedModules(new Set());
        setScores({});
        setActiveScenarioId(null);
        setCurrentStepId(null);
        setShowHint(false);
        setCoachMarksEnabled(true);
        setRightPanelView("inbox");
        setTicketHistory(getInitialHistory());
        setConversationHistory([]);
        setScenarioJustCompleted(null);
        setVisitedStepIds(new Set());
    }, []);

    // ═══ Context value ═══

    const value = {
        // Existing API (backward-compatible)
        activeScenario,
        scenarioSettings,
        currentStep,
        history,            // computed: [...ticketHistory, ...conversationHistory]
        showHint,
        coachMarksEnabled,
        score,              // deprecated → globalScore
        waitingForTicket,
        completedScenarios,
        handleAction,
        acceptTicket,
        skipTicket,
        toggleHint,
        toggleCoachMarks,
        checkNavigationGoal,
        checkActionGoal,
        advanceStep,

        // New API
        ticketHistory,
        conversationHistory,
        scenarioJustCompleted,
        scores,
        globalScore,
        rightPanelView,
        setRightPanelView,
        returnToInbox,
        replayScenario,
        completedModules,
        resetAllProgress,
        normalizedCurrentStep,
        visitedStepIds,
    };

    return (
        <InstructionalContext.Provider value={value}>
            {children}
        </InstructionalContext.Provider>
    );
}

export function useInstructional() {
    return useContext(InstructionalContext);
}
