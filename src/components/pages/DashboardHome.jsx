"use client";

import { useScenario } from "@/context/ScenarioContext";
import { PageHeader, Icons } from "@/components/ui";
import styles from "./DashboardHome.module.css";

export default function DashboardHome() {
    const { scenario } = useScenario();
    const { stats, sisSync, ssoStatus, awaitingAction, applicationStats, pinnedApplications } = scenario.dashboard;

    return (
        <div className={styles.page}>
            {/* Page Header — matches live */}
            <PageHeader
                title="Dashboard Home"
                subtitle={`Take control of identity, access, and security for ${stats.students} students, ${stats.teachers} teachers, and ${stats.staff} staff`}
            />

            <div className={styles.content}>
                {/* Search Bar — matches live */}
                <div className={styles.searchBar}>
                    <span className={styles.searchIcon}>{Icons.search}</span>
                    <input
                        type="text"
                        placeholder="Search for users or applications"
                        className={styles.searchInput}
                        readOnly
                    />
                </div>

                {/* Status Cards Row */}
                <div className={styles.statusRow}>
                    {/* SIS Sync Card */}
                    <div className={styles.statusCard}>
                        <div className={styles.statusHeader}>
                            <span className={styles.statusLabel}>SIS Sync</span>
                            <span className={styles.statusTime}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                    <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                                </svg>
                                {sisSync.lastSync}
                            </span>
                            <span className={`${styles.statusBadge} ${styles[sisSync.status]}`}>
                                <span className={styles.dot}>●</span> {sisSync.statusLabel}
                            </span>
                        </div>
                        <div className={styles.syncStat}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M4 14c0-3 2-5 5-5s5 2 5 5" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                                <circle cx="9" cy="6" r="3" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                            </svg>
                            <span><strong>0</strong> student changes</span>
                        </div>
                        <div className={styles.progressTrack}><div className={styles.progressFill} /></div>
                        <div className={styles.syncStat}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M2 15c0-2.5 2-4 4.5-4" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                                <circle cx="6.5" cy="7" r="2.5" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                                <path d="M10 15c0-2.5 2-4 4.5-4" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                                <circle cx="14.5" cy="7" r="2.5" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                            </svg>
                            <span><strong>0</strong> teacher + staff changes</span>
                        </div>
                        <div className={styles.progressTrack}><div className={styles.progressFill} /></div>
                        <div className={styles.cardArrow}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="11" fill="#dbeafe" />
                                <path d="M10 8l4 4-4 4" stroke="#2563eb" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>

                    {/* SSO Card */}
                    <div className={styles.statusCard}>
                        <div className={styles.statusHeader}>
                            <span className={styles.statusLabel}>SSO</span>
                            <span className={styles.statusTime}>{ssoStatus.timeframe}</span>
                            <span className={`${styles.statusBadge} ${styles[ssoStatus.status]}`}>
                                <span className={styles.dot}>●</span> {ssoStatus.statusLabel}
                            </span>
                        </div>
                        <div className={styles.ssoStats}>
                            <div className={styles.syncStat}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M4 14c0-3 2-5 5-5s5 2 5 5" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                                    <circle cx="9" cy="6" r="3" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                                </svg>
                                <span>{ssoStatus.studentLogins} successful student logins</span>
                            </div>
                            <div className={styles.syncStat}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M2 15c0-2.5 2-4 4.5-4" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                                    <circle cx="6.5" cy="7" r="2.5" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                                    <path d="M10 15c0-2.5 2-4 4.5-4" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                                    <circle cx="14.5" cy="7" r="2.5" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                                </svg>
                                <span>{ssoStatus.teacherStaffLogins} successful teacher + staff logins</span>
                            </div>
                        </div>
                        <div className={styles.cardArrow}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="11" fill="#dbeafe" />
                                <path d="M10 8l4 4-4 4" stroke="#2563eb" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>

                    {/* Awaiting Your Action Card */}
                    <div className={styles.actionCard}>
                        <div className={styles.actionHeader}>
                            <span className={styles.actionLabel}>Awaiting your action</span>
                            <span className={styles.actionCount}>{awaitingAction.count}</span>
                        </div>
                        <div className={styles.actionContent}>
                            <div className={styles.celebrationIcon}>
                                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                    <path d="M20 44L32 12" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
                                    <path d="M28 36l-8 8" stroke="#0d9488" strokeWidth="2" />
                                    <circle cx="36" cy="20" r="2" fill="#0d9488" />
                                    <circle cx="42" cy="16" r="1.5" fill="#6366f1" />
                                    <circle cx="28" cy="16" r="1" fill="#f59e0b" />
                                    <path d="M38 24l4-2" stroke="#6366f1" strokeWidth="1.5" />
                                    <path d="M40 28l2 2" stroke="#0d9488" strokeWidth="1.5" />
                                    <path d="M34 14l-2-4" stroke="#f59e0b" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <p className={styles.actionMessage}>{awaitingAction.message}</p>
                        </div>
                    </div>
                </div>

                {/* IDM Card — matches live IDM status row */}
                <div className={styles.idmCard}>
                    <div className={styles.idmHeader}>
                        <span className={styles.idmLabel}>IDM</span>
                        <span className={`${styles.statusBadge} ${styles.success}`}>
                            <span className={styles.dot}>●</span> Successful
                        </span>
                    </div>
                    <div className={styles.idmBody}>
                        <div className={styles.idmProvider}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="9" fill="white" stroke="#e5e7eb" />
                                <path d="M15 10.2A5 5 0 0 0 10.1 5l-.1.01V10h5z" fill="#4285f4" />
                                <path d="M10 5a5 5 0 0 0-3.5 8.6L10 10V5z" fill="#ea4335" />
                                <path d="M6.5 13.6A5 5 0 0 0 10 15v-5L6.5 13.6z" fill="#fbbc05" />
                                <path d="M10 15a5 5 0 0 0 5-4.8H10V15z" fill="#34a853" />
                            </svg>
                            <span>Google</span>
                        </div>
                        <span className={styles.idmTime}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                            </svg>
                            4 hours ago
                        </span>
                        <span className={styles.idmStat}>Created: <strong>0</strong></span>
                        <span className={styles.idmStat}>Updated: <strong>0</strong></span>
                        <span className={styles.idmStat}>Archived: <strong>0</strong></span>
                        <span className={styles.idmStat}>Issues: <strong>1</strong></span>
                        <div className={styles.cardArrowInline}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="11" fill="#dbeafe" />
                                <path d="M10 8l4 4-4 4" stroke="#2563eb" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Applications Section */}
                <div className={styles.applicationsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Applications</h2>
                        <div className={styles.sectionActions}>
                            <a href="#" className={styles.viewAllBtn}>View all</a>
                            <button className={styles.pinBtn}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M10 2l4 4-6 6-4-4 6-6zM6 12l-4 2 2-4" stroke="var(--gray-500)" strokeWidth="1.5" fill="none" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Application Stats */}
                    <div className={styles.appStats}>
                        <div className={styles.appStat}>
                            <span className={styles.appStatNumber}>{applicationStats.appsWithDataShared}</span>
                            <span className={styles.appStatLabel}>Apps with data shared</span>
                        </div>
                        <div className={styles.appStat}>
                            <span className={styles.appStatNumber}>{applicationStats.pendingAppInvites}</span>
                            <span className={styles.appStatLabel}>Pending app invites</span>
                        </div>
                        <div className={styles.appStat}>
                            <span className={styles.appStatNumber}>{applicationStats.appsWithNoDataShared}</span>
                            <span className={styles.appStatLabel}>Apps with no data shared</span>
                        </div>
                    </div>

                    {/* Application Cards */}
                    <div className={styles.appCards}>
                        {pinnedApplications.map((app, index) => (
                            <div key={index} className={styles.appCard}>
                                <div className={styles.appCardTop}>
                                    <div className={styles.appCardIcon}>
                                        <div className={app.iconType === "print" ? styles.printIcon : styles.ssoIcon2}>{app.icon}</div>
                                    </div>
                                    <span className={styles.appName}>{app.name}</span>
                                    <span className={styles.appArrow}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <circle cx="10" cy="10" r="9" fill="#dbeafe" />
                                            <path d="M8 6l4 4-4 4" stroke="#2563eb" strokeWidth="2" />
                                        </svg>
                                    </span>
                                </div>
                                <div className={styles.appCardStats}>
                                    <div className={styles.appCardStat}>
                                        <span className={styles.statValue}>{app.students}</span>
                                        <span className={styles.statLabel}>Students</span>
                                    </div>
                                    <div className={styles.appCardStat}>
                                        <span className={styles.statValue}>{app.teachers}</span>
                                        <span className={styles.statLabel}>Teachers</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
