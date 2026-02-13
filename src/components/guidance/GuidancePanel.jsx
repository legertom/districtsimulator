"use client";

import { useInstructional } from "@/context/InstructionalContext";
import styles from "./GuidancePanel.module.css";
import { Icon } from "@/components/ui/Icons";
import { demoCustomer } from "@/data/demoIdentity";

export default function GuidancePanel() {
    const { currentStep, showHint, toggleHint, advanceStep } = useInstructional();

    if (!currentStep || (currentStep.type !== "task" && currentStep.type !== "input")) {
        return null; // Only show guidance during tasks/inputs
    }

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.entityIcon}>
                    <Icon name="info" size={16} />
                </div>
                <span className={styles.title}>TRAINING GUIDE</span>
            </div>

            <div className={styles.content}>
                <p className={styles.objective}>
                    {currentStep.guideMessage || (currentStep.type === "task" ? "Navigate to the correct page." : `Find the answer and reply to ${demoCustomer.lastName}.`)}
                </p>

                <div className={styles.actions}>
                    {currentStep.hint && (
                        <button
                            className={`${styles.hintButton} ${showHint ? styles.active : ''}`}
                            onClick={toggleHint}
                        >
                            {showHint ? "Hide Hint" : "Show Hint"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
