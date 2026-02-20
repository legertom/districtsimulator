#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Support an environment variable for testing against fixtures
const SCENARIOS_PATH = process.env.SCENARIOS_PATH || path.join(process.cwd(), 'src/data/scenarios.js');
const IS_STRICT = process.argv.includes('--strict');

function loadScenarios() {
    try {
        const fileContent = fs.readFileSync(SCENARIOS_PATH, 'utf-8');

        // We replace export defaults and React imports with a simple JS structure
        // Strip everything up to the first block comment or the "export const scenarios ="
        let mockedContent = fileContent;
        const exportIndex = mockedContent.indexOf('export const scenarios =');
        if (exportIndex !== -1) {
            mockedContent = mockedContent.substring(exportIndex);
        }

        mockedContent = mockedContent
            .replace(/export const scenarios =/g, 'global.scenarios =')
            .replace(/export default scenarios;?/g, '');

        // Safely evaluate the file in a context where unknown variables 
        // silently evaluate to empty strings instead of throwing ReferenceError
        const proxyHandler = {
            has(target, key) {
                return true; // Pretend we have all variables
            },
            get(target, key) {
                if (key in target) return target[key];
                if (key in global) return global[key];
                if (key === 'Symbol') return Symbol;
                return 'mockFieldValue'; // Return string for unknown imports like `demoCustomer`
            }
        };

        const safeGlobal = new Proxy({ console, Math, Object, Array, String, Number, Boolean }, proxyHandler);

        // Execute the script using the Function constructor with our proxy scope
        const scriptFn = new Function('scope', `
            with(scope) {
                ${mockedContent}
            }
        `);
        scriptFn(safeGlobal);

        return global.scenarios;
    } catch (error) {
        console.error('❌ Failed to load scenarios file:', error.message);
        process.exit(1);
    }
}

const scenarios = loadScenarios();
let hasErrors = false;
let hasWarnings = false;

function reportError(scenarioId, message) {
    console.error(`❌ [${scenarioId}] ${message}`);
    hasErrors = true;
}

function reportWarning(scenarioId, message) {
    console.warn(`⚠️  [${scenarioId}] ${message}`);
    hasWarnings = true;
}

scenarios.forEach((scenario) => {
    // 1. Ensure scenario has an ID
    if (!scenario.id) {
        reportError('UNKNOWN', 'Scenario is missing an id.');
        return; // Skip further checks for this scenario
    }

    // Determine if this is a "new format" scenario
    // We infer this by checking if it uses new features like ticketMessage
    let isNewFormat = false;

    const stepIds = new Set();
    let taskCount = 0;
    const totalSteps = scenario.steps.length;

    scenario.steps.forEach((step) => {
        // 3. Ensure Step IDs are unique
        if (!step.id) {
            reportError(scenario.id, `Step is missing an id.`);
            return;
        }
        if (stepIds.has(step.id)) {
            reportError(scenario.id, `Duplicate step ID found: ${step.id}`);
        }
        stepIds.add(step.id);

        if (step.type === 'task' || step.type === 'input') {
            taskCount++;
        }

        if (step.ticketMessage) {
            isNewFormat = true;
        }

        // 4. Validate Step References
        const references = [];
        if (step.nextStep) references.push({ key: 'nextStep', val: step.nextStep });
        if (step.successStep) references.push({ key: 'successStep', val: step.successStep });
        if (step.unguidedNextStep) references.push({ key: 'unguidedNextStep', val: step.unguidedNextStep });
        if (step.unguidedFailStep) references.push({ key: 'unguidedFailStep', val: step.unguidedFailStep });

        if (step.actions) {
            step.actions.forEach((act, idx) => {
                if (act.nextStep) references.push({ key: `actions[${idx}].nextStep`, val: act.nextStep });
            });
        }
        if (step.options) {
            step.options.forEach((opt, idx) => {
                if (opt.nextStep) references.push({ key: `options[${idx}].nextStep`, val: opt.nextStep });
            });
        }

        // Validate checkpoint choices[]
        if (step.choices) {
            step.choices.forEach((choice, idx) => {
                const isTerminalResolution = step.type === 'resolution';

                // null is a valid terminal reference. Only error when
                // both references are absent, unless this is a resolution step.
                const hasNavRef = choice.nextStep !== undefined || choice.unguidedNextStep !== undefined;
                if (!hasNavRef && !isTerminalResolution) {
                    reportError(scenario.id, `Step "${step.id}" choice[${idx}] is missing a navigation reference (nextStep or unguidedNextStep).`);
                } else {
                    if (choice.nextStep != null) references.push({ key: `choices[${idx}].nextStep`, val: choice.nextStep });
                    if (choice.unguidedNextStep != null) references.push({ key: `choices[${idx}].unguidedNextStep`, val: choice.unguidedNextStep });
                }

                // Must have boolean correct unless scored: false
                if (step.scored !== false) {
                    if (typeof choice.correct !== 'boolean') {
                        reportError(scenario.id, `Step "${step.id}" choice[${idx}] must explicitly set boolean 'correct' unless step.scored is false.`);
                    }
                }
            });
        }

        references.forEach(ref => {
            // Validate that the target step exists within the current scenario
            const targetExists = scenario.steps.find((s) => s.id === ref.val);
            if (!targetExists) {
                reportError(scenario.id, `Step "${step.id}" references "${ref.key}" -> "${ref.val}", but that step does not exist.`);
            }
        });

        // 5. Schema checks for Inputs
        if (step.type === 'input' && !step.correctAnswer) {
            reportError(scenario.id, `Input step "${step.id}" is missing a 'correctAnswer'.`);
        }
    });

    // 6. Task Density Check (>=40%)
    if (totalSteps > 0) {
        const density = taskCount / totalSteps;
        if (density < 0.4) {
            const msg = `Task density low (${Math.round(density * 100)}%). Recommend >= 40% task/input steps.`;
            if (IS_STRICT || isNewFormat) {
                reportError(scenario.id, msg);
            } else {
                reportWarning(scenario.id, msg);
            }
        }
    }
});

// 7. Global Scenario ID Uniqueness Check
const scenarioIds = new Set();
scenarios.forEach(scen => {
    if (scen.id && scenarioIds.has(scen.id)) {
        reportError(scen.id, `Duplicate scenario ID found.`);
    }
    scenarioIds.add(scen.id);
});


if (hasErrors) {
    console.error('\n❌ Scenario linting failed. Please fix the errors above.');
    process.exit(1);
} else {
    if (hasWarnings && !IS_STRICT) {
        console.log('\n⚠️  All structural checks passed, but some scenarios have low task density. Run with --strict to enforce.');
    } else {
        console.log('✅ All scenarios passed linting successfully!');
    }
    process.exit(0);
}
