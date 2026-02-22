import { describe, it, expect } from "vitest";
import { scenarios } from "@/data/scenarios";
import { COURSES } from "@/data/curriculum";
import { CHARACTERS } from "@/data/characters";
import { validateScenarios } from "@/data/validateScenarios";

describe("scenario validation", () => {
    it("all scenarios pass validation with zero errors", () => {
        const errors = validateScenarios(scenarios, COURSES, CHARACTERS);

        if (errors.length > 0) {
            const summary = errors
                .map(e => `[${e.scenario}]${e.step ? ` Step "${e.step}"` : ""} → ${e.message}`)
                .join("\n");
            // Fail with a readable message
            expect(errors, `Validation errors:\n${summary}`).toHaveLength(0);
        }

        expect(errors).toHaveLength(0);
    });
});
