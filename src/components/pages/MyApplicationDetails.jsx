"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icons";
import { buildDashboardRoute } from "@/lib/routing";
import styles from "./MyApplicationDetails.module.css";

const TABS = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "data-quality", label: "Data Quality" },
    { id: "settings", label: "Settings" },
    { id: "past-rules", label: "Past rules" },
];

const SCHOOL_ROWS = [
    {
        name: "Fort Virgilfield Elementary School",
        schoolId: "5fb9220d-9b0f-4d32-a248-6492457c3890",
        grades: "K - 5",
    },
    {
        name: "Santa Rosa Elementary School",
        schoolId: "d95145ba-e71b-4c8c-9786-010a58e36c31",
        grades: "K - 5",
    },
    {
        name: "Treutelside Middle School",
        schoolId: "1d5209a0-83a2-4b6e-9251-ee4ad8831eea",
        grades: "6 - 8",
    },
    {
        name: "Default District Office (Auto-generated)",
        schoolId: "DEFAULT_DISTRICT_OFFICE",
        grades: "",
    },
];

function getDateAdded(appId) {
    const day = 11 + ((appId + 3) % 7);
    return `2026-02-${String(day).padStart(2, "0")}`;
}

function getLastChanged(appId) {
    const daysAgo = 1 + (appId % 4);
    return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
}

function getUserCounts(app) {
    const students = Math.max(20, Math.round((app.studentLogins ?? 0) / 6));
    const teachers = Math.max(10, Math.round((app.teacherLogins ?? 0) / 2));
    const sections = students + teachers + 1;
    const schools = Math.max(3, Math.min(7, Math.round(students / 6)));
    const staff = Math.max(0, Math.round(teachers / 4) - 2);

    return {
        schools,
        students,
        sections,
        teachers,
        staff,
    };
}

export default function MyApplicationDetails({ app }) {
    const [activeTab, setActiveTab] = useState("overview");
    const counts = useMemo(() => getUserCounts(app), [app]);
    const dateAdded = useMemo(() => getDateAdded(app.id), [app.id]);
    const lastChanged = useMemo(() => getLastChanged(app.id), [app.id]);

    return (
        <div className={styles.page}>
            <div className={styles.headerActions}>
                <Link href={buildDashboardRoute("my-applications")} className={styles.backLink}>
                    My applications
                </Link>
                <button type="button" className={styles.actionButton}>
                    <span>Actions</span>
                    <Icon name="chevronDown" size={14} />
                </button>
            </div>

            <section className={styles.identitySection}>
                <div
                    className={styles.appIcon}
                    style={{
                        background: app.iconBackground ?? "var(--gray-300)",
                        color: app.iconTextColor ?? "#ffffff",
                    }}
                >
                    {app.icon}
                </div>

                <div className={styles.identityContent}>
                    <div className={styles.identityTitleRow}>
                        <h1 className={styles.appName}>{app.name}</h1>
                        <span className={styles.statusBadge}>{app.status}</span>
                    </div>
                    <p className={styles.appType}>{app.appType}</p>
                </div>
            </section>

            <section className={styles.metaGrid}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Selected users last changed</span>
                    <span className={styles.metaValue}>{lastChanged}</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Date added</span>
                    <span className={styles.metaValue}>{dateAdded}</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>SSO supported user types</span>
                    <span className={styles.metaValue}>Students, Teachers, Staff, District Admins</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Extension required</span>
                    <span className={styles.metaValue}>
                        Get it for{" "}
                        <a href="#" className={styles.link}>Chrome</a>,{" "}
                        <a href="#" className={styles.link}>Firefox</a>,{" "}
                        <a href="#" className={styles.link}>Edge</a>
                    </span>
                </div>
            </section>

            <nav className={styles.tabNav} aria-label="Application details tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {activeTab === "overview" ? (
                <>
                    <section className={styles.bannerCard}>
                        <div className={styles.bannerArt} aria-hidden="true">
                            <div className={styles.bannerBlob} />
                            <div className={styles.bannerMascot}>🦉</div>
                        </div>

                        <div className={styles.bannerCopy}>
                            <h2 className={styles.bannerTitle}>Let your teachers know {app.name} is coming!</h2>
                            <p className={styles.bannerText}>
                                Send a message to your teachers in their portal.
                            </p>
                            <div className={styles.bannerActions}>
                                <button type="button" className={styles.primaryButton}>View email</button>
                                <button type="button" className={styles.textButton}>
                                    <Icon name="download" size={15} />
                                    <span>Download login instructions</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className={styles.selectedUsersSection}>
                        <h3 className={styles.sectionTitle}>Selected users</h3>
                        <div className={styles.selectedUsersCard}>
                            <table className={styles.selectedUsersTable}>
                                <thead>
                                    <tr>
                                        <th>Collection</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Schools</td>
                                        <td>{counts.schools}</td>
                                    </tr>
                                    <tr>
                                        <td>Students</td>
                                        <td>{counts.students}</td>
                                    </tr>
                                    <tr>
                                        <td>Sections</td>
                                        <td>{counts.sections}</td>
                                    </tr>
                                    <tr>
                                        <td>Teachers</td>
                                        <td>{counts.teachers}</td>
                                    </tr>
                                    <tr>
                                        <td>Staff</td>
                                        <td>{counts.staff}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className={styles.selectedUsersFooter}>
                                <button type="button" className={styles.modifyButton}>Modify user selection</button>
                                <p className={styles.selectionMeta}>User selection was last changed {lastChanged}.</p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.schoolsSection}>
                        <h3 className={styles.schoolsTitle}>Schools</h3>
                        <div className={styles.schoolsTableWrap}>
                            <table className={styles.schoolsTable}>
                                <thead>
                                    <tr>
                                        <th>School Name</th>
                                        <th>School ID</th>
                                        <th>Grades</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {SCHOOL_ROWS.map((school) => (
                                        <tr key={school.schoolId}>
                                            <td>
                                                <a href="#" className={styles.link}>{school.name}</a>
                                            </td>
                                            <td>{school.schoolId}</td>
                                            <td>{school.grades}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            ) : (
                <section className={styles.placeholderCard}>
                    <h2 className={styles.placeholderTitle}>{TABS.find((tab) => tab.id === activeTab)?.label}</h2>
                    <p className={styles.placeholderText}>
                        This section is available in the live dashboard and can be added to the simulator next.
                    </p>
                </section>
            )}
        </div>
    );
}
