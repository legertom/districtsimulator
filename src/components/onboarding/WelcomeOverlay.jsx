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
                    Hey, {firstName}!
                </h1>
                <p className={styles.subtitle}>
                    I&apos;m <strong>Sam</strong>, senior IT admin here at{" "}
                    <strong>{DISTRICT.name}</strong>. I&apos;ll be your onboarding buddy.
                </p>
                <p className={styles.description}>
                    You&apos;re the new <strong>Clever Admin</strong> — which means you&apos;re in charge of
                    managing our Google Workspace accounts through <strong>Clever IDM</strong>.
                    Don&apos;t worry, I&apos;ll walk you through everything. Fair warning — I over-explain.
                    It&apos;s a feature, not a bug.
                </p>
                <div className={styles.steps}>
                    <div className={styles.step}>
                        <span className={styles.stepNumber}>1</span>
                        <span>Get the lay of the land — IDM page, provider card, the works</span>
                    </div>
                    <div className={styles.step}>
                        <span className={styles.stepNumber}>2</span>
                        <span>Help your coworkers with real support tickets</span>
                    </div>
                    <div className={styles.step}>
                        <span className={styles.stepNumber}>3</span>
                        <span>Learn credentials, OUs, and groups — the stuff that actually matters</span>
                    </div>
                </div>
                <button className={styles.ctaButton} onClick={handleStart}>
                    Let&apos;s get started
                </button>
            </div>
        </div>
    );
}
