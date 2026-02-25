"use client";

import { useMemo } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "./ProfilePage.module.css";

export default function CleverIDMSection({ userType, person }) {
    const { idmSetupComplete } = useInstructional();

    const provisionedEvent = useMemo(() => {
        if (typeof window === "undefined" || !person?.id) return null;
        try {
            const raw = localStorage.getItem("idm-provisioning-results");
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            const events = parsed.events || [];
            return events.find((ev) => ev.personId === person.id) || null;
        } catch {
            return null;
        }
    }, [person?.id]);

    const provisioningConfig = useMemo(() => {
        if (provisionedEvent) return null;
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem("idm-provisioning-state");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, [provisionedEvent]);

    if (!idmSetupComplete) return null;

    const googleEmail = provisionedEvent
        ? provisionedEvent.destinationUsername
        : computeEmail(provisioningConfig, userType, person) || "\u2014";
    const googleId = provisionedEvent ? provisionedEvent.cleverId : "\u2014";
    const googleOU = provisionedEvent ? provisionedEvent.currentOU : null;

    return (
        <div className={styles.card}>
            <h2 className={styles.cardHeader}>Clever IDM Information</h2>
            <div className={styles.fieldGrid}>
                <Field label="Google Email" value={googleEmail} />
                <Field label="Google ID" value={googleId} />
                {googleOU && <Field label="Google OU" value={googleOU} />}
                {userType !== "staff" && (
                    <Field label="Google Password" value="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
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
            <span className={value && value !== "\u2014" ? styles.fieldValue : styles.fieldEmpty}>
                {value || "\u2014"}
            </span>
        </div>
    );
}

function computeEmail(config, userType, person) {
    const typeKey = userType + "s";
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
