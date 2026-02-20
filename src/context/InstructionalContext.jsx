"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from "react";
import { scenarios } from "@/data/scenarios";
import { COURSES, SCENARIO_TO_MODULE } from "@/data/curriculum";

export const InstructionalContext = createContext();

// ═══════════════════════════════════════════════════════════════
//  localStorage persistence
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "pjs-state";
const STATE_VERSION = 1;

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
        if (parsed.version !== STATE_VERSION) return null;
        return parsed;
    } catch {
        return null;
    }
}

function clearPersistedState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
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

    scenarios.forEach((scenario) => {
        const stepIds = new Set(scenario.steps.map(s => s.id));
        const prefix = `[Scenario "${scenario.id}"]`;

        if (!scenario.id) console.warn(`${prefix} Missing scenario id`);
        if (!scenario.description) console.warn(`${prefix} Missing description`);
        if (!scenario.steps?.length) console.warn(`${prefix} No steps defined`);

        scenario.steps.forEach((step) => {
            const sp = `${prefix} Step "${step.id}"`;

            if (step.nextStep && !stepIds.has(step.nextStep)) {
                console.warn(`${sp} → nextStep "${step.nextStep}" does not exist`);
            }
            if (step.successStep && !stepIds.has(step.successStep)) {
                console.warn(`${sp} → successStep "${step.successStep}" does not exist`);
            }

            if (step.actions) {
                step.actions.forEach((action, i) => {
                    if (action.nextStep && !stepIds.has(action.nextStep)) {
                        console.warn(`${sp} → action[${i}].nextStep "${action.nextStep}" does not exist`);
                    }
                });
            }

            if (step.type === "task" && !step.goalRoute && !step.goalAction) {
                console.warn(`${sp} → task step needs goalRoute or goalAction`);
            }
            if (step.type === "input" && !step.correctAnswer) {
                console.warn(`${sp} → input step missing correctAnswer`);
            }
            if (step.type === "input" && !step.successStep) {
                console.warn(`${sp} → input step missing successStep`);
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
    const scenarioSettings = activeScenario?.settings ?? {};
    const waitingForTicket = !currentStepId;

    const globalScore = useMemo(
        () => Object.values(scores).reduce((sum, s) => sum + (s.correct ?? 0), 0),
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

        setCoachMarksEnabled(guided);
        setActiveScenarioId(scenarioId);
        setCurrentStepId(firstStep.id);
        setShowHint(guided && !!firstStep.autoShowHint);
        setRightPanelView("conversation");
        setConversationHistory([]);
        setScenarioJustCompleted(null);

        // Initialize per-scenario scoring
        setScores(prev => ({
            ...prev,
            [scenarioId]: { correct: 0, total: 0, startTime: Date.now() }
        }));

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

            // Finalize score timing and set explicit completion state
            setScores(prev => {
                const s = prev[scenarioId];
                const finalScore = {
                    ...s,
                    timeMs: Date.now() - (s?.startTime ?? Date.now()),
                };
                // Set explicit completion state for ConversationView (Fix 2)
                setScenarioJustCompleted({
                    scenarioId,
                    scores: {
                        correct: finalScore.correct ?? 0,
                        total: finalScore.total ?? 0,
                        timeMs: finalScore.timeMs,
                    }
                });
                return { ...prev, [scenarioId]: finalScore };
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

            // Per-scenario scoring
            setScores(prev => {
                const s = prev[scenarioId] ?? { correct: 0, total: 0, startTime: Date.now() };
                return {
                    ...prev,
                    [scenarioId]: {
                        ...s,
                        total: s.total + 1,
                        correct: s.correct + (isCorrect ? 1 : 0),
                    }
                };
            });

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

        // Standard button action
        setConversationHistory(prev => [
            ...prev,
            {
                id: Date.now(),
                sender: "agent",
                text: action.label,
                timestamp: timestamp()
            }
        ]);

        if (action.nextStep) {
            setTimeout(() => advanceStep(action.nextStep), 600);
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
    }, []);

    // ═══ Return to inbox ═══

    const returnToInbox = useCallback(() => {
        setRightPanelView("inbox");
        setActiveScenarioId(null);
        setCurrentStepId(null);
        setShowHint(false);
        setConversationHistory([]);
        setScenarioJustCompleted(null);
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
