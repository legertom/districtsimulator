/**
 * Step type mapping and normalization utilities.
 * Extracted to avoid circular dependencies between InstructionalContext and validateScenarios.
 */

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
