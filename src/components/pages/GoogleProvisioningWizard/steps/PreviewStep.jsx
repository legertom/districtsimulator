"use client";

import React from "react";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "../GoogleProvisioningWizard.module.css";

const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ verticalAlign: "middle" }}>
        <path d="M7 2v7M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ verticalAlign: "middle" }}>
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ verticalAlign: "middle" }}>
        <path d="M12 7A5 5 0 0 1 2.5 9M2 7a5 5 0 0 1 9.5-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 3v4h-4M2 11V7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const InfoIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ verticalAlign: "middle" }}>
        <circle cx="7" cy="7" r="6" stroke="var(--gray-400)" strokeWidth="1.2" fill="none" />
        <path d="M7 6v4M7 4.5v.01" stroke="var(--gray-400)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export default function PreviewStep({ state, setToast, onExit, onProvisionComplete }) {
    const { checkActionGoal } = useInstructional();
    const { preview } = state;

    const handleDownload = () => {
        setToast("Downloading full preview report...");
    };

    const handleCheckUser = () => {
        setToast("Opening user lookup...");
    };

    const handleRefresh = () => {
        setToast("Refreshing preview data...");
    };

    const handleProvision = () => {
        checkActionGoal("wizard-provision-google");
        onProvisionComplete?.();
        setToast("Provisioning started! Google accounts are being created. Returning to IDM...");
        setTimeout(() => onExit(), 2500);
    };

    return (
        <>
            <h1 className={styles.stepTitle}>Preview and provision</h1>
            <p className={styles.stepDescription}>
                Download your full Google Preview before provisioning your selected users to review
                all created, updated, and archived accounts as well as all outstanding issues.
            </p>

            {/* Action buttons */}
            <div className={styles.previewActions}>
                <button className={styles.previewActionBtn} onClick={handleDownload}>
                    <DownloadIcon /> Download full preview
                </button>
                <button className={styles.previewActionLink} onClick={handleCheckUser}>
                    <SearchIcon /> Check a user
                </button>
                <button className={styles.previewActionLink} onClick={handleRefresh}>
                    <RefreshIcon /> Refresh
                </button>
            </div>

            {/* Google Accounts Status */}
            <div className={styles.statusSection}>
                <div className={styles.statusHeader}>
                    <h2 className={styles.statusTitle}>Google Accounts Status</h2>
                    <span className={styles.statusTimestamp}>
                        Last preview was run {preview.lastRun}
                    </span>
                </div>

                <div className={styles.statsRow}>
                    <div className={styles.statCell}>
                        <div className={styles.statCellLabel}>
                            Accounts to Create <InfoIcon />
                        </div>
                        <div className={`${styles.statCellValue} ${preview.accountsToCreate > 0 ? styles.statCellHighlight : ""}`}>
                            {preview.accountsToCreate}
                        </div>
                    </div>
                    <div className={styles.statCell}>
                        <div className={styles.statCellLabel}>
                            Accounts to Update <InfoIcon />
                        </div>
                        <div className={styles.statCellValue}>{preview.accountsToUpdate}</div>
                    </div>
                    <div className={styles.statCell}>
                        <div className={styles.statCellLabel}>
                            Accounts to Archive <InfoIcon />
                        </div>
                        <div className={styles.statCellValue}>{preview.accountsToArchive}</div>
                    </div>
                    <div className={styles.statCell}>
                        <div className={styles.statCellLabel}>
                            Sync Issues <InfoIcon />
                        </div>
                        <div className={styles.statCellValue}>{preview.syncIssues}</div>
                    </div>
                </div>
            </div>

            {/* Details Table */}
            <h2 className={styles.detailsTitle}>Details</h2>
            <table className={styles.detailsTable}>
                <thead>
                    <tr>
                        <th>Accounts Action</th>
                        <th>Details</th>
                        <th>Next Steps</th>
                    </tr>
                </thead>
                <tbody>
                    {preview.details.map((row, i) => (
                        <tr key={i}>
                            <td className={styles.actionCol}>{row.action}</td>
                            <td>{row.detail}</td>
                            <td>{row.nextSteps}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={styles.helpBanner}>
                <span className={styles.helpBannerIcon}>⚙️</span>
                <span className={styles.helpBannerText}>
                    For additional information please see the{" "}
                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                        preview and provision section
                    </a>{" "}
                    of our Clever IDM course in Clever Academy. Please also bookmark our article{" "}
                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                        Sync reports &amp; issues troubleshooting
                    </a>{" "}
                    for future reference!
                </span>
            </div>

            <div className={styles.nextBtnRow}>
                <button className={styles.provisionBtn} data-instruction-target="provision-google-btn" onClick={handleProvision}>
                    Provision Google
                </button>
            </div>
        </>
    );
}
