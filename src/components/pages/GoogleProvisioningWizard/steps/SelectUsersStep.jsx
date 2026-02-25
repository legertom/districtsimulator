"use client";

import React, { useState } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "../GoogleProvisioningWizard.module.css";

export default function SelectUsersStep({ state, updateState, goNext }) {
    const { checkActionGoal } = useInstructional();
    const anySelected = state.provisionStudents || state.provisionTeachers || state.provisionStaff;
    const [showRollover, setShowRollover] = useState(false);
    const nextBtnRef = React.useRef(null);

    const handleUserTypeChange = (field, checked) => {
        updateState({ [field]: checked });
        // Check if all three are now selected (considering the new change)
        const students = field === "provisionStudents" ? checked : state.provisionStudents;
        const teachers = field === "provisionTeachers" ? checked : state.provisionTeachers;
        const staff = field === "provisionStaff" ? checked : state.provisionStaff;
        if (students && teachers && staff) {
            checkActionGoal("wizard-select-all-users");
        }
    };

    const handleNext = () => {
        if (!showRollover) {
            setShowRollover(true);
            // Scroll the Next button into view after rollover section renders
            setTimeout(() => {
                nextBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }, 100);
        } else {
            goNext();
        }
    };

    return (
        <>
            <div className={styles.infoBanner}>
                <span className={styles.infoBannerIcon}>ℹ️</span>
                <span className={styles.infoBannerText}>
                    To provision and manage users who are not currently in Clever, add them using{" "}
                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>custom data</a>.
                </span>
            </div>

            <h1 className={styles.stepTitle}>Select users</h1>
            <p className={styles.stepDescription}>
                Select the Clever users you want to create Google accounts for. To provision and manage
                users who are not currently in Clever, you can add them using{" "}
                <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>custom data</a>.
                You have additional options for uploading staff users - such as an{" "}
                <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>SFTP upload</a>,
                which can be useful for exporting staff from an HRIS system. For additional information,
                please see the{" "}
                <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>Select users section</a>{" "}
                of our Clever IDM course in Clever Academy!
            </p>

            <div className={styles.userTypeCard} data-instruction-target="user-type-checkboxes">
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-900)", margin: "0 0 16px 0" }}>
                    Which Clever users do you want to provision Google accounts for?
                </h3>

                {/* Students */}
                <div className={styles.userTypeGroup}>
                    <label className={styles.userTypeLabel}>
                        <input
                            type="checkbox"
                            className={styles.userTypeCheckbox}
                            checked={state.provisionStudents}
                            onChange={(e) => handleUserTypeChange("provisionStudents", e.target.checked)}
                        />
                        Students
                    </label>
                    {state.provisionStudents && (
                        <div className={styles.userCount}>
                            {state.studentCount} students will be provisioned
                        </div>
                    )}
                </div>

                {/* Teachers */}
                <div className={styles.userTypeGroup}>
                    <label className={styles.userTypeLabel}>
                        <input
                            type="checkbox"
                            className={styles.userTypeCheckbox}
                            checked={state.provisionTeachers}
                            onChange={(e) => handleUserTypeChange("provisionTeachers", e.target.checked)}
                        />
                        Teachers
                    </label>
                    {state.provisionTeachers && (
                        <div className={styles.userCount}>
                            {state.teacherCount} teachers will be provisioned
                        </div>
                    )}
                </div>

                {/* Staff */}
                <div className={styles.userTypeGroup}>
                    <label className={styles.userTypeLabel}>
                        <input
                            type="checkbox"
                            className={styles.userTypeCheckbox}
                            checked={state.provisionStaff}
                            onChange={(e) => handleUserTypeChange("provisionStaff", e.target.checked)}
                        />
                        Staff
                    </label>
                    {state.provisionStaff && (
                        <div className={styles.userCount}>
                            {state.staffCount} staff will be provisioned
                        </div>
                    )}
                </div>
            </div>

            {showRollover && (
                <div className={styles.userTypeCard} style={{ marginTop: 16, padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)", margin: "0 0 4px 0" }}>
                                Graduation Rollover Date
                            </h3>
                            <p style={{ fontSize: 12, color: "var(--gray-500)", lineHeight: 1.4, margin: 0 }}>
                                Optional. If you don&apos;t sync graduation year from your SIS, IDM calculates it from grade level.
                            </p>
                        </div>
                        <div style={{ position: "relative", minWidth: 200 }}>
                            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--gray-500)" }}>📅</span>
                            <input
                                type="text"
                                className={styles.dateInput}
                                value={state.graduationRolloverDate || ""}
                                onChange={(e) => updateState({ graduationRolloverDate: e.target.value })}
                                placeholder="MM/DD/YYYY"
                                style={{ paddingLeft: 32, width: "100%", padding: "8px 12px 8px 32px", border: "1px solid var(--gray-300)", borderRadius: 6, fontSize: 14, color: "var(--gray-800)" }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.nextBtnRow}>
                <button ref={nextBtnRef} className={styles.nextBtn} data-instruction-target="next-credentials" onClick={handleNext} disabled={!anySelected}>
                    Next
                </button>
            </div>
        </>
    );
}
