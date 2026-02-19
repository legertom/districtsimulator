"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useScenario } from "@/context/ScenarioContext";
import { PageHeader, InfoBanner } from "@/components/ui";
import { buildApplicationDetailsRoute } from "@/lib/routing";
import styles from "./MyApplications.module.css";

export default function MyApplications() {
    const { scenario } = useScenario();
    const searchParams = useSearchParams();
    const applications = scenario.applications.myApplications;
    const selectedAppId = Number.parseInt(searchParams.get("appId") ?? "", 10);
    const highlightedAppId = Number.isInteger(selectedAppId) ? selectedAppId : null;
    const highlightedApp = useMemo(
        () => applications.find((app) => app.id === highlightedAppId) ?? null,
        [applications, highlightedAppId]
    );

    useEffect(() => {
        if (!highlightedAppId) {
            return;
        }

        const highlightedRow = document.getElementById(`my-app-row-${highlightedAppId}`);
        highlightedRow?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [highlightedAppId]);

    return (
        <div className={styles.page}>
            <PageHeader
                title="My applications"
                actions={<button className={styles.addButton}>Add applications</button>}
            />

            <InfoBanner variant="info">
                Learn more about{" "}
                <a href="#" className={styles.link}>types of applications</a> and{" "}
                <a href="#" className={styles.link}>adding applications</a> in our Help Center.
            </InfoBanner>

            {highlightedApp ? (
                <div className={styles.searchContext}>
                    Opened from search: <strong>{highlightedApp.name}</strong>
                </div>
            ) : null}

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th rowSpan={2}>Name</th>
                            <th rowSpan={2}>App Status</th>
                            <th rowSpan={2}>Next step</th>
                            <th rowSpan={2}>App Type</th>
                            <th colSpan={2} className={styles.groupHeader}>Total logins last 7 days</th>
                            <th rowSpan={2}>Sharing</th>
                        </tr>
                        <tr>
                            <th className={styles.subHeader}>Students</th>
                            <th className={styles.subHeader}>Teachers</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app) => (
                            <tr
                                key={app.id}
                                id={`my-app-row-${app.id}`}
                                className={app.id === highlightedAppId ? styles.selectedRow : ""}
                            >
                                <td>
                                    <div className={styles.nameCell}>
                                        <div
                                            className={styles.appIcon}
                                            style={{
                                                background: app.iconBackground ?? app.iconColor ?? "var(--gray-300)",
                                                color: app.iconTextColor ?? "#ffffff",
                                            }}
                                        >
                                            {app.icon}
                                        </div>
                                        <Link
                                            href={buildApplicationDetailsRoute(app.id)}
                                            className={`${styles.appName} ${app.id === highlightedAppId ? styles.selectedAppName : ""}`}
                                        >
                                            {app.name}
                                        </Link>
                                    </div>
                                </td>
                                <td>
                                    <span
                                        className={styles.statusBadge}
                                        style={{ backgroundColor: app.statusColor }}
                                    >
                                        {app.status}
                                    </span>
                                </td>
                                <td>{app.nextStep || ""}</td>
                                <td>{app.appType}</td>
                                <td className={styles.loginCount}>{app.studentLogins ?? 0}</td>
                                <td className={styles.loginCount}>{app.teacherLogins ?? 0}</td>
                                <td>
                                    <a href="#" className={styles.link}>{app.sharing}</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
