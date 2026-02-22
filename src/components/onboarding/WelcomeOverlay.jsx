"use client";

import { useSession } from "next-auth/react";
import { DISTRICT } from "@/data/districtIdentity";
import styles from "./WelcomeOverlay.module.css";

const WELCOME_FLAG = "cedarridge-welcome-seen";

/**
 * Check if the welcome overlay should be shown.
 * Shown when: no prior progress AND the welcome flag hasn't been set.
 * Lives outside InstructionalProvider so reads localStorage directly.
 */
export function shouldShowWelcome() {
    try {
        if (localStorage.getItem(WELCOME_FLAG)) return false;
        const saved = localStorage.getItem("pjs-state");
        if (!saved) return true;
        const parsed = JSON.parse(saved);
        const hasProgress =
            Array.isArray(parsed.completedScenarios) && parsed.completedScenarios.length > 0;
        return !hasProgress;
    } catch {
        return false;
    }
}

export function dismissWelcome() {
    try {
        localStorage.setItem(WELCOME_FLAG, "1");
    } catch { /* ignore */ }
}

export default function WelcomeOverlay({ onEnterDashboard }) {
    const { data: session } = useSession();
    const firstName = session?.user?.name?.split(" ")[0] ?? "there";

    const handleStart = () => {
        dismissWelcome();
        onEnterDashboard();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.card}>
                <div className={styles.badge}>Day 1</div>
                <h1 className={styles.title}>
                    Welcome, {firstName}!
                </h1>
                <p className={styles.subtitle}>
                    Today is your first day as the new <strong>Clever Admin</strong> at{" "}
                    <strong>{DISTRICT.name}</strong>.
                </p>
                <p className={styles.description}>
                    Your onboarding buddy Alex Rivera will show you the ropes.
                    You'll learn to manage the district's Google Workspace accounts through Clever IDM —
                    set up the integration, then handle real requests from your coworkers.
                </p>
                <div className={styles.steps}>
                    <div className={styles.step}>
                        <span className={styles.stepNumber}>1</span>
                        <span>Set up Google Workspace provisioning in Clever IDM</span>
                    </div>
                    <div className={styles.step}>
                        <span className={styles.stepNumber}>2</span>
                        <span>Handle requests from your coworkers</span>
                    </div>
                    <div className={styles.step}>
                        <span className={styles.stepNumber}>3</span>
                        <span>Master credentials, OUs, and group configuration</span>
                    </div>
                </div>
                <button className={styles.ctaButton} onClick={handleStart}>
                    Enter the Dashboard
                </button>
            </div>
        </div>
    );
}
