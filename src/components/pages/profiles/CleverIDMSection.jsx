"use client";

import { useMemo } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "./ProfilePage.module.css";

/**
 * "Clever IDM Information" card for profile Details tabs.
 * Only renders when IDM setup is complete.
 *
 * @param {{ userType: "student"|"teacher"|"staff", person: object }} props
 */
export default function CleverIDMSection({ userType, person }) {
    const { idmSetupComplete } = useInstructional();

    // Read provisioning config from localStorage (set by the wizard)
    const provisioningConfig = useMemo(() => {
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem("idm-provisioning-state");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);

    if (!idmSetupComplete) return null;

    const googleEmail = computeEmail(provisioningConfig, userType, person) || "—";
    const googleId = "—";

    return (
        <div className={styles.card}>
            <h2 className={styles.cardHeader}>Clever IDM Information</h2>
            <div className={styles.fieldGrid}>
                <Field label="Google Email" value={googleEmail} />
                <Field label="Google ID" value={googleId} />
                {userType !== "staff" && (
                    <Field label="Google Password" value="••••••••" />
                )}
                <div className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Actions</span>
                    <span className={styles.fieldLink}>Unlink user</span>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value }) {
    return (
        <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>{label}</span>
            <span className={value && value !== "—" ? styles.fieldValue : styles.fieldEmpty}>
                {value || "—"}
            </span>
        </div>
    );
}

// ── Helpers ─────────────────────────────────────────────────

function computeEmail(config, userType, person) {
    const typeKey = userType + "s"; // "students", "teachers", "staff" → "staffs" is fine, will fallback
    const cred = config?.credentials?.[typeKey] || config?.credentials?.[userType];
    if (!cred?.email || !person) return null;
    const domain = cred.domain || "cedarridgesd.org";
    const first = person.first?.toLowerCase() || "";
    const last = person.last?.toLowerCase() || "";
    let email = cred.email
        .replace(/\{\{name\.first\}\}/gi, first)
        .replace(/\{\{name\.last\}\}/gi, last)
        .replace(/\{\{name\.first_initial\}\}/gi, first.charAt(0));
    if (!email.includes("@")) {
        email = `${first}.${last}@${domain}`;
    }
    return email;
}
