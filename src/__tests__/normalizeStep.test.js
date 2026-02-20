import { describe, it, expect } from "vitest";
import { normalizeStep, STEP_TYPE_MAP } from "@/context/InstructionalContext";

describe("normalizeStep", () => {
    it("returns null for null input", () => {
        expect(normalizeStep(null)).toBeNull();
    });

    it("bridges old field names (text/actions) to new (question/choices)", () => {
        const oldStep = {
            id: "step_1",
            type: "message",
            text: "What provider is shown?",
            sender: "customer",
            actions: [
                { label: "Google Workspace", nextStep: "step_2" },
            ],
        };
        const norm = normalizeStep(oldStep);
        expect(norm.question).toBe("What provider is shown?");
        expect(norm.choices).toEqual([{ label: "Google Workspace", nextStep: "step_2" }]);
        // Original fields preserved
        expect(norm.text).toBe("What provider is shown?");
        expect(norm.actions).toEqual([{ label: "Google Workspace", nextStep: "step_2" }]);
    });

    it("prefers new field names over old when both exist", () => {
        const mixedStep = {
            id: "step_1",
            type: "checkpoint",
            text: "old text",
            question: "new question",
            actions: [{ label: "old" }],
            choices: [{ label: "new" }],
        };
        const norm = normalizeStep(mixedStep);
        expect(norm.question).toBe("new question");
        expect(norm.choices).toEqual([{ label: "new" }]);
    });

    it("generates default checklistLabel for task step", () => {
        const step = {
            id: "step_1",
            type: "task",
            guideMessage: "Navigate to IDM",
            goalRoute: "idm",
        };
        const norm = normalizeStep(step);
        expect(norm.checklistLabel).toBe("Navigate to IDM");
    });

    it("generates default checklistLabel for input step", () => {
        const step = { id: "step_1", type: "input", text: "How many?" };
        const norm = normalizeStep(step);
        expect(norm.checklistLabel).toBe("Answer a question");
    });

    it("generates default checklistLabel for message step", () => {
        const step = { id: "step_1", type: "message", text: "Hello" };
        const norm = normalizeStep(step);
        expect(norm.checklistLabel).toBe("Continue");
    });

    it("preserves explicit checklistLabel if provided", () => {
        const step = {
            id: "step_1",
            type: "task",
            checklistLabel: "Custom label",
            guideMessage: "Navigate to IDM",
        };
        const norm = normalizeStep(step);
        expect(norm.checklistLabel).toBe("Custom label");
    });
});

describe("STEP_TYPE_MAP", () => {
    it("maps all 7 type names to internal categories", () => {
        expect(STEP_TYPE_MAP.message).toBe("choice");
        expect(STEP_TYPE_MAP.action).toBe("choice");
        expect(STEP_TYPE_MAP.input).toBe("freetext");
        expect(STEP_TYPE_MAP.task).toBe("goal");
        expect(STEP_TYPE_MAP.observe).toBe("freetext");
        expect(STEP_TYPE_MAP.checkpoint).toBe("choice");
        expect(STEP_TYPE_MAP.resolution).toBe("choice");
    });

    it("has exactly 7 entries", () => {
        expect(Object.keys(STEP_TYPE_MAP)).toHaveLength(7);
    });
});
