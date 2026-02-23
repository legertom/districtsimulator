"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import { normalizeStep, STEP_TYPE_MAP } from "@/context/InstructionalContext";
import { CHARACTERS, getCustomerInfo } from "@/data/characters";
import { scenarios } from "@/data/scenarios";
import { COURSES } from "@/data/curriculum";
import TicketCard from "./TicketCard";
import styles from "./ChatView.module.css";

let msgCounter = 0;
function msgId() {
    return `msg_${++msgCounter}_${Date.now()}`;
}

const scenarioIdSet = new Set(scenarios.map(s => s.id));

function isModuleComplete(mod, completedScenarios) {
    const authored = mod.scenarioIds.filter(sid => scenarioIdSet.has(sid));
    if (authored.length === 0) return true;
    return authored.every(sid => completedScenarios.has(sid));
}

const MODULE_MAP = {};
for (const course of COURSES) {
    for (const mod of course.modules) {
        MODULE_MAP[mod.id] = mod;
    }
}

function isModuleLocked(mod, completedModules, completedScenarios) {
    for (const preId of mod.prerequisites || []) {
        if (completedModules.has(preId)) continue;
        const preMod = MODULE_MAP[preId];
        if (!preMod) return true;
        return !isModuleComplete(preMod, completedScenarios);
    }
    return false;
}

export default function ChatView() {
    const {
        activeScenario,
        currentStep,
        normalizedCurrentStep,
        coachMarksEnabled,
        handleAction,
        skipTicket,
        returnToInbox,
        toggleCoachMarks,
        replayScenario,
        scenarioJustCompleted,
        visitedStepIds,
        completedScenarios,
        completedModules,
        acceptTicket,
    } = useInstructional();

    const [chatMessages, setChatMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [lobbyBuilt, setLobbyBuilt] = useState(false);
    const bottomRef = useRef(null);
    const prevStepIdRef = useRef(null);
    const prevScenarioIdRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lobbyTimeoutsRef = useRef([]);

    const isOnboarding = activeScenario?.chatMode === "onboarding";
    const boss = CHARACTERS.boss;
    const customer = getCustomerInfo(activeScenario?.customerId);
    const stepProc = currentStep ? STEP_TYPE_MAP[currentStep.type] : null;
    const norm = currentStep ? normalizeStep(currentStep) : null;
    const isLobby = !activeScenario && !scenarioJustCompleted;

    // ── Current module + available tickets ──
    const course = COURSES[0];
    const currentModule = useMemo(() => {
        for (const mod of course.modules) {
            const locked = isModuleLocked(mod, completedModules, completedScenarios);
            if (locked) continue;
            if (!isModuleComplete(mod, completedScenarios)) return mod;
        }
        return course.modules[course.modules.length - 1];
    }, [course.modules, completedModules, completedScenarios]);

    const availableTickets = useMemo(() => {
        if (!currentModule) return [];
        return currentModule.scenarioIds
            .filter(sid => scenarioIdSet.has(sid) && !completedScenarios.has(sid))
            .map(sid => scenarios.find(s => s.id === sid))
            .filter(Boolean);
    }, [currentModule, completedScenarios]);

    // Helper: append messages with optional typing delay
    const appendMessages = useCallback((msgs, delay = 0) => {
        if (delay > 0) {
            setIsTyping(true);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                setChatMessages(prev => [...prev, ...msgs]);
            }, delay);
        } else {
            setChatMessages(prev => [...prev, ...msgs]);
        }
    }, []);

    // Cleanup timeouts
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            lobbyTimeoutsRef.current.forEach(t => clearTimeout(t));
        };
    }, []);

    // ── Lobby mode: build welcome + ticket notifications ──
    useEffect(() => {
        if (!isLobby) {
            setLobbyBuilt(false);
            return;
        }
        if (lobbyBuilt) return;
        setLobbyBuilt(true);

        setChatMessages([]);
        prevScenarioIdRef.current = null;
        prevStepIdRef.current = null;

        lobbyTimeoutsRef.current.forEach(t => clearTimeout(t));
        lobbyTimeoutsRef.current = [];

        // Staggered entrance: welcome → tickets
        const welcome = currentModule?.bossIntro;
        if (welcome) {
            const t1 = setTimeout(() => {
                setChatMessages(prev => [...prev, {
                    id: msgId(), type: "welcome", text: welcome,
                }]);
            }, 300);
            lobbyTimeoutsRef.current.push(t1);
        }

        availableTickets.forEach((scenario, idx) => {
            const t = setTimeout(() => {
                setChatMessages(prev => [...prev, {
                    id: msgId(),
                    type: "ticket-notification",
                    scenario,
                    scenarioId: scenario.id,
                }]);
            }, 800 + idx * 400);
            lobbyTimeoutsRef.current.push(t);
        });
    }, [isLobby, lobbyBuilt, currentModule, availableTickets]);

    // ── Scenario initialization ──
    useEffect(() => {
        if (!activeScenario) return;
        if (activeScenario.id === prevScenarioIdRef.current) return;
        prevScenarioIdRef.current = activeScenario.id;
        prevStepIdRef.current = null;

        const msgs = [];
        if (isOnboarding) {
            if (activeScenario.alexIntro) {
                msgs.push({ id: msgId(), type: "alex", text: activeScenario.alexIntro });
            }
        } else {
            msgs.push({ id: msgId(), type: "ticket", scenario: activeScenario });
            if (activeScenario.alexContext) {
                msgs.push({ id: msgId(), type: "alex", text: activeScenario.alexContext });
            }
        }
        setChatMessages(msgs);
        setInputValue("");
    }, [activeScenario, isOnboarding]);

    // ── Step change → append new messages ──
    useEffect(() => {
        if (!currentStep) return;
        if (currentStep.id === prevStepIdRef.current) return;

        const isFirst = prevStepIdRef.current === null;
        prevStepIdRef.current = currentStep.id;

        const step = normalizeStep(currentStep);
        const proc = STEP_TYPE_MAP[currentStep.type];
        const msgs = [];

        const alexText = step.alexPrompt || step.question;
        if (alexText) {
            msgs.push({ id: msgId(), type: "alex", text: alexText });
        }

        if (proc === "goal" && step.systemPrompt) {
            msgs.push({ id: msgId(), type: "system", text: step.systemPrompt });
        } else if (proc === "goal" && step.guideMessage) {
            msgs.push({ id: msgId(), type: "system", text: step.guideMessage });
        }

        if (proc === "choice" && step.choices) {
            msgs.push({ id: msgId(), type: "choices", choices: step.choices, stepId: currentStep.id });
        }

        if (msgs.length > 0) {
            appendMessages(msgs, isFirst ? 0 : 500);
        }
    }, [currentStep, appendMessages]);

    // ── Scenario completion ──
    useEffect(() => {
        if (!scenarioJustCompleted) return;

        const msgs = [];
        const alexText = coachMarksEnabled
            ? "Nice work following along. You're picking this up fast."
            : "You figured that out on your own. I'm going to stop worrying about you.";
        msgs.push({ id: msgId(), type: "alex", text: alexText });
        msgs.push({ id: msgId(), type: "completion", scores: scenarioJustCompleted });

        appendMessages(msgs, 600);
    }, [scenarioJustCompleted, coachMarksEnabled, appendMessages]);

    // ── Auto-scroll ──
    useEffect(() => {
        if (typeof bottomRef.current?.scrollIntoView === "function") {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, isTyping]);

    // ── User actions ──
    const handleChoiceClick = (choice, stepId) => {
        setChatMessages(prev => {
            const filtered = prev.filter(m => !(m.type === "choices" && m.stepId === stepId));
            return [...filtered, { id: msgId(), type: "user", text: choice.label }];
        });

        const step = activeScenario?.steps?.find(s => s.id === stepId);
        if (step) {
            const responseText = choice.correct !== false ? step.alexCorrectResponse : step.alexWrongResponse;
            if (responseText) {
                appendMessages([{ id: msgId(), type: "alex", text: responseText }], 400);
            }
        }
        handleAction(choice);
    };

    const handleSend = () => {
        const text = inputValue.trim();
        if (!text) return;
        setChatMessages(prev => [...prev, { id: msgId(), type: "user", text }]);
        setInputValue("");
        handleAction({ type: "submitted_answer", text });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleStartTicket = (scenario) => {
        if (scenario.chatMode === "onboarding") {
            acceptTicket(scenario.id, true);
        } else {
            setChatMessages(prev => {
                const filtered = prev.filter(m => m.scenarioId !== scenario.id);
                return [...filtered, {
                    id: msgId(), type: "mode-picker", scenario, scenarioId: scenario.id,
                }];
            });
        }
    };

    const handleModeSelect = (scenario, guided) => {
        acceptTicket(scenario.id, guided);
    };

    const handleReturnToLobby = () => {
        returnToInbox();
    };

    const formatTime = (ms) => {
        if (!ms) return "—";
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}m ${sec.toString().padStart(2, "0")}s`;
    };

    const renderProgressDots = () => (
        <div className={styles.progressDots}>
            {course.modules.map((mod) => {
                const complete = isModuleComplete(mod, completedScenarios);
                return (
                    <div
                        key={mod.id}
                        className={`${styles.progressDot} ${complete ? styles.progressDotComplete : ""} ${
                            currentModule?.id === mod.id ? styles.progressDotCurrent : ""
                        }`}
                    />
                );
            })}
        </div>
    );

    return (
        <div className={styles.chatView}>
            {/* ── Header ── */}
            {isLobby || scenarioJustCompleted ? (
                <div className={styles.header}>
                    <div className={styles.headerProfile}>
                        <span className={styles.lobbyIcon}>📥</span>
                        <span className={styles.headerName}>Help Desk</span>
                    </div>
                    <div className={styles.headerActions}>
                        {renderProgressDots()}
                    </div>
                </div>
            ) : (
                <div className={styles.header}>
                    <button className={styles.backButton} onClick={handleReturnToLobby} title="Return to tasks">←</button>
                    {isOnboarding ? (
                        <div className={styles.headerProfile}>
                            <div className={styles.headerAvatar} style={{ backgroundColor: boss.avatarColor }}>{boss.avatar}</div>
                            <div className={styles.headerInfo}>
                                <span className={styles.headerName}>Alex Rivera</span>
                                <span className={styles.headerRole}>Onboarding</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.headerProfile}>
                            <span className={styles.headerName}>#{activeScenario?.ticketNumber || "—"} · {customer.name}</span>
                        </div>
                    )}
                    <div className={styles.headerActions}>
                        {(currentStep || scenarioJustCompleted) && (
                            <button
                                className={`${styles.coachToggle} ${coachMarksEnabled ? styles.coachToggleOn : ""}`}
                                onClick={toggleCoachMarks}
                                title={coachMarksEnabled ? "Disable coach marks" : "Enable coach marks"}
                            >💡</button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Module label (lobby only) ── */}
            {(isLobby || scenarioJustCompleted) && currentModule && (
                <div className={styles.moduleLabel}>
                    <span className={styles.moduleLabelTitle}>
                        Module {course.modules.indexOf(currentModule) + 1} · {currentModule.title}
                    </span>
                </div>
            )}

            {/* ── Message stream ── */}
            <div className={styles.messageStream}>
                {chatMessages.map((msg) => {
                    switch (msg.type) {
                        case "alex":
                        case "welcome":
                            return (
                                <div key={msg.id} className={styles.alexMessage}>
                                    <div className={styles.alexAvatar} style={{ backgroundColor: boss.avatarColor }}>{boss.avatar}</div>
                                    <div className={styles.alexBubble}>{msg.text}</div>
                                </div>
                            );

                        case "user":
                            return (
                                <div key={msg.id} className={styles.userMessage}>
                                    <div className={styles.userBubble}>{msg.text}</div>
                                </div>
                            );

                        case "system":
                            return (
                                <div key={msg.id} className={styles.systemMessage}>
                                    <span className={styles.systemPill}>{msg.text}</span>
                                </div>
                            );

                        case "ticket":
                            return (
                                <div key={msg.id} className={styles.ticketMessage}>
                                    <TicketCard scenario={msg.scenario} />
                                </div>
                            );

                        case "choices":
                            return (
                                <div key={msg.id} className={styles.choicesMessage}>
                                    {msg.choices.map((choice, idx) => (
                                        <button
                                            key={`${choice.label}-${idx}`}
                                            className={styles.choiceButton}
                                            onClick={() => handleChoiceClick(choice, msg.stepId)}
                                        >
                                            {choice.label}
                                        </button>
                                    ))}
                                </div>
                            );

                        case "completion":
                            return (
                                <div key={msg.id} className={styles.completionCard}>
                                    <div className={styles.completionStats}>
                                        <div className={styles.completionStat}>
                                            <span className={styles.statLabel}>Mode</span>
                                            <span className={styles.statValue}>{msg.scores.mode === "guided" ? "Guided" : "Solo"}</span>
                                        </div>
                                        <div className={styles.completionStat}>
                                            <span className={styles.statLabel}>Score</span>
                                            <span className={styles.statValue}>{msg.scores.scores.correct}/{msg.scores.scores.total}</span>
                                        </div>
                                        <div className={styles.completionStat}>
                                            <span className={styles.statLabel}>Time</span>
                                            <span className={styles.statValue}>{formatTime(msg.scores.scores.timeMs)}</span>
                                        </div>
                                    </div>
                                </div>
                            );

                        case "ticket-notification":
                            return (
                                <div key={msg.id} className={styles.ticketNotification}>
                                    <div className={styles.notificationContent}>
                                        <div className={styles.notificationHeader}>
                                            <span className={styles.notificationNumber}>#{msg.scenario.ticketNumber}</span>
                                            <span className={styles.notificationTitle}>
                                                {msg.scenario.ticketSubject || msg.scenario.description}
                                            </span>
                                        </div>
                                        <button className={styles.startButton} onClick={() => handleStartTicket(msg.scenario)}>
                                            Start →
                                        </button>
                                    </div>
                                </div>
                            );

                        case "mode-picker":
                            return (
                                <div key={msg.id} className={styles.modePickerMessage}>
                                    <div className={styles.modePickerTitle}>How would you like to proceed?</div>
                                    <div className={styles.modePickerButtons}>
                                        <button className={styles.modeButton} onClick={() => handleModeSelect(msg.scenario, true)}>
                                            <span className={styles.modeIcon}>💡</span>
                                            <strong>Guided</strong>
                                            <span className={styles.modeDesc}>Coach marks show you where to go</span>
                                        </button>
                                        <button className={styles.modeButton} onClick={() => handleModeSelect(msg.scenario, false)}>
                                            <span className={styles.modeIcon}>🧭</span>
                                            <strong>Unguided</strong>
                                            <span className={styles.modeDesc}>Figure it out on your own</span>
                                        </button>
                                    </div>
                                </div>
                            );

                        default:
                            return null;
                    }
                })}

                {isTyping && (
                    <div className={styles.alexMessage}>
                        <div className={styles.alexAvatar} style={{ backgroundColor: boss.avatarColor }}>{boss.avatar}</div>
                        <div className={styles.typingIndicator}>
                            <span className={styles.dot} />
                            <span className={styles.dot} />
                            <span className={styles.dot} />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ── Footer ── */}
            {scenarioJustCompleted ? (
                <div className={styles.footer}>
                    <div className={styles.footerActions}>
                        <button className={styles.replayButton} onClick={() => replayScenario(scenarioJustCompleted.scenarioId)}>↺ Replay</button>
                        <button className={styles.returnButton} onClick={handleReturnToLobby}>Next Task</button>
                    </div>
                </div>
            ) : isLobby ? (
                <div className={styles.footer}>
                    <div className={styles.lobbyFooter}>Pick a task to get started</div>
                </div>
            ) : stepProc === "freetext" ? (
                <div className={styles.footer}>
                    <div className={styles.inputWrapper}>
                        <textarea className={styles.input} placeholder="Type your answer..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} rows={1} />
                        <button className={styles.sendButton} onClick={handleSend} disabled={!inputValue.trim()}>↑</button>
                    </div>
                    <div className={styles.footerMeta}>
                        <span className={styles.footerHint}>Enter to send</span>
                        <button className={styles.skipButton} onClick={skipTicket}>Skip</button>
                    </div>
                </div>
            ) : stepProc === "goal" ? (
                <div className={styles.footer}>
                    <div className={styles.footerStatus}>{norm?.guideMessage || "Head over to the right spot in the dashboard..."}</div>
                    <div className={styles.footerMeta}>
                        <span />
                        <button className={styles.skipButton} onClick={skipTicket}>Skip</button>
                    </div>
                </div>
            ) : currentStep ? (
                <div className={styles.footer}>
                    <div className={styles.footerMeta}>
                        <span className={styles.footerHint}>Pick an answer above</span>
                        <button className={styles.skipButton} onClick={skipTicket}>Skip</button>
                    </div>
                </div>
            ) : (
                <div className={styles.footer}>
                    <div className={styles.footerStatus}>...</div>
                </div>
            )}
        </div>
    );
}
