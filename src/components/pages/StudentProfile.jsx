"use client";

import { useState, useMemo } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Tabs } from "@/components/ui";
import ProfileHero from "@/components/pages/profiles/ProfileHero";
import ProfileOverviewTab from "@/components/pages/profiles/ProfileOverviewTab";
import ProfileField from "@/components/pages/profiles/ProfileField";
import CleverIDMSection from "@/components/pages/profiles/CleverIDMSection";
import styles from "./profiles/ProfilePage.module.css";

const STUDENT_ACTIONS = [
    { label: "Troubleshoot user login" },
    { label: "Troubleshoot user sharing" },
    { label: "Access Portal as user" },
    { label: "Download Clever Badge PDF", dividerBefore: true },
    { label: "Download Clever Badge PNG" },
    { label: "Void Clever Badge" },
    { label: "Enable Badge PIN", dividerBefore: true },
    { label: "Reset MFA" },
];

const SECTION_COLUMNS = [
    { key: "course", label: "Section" },
    { key: "term", label: "Term" },
    { key: "school", label: "School" },
    { key: "period", label: "Period" },
    { key: "grade", label: "Grade" },
    { key: "subject", label: "Subject" },
    { key: "teacher", label: "Primary Teacher" },
    { key: "students", label: "Students" },
];

export default function StudentProfile({ student }) {
    const [activeTab, setActiveTab] = useState("Overview");
    const { scenario } = useScenario();

    const enrolledSections = useMemo(() => {
        const sectionIds = scenario.dataBrowser?.enrollmentsByStudent?.[student.id] || [];
        const allSections = scenario.dataBrowser?.sections || [];
        return allSections.filter((s) => sectionIds.includes(s.id));
    }, [scenario.dataBrowser, student.id]);

    const schoolRecord = useMemo(() => {
        return scenario.dataBrowser?.schools?.find((s) => s.id === student.schoolId) || null;
    }, [scenario.dataBrowser?.schools, student.schoolId]);

    const fullName = [student.first, student.middleName, student.last].filter(Boolean).join(" ");

    return (
        <div className={styles.container}>
            <ProfileHero
                name={fullName}
                cleverId={student.id}
                metaChips={[
                    { value: `Grade ${student.grade}`, isBadge: true },
                    { value: student.school, isLink: true },
                    { value: student.email },
                ]}
                email={student.email}
                stats={[
                    { label: "Student Number", value: student.studentNumber || "—" },
                    { label: "Student ID", value: student.stateId || "—" },
                    { label: "Last Login to Clever", value: "—" },
                    { label: "Last Modified", value: student.lastModified?.date || "—" },
                ]}
                actions={STUDENT_ACTIONS}
            />

            <Tabs
                tabs={["Overview", "Details", "Guardians"]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {activeTab === "Overview" && (
                <ProfileOverviewTab
                    sections={enrolledSections}
                    sectionColumns={SECTION_COLUMNS}
                />
            )}

            {activeTab === "Details" && (
                <div className={styles.content}>
                    {/* Student Information */}
                    <div className={styles.card}>
                        <h2 className={styles.cardHeader}>Student Information</h2>
                        <div className={styles.fieldGrid}>
                            <ProfileField label="Student ID" value={student.stateId} />
                            <ProfileField label="Clever Student ID" value={student.id} />
                            <ProfileField label="Student Number" value={student.studentNumber} />
                            <ProfileField label="State ID" value={student.stateId} />
                            <ProfileField label="District Username" value={student.email?.split("@")[0]} />
                            <ProfileField label="Clever Username" value={student.email} />
                            <ProfileField label="District Password" value="••••••••" />
                            <ProfileField label="Clever Password" value="••••••••" />
                            <ProfileField label="Grade" value={student.grade} />
                            <ProfileField label="Graduation Year" value="2030" />
                            <ProfileField label="Created" value="Sep 1, 2025" />
                            <ProfileField label="Verified MFA Types" value="None" />
                        </div>
                    </div>

                    {/* Clever IDM Information (conditional) */}
                    <CleverIDMSection userType="student" person={student} />

                    {/* Personal Information */}
                    <div className={styles.card}>
                        <h2 className={styles.cardHeader}>Personal Information</h2>
                        <div className={styles.fieldGrid}>
                            <ProfileField label="Email" value={student.email} />
                            <ProfileField label="Date of Birth" value={student.dob} />
                            <ProfileField label="Race" value={student.race} />
                            <ProfileField
                                label="Address"
                                value={
                                    student.street
                                        ? `${student.street}, ${student.city}, ${student.state} ${student.zip}`
                                        : null
                                }
                            />
                            <ProfileField label="Gender" value={student.gender} />
                            <ProfileField label="Hispanic Ethnicity" value={student.hispanicLatino} />
                            <ProfileField label="Home Language" value={student.homeLanguage} />
                        </div>
                    </div>

                    {/* Sensitive Education Information */}
                    <div className={styles.card}>
                        <h2 className={styles.cardHeader}>Sensitive Education Information</h2>
                        <div className={styles.fieldGrid}>
                            <ProfileField label="Disability Type" value="—" />
                            <ProfileField label="Disability Status" value="—" />
                            <ProfileField label="ELL Status" value={student.ellStatus} />
                            <ProfileField label="FRL Status" value={student.frlStatus} />
                            <ProfileField label="Gifted/Talented" value="—" />
                            <ProfileField label="IEP Status" value={student.iepStatus} />
                            <ProfileField label="Section 504 Status" value="—" />
                            <ProfileField label="Unweighted GPA" value="—" />
                            <ProfileField label="Weighted GPA" value="—" />
                        </div>
                    </div>

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
                                    <td>{student.school}</td>
                                    <td>{student.schoolId?.substring(0, 8)}...</td>
                                    <td>
                                        {schoolRecord
                                            ? `${schoolRecord.lowGrade} - ${schoolRecord.highGrade}`
                                            : student.grade}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "Guardians" && (
                <div className={styles.content}>
                    <div className={styles.card}>
                        <p className={styles.emptyState}>
                            This student does not have any guardians.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
