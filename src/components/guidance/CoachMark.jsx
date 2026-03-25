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

        // Verify the element is actually visible and not fully behind a fixed overlay
        // (e.g. the provisioning wizard covering the sidebar). elementFromPoint
        // ignores pointer-events:none layers like the CoachMark itself.
        // Check multiple points — the element may be partially overlapped by the chat panel.
        const probePoints = [
            [rect.left + rect.width / 2, rect.top + rect.height / 2],  // center
            [rect.left + 4, rect.top + rect.height / 2],                // left edge
            [rect.left + rect.width - 4, rect.top + rect.height / 2],   // right edge
            [rect.left + rect.width / 2, rect.top + 4],                 // top edge
            [rect.left + rect.width / 2, rect.top + rect.height - 4],   // bottom edge
        ];
        const isVisible = probePoints.some(([px, py]) => {
            const topEl = document.elementFromPoint(px, py);
            return topEl && (element.contains(topEl) || topEl.contains(element));
        });
        if (!isVisible) {
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

        const updateRect = (scrolled = false) => {
            const rect = findTarget();
            if (rect) {
                // If the target is partially or fully outside the viewport, scroll it into view
                // and re-measure after the scroll completes
                if (!scrolled) {
                    const targetId = currentStep?.hint?.target;
                    const element = targetId && (
                        document.getElementById(targetId)
                        || document.querySelector(`[data-instruction-target="${targetId}"]`)
                        || document.querySelector(`[data-nav-id="${targetId}"]`)
                    );
                    if (element) {
                        const viewportHeight = window.innerHeight;
                        if (rect.top < 0 || rect.top + rect.height > viewportHeight - 80) {
                            element.scrollIntoView({ behavior: "smooth", block: "center" });
                            timer = setTimeout(() => updateRect(true), 350);
                            return;
                        }
                    }
                }
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

        // Continuously re-measure so the spotlight tracks the target through
        // scroll, resize, and layout shifts (e.g. after scrollIntoView).
        let rafId;
        let lastTop = null;
        let lastLeft = null;
        const track = () => {
            const rect = findTarget();
            if (rect && (rect.top !== lastTop || rect.left !== lastLeft)) {
                lastTop = rect.top;
                lastLeft = rect.left;
                setTargetRect(rect);
            }
            rafId = requestAnimationFrame(track);
        };
        rafId = requestAnimationFrame(track);

        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(rafId);
        };
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
            {(() => {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const tooltipWidth = 280;
                const tooltipHeight = 80;

                // Account for the chat panel on the right side
                const chatPanel = document.querySelector('[class*="chatPanel"]');
                const usableWidth = chatPanel
                    ? chatPanel.getBoundingClientRect().left
                    : viewportWidth;

                let top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
                let left = targetRect.left + targetRect.width + 16;
                let flippedLeft = false;

                // If tooltip would overlap the chat panel or go off right edge, place it to the left
                if (left + tooltipWidth > usableWidth - 16) {
                    left = targetRect.left - tooltipWidth - 16;
                    flippedLeft = true;
                }

                // If tooltip would go off bottom, nudge up
                if (top + tooltipHeight > viewportHeight - 16) {
                    top = viewportHeight - tooltipHeight - 16;
                }

                // If tooltip would go off top, nudge down
                if (top < 16) {
                    top = 16;
                }

                return (
                    <div className={styles.tooltip} style={{ top, left }}>
                        <div className={flippedLeft ? styles.arrowRight : styles.arrow} />
                        <div className={styles.content}>
                            <span className={styles.icon}>💡</span>
                            {currentStep.hint.message}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
