import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the migrateState import before importing progressApi
vi.mock("@/context/InstructionalContext", () => ({
    STATE_VERSION: 3,
    migrateState: vi.fn((state) => {
        // Simple pass-through for tests: just set version to 3
        if (!state || typeof state !== "object") return null;
        return { ...state, version: 3 };
    }),
}));

import {
    fetchProgressFromApi,
    saveProgressToApi,
    loadProgressFromLocalStorage,
    saveProgressToLocalStorage,
    clearLocalStorage,
    apiResponseToState,
    stateToApiPayload,
    createDebouncedApiSave,
} from "@/lib/progressApi";

// ═══════════════════════════════════════════════════════════════
//  Shape transformers
// ═══════════════════════════════════════════════════════════════

describe("apiResponseToState", () => {
    it("maps snake_case API response to camelCase state", () => {
        const apiData = {
            completed_scenarios: ["s1", "s2"],
            completed_modules: ["m1"],
            scores: { s1: { guided: { correct: 3, total: 4 } } },
            coach_marks_enabled: false,
            idm_setup_complete: true,
            state_version: 3,
        };

        const result = apiResponseToState(apiData);

        expect(result).toEqual({
            completedScenarios: ["s1", "s2"],
            completedModules: ["m1"],
            scores: { s1: { guided: { correct: 3, total: 4 } } },
            coachMarksEnabled: false,
            idmSetupComplete: true,
            version: 3,
        });
    });

    it("returns defaults for missing fields", () => {
        const result = apiResponseToState({});

        expect(result).toEqual({
            completedScenarios: [],
            completedModules: [],
            scores: {},
            coachMarksEnabled: true,
            idmSetupComplete: false,
            version: 3,
        });
    });
});

describe("stateToApiPayload", () => {
    it("maps camelCase state to snake_case API payload", () => {
        const state = {
            completedScenarios: ["s1"],
            completedModules: ["m1"],
            scores: { s1: { guided: null, unguided: null } },
            coachMarksEnabled: true,
            idmSetupComplete: false,
        };

        const result = stateToApiPayload(state);

        expect(result).toEqual({
            completed_scenarios: ["s1"],
            completed_modules: ["m1"],
            scores: { s1: { guided: null, unguided: null } },
            coach_marks_enabled: true,
            idm_setup_complete: false,
            state_version: 3,
        });
    });

    it("returns defaults for missing fields", () => {
        const result = stateToApiPayload({});

        expect(result.completed_scenarios).toEqual([]);
        expect(result.coach_marks_enabled).toBe(true);
        expect(result.state_version).toBe(3);
    });
});

// ═══════════════════════════════════════════════════════════════
//  API persistence
// ═══════════════════════════════════════════════════════════════

describe("fetchProgressFromApi", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns parsed data on 200", async () => {
        const mockData = { completed_scenarios: ["s1"], scores: {} };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockData),
        });

        const result = await fetchProgressFromApi();
        expect(result).toEqual(mockData);
        expect(fetch).toHaveBeenCalledWith("/api/progress");
    });

    it("returns null on 401", async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 401 });

        const result = await fetchProgressFromApi();
        expect(result).toBeNull();
    });

    it("returns null on network error", async () => {
        fetch.mockRejectedValueOnce(new Error("Network error"));

        const result = await fetchProgressFromApi();
        expect(result).toBeNull();
    });
});

describe("saveProgressToApi", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("sends PUT with correct body", async () => {
        fetch.mockResolvedValueOnce({ ok: true });

        await saveProgressToApi({
            completedScenarios: ["s1"],
            completedModules: [],
            scores: {},
            coachMarksEnabled: true,
            idmSetupComplete: false,
        });

        expect(fetch).toHaveBeenCalledWith("/api/progress", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                completed_scenarios: ["s1"],
                completed_modules: [],
                scores: {},
                coach_marks_enabled: true,
                idm_setup_complete: false,
                state_version: 3,
            }),
        });
    });

    it("logs warning on failure", async () => {
        fetch.mockRejectedValueOnce(new Error("fail"));

        await saveProgressToApi({ completedScenarios: [] });
        expect(console.warn).toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════
//  localStorage persistence
// ═══════════════════════════════════════════════════════════════

describe("loadProgressFromLocalStorage", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("returns null when no data exists", () => {
        expect(loadProgressFromLocalStorage()).toBeNull();
    });

    it("returns current-version data as-is", () => {
        const state = { version: 3, completedScenarios: ["s1"], scores: {} };
        localStorage.setItem("pjs-state", JSON.stringify(state));

        const result = loadProgressFromLocalStorage();
        expect(result).toEqual(state);
    });

    it("runs migration on old version data", () => {
        const oldState = { version: 1, scores: {} };
        localStorage.setItem("pjs-state", JSON.stringify(oldState));

        const result = loadProgressFromLocalStorage();
        expect(result).not.toBeNull();
        expect(result.version).toBe(3);
    });

    it("returns null on invalid JSON", () => {
        localStorage.setItem("pjs-state", "not-json");
        expect(loadProgressFromLocalStorage()).toBeNull();
    });
});

describe("saveProgressToLocalStorage", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("persists state to localStorage", () => {
        saveProgressToLocalStorage({ completedScenarios: ["s1"] });

        const stored = JSON.parse(localStorage.getItem("pjs-state"));
        expect(stored.version).toBe(3);
        expect(stored.completedScenarios).toEqual(["s1"]);
    });
});

describe("clearLocalStorage", () => {
    it("removes the storage key", () => {
        localStorage.setItem("pjs-state", "data");
        clearLocalStorage();
        expect(localStorage.getItem("pjs-state")).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════
//  Debounced API save
// ═══════════════════════════════════════════════════════════════

describe("createDebouncedApiSave", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("debounces multiple rapid calls into one", () => {
        const { debouncedSave } = createDebouncedApiSave();

        debouncedSave({ completedScenarios: ["s1"] });
        debouncedSave({ completedScenarios: ["s1", "s2"] });
        debouncedSave({ completedScenarios: ["s1", "s2", "s3"] });

        expect(fetch).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1000);

        // Only one fetch call with the last state
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("cancel prevents the pending save", () => {
        const { debouncedSave, cancel } = createDebouncedApiSave();

        debouncedSave({ completedScenarios: ["s1"] });
        cancel();

        vi.advanceTimersByTime(1000);

        expect(fetch).not.toHaveBeenCalled();
    });

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
});
