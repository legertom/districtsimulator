"use client";

import { useState } from "react";
import { PageHeader, Tabs, FilterBar, Icons } from "@/components/ui";
import styles from "./Communication.module.css";

export default function Communication() {
    const [activeTab, setActiveTab] = useState("Portal Notifications");

    const filters = [
        { label: "STATUS", options: [{ value: "", label: "All" }] },
        { label: "CREATED BY", options: [{ value: "", label: "All" }] },
    ];

    const renderNotifications = () => (
        <div className={styles.notificationsContent}>
            <div className={styles.notifHeader}>
                <div className={styles.bellIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className={styles.bellBadge}>1</span>
                </div>
                <div className={styles.notifHeaderText}>
                    <p>Portal notifications can be shown to teachers, staff and students in their Clever Portal.</p>
                </div>
                <button className={styles.createButton}>Create notification</button>
            </div>

            <FilterBar filters={filters} searchPlaceholder="Search by title or creator" />

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Created by</th>
                            <th>Title</th>
                            <th>Body</th>
                            <th>Start date</th>
                            <th>End date</th>
                            <th>Visibility</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={8}>
                                <div className={styles.emptyState}>
                                    <h3 className={styles.emptyTitle}>Go ahead, create your first notification!</h3>
                                    <button className={styles.createButton}>Create notification</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMessaging = () => (
        <div className={styles.messagingContent}>
            <div className={styles.emptyState}>
                <p className={styles.emptyText}>District messaging settings will appear here.</p>
            </div>
        </div>
    );

    return (
        <div className={styles.page}>
            <PageHeader title="Portal communication" />

            <Tabs
                tabs={["Portal Notifications", "District Messaging Settings"]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className={styles.content}>
                {activeTab === "Portal Notifications" ? renderNotifications() : renderMessaging()}
            </div>
        </div>
    );
}
