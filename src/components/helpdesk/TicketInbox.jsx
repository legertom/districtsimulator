"use client";

import { useState } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import { scenarios } from "@/data/scenarios";
import { COURSES } from "@/data/curriculum";
import { CHARACTERS, getCustomerInfo } from "@/data/characters";
import styles from "./TicketInbox.module.css";

// ═══════════════════════════════════════════════════════════════
//  Cross-course module map — O(1) lookups (Fix 1)
// ═══════════════════════════════════════════════════════════════

const MODULE_MAP = {};
for (const course of COURSES) {
    for (const mod of course.modules) {
        MODULE_MAP[mod.id] = mod;
    }
}

/**
 * A module with zero authored scenarios is auto-satisfied.
 * This prevents prerequisite deadlocks when modules are defined
 * in curriculum.js but their scenarios haven't been written yet.
 */
function isModuleEffectivelyComplete(mod, completedScenarios) {
    const authored = mod.scenarioIds.filter(
        sid => scenarios.find(s => s.id === sid)
    );
    if (authored.length === 0) return true;
    return authored.every(sid => completedScenarios.has(sid));
}

/**
 * A module is locked if any of its prerequisite modules are
 * neither genuinely completed nor effectively complete.
 */
function isModuleLocked(mod, completedModules, completedScenarios) {
    return mod.prerequisites.some(preId => {
        if (completedModules.has(preId)) return false;
        const preMod = MODULE_MAP[preId];
        if (!preMod) return true; // unknown prerequisite → locked
        return !isModuleEffectivelyComplete(preMod, completedScenarios);
    });
}

export default function TicketInbox() {
    const {
        completedScenarios,
        completedModules,
        globalScore,
        scores,
        resetAllProgress,
        acceptTicket,
    } = useInstructional();

    const [showModePicker, setShowModePicker] = useState(false);
    const [pendingScenarioId, setPendingScenarioId] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [dismissedBossMessages, setDismissedBossMessages] = useState(new Set());

    const course = COURSES[0]; // current single course
    const boss = CHARACTERS.boss;

    // ── Ticket click → mode picker ──
    const handleTicketClick = (scenarioId) => {
        setPendingScenarioId(scenarioId);
        setShowModePicker(true);
    };

    const handleModeSelect = (guided) => {
        setShowModePicker(false);
        acceptTicket(pendingScenarioId, guided);
        setPendingScenarioId(null);
    };

    const handleCancelModePicker = () => {
        setShowModePicker(false);
        setPendingScenarioId(null);
    };

    // ── Reset progress ──
    const handleReset = () => {
        resetAllProgress();
        setShowResetConfirm(false);
    };

    // ── Module progress ──
    const moduleStates = course.modules.map(mod => {
        const locked = isModuleLocked(mod, completedModules, completedScenarios);
        const complete = isModuleEffectivelyComplete(mod, completedScenarios);
        return { mod, locked, complete };
    });

    // ── Boss message logic ──
    // Find the first unlocked, incomplete module with authored scenarios
    const currentModule = moduleStates.find(({ locked, complete, mod }) => {
        if (locked || complete) return false;
        return mod.scenarioIds.some(sid => scenarios.find(s => s.id === sid));
    });

    const showBossIntro = currentModule
        && currentModule.mod.bossIntro
        && !dismissedBossMessages.has(`intro-${currentModule.mod.id}`);

    const handleDismissBoss = (messageKey) => {
        setDismissedBossMessages(prev => new Set([...prev, messageKey]));
    };

    // Format time display
    const formatTime = (ms) => {
        if (!ms) return "";
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}m ${sec.toString().padStart(2, "0")}s`;
    };

    return (
        <div className={styles.inbox}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <span className={styles.headerIcon}>📥</span>
                    <span>Help Desk</span>
                </div>
                <div className={styles.headerRight}>
                    <span className={styles.scoreBadge}>⭐ {globalScore}</span>
                    <button
                        className={styles.resetButton}
                        onClick={() => setShowResetConfirm(true)}
                        title="Reset all progress"
                    >
                        ⟲
                    </button>
                </div>
            </div>

            {/* ── Reset confirmation ── */}
            {showResetConfirm && (
                <div className={styles.resetConfirm}>
                    <p>Reset all progress? This cannot be undone.</p>
                    <div className={styles.resetActions}>
                        <button className={styles.resetConfirmBtn} onClick={handleReset}>
                            Reset
                        </button>
                        <button className={styles.resetCancelBtn} onClick={() => setShowResetConfirm(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ── Progress bar ── */}
            <div className={styles.progressBar}>
                <div className={styles.progressLabel}>{course.title}</div>
                <div className={styles.progressDots}>
                    {moduleStates.map(({ mod, locked, complete }, idx) => (
                        <div
                            key={mod.id}
                            className={`${styles.progressDot} ${
                                complete ? styles.dotComplete :
                                locked ? styles.dotLocked :
                                styles.dotActive
                            }`}
                            title={`${idx + 1}. ${mod.title}`}
                        />
                    ))}
                </div>
            </div>

            {/* ── Boss message ── */}
            {showBossIntro && (
                <div className={styles.bossMessage}>
                    <div
                        className={styles.bossAvatar}
                        style={{ backgroundColor: boss.avatarColor }}
                    >
                        {boss.avatar}
                    </div>
                    <div className={styles.bossContent}>
                        <div className={styles.bossName}>
                            {boss.firstName} {boss.lastName}
                            <span className={styles.bossRole}>{boss.role}</span>
                        </div>
                        <p className={styles.bossText}>{currentModule.mod.bossIntro}</p>
                        <button
                            className={styles.bossDismiss}
                            onClick={() => handleDismissBoss(`intro-${currentModule.mod.id}`)}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* ── Ticket list ── */}
            <div className={styles.ticketList}>
                {moduleStates.map(({ mod, locked, complete }, modIdx) => {
                    // Find authored scenarios for this module
                    const authoredScenarios = mod.scenarioIds
                        .map(sid => scenarios.find(s => s.id === sid))
                        .filter(Boolean);

                    // Skip modules with zero authored scenarios
                    if (authoredScenarios.length === 0) return null;

                    return (
                        <div key={mod.id} className={styles.moduleGroup}>
                            <div className={`${styles.moduleHeader} ${locked ? styles.moduleLocked : ""}`}>
                                <span className={styles.moduleNumber}>Module {modIdx + 1}</span>
                                <span className={styles.moduleTitle}>{mod.title}</span>
                                {locked && <span className={styles.lockIcon}>🔒</span>}
                                {complete && !locked && <span className={styles.checkIcon}>✓</span>}
                            </div>

                            {/* Boss completion message for finished modules */}
                            {complete && !locked && mod.bossCompletion && (
                                <div className={styles.bossCompletion}>
                                    <div
                                        className={styles.bossCompletionAvatar}
                                        style={{ backgroundColor: boss.avatarColor }}
                                    >
                                        {boss.avatar}
                                    </div>
                                    <p className={styles.bossCompletionText}>
                                        {mod.bossCompletion}
                                    </p>
                                </div>
                            )}

                            {authoredScenarios.map(scenario => {
                                const isDone = completedScenarios.has(scenario.id);
                                const scenarioScore = scores[scenario.id];
                                const isClickable = !locked && !isDone && !showModePicker;
                                const isPending = pendingScenarioId === scenario.id;

                                const customer = getCustomerInfo(scenario.customerId);
                                const priority = scenario.ticketPriority || "normal";

                                return (
                                    <div key={scenario.id}>
                                        <div
                                            className={`${styles.ticketCard} ${
                                                styles[`priority_${priority}`]
                                            } ${isDone ? styles.ticketDone : ""} ${
                                                locked ? styles.ticketLocked : ""
                                            } ${isClickable ? styles.ticketClickable : ""}`}
                                            onClick={isClickable ? () => handleTicketClick(scenario.id) : undefined}
                                            role={isClickable ? "button" : undefined}
                                            tabIndex={isClickable ? 0 : undefined}
                                        >
                                            <div
                                                className={styles.ticketAvatar}
                                                style={{ backgroundColor: customer.avatarColor }}
                                            >
                                                {customer.avatar}
                                            </div>
                                            <div className={styles.ticketContent}>
                                                <div className={styles.ticketTop}>
                                                    <span className={styles.ticketNumber}>
                                                        #{scenario.ticketNumber || "—"}
                                                    </span>
                                                    <span className={styles.ticketCustomer}>
                                                        {customer.name}
                                                    </span>
                                                </div>
                                                <div className={styles.ticketSubject}>
                                                    {scenario.ticketSubject || scenario.description}
                                                </div>
                                                <div className={styles.ticketMeta}>
                                                    {isDone && scenarioScore ? (
                                                        <span className={styles.ticketScore}>
                                                            ✓ {scenarioScore.correct}/{scenarioScore.total}
                                                            {scenarioScore.timeMs ? ` · ${formatTime(scenarioScore.timeMs)}` : ""}
                                                        </span>
                                                    ) : locked ? (
                                                        <span className={styles.ticketLockedLabel}>
                                                            Complete previous modules to unlock
                                                        </span>
                                                    ) : (
                                                        <span className={styles.ticketOpen}>Open</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inline mode picker for this ticket */}
                                        {isPending && showModePicker && (
                                            <div className={styles.modePicker}>
                                                <div className={styles.modePickerLabel}>
                                                    How would you like to proceed?
                                                </div>
                                                <div className={styles.modeButtons}>
                                                    <button
                                                        className={styles.modeButton}
                                                        onClick={() => handleModeSelect(true)}
                                                    >
                                                        <span className={styles.modeButtonIcon}>💡</span>
                                                        <span className={styles.modeButtonText}>
                                                            <strong>Guided</strong>
                                                            <small>Coach marks will show you where to go</small>
                                                        </span>
                                                    </button>
                                                    <button
                                                        className={`${styles.modeButton} ${styles.modeButtonAlt}`}
                                                        onClick={() => handleModeSelect(false)}
                                                    >
                                                        <span className={styles.modeButtonIcon}>🧭</span>
                                                        <span className={styles.modeButtonText}>
                                                            <strong>Unguided</strong>
                                                            <small>Figure it out on your own</small>
                                                        </span>
                                                    </button>
                                                </div>
                                                <button
                                                    className={styles.cancelPicker}
                                                    onClick={handleCancelModePicker}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
