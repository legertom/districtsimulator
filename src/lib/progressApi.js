import { migrateState, STATE_VERSION } from "@/context/InstructionalContext";

// ═══════════════════════════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "pjs-state";
const DEBOUNCE_MS = 1000;

// ═══════════════════════════════════════════════════════════════
//  Shape transformers (camelCase ↔ snake_case)
// ═══════════════════════════════════════════════════════════════

/**
 * Convert a snake_case API response to the camelCase shape
 * InstructionalContext expects.
 */
export function apiResponseToState(data) {
    return {
        completedScenarios: data.completed_scenarios ?? [],
        completedModules: data.completed_modules ?? [],
        scores: data.scores ?? {},
        coachMarksEnabled: data.coach_marks_enabled ?? true,
        idmSetupComplete: data.idm_setup_complete ?? false,
        version: data.state_version ?? STATE_VERSION,
    };
}

/**
 * Convert camelCase state to the snake_case payload the API expects.
 */
export function stateToApiPayload(state) {
    return {
        completed_scenarios: state.completedScenarios ?? [],
        completed_modules: state.completedModules ?? [],
        scores: state.scores ?? {},
        coach_marks_enabled: state.coachMarksEnabled ?? true,
        idm_setup_complete: state.idmSetupComplete ?? false,
        state_version: STATE_VERSION,
    };
}

// ═══════════════════════════════════════════════════════════════
//  API persistence (Supabase via Next.js API routes)
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch progress from the API. Returns parsed data or null on failure.
 * Session cookie is automatically included by the browser.
 */
export async function fetchProgressFromApi() {
    try {
        const res = await fetch("/api/progress");
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

/**
 * Save progress to the API. Fire-and-forget with error logging.
 */
export async function saveProgressToApi(state) {
    try {
        const payload = stateToApiPayload(state);
        await fetch("/api/progress", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    } catch (err) {
        console.warn("[progressApi] Failed to save to API:", err);
    }
}

// ═══════════════════════════════════════════════════════════════
//  localStorage persistence (offline fallback)
// ═══════════════════════════════════════════════════════════════

/**
 * Load and migrate state from localStorage. Returns null if empty
 * or unrecoverable.
 */
export function loadProgressFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);

        // Already current version
        if (parsed.version === STATE_VERSION) return parsed;

        // Attempt migration chain
        const migrated = migrateState(parsed);
        if (migrated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            return migrated;
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Save state to localStorage (synchronous, immediate).
 */
export function saveProgressToLocalStorage(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: STATE_VERSION,
            ...state,
        }));
    } catch { /* quota exceeded or private browsing */ }
}

/**
 * Remove persisted state from localStorage.
 */
export function clearLocalStorage() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// ═══════════════════════════════════════════════════════════════
//  Debounced API save
// ═══════════════════════════════════════════════════════════════

/**
 * Create a debounced save function for API writes.
 * Returns { debouncedSave, cancel, flush }.
 */
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

// ═══════════════════════════════════════════════════════════════
//  Wizard state persistence (provisioning wizard config)
// ═══════════════════════════════════════════════════════════════

export async function fetchWizardStateFromApi() {
    try {
        const res = await fetch("/api/progress/wizard");
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function saveWizardStateToApi(wizardData) {
    try {
        await fetch("/api/progress/wizard", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wizard_data: wizardData }),
        });
    } catch (err) {
        console.warn("[progressApi] Failed to save wizard state:", err);
    }
}

export function createDebouncedWizardSave() {
    let timer = null;
    let pendingState = null;

    function debouncedSave(wizardData) {
        pendingState = wizardData;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            pendingState = null;
            saveWizardStateToApi(wizardData);
        }, 1000);
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
            saveWizardStateToApi(pendingState);
            pendingState = null;
        }
    }

    return { debouncedSave, cancel, flush };
}
