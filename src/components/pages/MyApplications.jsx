"use client";

import { useScenario } from "@/context/ScenarioContext";
import { PageHeader, InfoBanner } from "@/components/ui";
import styles from "./MyApplications.module.css";

export default function MyApplications() {
    const { scenario } = useScenario();
    const applications = scenario.applications.myApplications;

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
                            <tr key={app.id}>
                                <td>
                                    <div className={styles.nameCell}>
                                        <div
                                            className={styles.appIcon}
                                            style={{ backgroundColor: app.iconColor }}
                                        >
                                            {app.icon}
                                        </div>
                                        <a href="#" className={styles.appName}>{app.name}</a>
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
