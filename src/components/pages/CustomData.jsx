"use client";

import { useState } from "react";
import { PageHeader, Tabs, Icons, InfoBanner } from "@/components/ui";
import styles from "./CustomData.module.css";

export default function CustomData() {
    const [activeTab, setActiveTab] = useState("browse");
    const [activeSubTab, setActiveSubTab] = useState("students");

    const tabs = [
        { id: "browse", label: "Browse" },
        { id: "reports", label: "Reports" },
    ];

    const subTabs = [
        { id: "students", label: "Students" },
        { id: "teachers", label: "Teachers" },
        { id: "staff", label: "Staff" },
        { id: "sections", label: "Sections" },
        { id: "admins", label: "Admins" },
    ];

    return (
        <div className={styles.page}>
            <PageHeader
                title="Custom data"
                actions={
                    <button className={styles.addBtn}>
                        Add custom data
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 6 }}>
                            <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>
                }
            />

            {/* How custom data works — pipeline visualization */}
            <div className={styles.content}>
                <div className={styles.pipelineCard}>
                    <p className={styles.pipelineTitle}>How custom data works in Clever</p>
                    <div className={styles.pipeline}>
                        <div className={styles.pipelineStep}>
                            <div className={styles.pipelineIcon}>
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <rect x="8" y="8" width="32" height="32" rx="6" fill="#dbeafe" />
                                    <rect x="14" y="16" width="20" height="2" rx="1" fill="#3b82f6" />
                                    <rect x="14" y="22" width="16" height="2" rx="1" fill="#3b82f6" />
                                    <rect x="14" y="28" width="12" height="2" rx="1" fill="#3b82f6" />
                                    <text x="30" y="36" fill="#3b82f6" fontSize="10" fontWeight="600">+</text>
                                </svg>
                            </div>
                            <span className={styles.pipelineLabel}>Add custom<br />records or fields</span>
                        </div>
                        <span className={styles.pipelineArrow}>→</span>
                        <div className={styles.pipelineStep}>
                            <div className={styles.pipelineIcon}>
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <rect x="8" y="8" width="32" height="32" rx="6" fill="#dbeafe" />
                                    <rect x="12" y="14" width="24" height="4" rx="2" fill="#93c5fd" />
                                    <rect x="12" y="22" width="24" height="4" rx="2" fill="#93c5fd" />
                                    <rect x="12" y="30" width="24" height="4" rx="2" fill="#93c5fd" />
                                </svg>
                            </div>
                            <span className={styles.pipelineLabel}>Clever processes<br />custom data</span>
                        </div>
                        <span className={styles.pipelineArrow}>→</span>
                        <div className={styles.pipelineStep}>
                            <div className={styles.pipelineIcon}>
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <rect x="6" y="10" width="18" height="28" rx="4" fill="#dbeafe" />
                                    <rect x="24" y="10" width="18" height="28" rx="4" fill="#bfdbfe" />
                                    <path d="M20 24l-3 3 3 3" stroke="#3b82f6" strokeWidth="2" fill="none" />
                                    <path d="M28 24l3 3-3 3" stroke="#3b82f6" strokeWidth="2" fill="none" />
                                </svg>
                            </div>
                            <span className={styles.pipelineLabel}>Clever resolves<br />data conflicts</span>
                        </div>
                        <span className={styles.pipelineArrow}>→</span>
                        <div className={styles.pipelineStep}>
                            <div className={styles.pipelineIcon}>
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <rect x="8" y="8" width="32" height="32" rx="6" fill="#dbeafe" />
                                    <circle cx="24" cy="24" r="8" fill="#3b82f6" />
                                    <path d="M20 24l3 3 5-6" stroke="white" strokeWidth="2" fill="none" />
                                </svg>
                            </div>
                            <span className={styles.pipelineLabel}>Custom data is<br />ready to be shared</span>
                        </div>
                    </div>
                </div>

                {/* Browse / Reports Tabs */}
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {activeTab === "browse" && (
                    <div className={styles.browseContent}>
                        <h2 className={styles.sectionTitle}>Custom Records</h2>
                        <p className={styles.sectionDesc}>
                            The records that appear below were added directly into Clever as custom data.
                            It takes about 15 minutes for custom data to be processed and reflected in profiles and search.
                            <strong> Please note:</strong> if a custom record has the same SIS ID as a record that is syncing from your SIS,
                            the SIS data will take precedence.
                        </p>

                        <InfoBanner variant="info">
                            Learn more about <a href="#" className={styles.link}>custom data</a>.
                        </InfoBanner>

                        {/* Sub-tabs: Students, Teachers, etc. */}
                        <div className={styles.subTabs}>
                            {subTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`${styles.subTab} ${activeSubTab === tab.id ? styles.subTabActive : ""}`}
                                    onClick={() => setActiveSubTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Data Table */}
                        <div className={styles.tableCard}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>School</th>
                                        <th>Email</th>
                                        <th>SIS ID</th>
                                        <th>Username</th>
                                        <th>Grade</th>
                                        <th>Created By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="8" className={styles.emptyRow}>NO DATA</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "reports" && (
                    <div className={styles.browseContent}>
                        <h2 className={styles.sectionTitle}>Custom Data Reports</h2>
                        <p className={styles.sectionDesc}>
                            View and download reports about your custom data uploads and processing status.
                        </p>
                        <div className={styles.emptyState}>
                            <p>No reports available.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
