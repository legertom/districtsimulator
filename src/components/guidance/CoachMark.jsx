"use client";

import { useEffect, useState } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "./CoachMark.module.css";

export default function CoachMark() {
    const { currentStep, showHint } = useInstructional();
    const [targetRect, setTargetRect] = useState(null);

    // Safety: If no hint key, don't try to calculate or render anything
    // However, we MUST NOT return before hooks. Handled in effect and render guard.

    useEffect(() => {
        // Ensure showHint is active and currentStep and its hint property exist
        if (!showHint || !currentStep?.hint) {
            setTargetRect(null);
            return;
        }

        const targetId = currentStep.hint.target;
        if (!targetId) { // If targetId is missing, clear rect and exit
            setTargetRect(null);
            return;
        }

        // Using a data attribute selector which is more robust than class names
        // Ideally we add data-instruction-target="nav-item-people" to elements
        // For now, looking for ID or fallback to data attribute
        const element = document.getElementById(targetId) ||
            document.querySelector(`[data-instruction-target="${targetId}"]`) ||
            document.querySelector(`[data-nav-id="${targetId}"]`);

        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });
        }
    }, [showHint, currentStep]);

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
