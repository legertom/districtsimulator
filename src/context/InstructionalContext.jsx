"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { scenarios } from "@/data/scenarios";
import { COURSES, SCENARIO_TO_MODULE } from "@/data/curriculum";
import { CHARACTERS } from "@/data/characters";
import { STEP_TYPE_MAP, normalizeStep } from "@/data/stepUtils";
import { validateScenarios as runValidation } from "@/data/validateScenarios";
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
    fetchWizardStateFromApi,
} from "@/lib/progressApi";

export const InstructionalContext = createContext();

// ═══════════════════════════════════════════════════════════════
//  State version (used by migration chain and progressApi)
// ═══════════════════════════════════════════════════════════════

export const STATE_VERSION = 3;

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

/**
 * Migrate v2 → v3: add idmSetupComplete flag.
 * Existing users (who have progress) get `true` so they don't see the empty IDM state.
 * New users get `false` via initial state defaults.
 */
export function migrateV2toV3(state) {
    const migrated = { ...state, version: 3 };
    // If user has any completed scenarios, they've already seen the configured IDM
    const hasProgress = Array.isArray(state.completedScenarios) && state.completedScenarios.length > 0;
    migrated.idmSetupComplete = hasProgress;
    return migrated;
}

/** Ordered migration chain. Each entry: [fromVersion, migrator]. */
const MIGRATIONS = [
    [1, migrateV1toV2],
    [2, migrateV2toV3],
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

// ═══════════════════════════════════════════════════════════════
//  Step normalizer — re-exported from shared stepUtils
// ═══════════════════════════════════════════════════════════════

export { STEP_TYPE_MAP, normalizeStep };

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
//  Scenario validation (dev: throw, prod: warn)
// ═══════════════════════════════════════════════════════════════

const _validationErrors = runValidation(scenarios, COURSES, CHARACTERS);

if (_validationErrors.length > 0) {
    const summary = _validationErrors
        .map(e => `[${e.scenario}]${e.step ? ` Step "${e.step}"` : ""} → ${e.message}`)
        .join("\n");

    if (process.env.NODE_ENV === "development") {
        throw new Error(
            `Scenario validation failed with ${_validationErrors.length} error(s):\n${summary}`
        );
    } else {
        console.warn(
            `Scenario validation warnings (${_validationErrors.length}):\n${summary}`
        );
    }
}

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
    const { data: session, status: authStatus } = useSession();
    const isAuthenticated = authStatus === "authenticated" && !!session?.user?.id;

    // Phase 1: synchronous localStorage load (instant, no flash)
    const saved = useMemo(() => loadProgressFromLocalStorage(), []);

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

    // ── IDM setup complete flag ──
    const [idmSetupComplete, setIdmSetupComplete] = useState(saved?.idmSetupComplete ?? false);

    // ── Ticket notifications ──
    const [pendingNotifications, setPendingNotifications] = useState([]);

    // ── Right panel view ──
    const [rightPanelView, setRightPanelView] = useState("chat");

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

    // ═══ Phase 2: async DB load (overlays localStorage once resolved) ═══
    useEffect(() => {
        if (!isAuthenticated) return;

        let cancelled = false;

        (async () => {
            try {
                // Fetch progress and session state in parallel
                const [progressData, sessionData, wizardData] = await Promise.all([
                    fetchProgressFromApi(),
                    fetchSessionStateFromApi(),
                    fetchWizardStateFromApi(),
                ]);

                if (cancelled) return;

                // Apply progress data (DB is authoritative)
                const dbState = progressData ? apiResponseToState(progressData) : null;
                if (dbState) {
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
                        setShowHint((dbState?.coachMarksEnabled ?? true) && !!step.autoShowHint);
                        setRightPanelView("chat");
                        setConversationHistory([]);
                        setScenarioJustCompleted(null);
                    }
                }

                if (wizardData?.wizard_data) {
                    try {
                        const localWizard = localStorage.getItem("idm-provisioning-state");
                        if (!localWizard) {
                            localStorage.setItem("idm-provisioning-state", JSON.stringify(wizardData.wizard_data));
                        }
                        if (wizardData.wizard_data.provisioning_results) {
                            const localResults = localStorage.getItem("idm-provisioning-results");
                            if (!localResults) {
                                localStorage.setItem("idm-provisioning-results", JSON.stringify(wizardData.wizard_data.provisioning_results));
                            }
                        }
                    } catch {
                        // ignore localStorage errors
                    }
                }
            } catch (err) {
                console.warn("Phase 2 DB sync failed, continuing with localStorage:", err);
                // Silently continue — localStorage data is already loaded from Phase 1
            }
        })();

        return () => { cancelled = true; };
    }, [isAuthenticated]);

    // ═══ Persist on change (dual-write: localStorage + API) ═══
    const debouncedApiSaveRef = useRef(null);
    if (!debouncedApiSaveRef.current) {
        debouncedApiSaveRef.current = createDebouncedApiSave();
    }

    useEffect(() => {
        const stateSnapshot = {
            completedScenarios: [...completedScenarios],
            completedModules: [...completedModules],
            scores,
            coachMarksEnabled,
            idmSetupComplete,
        };

        // Always write to localStorage immediately (offline fallback)
        saveProgressToLocalStorage(stateSnapshot);

        // Debounced write to API if authenticated
        if (isAuthenticated) {
            debouncedApiSaveRef.current.debouncedSave(stateSnapshot);
        }
    }, [completedScenarios, completedModules, scores, coachMarksEnabled, idmSetupComplete, isAuthenticated]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => debouncedApiSaveRef.current?.flush();
    }, []);

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

    // ═══ Notification helper ═══
    const dismissNotification = useCallback((notificationId) => {
        setPendingNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, []);

    // ═══ Module completion check ═══
    const checkModuleCompletion = useCallback((justCompletedId) => {
        const newlyCompletedModuleIds = [];

        for (const course of COURSES) {
            for (const mod of course.modules) {
                if (!mod.scenarioIds.includes(justCompletedId)) continue;
                const allDone = mod.scenarioIds.every(sid =>
                    completedScenarios.has(sid) || sid === justCompletedId
                );
                if (allDone && !completedModules.has(mod.id)) {
                    newlyCompletedModuleIds.push(mod.id);
                }
            }
        }

        if (newlyCompletedModuleIds.length === 0) return;

        // Update completed modules
        setCompletedModules(prev => {
            const next = new Set(prev);
            newlyCompletedModuleIds.forEach(id => next.add(id));
            return next;
        });

        // Check for newly unlocked modules and push toast notifications
        const updatedCompleted = new Set([...completedModules, ...newlyCompletedModuleIds]);
        const newNotifications = [];

        for (const course of COURSES) {
            for (const candidate of course.modules) {
                if (updatedCompleted.has(candidate.id)) continue;
                if (!candidate.prerequisites.some(preId => newlyCompletedModuleIds.includes(preId))) continue;

                const allPrereqsMet = candidate.prerequisites.every(preId => updatedCompleted.has(preId));
                if (!allPrereqsMet) continue;

                // This module is newly unlocked — notify for each authored scenario
                const authoredScenarios = candidate.scenarioIds
                    .map(sid => scenarios.find(s => s.id === sid))
                    .filter(Boolean);

                for (const scenario of authoredScenarios) {
                    newNotifications.push({
                        id: `notif-${scenario.id}-${Date.now()}`,
                        scenarioId: scenario.id,
                        customerId: scenario.customerId,
                        subject: scenario.ticketSubject || scenario.description,
                        moduleId: candidate.id,
                    });
                }
            }
        }

        if (newNotifications.length > 0) {
            setPendingNotifications(prev => [...prev, ...newNotifications]);
        }
    }, [completedScenarios, completedModules]);

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

        // Clear wizard localStorage if scenario settings require it
        if (scenario.settings?.clearWizardState) {
            try { localStorage.removeItem("idm-provisioning-state"); } catch { /* ignore */ }
            setIdmSetupComplete(false);
        }

        const firstStep = scenario.steps[0];
        if (!firstStep) return;

        // Choose panel view: new investigation format if ticketMessage exists,
        // otherwise fall back to legacy conversation view
        const panelView = "chat";

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

    // ═══ DEV-ONLY: URL-based scenario jumping ═══
    useEffect(() => {
        if (process.env.NODE_ENV !== "development") return;
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        const scenarioId = params.get("scenario");
        if (!scenarioId) return;

        const scenario = scenarios.find(s => s.id === scenarioId);
        if (!scenario) {
            console.warn(`[DEV] Scenario "${scenarioId}" not found`);
            return;
        }

        const guided = params.get("mode") !== "unguided";
        const targetStepId = params.get("step");

        // Find the module that owns this scenario and unlock all prerequisites
        const targetModule = SCENARIO_TO_MODULE[scenarioId];
        if (targetModule) {
            const prereqModuleIds = new Set();
            const collectPrereqs = (modId) => {
                for (const course of COURSES) {
                    const mod = course.modules.find(m => m.id === modId);
                    if (!mod) continue;
                    for (const preId of mod.prerequisites) {
                        if (!prereqModuleIds.has(preId)) {
                            prereqModuleIds.add(preId);
                            collectPrereqs(preId);
                        }
                    }
                }
            };
            collectPrereqs(targetModule.id);

            // Mark all prerequisite modules and their scenarios as complete
            if (prereqModuleIds.size > 0) {
                const prereqScenarioIds = new Set();
                for (const course of COURSES) {
                    for (const mod of course.modules) {
                        if (prereqModuleIds.has(mod.id)) {
                            for (const sid of mod.scenarioIds) {
                                prereqScenarioIds.add(sid);
                            }
                        }
                    }
                }
                setCompletedModules(prev => new Set([...prev, ...prereqModuleIds]));
                setCompletedScenarios(prev => new Set([...prev, ...prereqScenarioIds]));
            }
        }

        // Accept the ticket
        acceptTicket(scenarioId, guided);

        // Jump to target step if specified
        if (targetStepId) {
            const targetStep = scenario.steps.find(s => s.id === targetStepId);
            if (targetStep) {
                // Build visited set for all steps up to the target
                const visited = new Set();
                for (const s of scenario.steps) {
                    visited.add(s.id);
                    if (s.id === targetStepId) break;
                }
                setCurrentStepId(targetStepId);
                setVisitedStepIds(visited);
            } else {
                console.warn(`[DEV] Step "${targetStepId}" not found in scenario "${scenarioId}"`);
            }
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setRightPanelView("chat");
        setActiveScenarioId(null);
        setCurrentStepId(null);
        setShowHint(false);
        setConversationHistory([]);
        // Note: don't clear scenarioJustCompleted here — ChatView uses it
        // to show the completion card before transitioning to lobby
        setVisitedStepIds(new Set());
    }, []);

    // ═══ Reset all progress ═══

    const resetAllProgress = useCallback(() => {
        clearLocalStorage();
        try { localStorage.removeItem("cedarridge-welcome-seen"); } catch { /* ignore */ }
        try { localStorage.removeItem("idm-provisioning-state"); } catch { /* ignore */ }
        setCompletedScenarios(new Set());
        setCompletedModules(new Set());
        setScores({});
        setActiveScenarioId(null);
        setCurrentStepId(null);
        setShowHint(false);
        setCoachMarksEnabled(true);
        setIdmSetupComplete(false);
        setPendingNotifications([]);
        setRightPanelView("inbox");
        setTicketHistory(getInitialHistory());
        setConversationHistory([]);
        setScenarioJustCompleted(null);
        setVisitedStepIds(new Set());

        // Also reset DB if authenticated
        if (isAuthenticated) {
            saveProgressToApi({
                completedScenarios: [],
                completedModules: [],
                scores: {},
                coachMarksEnabled: true,
                idmSetupComplete: false,
            });
            // Also clear session state
            saveSessionStateToApi(null, null);
        }
    }, [isAuthenticated]);

    // ═══ DEV-ONLY: Ctrl+Shift+R reset-to-module shortcut ═══
    useEffect(() => {
        if (process.env.NODE_ENV !== "development") return;

        const handleDevReset = (e) => {
            if (!(e.ctrlKey && e.shiftKey && e.key === "R")) return;
            e.preventDefault();

            const input = window.prompt("Reset to which module? (1-7)");
            if (!input) return;

            const moduleNum = parseInt(input, 10);
            if (isNaN(moduleNum) || moduleNum < 1) return;

            const course = COURSES[0];
            if (!course) return;

            const targetIndex = moduleNum - 1;
            if (targetIndex >= course.modules.length) return;

            // Mark all modules before targetIndex as complete (with their scenarios)
            const modulesToComplete = new Set();
            const scenariosToComplete = new Set();

            for (let i = 0; i < targetIndex; i++) {
                const mod = course.modules[i];
                modulesToComplete.add(mod.id);
                for (const sid of mod.scenarioIds) {
                    scenariosToComplete.add(sid);
                }
            }

            // Clear the target module and everything after
            setCompletedModules(modulesToComplete);
            setCompletedScenarios(scenariosToComplete);
            setScores(prev => {
                const next = {};
                for (const sid of scenariosToComplete) {
                    if (prev[sid]) next[sid] = prev[sid];
                }
                return next;
            });

            // Navigate to inbox
            setActiveScenarioId(null);
            setCurrentStepId(null);
            setShowHint(false);
            setRightPanelView("inbox");
            setScenarioJustCompleted(null);
            setVisitedStepIds(new Set());
        };

        window.addEventListener("keydown", handleDevReset);
        return () => window.removeEventListener("keydown", handleDevReset);
    }, []);

    // ═══ Context value ═══

    const value = {
        // Existing API (backward-compatible)
        activeScenarioId,
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

        // IDM setup
        idmSetupComplete,
        setIdmSetupComplete,

        // Notifications
        pendingNotifications,
        dismissNotification,

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
