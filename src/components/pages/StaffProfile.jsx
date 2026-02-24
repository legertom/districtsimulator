"use client";

import { useMemo } from "react";
import { useScenario } from "@/context/ScenarioContext";
import ProfileHero from "@/components/pages/profiles/ProfileHero";
import ProfileField from "@/components/pages/profiles/ProfileField";
import CleverIDMSection from "@/components/pages/profiles/CleverIDMSection";
import styles from "./profiles/ProfilePage.module.css";

const STAFF_ACTIONS = [
    { label: "Troubleshoot user login" },
    { label: "Troubleshoot user sharing" },
    { label: "Access Portal as user" },
    { label: "Download Clever Badge PDF", dividerBefore: true },
    { label: "Download Clever Badge PNG" },
    { label: "Void Clever Badge" },
    { label: "Enable Badge PIN", dividerBefore: true },
    { label: "Reset MFA" },
];

export default function StaffProfile({ staff }) {
    const { scenario } = useScenario();

    const schoolRecord = useMemo(() => {
        return scenario.dataBrowser?.schools?.find((s) => s.id === staff.schoolId) || null;
    }, [scenario.dataBrowser?.schools, staff.schoolId]);

    const fullName = [staff.first, staff.last].filter(Boolean).join(" ");

    // Staff has no tabs — just the Details content directly
    // No stats bar either (matches real Clever)
    return (
        <div className={styles.container}>
            <ProfileHero
                name={fullName}
                cleverId={staff.id}
                metaChips={[
                    ...(staff.title ? [{ value: staff.title, isBadge: true }] : []),
                    { value: staff.school, isLink: true },
                    { value: staff.email },
                ]}
                email={staff.email}
                stats={null}
                actions={STAFF_ACTIONS}
            />

            {/* No tab bar for staff — single content area */}
            <div className={styles.content}>
                {/* Staff Information */}
                <div className={styles.card}>
                    <h2 className={styles.cardHeader}>Staff Information</h2>
                    <div className={styles.fieldGrid}>
                        <ProfileField label="Staff ID" value={staff.id?.substring(0, 8)} />
                        <ProfileField label="Clever Staff ID" value={staff.id} />
                        <ProfileField label="Email" value={staff.email} />
                        <ProfileField label="Clever Role" value={staff.role} />
                        <ProfileField label="District Username" value={staff.username} />
                        <ProfileField label="Clever Username" value={staff.email} />
                        <ProfileField label="Department" value={staff.department} />
                        <ProfileField label="Clever Password" value="••••••••" />
                        <ProfileField label="Created" value="Sep 1, 2025" />
                        <ProfileField label="Last Modified" value={staff.lastModified?.date || "—"} />
                        <ProfileField label="Verified MFA Types" value="None" />
                    </div>
                </div>

                {/* Clever IDM Information (conditional) */}
                <CleverIDMSection userType="staff" person={staff} />

                {/* Schools */}
                <div className={styles.card}>
                    <h2 className={styles.cardHeader}>Schools</h2>
                    <table className={styles.cardTable}>
                        <thead>
                            <tr>
                                <th>School Name</th>
                                <th>School ID</th>
                                <th>Grades</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{staff.school}</td>
                                <td>{staff.schoolId?.substring(0, 8)}...</td>
                                <td>
                                    {schoolRecord
                                        ? `${schoolRecord.lowGrade} - ${schoolRecord.highGrade}`
                                        : "—"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Apps & Logins (staff shows these on the single page, same as Overview on student/teacher) */}
                <div className={styles.placeholderCard}>
                    <h3>Apps</h3>
                    <div className={styles.placeholderEmpty}>
                        No apps shared with this user
                    </div>
                </div>

                <div className={styles.placeholderCard}>
                    <h3>Logins to Clever</h3>
                    <div className={styles.placeholderEmpty}>
                        No login data available
                    </div>
                </div>
            </div>
        </div>
    );
}
