"use client";

import { useState, useEffect, useCallback } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "./CoachMark.module.css";

export default function CoachMark() {
    const { currentStep, showHint, coachMarksEnabled } = useInstructional();
    const [targetRect, setTargetRect] = useState(null);

    const findTarget = useCallback(() => {
        if (!coachMarksEnabled || !showHint || !currentStep?.hint || typeof document === "undefined") {
            return null;
        }

        const targetId = currentStep.hint.target;
        if (!targetId) return null;

        const element = document.getElementById(targetId)
            || document.querySelector(`[data-instruction-target="${targetId}"]`)
            || document.querySelector(`[data-nav-id="${targetId}"]`);

        if (!element) return null;

        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        };
    }, [coachMarksEnabled, showHint, currentStep]);

    useEffect(() => {
        let timer;
        const updateRect = () => {
            const rect = findTarget();
            if (rect) {
                setTargetRect(rect);
            } else if (coachMarksEnabled && showHint && currentStep?.hint?.target) {
                // If not found (e.g., sidebar still expanding), retry after a short delay
                timer = setTimeout(updateRect, 150);
            } else {
                setTargetRect(null);
            }
        };

        // Delay the initial check slightly to allow DOM to render and avoid synchronous setState in effect
        timer = setTimeout(updateRect, 0);

        return () => clearTimeout(timer);
    }, [findTarget, coachMarksEnabled, showHint, currentStep]);

    // Render Guard: Must have both rect AND valid hint data
    if (!targetRect || !currentStep?.hint) return null;

    return (
        <div className={styles.overlayContainer}>
            {/* Spotlight cut-out effect using box-shadow */}
            <div
                className={styles.spotlight}
                style={{
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8
                }}
            />
            {/* The Hint Message */}
            <div
                className={styles.tooltip}
                style={{
                    top: targetRect.top + (targetRect.height / 2) - 20, // Align broadly
                    left: targetRect.left + targetRect.width + 16, // To the right
                }}
            >
                <div className={styles.arrow} />
                <div className={styles.content}>
                    <span className={styles.icon}>💡</span>
                    {currentStep.hint.message}
                </div>
            </div>
        </div>
    );
}
