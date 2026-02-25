import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    fetchWizardStateFromApi,
    saveWizardStateToApi,
    createDebouncedWizardSave,
} from "@/lib/progressApi";

describe("fetchWizardStateFromApi", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns parsed JSON on success", async () => {
        const mockData = { wizard_data: { googleConnected: true } };
        fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockData) });
        const result = await fetchWizardStateFromApi();
        expect(result).toEqual(mockData);
    });

    it("returns null on fetch error", async () => {
        fetch.mockRejectedValue(new Error("Network error"));
        const result = await fetchWizardStateFromApi();
        expect(result).toBeNull();
    });

    it("returns null on non-OK response", async () => {
        fetch.mockResolvedValue({ ok: false, status: 401 });
        const result = await fetchWizardStateFromApi();
        expect(result).toBeNull();
    });
});

describe("saveWizardStateToApi", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("sends wizard_data in correct payload", async () => {
        fetch.mockResolvedValue({ ok: true });
        const wizardData = { googleConnected: true, managementLevel: "full" };
        await saveWizardStateToApi(wizardData);
        expect(fetch).toHaveBeenCalledWith("/api/progress/wizard", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wizard_data: wizardData }),
        });
    });

    it("does not throw on fetch error", async () => {
        fetch.mockRejectedValue(new Error("Network error"));
        await expect(saveWizardStateToApi({ test: true })).resolves.toBeUndefined();
    });
});

describe("createDebouncedWizardSave", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("delays save by 1000ms", () => {
        const { debouncedSave } = createDebouncedWizardSave();
        debouncedSave({ test: true });
        expect(fetch).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1000);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("flush sends immediately", () => {
        const { debouncedSave, flush } = createDebouncedWizardSave();
        debouncedSave({ test: true });
        expect(fetch).not.toHaveBeenCalled();
        flush();
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("cancel prevents the save", () => {
        const { debouncedSave, cancel } = createDebouncedWizardSave();
        debouncedSave({ test: true });
        cancel();
        vi.advanceTimersByTime(2000);
        expect(fetch).not.toHaveBeenCalled();
    });
});
