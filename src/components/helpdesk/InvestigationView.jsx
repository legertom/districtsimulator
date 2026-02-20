"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import { normalizeStep, STEP_TYPE_MAP } from "@/context/InstructionalContext";
import { getCustomerInfo } from "@/data/characters";
import TicketCard from "./TicketCard";
import styles from "./InvestigationView.module.css";

/**
 * InvestigationView — Ticket + Investigation checklist + Resolution.
 *
 * Replaces the iMessage-style ConversationView for scenarios that use
 * the new format (scenario.ticketMessage is present).
 *
 * Layout:
 *   1. TicketCard (pinned at top) — the coworker's static request
 *   2. Step checklist (scrollable) — investigation steps with progress
 *   3. Current step interaction — input/choices/navigation prompt
 */
export default function InvestigationView() {
    const {
        activeScenario,
        currentStep,
        normalizedCurrentStep,
        coachMarksEnabled,
        showHint,
        handleAction,
        skipTicket,
        returnToInbox,
        toggleCoachMarks,
        toggleHint,
        replayScenario,
        scenarioJustCompleted,
        scores,
    } = useInstructional();

    const [inputValue, setInputValue] = useState("");
    const currentStepRef = useRef(null);
    const prevStepIdRef = useRef(currentStep?.id);

    // Build normalized step list with completion status
    const stepList = useMemo(() => {
        if (!activeScenario?.steps) return [];
        const currentIdx = activeScenario.steps.findIndex(s => s.id === currentStep?.id);

        return activeScenario.steps.map((step, idx) => {
            const norm = normalizeStep(step);
            let status = "future";
            if (scenarioJustCompleted || (currentIdx >= 0 && idx < currentIdx)) {
                status = "completed";
            } else if (idx === currentIdx) {
                status = "current";
            }
            return { ...norm, _status: status, _originalStep: step };
        });
    }, [activeScenario, currentStep, scenarioJustCompleted]);

    // Reset input when step changes — tracked via ref to avoid setState in useEffect
    if (currentStep?.id !== prevStepIdRef.current) {
        prevStepIdRef.current = currentStep?.id;
        if (inputValue !== "") {
            setInputValue("");
        }
    }

    // Auto-scroll to current step
    useEffect(() => {
        if (typeof currentStepRef.current?.scrollIntoView === "function") {
            currentStepRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [currentStep?.id]);

    const handleSend = () => {
        const text = inputValue.trim();
        if (!text) return;
        handleAction({ type: "submitted_answer", text });
        setInputValue("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (ms) => {
        if (!ms) return "\u2014";
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}m ${sec.toString().padStart(2, "0")}s`;
    };

    const customer = getCustomerInfo(activeScenario?.customerId);
    const proc = currentStep ? STEP_TYPE_MAP[currentStep.type] : null;
    const isResolution = currentStep?.type === "resolution";

    return (
        <div className={styles.investigation}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={returnToInbox}
                    title="Return to inbox"
                >
                    \u2190
                </button>
                <div className={styles.headerInfo}>
                    <span className={styles.headerTitle}>
                        {activeScenario?.title || "Investigation"}
                    </span>
                </div>
                <div className={styles.headerActions}>
                    {(currentStep || scenarioJustCompleted) && (
                        <button
                            className={`${styles.coachToggle} ${coachMarksEnabled ? styles.coachToggleOn : ""}`}
                            onClick={toggleCoachMarks}
                            title={coachMarksEnabled ? "Disable coach marks" : "Enable coach marks"}
                        >
                            \uD83D\uDCA1
                        </button>
                    )}
                </div>
            </div>

            {/* ── Ticket card (pinned) ── */}
            <TicketCard scenario={activeScenario} />

            {/* ── Scrollable step list ── */}
            <div className={styles.stepList} role="list">
                {stepList.map((step) => {
                    const isCurrent = step._status === "current";
                    const isCompleted = step._status === "completed";
                    const stepProc = STEP_TYPE_MAP[step.type];
                    const isStepResolution = step.type === "resolution";

                    return (
                        <div
                            key={step.id}
                            ref={isCurrent ? currentStepRef : null}
                            className={`${styles.stepItem} ${styles[`step_${step._status}`]}`}
                            role="listitem"
                            aria-current={isCurrent ? "step" : undefined}
                        >
                            {/* Step indicator */}
                            <div className={styles.stepIndicator}>
                                {isCompleted ? (
                                    <span className={styles.stepCheck}>\u2713</span>
                                ) : isCurrent ? (
                                    <span className={styles.stepArrow}>\u2192</span>
                                ) : (
                                    <span className={styles.stepCircle}>\u25CB</span>
                                )}
                            </div>

                            <div className={styles.stepContent}>
                                {/* Checklist label */}
                                <div className={styles.stepLabel}>
                                    {isStepResolution && isCurrent && (
                                        <span className={styles.resolutionBadge}>
                                            \uD83D\uDCE4 Report back to {customer.name}
                                        </span>
                                    )}
                                    {!(isStepResolution && isCurrent) && step.checklistLabel}
                                </div>

                                {/* Current step: show question + interaction */}
                                {isCurrent && !scenarioJustCompleted && (
                                    <div className={styles.stepExpanded}>
                                        {/* Question text */}
                                        {step.question && (
                                            <p className={styles.stepQuestion}>{step.question}</p>
                                        )}

                                        {/* Goal step: navigation prompt */}
                                        {stepProc === "goal" && (
                                            <div className={styles.navPrompt}>
                                                {step.guideMessage || "Navigate to complete this step\u2026"}
                                            </div>
                                        )}

                                        {/* Freetext step: input */}
                                        {stepProc === "freetext" && (
                                            <div className={styles.inputWrapper}>
                                                <textarea
                                                    className={styles.input}
                                                    placeholder="Type your answer"
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    rows={1}
                                                />
                                                <button
                                                    className={styles.sendButton}
                                                    onClick={handleSend}
                                                    disabled={!inputValue.trim()}
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        )}

                                        {/* Choice step: buttons */}
                                        {stepProc === "choice" && step.choices && (
                                            <div className={styles.choiceButtons}>
                                                {step.choices.map((choice, idx) => (
                                                    <button
                                                        key={`${choice.label}-${idx}`}
                                                        className={styles.choiceButton}
                                                        onClick={() => handleAction(choice)}
                                                    >
                                                        {choice.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Hint toggle */}
                                        {coachMarksEnabled && step._originalStep.hint && (
                                            <button
                                                className={`${styles.hintButton} ${showHint ? styles.hintActive : ""}`}
                                                onClick={toggleHint}
                                            >
                                                {showHint ? "Hide Hint" : "Show Hint"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* ── Completion card ── */}
                {scenarioJustCompleted && (
                    <div className={styles.completionCard}>
                        <div className={styles.completionIcon}>\u2705</div>
                        <div className={styles.completionTitle}>Investigation Complete</div>
                        <div className={styles.completionStats}>
                            <div className={styles.completionStat}>
                                <span className={styles.statLabel}>Score</span>
                                <span className={styles.statValue}>
                                    {scenarioJustCompleted.scores.correct}/{scenarioJustCompleted.scores.total}
                                </span>
                            </div>
                            <div className={styles.completionStat}>
                                <span className={styles.statLabel}>Time</span>
                                <span className={styles.statValue}>
                                    {formatTime(scenarioJustCompleted.scores.timeMs)}
                                </span>
                            </div>
                        </div>
                        <div className={styles.completionActions}>
                            <button
                                className={styles.replayButton}
                                onClick={() => replayScenario(scenarioJustCompleted.scenarioId)}
                            >
                                \u21BA Replay
                            </button>
                            <button
                                className={styles.returnButton}
                                onClick={returnToInbox}
                            >
                                Return to Inbox
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            {currentStep && !scenarioJustCompleted && (
                <div className={styles.footer}>
                    <button className={styles.skipButton} onClick={skipTicket}>
                        Skip this ticket
                    </button>
                </div>
            )}
        </div>
    );
}
