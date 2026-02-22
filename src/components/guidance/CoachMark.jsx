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

        // Verify the element is actually visible and not behind a fixed overlay
        // (e.g. the provisioning wizard covering the sidebar). elementFromPoint
        // ignores pointer-events:none layers like the CoachMark itself.
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const topEl = document.elementFromPoint(centerX, centerY);
        if (topEl && !element.contains(topEl) && !topEl.contains(element)) {
            return null;
        }

        return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        };
    }, [coachMarksEnabled, showHint, currentStep]);

    useEffect(() => {
        let timer;
        let retryCount = 0;
        const MAX_RETRIES = 5;

        const updateRect = () => {
            const rect = findTarget();
            if (rect) {
                setTargetRect(rect);
            } else if (coachMarksEnabled && showHint && currentStep?.hint?.target) {
                retryCount++;
                if (retryCount >= MAX_RETRIES) {
                    const target = currentStep.hint.target;
                    console.error(
                        `[CoachMark] Hint target "${target}" not found after ${MAX_RETRIES} retries. Check that a DOM element has id="${target}" or data-instruction-target="${target}".`
                    );
                    setTargetRect(null);
                    return;
                }
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

    // Render Guard: Must have both rect AND valid hint data with message
    if (!targetRect || !currentStep?.hint?.message) return null;

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
                style={(() => {
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const tooltipWidth = 280;
                    const tooltipHeight = 80;

                    let top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
                    let left = targetRect.left + targetRect.width + 16;

                    // If tooltip would go off right edge, place it to the left
                    if (left + tooltipWidth > viewportWidth - 16) {
                        left = targetRect.left - tooltipWidth - 16;
                    }

                    // If tooltip would go off bottom, nudge up
                    if (top + tooltipHeight > viewportHeight - 16) {
                        top = viewportHeight - tooltipHeight - 16;
                    }

                    // If tooltip would go off top, nudge down
                    if (top < 16) {
                        top = 16;
                    }

                    return { top, left };
                })()}
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
