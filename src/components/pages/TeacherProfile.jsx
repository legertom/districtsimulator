"use client";

import { useState, useMemo } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Tabs } from "@/components/ui";
import ProfileHero from "@/components/pages/profiles/ProfileHero";
import ProfileOverviewTab from "@/components/pages/profiles/ProfileOverviewTab";
import ProfileField from "@/components/pages/profiles/ProfileField";
import CleverIDMSection from "@/components/pages/profiles/CleverIDMSection";
import styles from "./profiles/ProfilePage.module.css";

const TEACHER_ACTIONS = [
    { label: "Troubleshoot user login" },
    { label: "Troubleshoot user sharing" },
    { label: "Access Portal as user" },
    { label: "Download Clever Badge PDF", dividerBefore: true },
    { label: "Download Clever Badge PNG" },
    { label: "Void Clever Badge" },
    { label: "Enable Badge PIN", dividerBefore: true },
    { label: "Generate MFA Bypass" },
    { label: "Reset MFA" },
    { label: "Download Messaging transcript", dividerBefore: true },
    { label: "Disable Messaging" },
];

const SECTION_COLUMNS = [
    { key: "course", label: "Section" },
    { key: "term", label: "Term" },
    { key: "school", label: "School" },
    { key: "period", label: "Period" },
    { key: "grade", label: "Grade" },
    { key: "subject", label: "Subject" },
    { key: "students", label: "Students" },
];

export default function TeacherProfile({ teacher }) {
    const [activeTab, setActiveTab] = useState("Overview");
    const { scenario } = useScenario();

    const taughtSections = useMemo(() => {
        const allSections = scenario.dataBrowser?.sections || [];
        return allSections.filter((s) => s.teacherId === teacher.id);
    }, [scenario.dataBrowser?.sections, teacher.id]);

    const schoolRecord = useMemo(() => {
        return scenario.dataBrowser?.schools?.find((s) => s.id === teacher.schoolId) || null;
    }, [scenario.dataBrowser?.schools, teacher.schoolId]);

    const fullName = [teacher.title, teacher.first, teacher.middleName, teacher.last]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles.container}>
            <ProfileHero
                name={fullName}
                cleverId={teacher.id}
                metaChips={[
                    { value: teacher.school, isLink: true },
                    { value: teacher.email },
                    { value: "Messaging Enabled", isBadge: true, badgeGreen: true },
                ]}
                email={teacher.email}
                stats={[
                    { label: "Teacher Number", value: teacher.teacherNumber || "—" },
                    { label: "State Teacher ID", value: teacher.stateTeacherId || "—" },
                    { label: "Last Login to Clever", value: "—" },
                    { label: "Last Modified", value: teacher.lastModified?.date || "—" },
                ]}
                actions={TEACHER_ACTIONS}
            />

            <Tabs
                tabs={["Overview", "Details"]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {activeTab === "Overview" && (
                <ProfileOverviewTab
                    sections={taughtSections}
                    sectionColumns={SECTION_COLUMNS}
                />
            )}

            {activeTab === "Details" && (
                <div className={styles.content}>
                    {/* Teacher Information */}
                    <div className={styles.card}>
                        <h2 className={styles.cardHeader}>Teacher Information</h2>
                        <div className={styles.fieldGrid}>
                            <ProfileField label="Teacher ID" value={teacher.stateTeacherId} />
                            <ProfileField label="Clever Teacher ID" value={teacher.id} />
                            <ProfileField label="Teacher Number" value={teacher.teacherNumber} />
                            <ProfileField label="State Teacher ID" value={teacher.stateTeacherId} />
                            <ProfileField label="District Username" value={teacher.username} />
                            <ProfileField label="Clever Username" value={teacher.email} />
                            <ProfileField label="District Password" value="••••••••" />
                            <ProfileField label="Clever Password" value="••••••••" />
                            <ProfileField label="Created" value="Sep 1, 2025" />
                            <ProfileField label="Last Modified" value={teacher.lastModified?.date || "—"} />
                            <ProfileField label="Verified MFA Types" value="None" />
                        </div>
                    </div>

                    {/* Clever IDM Information (conditional) */}
                    <CleverIDMSection userType="teacher" person={teacher} />

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
                                    <td>{teacher.school}</td>
                                    <td>{teacher.schoolId?.substring(0, 8)}...</td>
                                    <td>
                                        {schoolRecord
                                            ? `${schoolRecord.lowGrade} - ${schoolRecord.highGrade}`
                                            : "—"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
