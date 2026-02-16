"use client";

import { useState } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import styles from "./IDM.module.css";

export default function IDM() {
    const [activeTab, setActiveTab] = useState("tasks");

    const tabs = [
        { id: "tasks", label: "Tasks" },
        { id: "sync-history", label: "Sync History" },
        { id: "exports", label: "Exports" },
        { id: "events", label: "Events" },
    ];

    return (
        <div className={styles.page}>
            <PageHeader
                title="Clever IDM"
                subtitle="Destinations are services to which Clever can provision user accounts."
            />

            <div className={styles.content}>
                {/* Add Destination Button */}
                <button className={styles.addDestinationBtn}>
                    Add new destination
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 6 }}>
                        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>

                {/* Google Workspace Card */}
                <div className={styles.providerCard}>
                    <div className={styles.providerHeader}>
                        <div className={styles.providerName}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="11" fill="white" stroke="#e5e7eb" />
                                <path d="M18 12.2A6 6 0 0 0 12.1 6l-.1.01V12h6z" fill="#4285f4" />
                                <path d="M12 6a6 6 0 0 0-4.2 10.3L12 12V6z" fill="#ea4335" />
                                <path d="M7.8 16.3A6 6 0 0 0 12 18v-6L7.8 16.3z" fill="#fbbc05" />
                                <path d="M12 18a6 6 0 0 0 6-5.8H12V18z" fill="#34a853" />
                            </svg>
                            <span>Google Workspace</span>
                        </div>
                        <div className={styles.providerBadges}>
                            <span className={styles.activeBadge}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M3 6l2.5 2.5L9 4" stroke="white" strokeWidth="2" />
                                </svg>
                                Active
                            </span>
                            <span className={styles.issueBadge}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M6 1l5 10H1L6 1z" fill="white" />
                                </svg>
                                Issue
                            </span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Create</span>
                            <span className={styles.statValue}>0</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Update</span>
                            <span className={styles.statValue}>0</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Archive</span>
                            <span className={styles.statValue}>0</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Issue</span>
                            <span className={styles.statValue}>1</span>
                        </div>
                    </div>
                </div>

                {/* Last sync timestamp */}
                <p className={styles.syncTimestamp}>
                    Your last Google accounts sync was processed on 02/16/2026 at 4:45AM
                </p>

                {/* Action buttons */}
                <div className={styles.actionButtons}>
                    <button className={styles.editProvisioningBtn}>Edit Google provisioning</button>
                    <button className={styles.pauseSyncBtn}>Pause Google sync</button>
                </div>

                {/* Tabs */}
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {/* Tasks Tab Content */}
                {activeTab === "tasks" && (
                    <div className={styles.tabContent}>
                        {/* Notifications */}
                        <div className={styles.sectionHeaderRow}>
                            <h2 className={styles.sectionTitle}>Notifications</h2>
                            <a href="#" className={styles.downloadLink}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 4, verticalAlign: "middle" }}>
                                    <path d="M7 2v7M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Download user emails
                            </a>
                        </div>
                        <div className={styles.notificationCard}>
                            <span className={styles.successBadge}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M3 6l2.5 2.5L9 4" stroke="white" strokeWidth="2" />
                                </svg>
                                Success
                            </span>
                            <div className={styles.notificationText}>
                                <p className={styles.notificationTitle}>Clever IDM is managing 40 Google users</p>
                                <p className={styles.notificationDesc}>
                                    View students.csv and teachers_and_staff.csv for a list of emails to upload them to your SIS.
                                </p>
                            </div>
                        </div>

                        {/* Issues */}
                        <h2 className={styles.sectionTitle}>Issues</h2>
                        <div className={styles.emptyCard}>
                            <p>You are all caught up!</p>
                        </div>
                    </div>
                )}

                {activeTab === "sync-history" && (
                    <div className={styles.tabContent}>
                        <h2 className={styles.sectionTitle}>Sync History</h2>
                        <div className={styles.emptyCard}>
                            <p>No sync history available.</p>
                        </div>
                    </div>
                )}

                {activeTab === "exports" && (
                    <div className={styles.tabContent}>
                        <h2 className={styles.sectionTitle}>Exports</h2>
                        <div className={styles.emptyCard}>
                            <p>No exports available.</p>
                        </div>
                    </div>
                )}

                {activeTab === "events" && (
                    <div className={styles.tabContent}>
                        <h2 className={styles.sectionTitle}>Events</h2>
                        <div className={styles.emptyCard}>
                            <p>No events to display.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
