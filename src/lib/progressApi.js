import { migrateState } from "@/context/InstructionalContext";

// ═══════════════════════════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "pjs-state";
const STATE_VERSION = 3;
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
