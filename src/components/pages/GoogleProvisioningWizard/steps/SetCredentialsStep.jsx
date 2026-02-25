"use client";

import React, { useState } from "react";
import {
    SAMPLE_STUDENT, SAMPLE_TEACHER, SAMPLE_STAFF,
    EMAIL_SIS_VARIABLES,
} from "@/data/defaults/idm-provisioning";
import CredentialFormatEditorModal, {
    resolveEmailPreview,
    formatToTokens,
    formatToEmailString,
} from "./CredentialFormatEditorModal";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "../GoogleProvisioningWizard.module.css";

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 6l2.5 2.5L9 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/** Migrate old credential state that lacks emailFormat/fallback fields */
function migrateCredential(cred) {
    if (cred.emailFormat) return cred;
    // Derive emailFormat from emailTokens
    const emailFormat = (cred.emailTokens || []).map((token) => {
        const variable = token.replace(/\{\{|\}\}/g, "");
        const vars = Object.values(EMAIL_SIS_VARIABLES).flat();
        const match = vars.find((v) => v.variable === variable);
        return { type: "variable", variable, label: match?.label || variable };
    });
    return {
        ...cred,
        emailFormat,
        fallbackEnabled: false,
        fallbackFormat: [],
    };
}

function CredentialCard({ title, credential, onEdit, userType }) {
    return (
        <div className={styles.card} data-instruction-target={`credential-card-${userType}`}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                    {title}
                    {credential.completed && (
                        <span className={styles.completedBadge}>
                            <CheckIcon /> Completed
                        </span>
                    )}
                </div>
                <button
                    className={styles.editBtn}
                    data-instruction-target={`edit-credential-${userType}`}
                    onClick={onEdit}
                >
                    Edit
                </button>
            </div>
            <div>
                <div className={styles.cardLabel}>EMAIL</div>
                <div className={styles.cardValue} data-instruction-target={`email-format-${userType}`}>
                    {credential.email}
                </div>
            </div>
            <div style={{ marginTop: 12 }}>
                <div className={styles.cardLabel}>PASSWORD</div>
                <div className={styles.cardValue}>{credential.password}</div>
            </div>
        </div>
    );
}

function CredentialEditView({ title, userType, credential, sample, onBack, updateState, state }) {
    const [domain] = useState(credential.domain);
    const [showFormatEditor, setShowFormatEditor] = useState(false);
    const [showFallbackEditor, setShowFallbackEditor] = useState(false);
    const [section, setSection] = useState(1); // 1 = user preview, 2 = email config
    const { checkActionGoal } = useInstructional();

    const cred = migrateCredential(credential);

    // Compute preview email from format segments
    const previewEmail = cred.emailFormat?.length
        ? resolveEmailPreview(cred.emailFormat, sample, domain)
        : sample.exampleEmail;

    const fallbackPreviewEmail = cred.fallbackEnabled && cred.fallbackFormat?.length
        ? resolveEmailPreview(cred.fallbackFormat, sample, domain)
        : null;

    /** Save primary format from modal */
    const handleFormatSave = (rows) => {
        const emailTokens = formatToTokens(rows);
        const email = formatToEmailString(rows, domain);
        updateState({
            credentials: {
                ...state.credentials,
                [userType]: {
                    ...state.credentials[userType],
                    emailFormat: rows,
                    emailTokens,
                    email,
                },
            },
        });
        setShowFormatEditor(false);
    };

    /** Save fallback format from modal */
    const handleFallbackSave = (rows) => {
        updateState({
            credentials: {
                ...state.credentials,
                [userType]: {
                    ...state.credentials[userType],
                    fallbackFormat: rows,
                    fallbackEnabled: true,
                },
            },
        });
        setShowFallbackEditor(false);
    };

    /** Enable fallback and show editor */
    const handleAddFallback = (e) => {
        e.preventDefault();
        if (!cred.fallbackEnabled) {
            // Enable with default format
            const defaultFallback = [
                { type: "variable", variable: "name.first", label: "First Name" },
                { type: "text", value: "." },
                { type: "variable", variable: "name.last", label: "Last Name" },
            ];
            updateState({
                credentials: {
                    ...state.credentials,
                    [userType]: {
                        ...state.credentials[userType],
                        fallbackEnabled: true,
                        fallbackFormat: defaultFallback,
                    },
                },
            });
        } else {
            setShowFallbackEditor(true);
        }
    };

    /** Remove fallback */
    const handleRemoveFallback = (e) => {
        e.preventDefault();
        updateState({
            credentials: {
                ...state.credentials,
                [userType]: {
                    ...state.credentials[userType],
                    fallbackEnabled: false,
                    fallbackFormat: [],
                },
            },
        });
    };

    /** Next Step: progressive disclosure, then save */
    const handleNextStep = () => {
        if (section === 1) {
            checkActionGoal(`credential-next-step-${userType}`);
            setSection(2);
        } else {
            checkActionGoal(`credential-save-${userType}`);
            updateState({
                credentials: {
                    ...state.credentials,
                    [userType]: {
                        ...state.credentials[userType],
                        completed: true,
                    },
                },
            });
            onBack();
        }
    };

    const nextButtonLabel = section === 1 ? "Next Step" : "Save";

    return (
        <>
            <h1 className={styles.stepTitle}>{title} login credentials and email</h1>
            <p className={styles.stepDescription}>
                Set email and password formats for all {userType}. Preview your format with an
                existing Clever user. Learn more in the{" "}
                <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                    Set login credentials section
                </a>{" "}
                of our Clever IDM course in Clever Academy!
            </p>

            {/* Section 1: Preview user */}
            <div className={styles.card}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0" }}>
                    1. Select any {userType.slice(0, -1)} with an existing Clever account to preview their data
                </h3>
                <div style={{ marginBottom: 12 }}>
                    <div className={styles.cardLabel}>USER NAME</div>
                    <select
                        style={{
                            width: "100%", padding: "8px 12px", border: "1px solid var(--gray-300)",
                            borderRadius: 6, fontSize: 14, color: "var(--gray-900)", background: "white",
                        }}
                        defaultValue={sample.name}
                    >
                        <option>{sample.name}</option>
                    </select>
                </div>
                <div className={styles.card} style={{ background: "var(--gray-50)" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)", marginBottom: 12 }}>
                        🔵 {sample.name}&apos;s Clever Data
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 13 }}>
                        <div><strong>SIS Email</strong> {sample.sisEmail}</div>
                        <div><strong>SIS ID</strong> {sample.sisId}</div>
                        <div><strong>District Username</strong> {sample.districtUsername || "—"}</div>
                        <div><strong>State ID</strong> {sample.stateId || "—"}</div>
                        <div><strong>District Password</strong> {sample.districtPassword || "—"}</div>
                        <div><strong>Student Number</strong> {sample.studentNumber || "—"}</div>
                        <div><strong>Graduation Year</strong> {sample.graduationYear || "—"}</div>
                        <div><strong>Birthday</strong> {sample.birthday || "—"}</div>
                    </div>
                </div>
            </div>

            {/* Section 2: Email credentials — revealed on Next Step */}
            {section >= 2 && (
                <div className={`${styles.card} ${styles.section3Container}`}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0" }}>
                        2. Select email credentials
                    </h3>

                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Matching emails</h4>
                            <span className={styles.recommendBadge}>Match credentials</span>
                        </div>
                        <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.5, margin: "0 0 12px 0" }}>
                            Clever IDM uses the SIS email associated with the user in Clever to automatically
                            link to matching accounts in Google. Only those users whose SIS email matches the
                            domain will be matched.
                        </p>
                        <div style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 13, color: "var(--gray-600)" }}>
                                    Select the associated email domain for {userType}
                                </span>
                                <span style={{ fontSize: 13, color: "var(--gray-600)", fontStyle: "italic" }}>Required</span>
                            </div>
                            <select
                                style={{
                                    width: "100%", maxWidth: 400, padding: "8px 12px",
                                    border: "1px solid var(--gray-300)", borderRadius: 6,
                                    fontSize: 14, color: "var(--gray-900)", background: "white", marginTop: 4,
                                }}
                                defaultValue={domain}
                            >
                                <option>{domain}</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                                Create an email format for all unmatched users
                            </h4>
                            <span className={styles.limitedBadge}>Create credentials</span>
                        </div>
                        <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.5, margin: "0 0 12px 0" }}>
                            To create an email format for {userType}, combine a username and a domain.
                            Clever IDM will only use this format if the user&apos;s email address isn&apos;t
                            populated in Clever already.
                        </p>

                        {/* Primary format display */}
                        <div className={styles.formatTagRow}>
                            {(cred.emailFormat || []).map((seg, i) => (
                                seg.type === "variable" ? (
                                    <span key={i} className={styles.formatTag}>
                                        {`{{${seg.variable}}}`}
                                    </span>
                                ) : (
                                    <span key={i} className={styles.formatTagText}>
                                        {seg.value}
                                    </span>
                                )
                            ))}
                            {(!cred.emailFormat || cred.emailFormat.length === 0) && (
                                <span style={{ fontSize: 13, color: "var(--gray-500)", fontStyle: "italic" }}>
                                    No format configured
                                </span>
                            )}
                        </div>
                        <button
                            className={styles.editFormatLink}
                            data-instruction-target={`edit-format-link-${userType}`}
                            onClick={() => setShowFormatEditor(true)}
                        >
                            Edit your format
                        </button>

                        {/* Email preview */}
                        <div className={styles.card} style={{ background: "var(--gray-50)", marginTop: 12 }}>
                            <div style={{ fontSize: 14, color: "var(--gray-700)" }}>
                                👁 {sample.name}&apos;s email format
                            </div>
                            <div style={{ fontSize: 14, marginTop: 4 }}>
                                <strong>Example email</strong> {previewEmail}
                            </div>
                        </div>

                        {/* Fallback section */}
                        {cred.fallbackEnabled ? (
                            <div className={styles.credentialFallbackSection}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, marginTop: 16 }}>
                                    <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--gray-800)" }}>
                                        Fallback create format
                                    </h4>
                                    <a href="#" className={styles.helpLink} onClick={handleRemoveFallback}
                                        style={{ fontSize: 13 }}>
                                        Remove fallback
                                    </a>
                                </div>
                                <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.5, margin: "0 0 8px 0" }}>
                                    If the primary email format produces a conflict, this fallback format will be used instead.
                                </p>
                                <div className={styles.formatTagRow}>
                                    {(cred.fallbackFormat || []).map((seg, i) => (
                                        seg.type === "variable" ? (
                                            <span key={i} className={styles.formatTag}>
                                                {`{{${seg.variable}}}`}
                                            </span>
                                        ) : (
                                            <span key={i} className={styles.formatTagText}>
                                                {seg.value}
                                            </span>
                                        )
                                    ))}
                                </div>
                                <button
                                    className={styles.editFormatLink}
                                    onClick={() => setShowFallbackEditor(true)}
                                >
                                    Edit fallback format
                                </button>
                                {fallbackPreviewEmail && (
                                    <div className={styles.card} style={{ background: "var(--gray-50)", marginTop: 12 }}>
                                        <div style={{ fontSize: 14, color: "var(--gray-700)" }}>
                                            👁 {sample.name}&apos;s fallback email
                                        </div>
                                        <div style={{ fontSize: 14, marginTop: 4 }}>
                                            <strong>Example email</strong> {fallbackPreviewEmail}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                className={styles.editFormatLink}
                                onClick={handleAddFallback}
                                style={{ display: "block", marginTop: 8 }}
                            >
                                Add fallback create format ℹ️
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className={styles.nextBtnRow}>
                <button className={styles.nextBtn} onClick={handleNextStep}>
                    {nextButtonLabel}
                </button>
            </div>

            <div className={styles.helpBanner}>
                <span className={styles.helpBannerIcon}>⚙️</span>
                <span className={styles.helpBannerText}>
                    Need help setting up your login credentials? Check out the{" "}
                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                        Set login credentials section
                    </a>{" "}
                    of our Clever IDM course in Clever Academy!
                </span>
            </div>

            {/* Format Editor Modals */}
            {showFormatEditor && (
                <CredentialFormatEditorModal
                    userType={userType}
                    format={cred.emailFormat}
                    domain={domain}
                    sampleUser={sample}
                    onSave={handleFormatSave}
                    onCancel={() => setShowFormatEditor(false)}
                    title="Edit email format"
                />
            )}
            {showFallbackEditor && (
                <CredentialFormatEditorModal
                    userType={userType}
                    format={cred.fallbackFormat}
                    domain={domain}
                    sampleUser={sample}
                    onSave={handleFallbackSave}
                    onCancel={() => setShowFallbackEditor(false)}
                    title="Edit fallback email format"
                />
            )}
        </>
    );
}

export default function SetCredentialsStep({ state, updateState, goNext }) {
    const [editingType, setEditingType] = useState(null);
    const { checkActionGoal } = useInstructional();

    // Count completed credential steps
    const types = [];
    if (state.provisionStudents) types.push("students");
    if (state.provisionTeachers) types.push("teachers");
    if (state.provisionStaff) types.push("staff");
    const completedCount = types.filter((t) => state.credentials[t].completed).length;

    const samples = { students: SAMPLE_STUDENT, teachers: SAMPLE_TEACHER, staff: SAMPLE_STAFF };
    const labels = { students: "Student", teachers: "Teacher", staff: "Staff" };

    if (editingType) {
        return (
            <CredentialEditView
                title={`${labels[editingType]}`}
                userType={editingType}
                credential={state.credentials[editingType]}
                sample={samples[editingType]}
                state={state}
                updateState={updateState}
                onBack={() => setEditingType(null)}
            />
        );
    }

    return (
        <>
            <div className={styles.infoBanner}>
                <span className={styles.infoBannerIcon}>ℹ️</span>
                <span className={styles.infoBannerText}>
                    Clever IDM identifies and matches existing Google accounts automatically.
                    Users with the same email address in Clever and Google will be matched and updated.
                    Make sure existing Google email addresses are updated in your SIS so Clever can match them.
                </span>
            </div>

            <h1 className={styles.stepTitle}>Set login credentials</h1>

            <div className={styles.progressRow}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${(completedCount / types.length) * 100}%` }}
                    />
                </div>
                <span className={styles.progressText}>
                    {completedCount} of {types.length} steps
                </span>
            </div>

            <div className={styles.cardGrid}>
                {state.provisionStudents && (
                    <CredentialCard
                        title="Student credentials"
                        userType="students"
                        credential={state.credentials.students}
                        onEdit={() => { checkActionGoal("credential-edit-students"); setEditingType("students"); }}
                    />
                )}
                {state.provisionTeachers && (
                    <CredentialCard
                        title="Teacher credentials"
                        userType="teachers"
                        credential={state.credentials.teachers}
                        onEdit={() => { checkActionGoal("credential-edit-teachers"); setEditingType("teachers"); }}
                    />
                )}
                {state.provisionStaff && (
                    <CredentialCard
                        title="Staff credentials"
                        userType="staff"
                        credential={state.credentials.staff}
                        onEdit={() => { checkActionGoal("credential-edit-staff"); setEditingType("staff"); }}
                    />
                )}
            </div>

            <div className={styles.helpBanner}>
                <span className={styles.helpBannerIcon}>⚙️</span>
                <span className={styles.helpBannerText}>
                    Need help setting up your login credentials? Check out the{" "}
                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                        Set login credentials section
                    </a>{" "}
                    of our Clever IDM course in Clever Academy!
                </span>
            </div>

            <div className={styles.nextBtnRow}>
                <button className={styles.nextBtn} onClick={goNext}>
                    Organize OUs
                </button>
            </div>
        </>
    );
}
