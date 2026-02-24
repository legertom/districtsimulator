"use client";

import styles from "./ProfilePage.module.css";

/**
 * Single label+value field for profile detail cards.
 * Renders "—" in muted style for empty values.
 */
export default function ProfileField({ label, value }) {
    const displayValue = value != null && value !== "" ? String(value) : "—";
    const isEmpty = displayValue === "—";

    return (
        <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>{label}</span>
            <span className={isEmpty ? styles.fieldEmpty : styles.fieldValue}>
                {displayValue}
            </span>
        </div>
    );
}
