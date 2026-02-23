"use client";

import React from "react";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "../GoogleProvisioningWizard.module.css";

const GreenCheck = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.bestForIcon}>
        <circle cx="8" cy="8" r="7" fill="#059669" />
        <path d="M5 8l2 2L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export default function ManagementLevelStep({ state, updateState, goNext }) {
    const { checkActionGoal } = useInstructional();

    const handleSelectLevel = (level) => {
        updateState({ managementLevel: level, transitionMode: level === "password-only" ? state.transitionMode : false });
        if (level === "full") {
            checkActionGoal("wizard-select-full-provisioning");
        }
    };

    return (
        <>
            <h1 className={styles.stepTitle}>Select your IDM Management Level</h1>
            <p className={styles.stepDescription}>
                We recommend selecting &quot;Password Management Only&quot; if you are currently in the
                middle of the school year or looking to pilot Clever IDM. If you are ready to let
                Clever IDM provision and manage the full end user lifecycle automatically for you,
                select &quot;Full Provisioning and Password Management.&quot;
            </p>

            {/* Full IDM */}
            <h3 className={styles.sectionHeading}>Full IDM</h3>
            <div
                className={`${styles.radioCard} ${state.managementLevel === "full" ? styles.radioCardSelected : ""}`}
                data-instruction-target="management-level-full"
                onClick={() => handleSelectLevel("full")}
            >
                <div className={styles.radioHeader}>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="mgmt"
                            className={styles.radioInput}
                            checked={state.managementLevel === "full"}
                            onChange={() => handleSelectLevel("full")}
                        />
                        Full Provisioning and Password Management
                    </label>
                    <span className={styles.recommendBadge}>Clever recommendation</span>
                </div>
                <p className={styles.radioDesc}>
                    Clever IDM automated account security and password management
                </p>
                <div className={styles.radioDesc} style={{ marginBottom: 0 }}>
                    <strong>Best for:</strong>
                </div>
                <ul className={styles.bestForList}>
                    <li className={styles.bestForItem}>
                        <GreenCheck /> Automatically provisioning, updating and archiving user accounts
                    </li>
                    <li className={styles.bestForItem}>
                        <GreenCheck /> Configuring password reset, account recovery and account claiming settings
                    </li>
                    <li className={styles.bestForItem}>
                        <GreenCheck /> Building out and maintaining OUs and groups from your SIS data
                    </li>
                </ul>
            </div>

            {/* Secure Password Management Suite */}
            <h3 className={styles.sectionHeading}>Secure Password Management Suite</h3>
            <div
                className={`${styles.radioCard} ${state.managementLevel === "password-only" ? styles.radioCardSelected : ""}`}
                onClick={() => handleSelectLevel("password-only")}
            >
                <div className={styles.radioHeader}>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="mgmt"
                            className={styles.radioInput}
                            checked={state.managementLevel === "password-only"}
                            onChange={() => handleSelectLevel("password-only")}
                        />
                        Password Management Only
                    </label>
                    <span className={styles.limitedBadge}>Limited</span>
                </div>
                <p className={styles.radioDesc}>
                    Access to our secure password management functionality for matched users
                </p>
                <div className={styles.radioDesc} style={{ marginBottom: 0 }}>
                    <strong>Best for:</strong>
                </div>
                <ul className={styles.bestForList}>
                    <li className={styles.bestForItem}>
                        <GreenCheck /> Piloting Clever IDM or beginning setup in the middle of the school year
                    </li>
                    <li className={styles.bestForItem}>
                        <GreenCheck /> Accessing Clever&apos;s password management tools
                    </li>
                    <li className={styles.bestForItem}>
                        <GreenCheck /> Managing matched users between systems
                    </li>
                </ul>

                {/* Transition sub-option */}
                <div className={styles.transitionCheckbox}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={state.transitionMode || false}
                            onChange={(e) => {
                                e.stopPropagation();
                                updateState({ transitionMode: e.target.checked });
                            }}
                        />
                        Transition to Full Provisioning and Password Management
                    </label>
                    <p className={styles.radioDesc} style={{ marginLeft: 28, marginTop: 8 }}>
                        Explore or setup Full IDM while continuing to sync your matches
                    </p>
                    <div className={styles.radioDesc} style={{ marginBottom: 0, marginLeft: 28 }}>
                        <strong>Best for:</strong>
                    </div>
                    <ul className={styles.bestForList} style={{ marginLeft: 28 }}>
                        <li className={styles.bestForItem}>
                            <GreenCheck /> Continuing your nightly match-only syncs
                        </li>
                        <li className={styles.bestForItem}>
                            <GreenCheck /> Exploring Full Provisioning and Password Management capabilities without commitment
                        </li>
                    </ul>
                </div>
            </div>

            <div className={styles.nextBtnRow}>
                <button className={styles.nextBtn} data-instruction-target="next-select-users" onClick={goNext}>
                    Next: Select Users
                </button>
            </div>
        </>
    );
}
