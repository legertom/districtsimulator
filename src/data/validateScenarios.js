import { STEP_TYPE_MAP, normalizeStep } from "@/data/stepUtils";

/**
 * Validate all scenarios against curriculum and character data.
 * Returns an array of error objects: { scenario, step, message }.
 *
 * @param {Array} scenarios — all scenario definitions
 * @param {Array} courses — all course definitions
 * @param {Object} characters — character map (CHARACTERS)
 * @returns {Array<{scenario: string, step: string|null, message: string}>}
 */
export function validateScenarios(scenarios, courses, characters) {
    const errors = [];
    const validTypes = new Set(Object.keys(STEP_TYPE_MAP));

    // Build lookup sets from curriculum
    const allModuleIds = new Set();
    const curriculumScenarioIds = new Set();
    for (const course of courses) {
        for (const mod of course.modules) {
            allModuleIds.add(mod.id);
            for (const sid of mod.scenarioIds) {
                curriculumScenarioIds.add(sid);
            }
        }
    }

    // Build character ID set
    const characterIds = new Set(Object.keys(characters));

    // Build scenario ID set for nextScenario validation
    const scenarioIdSet = new Set(scenarios.map(s => s.id));

    scenarios.forEach((scenario) => {
        const stepIds = new Set(scenario.steps?.map(s => s.id) ?? []);
        const prefix = scenario.id || "(unnamed)";

        const pushErr = (message, stepId = null) => {
            errors.push({ scenario: prefix, step: stepId, message });
        };

        // ── Scenario-level checks ──

        if (!scenario.id) pushErr("Missing scenario id");
        if (!scenario.description) pushErr("Missing description");
        if (!scenario.steps?.length) pushErr("No steps defined");

        // (e) Required fields — ticket fields only needed when not in onboarding chatMode
        if (!scenario.chatMode) {
            if (!scenario.ticketSubject) pushErr("Missing ticketSubject");
            if (!scenario.ticketMessage) pushErr("Missing ticketMessage");
        }
        if (!scenario.customerId) pushErr("Missing customerId");
        if (!scenario.moduleId) pushErr("Missing moduleId");

        // (f) customerId must exist in CHARACTERS
        if (scenario.customerId && !characterIds.has(scenario.customerId)) {
            pushErr(`customerId "${scenario.customerId}" not found in CHARACTERS`);
        }

        // (g) moduleId must exist in COURSES
        if (scenario.moduleId && !allModuleIds.has(scenario.moduleId)) {
            pushErr(`moduleId "${scenario.moduleId}" not found in COURSES`);
        }

        // nextScenario reference
        if (scenario.nextScenario && !scenarioIdSet.has(scenario.nextScenario)) {
            pushErr(`nextScenario "${scenario.nextScenario}" does not exist`);
        }

        // ── Step-level checks ──

        (scenario.steps ?? []).forEach((step) => {
            const norm = normalizeStep(step);
            const proc = STEP_TYPE_MAP[step.type];

            // Validate step type
            if (step.type && !validTypes.has(step.type)) {
                pushErr(`unknown step type "${step.type}"`, step.id);
            }

            // (d) Every step must have a checklistLabel
            if (!step.checklistLabel) {
                pushErr("missing checklistLabel (will fall back to generic)", step.id);
            }

            // (a) nextStep must point to a real step ID
            if (step.nextStep && !stepIds.has(step.nextStep)) {
                pushErr(`nextStep "${step.nextStep}" does not exist`, step.id);
            }
            if (step.successStep && !stepIds.has(step.successStep)) {
                pushErr(`successStep "${step.successStep}" does not exist`, step.id);
            }

            // (b) hint.target must be a non-empty string when present
            // Hints without a target are valid (text-only conceptual hints).
            // Only flag when target is explicitly set to an empty string.
            if (step.hint && "target" in step.hint && !step.hint.target) {
                pushErr("hint.target is empty", step.id);
            }

            // Validate choices/actions
            const choices = norm.choices;
            if (choices) {
                choices.forEach((choice, i) => {
                    // (a) choice nextStep references
                    if (choice.nextStep && !stepIds.has(choice.nextStep)) {
                        pushErr(`choices[${i}].nextStep "${choice.nextStep}" does not exist`, step.id);
                    }
                    if (choice.unguidedNextStep && !stepIds.has(choice.unguidedNextStep)) {
                        pushErr(`choices[${i}].unguidedNextStep "${choice.unguidedNextStep}" does not exist`, step.id);
                    }
                });

                // (i) Choice steps must have at least one correct choice (unless scored: false)
                if (step.scored !== false && proc === "choice") {
                    const hasCorrect = choices.some(c => c.correct === true);
                    if (!hasCorrect) {
                        pushErr("choice step has no choice with correct: true", step.id);
                    }
                }
            }

            // (c) Resolution steps must have at least one choice with nextStep: null
            if (step.type === "resolution" && choices) {
                const hasTerminal = choices.some(c => !c.nextStep && !c.unguidedNextStep);
                if (!hasTerminal) {
                    pushErr("resolution step has no choice with nextStep: null (scenario can never complete)", step.id);
                }
            }

            // Goal steps need goalRoute or goalAction
            if (proc === "goal" && !step.goalRoute && !step.goalAction) {
                pushErr("goal step needs goalRoute or goalAction", step.id);
            }

            // (h) Freetext steps must have correctAnswer
            // matchMode is optional — defaults to "exact" at runtime
            if (proc === "freetext") {
                if (!step.correctAnswer) {
                    pushErr("freetext step missing correctAnswer", step.id);
                }
            }
        });
    });

    // ── Curriculum → scenario cross-references ──

    for (const course of courses) {
        for (const mod of course.modules) {
            for (const scenarioId of mod.scenarioIds) {
                if (!scenarioIdSet.has(scenarioId)) {
                    errors.push({
                        scenario: `curriculum:${mod.id}`,
                        step: null,
                        message: `scenarioId "${scenarioId}" not found in scenarios`,
                    });
                }
            }
        }
    }

    return errors;
}
