"use client";

import { useRef, useEffect } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "./ChatPanel.module.css";
import GuidancePanel from "../guidance/GuidancePanel";

export default function ChatPanel() {
    const {
        history,
        currentStep,
        handleAction,
        activeScenario,
        toggleHint,
        showHint,
        advanceStep
    } = useInstructional();

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    // Render actions based on the current step type
    const renderActions = () => {
        if (!currentStep) return null;

        // If it's a message step with multiple choices
        if (currentStep.type === "message" && currentStep.actions) {
            return (
                <div className={styles.responseArea}>
                    <span className={styles.responseLabel}>Choose your response:</span>
                    <div className={styles.actionButtons}>
                        {currentStep.actions.map((action, idx) => (
                            <button
                                key={idx}
                                className={styles.actionButton}
                                onClick={() => handleAction(action)}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        // If it's a task step, actions are now handled by GuidancePanel
        if (currentStep.type === "task") {
            return null;
        }

        if (currentStep.type === "input") {
            return (
                <div className={styles.inputActions}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        const fd = new FormData(form);
                        handleAction({ text: fd.get('answer'), type: 'submitted_answer' });
                        form.reset();
                    }} className={styles.inputForm}>
                        <input
                            name="answer"
                            type="text"
                            placeholder="Type your answer..."
                            className={styles.textInput}
                            autoComplete="off"
                        />
                        <button type="submit" className={styles.sendButton}>➤</button>
                    </form>
                    {currentStep.hint && (
                        <button
                            className={`${styles.hintButton} ${showHint ? styles.active : ''}`}
                            onClick={toggleHint}
                            type="button"
                        >
                            {showHint ? "💡 Hide Hint" : "💡 Show Hint"}
                        </button>
                    )}
                </div>
            )
        }

        return null;
    };

    return (
        <div className={styles.chatPanel}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.customerInfo}>
                    <div className={styles.avatar}>
                        <span>👩🏽‍💼</span>
                    </div>
                    <div className={styles.customerDetails}>
                        <div className={styles.customerName}>Principal Jones</div>
                        <div className={styles.customerStatus}>
                            <span className={styles.statusDot}></span>
                            Lincoln Heights Elementary
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <span className={styles.badge}>Clever Admin</span>
                </div>
            </div>

            {/* Guidance Panel (The Entity) */}
            <GuidancePanel />

            {/* Context Banner Removed - moved to GuidancePanel Logic roughly */}

            {/* Messages */}
            <div className={styles.messages}>
                {history.map((msg) => (
                    <div
                        key={msg.id}
                        className={`${styles.message} ${styles[msg.sender]}`}
                    >
                        {msg.sender === "customer" && (
                            <div className={styles.messageAvatar}>👩🏽‍💼</div>
                        )}
                        <div className={styles.messageBubble}>
                            <div className={styles.messageText}>{msg.text}</div>
                            <div className={styles.messageTime}>{msg.timestamp}</div>
                        </div>
                    </div>
                ))}

                {/* Action Area (Inline with chat flow) */}
                <div className={styles.inputArea}>
                    {renderActions()}
                </div>

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
