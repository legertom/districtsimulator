"use client";

import { useState, useRef, useEffect } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import { getCustomerInfo } from "@/data/characters";
import styles from "./ConversationView.module.css";

export default function ConversationView() {
    const {
        activeScenario,
        currentStep,
        conversationHistory,
        coachMarksEnabled,
        handleAction,
        skipTicket,
        returnToInbox,
        toggleCoachMarks,
        replayScenario,
        scenarioJustCompleted,
    } = useInstructional();

    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef(null);

    const customer = getCustomerInfo(activeScenario?.customerId);

    const scrollToBottom = () => {
        if (typeof messagesEndRef.current?.scrollIntoView === "function") {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversationHistory, currentStep, scenarioJustCompleted]);

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

    // Format time for completion card
    const formatTime = (ms) => {
        if (!ms) return "—";
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}m ${sec.toString().padStart(2, "0")}s`;
    };

    return (
        <div className={styles.conversation}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={returnToInbox}
                    title="Return to inbox"
                >
                    ←
                </button>
                <div
                    className={styles.headerAvatar}
                    style={{ backgroundColor: customer.avatarColor }}
                >
                    {customer.avatar}
                </div>
                <div className={styles.headerInfo}>
                    <div className={styles.headerName}>{customer.name}</div>
                    {customer.school && (
                        <div className={styles.headerSchool}>{customer.school}</div>
                    )}
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

            {/* ── Context banner ── */}
            {currentStep && activeScenario && (
                <div className={styles.contextBanner}>
                    <span className={styles.contextIcon}>📋</span>
                    <span className={styles.contextText}>
                        <strong>Scenario:</strong> {activeScenario.description || "Training scenario"}
                    </span>
                </div>
            )}

            {/* ── Messages ── */}
            <div className={styles.messages}>
                {conversationHistory.map((msg) => {
                    if (msg.sender === "system") {
                        return (
                            <div key={msg.id} className={styles.systemMessage}>
                                <div className={`${styles.systemBubble} ${msg.variant ? styles[msg.variant] : ""}`}>
                                    {msg.text}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={msg.id}
                            className={`${styles.message} ${styles[msg.sender] || styles.customer}`}
                        >
                            {msg.sender === "customer" && (
                                <div
                                    className={styles.messageAvatar}
                                    style={{ backgroundColor: customer.avatarColor }}
                                >
                                    {customer.avatar}
                                </div>
                            )}
                            <div className={styles.messageBubble}>
                                <div className={styles.messageText}>{msg.text}</div>
                                <div className={styles.messageTime}>{msg.timestamp}</div>
                            </div>
                        </div>
                    );
                })}

                {/* ── Completion card (Fix 2: driven by explicit state) ── */}
                {scenarioJustCompleted && (
                    <div className={styles.completionCard}>
                        <div className={styles.completionIcon}>✅</div>
                        <div className={styles.completionTitle}>Ticket Resolved</div>
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
                                ↺ Replay
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

                <div ref={messagesEndRef} />
            </div>

            {/* ── Input area ── */}
            <div className={styles.inputArea}>
                {scenarioJustCompleted ? (
                    <div className={styles.inputHint}>
                        Ticket resolved. Return to inbox or replay this scenario.
                    </div>
                ) : !currentStep ? (
                    <div className={styles.inputHint}>Waiting for next training step…</div>
                ) : currentStep.actions?.length ? (
                    <div className={styles.actionButtons}>
                        {currentStep.actions.map((action, idx) => (
                            <button
                                key={`${action.label}-${idx}`}
                                className={styles.actionButton}
                                onClick={() => handleAction(action)}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                ) : currentStep.type === "input" ? (
                    <div className={styles.inputWrapper}>
                        <textarea
                            className={styles.input}
                            placeholder="Type your response"
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
                            Send
                        </button>
                    </div>
                ) : (
                    <div className={styles.inputHint}>
                        {currentStep.type === "task"
                            ? `Navigate to complete this step…`
                            : "Waiting for next training step…"}
                    </div>
                )}

                {currentStep && !scenarioJustCompleted && (
                    <div className={styles.inputFooter}>
                        <span className={styles.inputHint}>Press Enter to send</span>
                        <button className={styles.skipButton} onClick={skipTicket}>
                            Skip this ticket
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
