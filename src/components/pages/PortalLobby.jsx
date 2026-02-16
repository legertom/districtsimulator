"use client";

import { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import styles from "./PortalLobby.module.css";
import { Icon } from "@/components/ui/Icons";

export default function PortalLobby({ onLaunchApp, onEnterDashboard }) {
    const { scenario } = useScenario();
    const { apps } = scenario.portalLobby;
    const districtName = scenario.sidebar.districtInfo.name;

    const [comingSoonId, setComingSoonId] = useState(null);

    const liveApps = apps.filter((a) => a.launchMode === "dashboard");
    const comingSoonApps = apps.filter((a) => a.launchMode === "comingSoon");

    const handleTileClick = (app) => {
        if (app.launchMode === "dashboard") {
            onLaunchApp(app.launchTarget);
        } else {
            setComingSoonId(app.id);
            setTimeout(() => setComingSoonId(null), 2000);
        }
    };

    return (
        <div className={styles.portalPage}>
            {/* Portal Top Bar */}
            <header className={styles.portalHeader}>
                <div className={styles.headerLeft}>
                    <span className={styles.logoText}>Clever</span>
                    <span className={styles.logoDivider} aria-hidden="true" />
                    <span className={styles.portalLabel}>Portal</span>
                </div>
                <div className={styles.headerRight}>
                    <button
                        className={styles.dashboardLink}
                        onClick={onEnterDashboard}
                    >
                        <Icon name="dashboard" size={16} />
                        <span>Admin Dashboard</span>
                    </button>
                </div>
            </header>

            {/* District Banner */}
            <div className={styles.districtBanner}>
                <div className={styles.districtInner}>
                    <h1 className={styles.districtName}>{districtName}</h1>
                    <p className={styles.districtMeta}>
                        {apps.length} application{apps.length !== 1 ? "s" : ""} available
                    </p>
                </div>
            </div>

            {/* App Grid */}
            <main className={styles.portalMain}>
                {/* Live applications */}
                <section className={styles.appSection}>
                    <h2 className={styles.sectionHeading}>Your Applications</h2>
                    <div className={styles.appGrid}>
                        {liveApps.map((app) => (
                            <button
                                key={app.id}
                                className={styles.appTile}
                                onClick={() => handleTileClick(app)}
                            >
                                <div
                                    className={styles.appIcon}
                                    style={{ backgroundColor: app.iconColor || "#e5e7eb" }}
                                >
                                    <span className={styles.appIconLabel}>{app.icon}</span>
                                </div>
                                <span className={styles.appName}>{app.name}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Coming soon applications */}
                {comingSoonApps.length > 0 && (
                    <section className={styles.appSection}>
                        <h2 className={styles.sectionHeading}>Coming Soon</h2>
                        <div className={styles.appGrid}>
                            {comingSoonApps.map((app) => (
                                <button
                                    key={app.id}
                                    className={`${styles.appTile} ${styles.comingSoonTile}`}
                                    onClick={() => handleTileClick(app)}
                                >
                                    <div
                                        className={`${styles.appIcon} ${styles.comingSoonIcon}`}
                                        style={{ backgroundColor: app.iconColor || "#e5e7eb" }}
                                    >
                                        <span className={styles.appIconLabel}>{app.icon}</span>
                                    </div>
                                    <span className={styles.appName}>{app.name}</span>
                                    {comingSoonId === app.id && (
                                        <span className={styles.comingSoonToast}>
                                            Coming soon
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
