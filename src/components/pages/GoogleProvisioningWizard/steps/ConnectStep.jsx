"use client";

import React from "react";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "../GoogleProvisioningWizard.module.css";

const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="white" stroke="#e5e7eb" />
        <path d="M18 12.2A6 6 0 0 0 12.1 6l-.1.01V12h6z" fill="#4285f4" />
        <path d="M12 6a6 6 0 0 0-4.2 10.3L12 12V6z" fill="#ea4335" />
        <path d="M7.8 16.3A6 6 0 0 0 12 18v-6L7.8 16.3z" fill="#fbbc05" />
        <path d="M12 18a6 6 0 0 0 6-5.8H12V18z" fill="#34a853" />
    </svg>
);

const CheckCircle = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="#059669" />
        <path d="M6 10l2.5 2.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default function ConnectStep({ state, updateState, goNext, setToast }) {
    const { checkActionGoal } = useInstructional();

    const handleDisconnect = () => {
        updateState({ googleConnected: false });
        setToast("Google account disconnected. Click 'Connect with Google' to reconnect.");
    };

    const handleConnect = () => {
        updateState({ googleConnected: true });
        checkActionGoal("wizard-connect-google");
        setToast("Google account connected successfully.");
    };

    return (
        <>
            <h1 className={styles.stepTitle}>Connect to Google</h1>

            <div className={styles.connectCard}>
                <p className={styles.stepDescription} style={{ margin: 0 }}>
                    To provision accounts, Clever needs permission to connect to your Google Workspace.
                    Don&apos;t worry, no changes will be made to your Google Workspace until you have
                    completed all the steps in this setup preview and given Clever explicit permission
                    to begin provisioning accounts. For step-by-step assistance, visit{" "}
                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                        Clever Academy
                    </a>.
                </p>

                {state.googleConnected ? (
                    <div className={styles.connectedStatus}>
                        <span className={styles.connectedIcon}><CheckCircle /></span>
                        <div className={styles.connectedText}>
                            <div className={styles.connectedTitle}>
                                Your Google account is successfully connected.
                            </div>
                            <div>
                                If you would like to connect a different Google account to Clever IDM,
                                please clear your current Google account by clicking the button below
                                and re-authorize your new account.
                            </div>
                            <button className={styles.disconnectBtn} onClick={handleDisconnect}>
                                <GoogleLogo /> Disconnect
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginTop: 16 }}>
                        <button className={styles.nextBtn} data-instruction-target="connect-google-btn" onClick={handleConnect}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <GoogleLogo /> Connect with Google
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {state.googleConnected && (
                <div className={styles.nextBtnRow}>
                    <button className={styles.nextBtn} data-instruction-target="next-management-level" onClick={goNext}>
                        Next: Select Management Level
                    </button>
                </div>
            )}
        </>
    );
}
