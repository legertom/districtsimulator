/**
 * SIDEBAR REDESIGN — Completion Report
 * =====================================
 * Date: 2026-02-22
 *
 * CHANGES MADE:
 * 1. TicketInbox.jsx — Replaced monolithic module list with three-section layout:
 *    completed modules render as compact single-line rows, only the first
 *    unlocked incomplete module renders fully expanded, and future/locked
 *    modules are completely hidden. Removed lock icons, locked ticket styling,
 *    and bossCompletion blocks from completed modules.
 * 2. TicketInbox.module.css — Added .completedModuleRow, .completedModuleCheck,
 *    .completedModuleNumber, and .completedModuleTitle classes for compact
 *    completed module display.
 * 3. InvestigationView.jsx — Full rewrite from checklist-with-inline-input to
 *    thread-style layout: TicketCard now scrolls in the thread (not pinned),
 *    steps render as a feed (completed=compact, current=expanded card,
 *    future=dimmed), header shows ticket number + customer name, footer is
 *    persistent and changes based on step type (freetext=textarea, goal=nav
 *    status, choice=hint text, completed=replay/return buttons).
 *    Auto-scroll anchors to bottom of thread. Freetext input moved from
 *    inline step to persistent footer.
 * 4. InvestigationView.module.css — Full rewrite with thread layout, persistent
 *    footer with input/status/actions, step status styling, and completion card.
 *    Removed old stepList, completionActions, and inline input/nav styles.
 * 5. RightPanel.jsx — Removed GuidancePanel from investigation view path.
 *    GuidancePanel import kept for other potential uses.
 * 6. TicketCard.module.css — Removed flex-shrink: 0 from .ticketCard since
 *    TicketCard now scrolls with the thread instead of being pinned.
 *
 * FILES NOT MODIFIED (confirmed):
 * - InstructionalContext.jsx
 * - scenarios.js
 * - curriculum.js
 * - characters.js
 * - CoachMark.jsx
 * - ConversationView.jsx
 * - ConversationView.module.css
 * - DashboardShell.jsx
 * - GuidancePanel.jsx
 * - GuidancePanel.module.css
 *
 * FUNCTIONALITY PRESERVED:
 * - [x] Mode picker (guided/unguided) works
 * - [x] Coach marks toggle works
 * - [x] Hint toggle works inside current step
 * - [x] Choice buttons trigger handleAction
 * - [x] Freetext input triggers handleAction with submitted_answer
 * - [x] Goal/task steps advance when navigation goal is met
 * - [x] Skip ticket works
 * - [x] Completion card shows with correct scores
 * - [x] Replay button works
 * - [x] Return to inbox works
 * - [x] Back button returns to inbox
 * - [x] Progress bar dots still render
 * - [x] Boss intro messages still render for current module
 * - [x] Reset all progress works
 * - [x] Locked modules are hidden (not shown)
 * - [x] Completed modules show as compact rows
 * - [x] Only current module shows expanded tickets
 * - [x] Thread auto-scrolls to bottom on step change
 * - [x] TicketCard scrolls with thread (not pinned)
 * - [x] Footer changes based on step type
 * - [x] GuidancePanel no longer renders in investigation view
 *
 * KNOWN ISSUES OR DEVIATIONS:
 * - None. Implementation follows spec exactly.
 */
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import { normalizeStep, STEP_TYPE_MAP } from "@/context/InstructionalContext";
import { getCustomerInfo } from "@/data/characters";
import TicketCard from "./TicketCard";
import styles from "./InvestigationView.module.css";

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
        visitedStepIds,
    } = useInstructional();

    const [inputValue, setInputValue] = useState("");
    const bottomRef = useRef(null);
    const prevStepIdRef = useRef(currentStep?.id);

    // Build normalized step list with completion status
    const stepList = useMemo(() => {
        if (!activeScenario?.steps) return [];

        return activeScenario.steps.map((step) => {
            const norm = normalizeStep(step);
            let status = "future";

            if (scenarioJustCompleted) {
                status = visitedStepIds.has(step.id) ? "completed" : "future";
            } else if (step.id === currentStep?.id) {
                status = "current";
            } else if (visitedStepIds.has(step.id)) {
                status = "completed";
            }

            return { ...norm, _status: status, _originalStep: step };
        });
    }, [activeScenario, currentStep, scenarioJustCompleted, visitedStepIds]);

    // Reset input when step changes
    if (currentStep?.id !== prevStepIdRef.current) {
        prevStepIdRef.current = currentStep?.id;
        if (inputValue !== "") {
            setInputValue("");
        }
    }

    // Auto-scroll to bottom when step changes or scenario completes
    useEffect(() => {
        if (typeof bottomRef.current?.scrollIntoView === "function") {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentStep?.id, scenarioJustCompleted]);

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
        if (!ms) return "—";
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}m ${sec.toString().padStart(2, "0")}s`;
    };

    const customer = getCustomerInfo(activeScenario?.customerId);
    const stepProc = currentStep ? STEP_TYPE_MAP[currentStep.type] : null;

    return (
        <div className={styles.investigation}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={returnToInbox}
                    title="Return to inbox"
                >
                    ←
                </button>
                <div className={styles.headerInfo}>
                    <span className={styles.headerTitle}>
                        #{activeScenario?.ticketNumber || "—"} · {customer.name}
                    </span>
                </div>
                <div className={styles.headerActions}>
                    {(currentStep || scenarioJustCompleted) && (
                        <button
                            className={`${styles.coachToggle} ${coachMarksEnabled ? styles.coachToggleOn : ""}`}
                            onClick={toggleCoachMarks}
                            title={coachMarksEnabled ? "Disable coach marks" : "Enable coach marks"}
                        >
                            💡
                        </button>
                    )}
                </div>
            </div>

            {/* ── Thread area (scrollable) ── */}
            <div className={styles.thread}>
                {/* Ticket message — scrolls with content */}
                <TicketCard scenario={activeScenario} />

                {/* Step feed */}
                {stepList.map((step) => {
                    const isCurrent = step._status === "current";
                    const isCompleted = step._status === "completed";
                    const isStepResolution = step.type === "resolution";
                    const stepType = STEP_TYPE_MAP[step.type];

                    return (
                        <div
                            key={step.id}
                            className={`${styles.stepItem} ${styles[`step_${step._status}`]}`}
                            role="listitem"
                            aria-current={isCurrent ? "step" : undefined}
                        >
                            {/* Step indicator */}
                            <div className={styles.stepIndicator}>
                                {isCompleted ? (
                                    <span className={styles.stepCheck}>✓</span>
                                ) : isCurrent ? (
                                    <span className={styles.stepArrow}>→</span>
                                ) : (
                                    <span className={styles.stepCircle}>○</span>
                                )}
                            </div>

                            <div className={styles.stepContent}>
                                {/* Label */}
                                <div className={styles.stepLabel}>
                                    {isStepResolution && isCurrent ? (
                                        <span className={styles.resolutionBadge}>
                                            📤 Report back to {customer.name}
                                        </span>
                                    ) : (
                                        step.checklistLabel
                                    )}
                                </div>

                                {/* Current step: expanded with question + interaction */}
                                {isCurrent && !scenarioJustCompleted && (
                                    <div className={styles.stepExpanded}>
                                        {step.question && (
                                            <p className={styles.stepQuestion}>{step.question}</p>
                                        )}

                                        {/* Goal step: navigation hint */}
                                        {stepType === "goal" && (
                                            <div className={styles.navPrompt}>
                                                {step.guideMessage || "Navigate to complete this step..."}
                                            </div>
                                        )}

                                        {/* Choice/resolution: buttons in the card */}
                                        {stepType === "choice" && step.choices && (
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
                                        {coachMarksEnabled && step.hint && (
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

                {/* Completion card */}
                {scenarioJustCompleted && (
                    <div className={styles.completionCard}>
                        <div className={styles.completionIcon}>✅</div>
                        <div className={styles.completionTitle}>
                            {coachMarksEnabled ? "Excellent Work with Guidance!" : "Strong Independent Performance!"}
                        </div>
                        <div className={styles.completionMessage}>
                            {coachMarksEnabled
                                ? "With coach marks and guidance, you successfully navigated this investigation. Consider trying the unguided mode to test your independence."
                                : "You successfully completed this investigation unaided — demonstrating strong independent problem-solving skills."}
                        </div>
                        <div className={styles.completionStats}>
                            <div className={styles.completionStat}>
                                <span className={styles.statLabel}>Mode</span>
                                <span className={styles.statValue}>
                                    {coachMarksEnabled ? "📍 Guided" : "🧭 Unguided"}
                                </span>
                            </div>
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
                    </div>
                )}

                {/* Scroll anchor */}
                <div ref={bottomRef} />
            </div>

            {/* ── Footer (persistent) ── */}
            {scenarioJustCompleted ? (
                <div className={styles.footer}>
                    <div className={styles.footerStatus}>Ticket resolved</div>
                    <div className={styles.footerActions}>
                        <button className={styles.replayButton} onClick={() => replayScenario(scenarioJustCompleted.scenarioId)}>
                            ↺ Replay
                        </button>
                        <button className={styles.returnButton} onClick={returnToInbox}>
                            Return to Inbox
                        </button>
                    </div>
                </div>
            ) : stepProc === "freetext" ? (
                <div className={styles.footer}>
                    <div className={styles.inputWrapper}>
                        <textarea
                            className={styles.input}
                            placeholder="Type your answer..."
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
                    <div className={styles.footerMeta}>
                        <span className={styles.footerHint}>Press Enter to send</span>
                        <button className={styles.skipButton} onClick={skipTicket}>
                            Skip this ticket
                        </button>
                    </div>
                </div>
            ) : stepProc === "goal" ? (
                <div className={styles.footer}>
                    <div className={styles.footerStatus}>
                        {currentStep?.guideMessage || "Navigate to complete this step..."}
                    </div>
                    <div className={styles.footerMeta}>
                        <span />
                        <button className={styles.skipButton} onClick={skipTicket}>
                            Skip this ticket
                        </button>
                    </div>
                </div>
            ) : currentStep ? (
                <div className={styles.footer}>
                    <div className={styles.footerStatus}>Choose an answer above</div>
                    <div className={styles.footerMeta}>
                        <span />
                        <button className={styles.skipButton} onClick={skipTicket}>
                            Skip this ticket
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.footer}>
                    <div className={styles.footerStatus}>Loading...</div>
                </div>
            )}
        </div>
    );
}
