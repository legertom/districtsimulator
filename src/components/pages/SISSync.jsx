"use client";

/**
 * SIS Sync page - main component.
 * Split into separate tab components for better maintainability.
 */

import styles from "./SISSync.module.css";
import { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Icons, Tabs, InfoBanner, StatusBadge } from "@/components/ui";
import { demoUsers } from "@/data/demoIdentity";
import {
    LastAttemptedSyncTab,
    SettingsTab,
    UploadTab,
    StaffDataTab
} from "./SISSync/index.js";

export default function SISSync() {
    const { scenario } = useScenario();
    const { syncStates: SYNC_STATES, metadata } = scenario.sisSync;

    const [activeTab, setActiveTab] = useState("Last Attempted Sync");
    const [syncMode, setSyncMode] = useState("SUCCESSFUL");

    const currentSync = SYNC_STATES[syncMode];

    return (
        <div className={styles.page}>

            <div className={styles.header}>
                <div className={styles.searchContainer}>
                    <span className={styles.searchIcon}>{Icons.search}</span>
                    <input
                        type="text"
                        placeholder="Search for users or applications"
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.headerLink}>
                        <span className={styles.portalIcon}>{Icons.grid}</span>
                        Portal
                    </div>
                    <div className={styles.userMenu}>
                        {demoUsers.primaryAdmin.firstName} {demoUsers.primaryAdmin.lastName} <span className={styles.chevronDown}>{Icons.chevronDown}</span>
                    </div>
                </div>
            </div>

            <div className={styles.titleRow}>
                <h1 className={styles.title}>Sync</h1>
                <StatusBadge
                    variant={currentSync.badgeVariant}
                    className={styles.clickableBadge}
                    onClick={() => setSyncMode(syncMode === "SUCCESSFUL" ? "OUT_OF_DATE" : "SUCCESSFUL")}
                >
                    {currentSync.badgeText}
                </StatusBadge>
            </div>

            <div className={styles.statusRow}>
                <div className={styles.statusItem}>
                    <div className={styles.statusLabel}>STATUS</div>
                    <div className={styles.statusValue}>
                        {currentSync.statusText}
                    </div>
                </div>
                <div className={styles.statusItem}>
                    <div className={styles.statusLabel}>LAST SYNC</div>
                    <div className={styles.statusValue}>{currentSync.lastSync}</div>
                </div>
                <div className={styles.statusItem}>
                    <div className={styles.statusLabel}>SYNC TYPE</div>
                    <div className={styles.statusValue}>{metadata.syncType}</div>
                </div>
                <div className={styles.statusItem}>
                    <div className={styles.statusLabel}>SYNC MANAGER</div>
                    <div className={styles.statusValue}>{metadata.syncManager}</div>
                </div>
            </div>

            <InfoBanner variant="info" icon={Icons.xCircle}>
                Learn more about <a href="#">uploading data to Clever</a> in our Help Center.
            </InfoBanner>

            <Tabs
                tabs={["Last Attempted Sync", "Settings", "Upload", "Staff Data"]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {activeTab === "Last Attempted Sync" && (
                <LastAttemptedSyncTab
                    data={currentSync.data}
                    bannerVariant={currentSync.bannerVariant}
                    bannerText={currentSync.bannerText}
                />
            )}
            {activeTab === "Settings" && <SettingsTab />}
            {activeTab === "Upload" && <UploadTab />}
            {activeTab === "Staff Data" && <StaffDataTab />}
        </div>
    );
}
