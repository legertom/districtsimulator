"use client";

import { useState, useRef, useEffect } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import { useScenario } from "@/context/ScenarioContext";
import styles from "./ChatPanel.module.css";

export default function ChatPanel() {
    const { scenario } = useScenario();
    const { customerInfo } = scenario.chat;
    const { activeScenario, currentStep, history, handleAction } = useInstructional();

    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, currentStep]);

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

    return (
        <div className={styles.chatPanel}>
            <div className={styles.header}>
                <div className={styles.customerInfo}>
                    <div className={styles.avatar}>
                        <span>{customerInfo.avatar}</span>
                    </div>
                    <div className={styles.customerDetails}>
                        <div className={styles.customerName}>{customerInfo.name}</div>
                        <div className={styles.customerStatus}>
                            <span className={styles.statusDot}></span>
                            {customerInfo.school}
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <span className={styles.badge}>{customerInfo.badge}</span>
                </div>
            </div>

            <div className={styles.contextBanner}>
                <div className={styles.contextIcon}>📋</div>
                <div className={styles.contextText}>
                    <strong>Scenario:</strong> {activeScenario?.description || "Training scenario"}
                </div>
            </div>

            <div className={styles.messages}>
                {history.map((msg) => (
                    <div
                        key={msg.id}
                        className={`${styles.message} ${styles[msg.sender] || styles.customer}`}
                    >
                        {msg.sender === "customer" && (
                            <div className={styles.messageAvatar}>{customerInfo.avatar}</div>
                        )}
                        <div className={styles.messageBubble}>
                            <div className={styles.messageText}>{msg.text}</div>
                            <div className={styles.messageTime}>{msg.timestamp}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                {currentStep?.actions?.length ? (
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
                ) : currentStep?.type === "input" ? (
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
                    <div className={styles.inputHint}>Waiting for next training step…</div>
                )}

                <div className={styles.inputHint}>Press Enter to send • Shift+Enter for new line</div>
            </div>
        </div>
    );
}
