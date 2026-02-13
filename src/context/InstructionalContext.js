"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { scenarios } from "@/data/scenarios";

const InstructionalContext = createContext();

export function InstructionalProvider({ children }) {
    const [activeScenarioId, setActiveScenarioId] = useState("scenario_find_district_id"); // Default for dev
    const [currentStepId, setCurrentStepId] = useState("step_welcome");
    const [history, setHistory] = useState([]); // Chat history
    const [showHint, setShowHint] = useState(false);
    const [score, setScore] = useState(0);

    // Derived state
    const activeScenario = scenarios.find(s => s.id === activeScenarioId);
    const currentStep = activeScenario?.steps.find(s => s.id === currentStepId);
    const scenarioSettings = activeScenario?.settings ?? {};

    // Load initial step message on mount or scenario change
    useEffect(() => {
        if (activeScenario && currentStep && history.length === 0) {
            addMessageToHistory(currentStep);
        }
    }, [activeScenarioId]);

    const addMessageToHistory = (step) => {
        // If the step has no text (e.g. pure guidance step), don't add to chat history
        if (!step.text) return;

        setHistory(prev => [
            ...prev,
            {
                id: Date.now(),
                sender: step.sender || "system",
                text: step.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isCurrentStep: true
            }
        ]);
    };

    const advanceStep = (nextStepId) => {
        if (!nextStepId) {
            // End of scenario
            setHistory(prev => [...prev, {
                id: Date.now(),
                sender: "system",
                text: "Scenario Completed!",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                variant: "success"
            }]);
            return;
        }

        const nextStep = activeScenario.steps.find(s => s.id === nextStepId);
        if (nextStep) {
            setCurrentStepId(nextStepId);
            // Auto-show hint if properly configured
            setShowHint(!!nextStep.autoShowHint);
            addMessageToHistory(nextStep);
        }
    };

    const handleAction = (action) => {
        // User clicked a predefined reply button OR submitted text
        if (action.type === 'submitted_answer') {
            // Validate answer
            const isCorrect = currentStep.correctAnswer && action.text.trim() === currentStep.correctAnswer;

            setHistory(prev => [
                ...prev,
                {
                    id: Date.now(),
                    sender: "agent",
                    text: action.text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);

            if (isCorrect) {
                setScore(prev => prev + 1);
                // Advance to success step
                setTimeout(() => advanceStep(currentStep.successStep), 600);
            } else {
                // Wrong answer feedback
                setHistory(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        sender: "system",
                        text: "That doesn't look quite right. Try again!",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        variant: "warning"
                    }
                ]);
            }
            return;
        }

        // Standard button action
        setHistory(prev => [
            ...prev,
            {
                id: Date.now(),
                sender: "agent", // User is the agent
                text: action.label,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);

        if (action.nextStep) {
            // Small delay for natural feel
            setTimeout(() => advanceStep(action.nextStep), 600);
        }
    };

    const toggleHint = () => {
        setShowHint(prev => !prev);
    };

    const checkNavigationGoal = (navId) => {
        if (currentStep?.type === "task" && currentStep.goalRoute === navId) {
            // Success! Move to next step
            if (activeScenarioId === "scenario_add_app") {
                if (navId === "add-applications") {
                    advanceStep("step_completion");
                }
            }
            if (activeScenarioId === "scenario_find_district_id") {
                if (navId === "data-browser") {
                    advanceStep("step_locate_id");
                }
            }
        }
    };

    const checkActionGoal = (actionId) => {
        // Generic action handling can go here if needed
        if (currentStep?.type === "task" && currentStep.goalAction === actionId) {
            // ...
        }
    }

    const value = {
        activeScenario,
        scenarioSettings,
        currentStep,
        history,
        showHint,
        score,
        handleAction,
        toggleHint,
        checkNavigationGoal,
        checkActionGoal,
        advanceStep
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
