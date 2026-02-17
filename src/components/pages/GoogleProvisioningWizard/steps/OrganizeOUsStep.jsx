"use client";

import React, { useState } from "react";
import {
    GOOGLE_ORG_UNITS,
    ARCHIVE_ACTIONS,
    SAMPLE_STUDENT,
    SAMPLE_TEACHER,
    SAMPLE_STAFF,
} from "@/data/defaults/idm-provisioning";
import FormatEditorModal from "./FormatEditorModal";
import styles from "../GoogleProvisioningWizard.module.css";

/* ── Shared Icons ─────────────────────────────── */

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 6l2.5 2.5L9 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const FolderIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path d="M2 4a1 1 0 011-1h3.586a1 1 0 01.707.293L8.707 4.7A1 1 0 009.414 5H13a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" fill="#6b7280" />
    </svg>
);

const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" fill="#6b7280" />
        <path d="M3 14c0-2.761 2.239-5 5-5s5 2.239 5 5" fill="#6b7280" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M13.5 2.5v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.5 8A5.5 5.5 0 0112.12 4.12L13.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.5 13.5v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 8A5.5 5.5 0 013.88 11.88L2.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const EyeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

/* ── Helpers ───────────────────────────────────── */

function findOUById(nodes, id) {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children?.length) {
            const found = findOUById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

function flattenOUTree(nodes) {
    const result = [];
    function walk(nodes) {
        for (const n of nodes) {
            result.push(n);
            if (n.children?.length) walk(n.children);
        }
    }
    walk(nodes);
    return result;
}

/** Render a format segment array into a preview path string */
function renderFormatPreview(format, sampleUser) {
    if (!format?.length) return "";
    return format.map((seg) => {
        if (seg.type === "text") return seg.value;
        if (seg.type === "variable") {
            const varMap = {
                "school_name": sampleUser.school,
                "student.grade": sampleUser.grade?.replace(/[^0-9]/g, "") || "",
                "student.student_number": sampleUser.studentNumber || "",
                "student.graduation_year": sampleUser.graduationYear || "",
                "staff.department": sampleUser.department || "",
                "staff.title": sampleUser.title || "",
                "teacher.title": sampleUser.title || "",
            };
            return varMap[seg.variable] || seg.variable;
        }
        if (seg.type === "function") return `[${seg.fn}]`;
        return "";
    }).join("");
}

/* ── Google Org Unit Tree ─────────────────────── */

function OrgUnitNode({ node, depth, mode, selectedId, selectedIds, onSelect, expanded, onToggle }) {
    const isRadio = mode === "radio";
    const isChecked = isRadio ? selectedId === node.id : selectedIds?.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];

    return (
        <>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    paddingLeft: 16 + depth * 24,
                    borderBottom: "1px solid var(--gray-100)",
                    cursor: "pointer",
                }}
                onClick={() => onSelect(node.id)}
            >
                <input
                    type={isRadio ? "radio" : "checkbox"}
                    checked={isChecked}
                    onChange={() => onSelect(node.id)}
                    style={{ accentColor: "var(--clever-blue)", width: 18, height: 18, cursor: "pointer" }}
                />
                {hasChildren && (
                    <span
                        onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
                        style={{ cursor: "pointer", fontSize: 12, color: "var(--gray-500)", userSelect: "none" }}
                    >
                        {isExpanded ? "▾" : "▸"}
                    </span>
                )}
                <span style={{ fontSize: 14, color: "var(--gray-900)" }}>{node.name}</span>
            </div>
            {hasChildren && isExpanded && node.children.map((child) => (
                <OrgUnitNode
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                    mode={mode}
                    selectedId={selectedId}
                    selectedIds={selectedIds}
                    onSelect={onSelect}
                    expanded={expanded}
                    onToggle={onToggle}
                />
            ))}
        </>
    );
}

function GoogleOrgUnitTree({ mode, selectedId, selectedIds, onSelect, setToast }) {
    const [expanded, setExpanded] = useState({ root: true, students: true, users: true, "users-staff": true });

    const onToggle = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div style={{ border: "1px solid var(--gray-200)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderBottom: "1px solid var(--gray-200)", background: "white",
            }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>Your Google Org Units</span>
                <button
                    onClick={() => setToast("Refreshing Google Org Units...")}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: "none", border: "none", color: "var(--clever-blue)",
                        fontSize: 14, fontWeight: 500, cursor: "pointer",
                    }}
                >
                    <RefreshIcon /> Refresh
                </button>
            </div>
            {GOOGLE_ORG_UNITS.map((node) => (
                <OrgUnitNode
                    key={node.id}
                    node={node}
                    depth={0}
                    mode={mode}
                    selectedId={selectedId}
                    selectedIds={selectedIds}
                    onSelect={onSelect}
                    expanded={expanded}
                    onToggle={onToggle}
                />
            ))}
        </div>
    );
}

/* ── Preview Panel (right sidebar) ────────────── */

function OUPreviewPanel({ selectedOU, sampleUser, userType }) {
    const ou = findOUById(GOOGLE_ORG_UNITS, selectedOU);
    if (!ou) return null;

    // Build path segments from root to selected OU
    const segments = [];
    function buildPath(nodes, targetId, path) {
        for (const n of nodes) {
            const newPath = [...path, n];
            if (n.id === targetId) { segments.push(...newPath); return true; }
            if (n.children?.length && buildPath(n.children, targetId, newPath)) return true;
        }
        return false;
    }
    buildPath(GOOGLE_ORG_UNITS, selectedOU, []);

    return (
        <div style={{
            border: "1px solid var(--gray-200)", borderRadius: 8, padding: 16,
            background: "white", marginBottom: 16,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
                <EyeIcon /> Preview
            </div>
            <div style={{ fontSize: 13 }}>
                {segments.map((seg, i) => (
                    <div key={seg.id} style={{ paddingLeft: i * 16, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                        {i < segments.length - 1 ? "▸" : "▸"} <FolderIcon size={12} /> {seg.name}
                    </div>
                ))}
                {sampleUser && (
                    <>
                        {userType === "students" && sampleUser.school && (
                            <div style={{ paddingLeft: segments.length * 16, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                                ▸ <FolderIcon size={12} /> {sampleUser.school}
                                <div style={{ paddingLeft: 16, display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                                    ▸ <FolderIcon size={12} /> {sampleUser.grade?.replace(/\D+$/, "").replace(/\D+/, "") || "7"}
                                </div>
                            </div>
                        )}
                        <div style={{
                            paddingLeft: (segments.length + (userType === "students" ? 2 : 0)) * 16,
                            display: "flex", alignItems: "center", gap: 4, marginTop: 4,
                        }}>
                            <UserIcon /> {sampleUser.name}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function CleverTipPanel({ userType }) {
    const tips = {
        students: "Don\u2019t see a parent OU to place students? Create a new OU in your Google Admin Console and it will appear in the table.",
        teachers: "Don\u2019t see a parent OU to place teachers? Create a new OU in your Google Admin Console and it will appear in the table.",
        staff: "Don\u2019t see a parent OU to place staff? Create a new OU in your Google Admin Console and it will appear in the table.",
        archive: "Clever uses SIS ID to reactivate user accounts if they return to the district in less than a year.",
        ignored: "OUs you selected in previous steps to place Clever users cannot be ignored.",
    };

    return (
        <div style={{
            border: "1px solid var(--gray-200)", borderRadius: 8, padding: 16,
            background: "white",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                ℹ️ Clever Tip
            </div>
            <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.5, margin: 0 }}>
                {tips[userType]}
            </p>
        </div>
    );
}

/* ── User Type OU Edit View (Student/Teacher/Staff) ── */

function UserTypeOUEditView({ userType, title, state, updateState, onBack, setToast }) {
    const samples = { students: SAMPLE_STUDENT, teachers: SAMPLE_TEACHER, staff: SAMPLE_STAFF };
    const sample = samples[userType];
    const ou = state.ous[userType];
    const [selectedOU, setSelectedOU] = useState(ou.selectedOU || "");
    const [section3Visible, setSection3Visible] = useState(false);
    const [formatEditorOpen, setFormatEditorOpen] = useState(false);

    const cleverDataFields = {
        students: [
            { label: "School", value: sample.school || "—" },
            { label: "Grade", value: sample.grade || "—" },
            { label: "Graduation Year", value: `Class of ${sample.graduationYear}` },
        ],
        teachers: [
            { label: "School", value: sample.school || "—" },
            { label: "Title", value: sample.title || "—" },
        ],
        staff: [
            { label: "Title", value: sample.title || "—" },
        ],
    };

    const section3Tips = {
        students: "Clever will dynamically create sub-OUs based on student profile data or match existing sub-OUs (case insensitive) within Student Users.",
        teachers: "Clever will dynamically create sub-OUs based on student profile data or match existing sub-OUs (case insensitive) within Teacher Users.",
        staff: "Want to use another staff attribute for organizing OUs? Learn more about the extension fields supported for creating sub-OUs in this help center article.",
    };

    const handleSelect = (id) => {
        setSelectedOU(id);
        const ouNode = findOUById(GOOGLE_ORG_UNITS, id);
        if (ouNode) {
            updateState({
                ous: {
                    ...state.ous,
                    [userType]: { ...ou, selectedOU: id, path: ouNode.path, completed: true },
                },
            });
        }
    };

    const handleNextStep = () => {
        if (!section3Visible) {
            setSection3Visible(true);
        } else {
            setToast(`${title} configuration saved.`);
            onBack();
        }
    };

    const handleFormatSave = (newFormat) => {
        updateState({
            ous: {
                ...state.ous,
                [userType]: { ...state.ous[userType], subOUFormat: newFormat },
            },
        });
        setFormatEditorOpen(false);
    };

    const currentFormat = state.ous[userType]?.subOUFormat || [];
    const selectedOUPath = selectedOU ? (findOUById(GOOGLE_ORG_UNITS, selectedOU)?.path || "/") : "/";

    return (
        <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <h1 className={styles.stepTitle}>{title}</h1>
                <p className={styles.stepDescription}>
                    Organize {userType} into your existing Google OU structure and create optional sub-OUs based on Clever {userType.slice(0, -1)} data.{" "}
                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                        Learn more about sub-OUs.
                    </a>
                </p>

                {/* Section 1: Preview user */}
                <div className={styles.card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0" }}>
                        1. Preview any {userType.slice(0, -1)} with an existing Clever account.
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
                        <div style={{ fontSize: 13 }}>
                            {cleverDataFields[userType].map((field) => (
                                <div key={field.label} style={{ marginBottom: 4 }}>
                                    <strong>{field.label}</strong> {field.value}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 2: Select parent OU */}
                <div className={styles.card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0" }}>
                        2. Select a parent OU to place all {userType}
                    </h3>
                    <GoogleOrgUnitTree
                        mode="radio"
                        selectedId={selectedOU}
                        onSelect={handleSelect}
                        setToast={setToast}
                    />
                </div>

                {/* Section 3: Sub-OU format (revealed on "Next step") */}
                {section3Visible && (
                    <div className={`${styles.card} ${styles.section3Container}`}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0" }}>
                            3. Which sub-OUs do you want to create inside of {selectedOUPath} OU? (Optional)
                        </h3>

                        {currentFormat.length > 0 ? (
                            <>
                                <div className={styles.formatTagRow}>
                                    {currentFormat.map((seg, i) => (
                                        <span key={i} className={seg.type === "variable" ? styles.formatTag : styles.formatTagText}>
                                            {seg.type === "variable" ? `{{${seg.variable}}}` : seg.value}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    className={styles.editFormatLink}
                                    onClick={() => setFormatEditorOpen(true)}
                                >
                                    Edit your format
                                </button>
                            </>
                        ) : (
                            <button className={styles.buildFormatBtn} onClick={() => setFormatEditorOpen(true)}>
                                Build your format
                            </button>
                        )}

                        {/* OU placement preview */}
                        <div className={styles.ouPlacementPreview}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>
                                🔵 {sample.name}&apos;s OU placement
                            </div>
                            <div style={{ fontSize: 13, color: "var(--gray-600)", marginTop: 4 }}>
                                <span className={styles.ouPlacementLabel}>Example OU</span>{" "}
                                {selectedOUPath}{renderFormatPreview(currentFormat, sample)}
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.helpBanner}>
                    <span className={styles.helpBannerIcon}>⚙️</span>
                    <span className={styles.helpBannerText}>
                        For additional information please see the{" "}
                        <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                            Organize OUs section
                        </a>{" "}
                        of our Clever IDM course in Clever Academy.
                    </span>
                </div>

                <div className={styles.nextBtnRow}>
                    <button className={styles.nextBtn} onClick={handleNextStep}>
                        {section3Visible ? "Save" : "Next step"}
                    </button>
                </div>
            </div>

            {/* Right sidebar */}
            <div style={{ width: 220, flexShrink: 0 }}>
                {selectedOU && (
                    <OUPreviewPanel selectedOU={selectedOU} sampleUser={sample} userType={userType} />
                )}
                {section3Visible ? (
                    <div style={{
                        border: "1px solid var(--gray-200)", borderRadius: 8, padding: 16,
                        background: "white",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                            ℹ️ Clever Tip
                        </div>
                        <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.5, margin: 0 }}>
                            {section3Tips[userType]}
                            {userType === "staff" && (
                                <>
                                    {" "}
                                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                                        help center article
                                    </a>.
                                </>
                            )}
                            {userType !== "staff" && (
                                <>
                                    {" "}
                                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                                        Learn more about sub-OUs
                                    </a>.
                                </>
                            )}
                        </p>
                    </div>
                ) : (
                    <CleverTipPanel userType={userType} />
                )}
            </div>

            {/* Format Editor Modal */}
            {formatEditorOpen && (
                <FormatEditorModal
                    userType={userType}
                    format={currentFormat}
                    sampleUser={sample}
                    selectedOUPath={selectedOUPath}
                    onSave={handleFormatSave}
                    onCancel={() => setFormatEditorOpen(false)}
                />
            )}
        </div>
    );
}

/* ── Archive OU Edit View ─────────────────────── */

function ArchiveOUEditView({ state, updateState, onBack, setToast }) {
    const ou = state.ous.archive;
    const [selectedOU, setSelectedOU] = useState(ou.selectedOU || "");
    const [archiveAction, setArchiveAction] = useState(ou.archiveAction || "move-suspend");

    const handleSelect = (id) => {
        setSelectedOU(id);
        const ouNode = findOUById(GOOGLE_ORG_UNITS, id);
        if (ouNode) {
            updateState({
                ous: {
                    ...state.ous,
                    archive: { ...ou, selectedOU: id, path: ouNode.path, completed: true, archiveAction },
                },
            });
        }
    };

    const handleActionChange = (actionId) => {
        setArchiveAction(actionId);
        updateState({
            ous: {
                ...state.ous,
                archive: { ...ou, archiveAction: actionId },
            },
        });
    };

    const handleSave = () => {
        setToast("Archive OU configuration saved.");
        onBack();
    };

    return (
        <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <h1 className={styles.stepTitle}>Archive OU</h1>

                {/* Section 1: Select parent OU */}
                <div className={styles.card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px 0" }}>
                        1. Select a parent OU to place users that are removed from Clever.
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.5, margin: "0 0 12px 0" }}>
                        Users will be placed in the corresponding sub-OU for their type: /Students, /Teachers, or /Staff.
                    </p>
                    <GoogleOrgUnitTree
                        mode="radio"
                        selectedId={selectedOU}
                        onSelect={handleSelect}
                        setToast={setToast}
                    />
                </div>

                {/* Archive OU Preview */}
                <div style={{
                    border: "1px solid var(--gray-200)", borderRadius: 8, padding: 16,
                    background: "var(--gray-50)", marginBottom: 16,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                        <EyeIcon /> Archive OU Preview
                    </div>
                    <div style={{ fontSize: 13, color: "var(--gray-700)" }}>
                        {selectedOU ? (
                            <>
                                <div>{findOUById(GOOGLE_ORG_UNITS, selectedOU)?.path || "/"}/Students</div>
                                <div>{findOUById(GOOGLE_ORG_UNITS, selectedOU)?.path || "/"}/Teachers</div>
                                <div>{findOUById(GOOGLE_ORG_UNITS, selectedOU)?.path || "/"}/Staff</div>
                            </>
                        ) : (
                            <>
                                <div>{"//Students"}</div>
                                <div>{"//Teachers"}</div>
                                <div>{"//Staff"}</div>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.helpBanner}>
                    <span className={styles.helpBannerIcon}>⚙️</span>
                    <span className={styles.helpBannerText}>
                        For additional information please see the{" "}
                        <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                            Organize OUs section
                        </a>{" "}
                        of our Clever IDM course in Clever Academy.
                    </span>
                </div>

                {/* Section 2: Archive action */}
                <div className={styles.card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0" }}>
                        2. Select an action to take for users removed from Clever.
                    </h3>
                    {ARCHIVE_ACTIONS.map((action) => (
                        <label
                            key={action.id}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "8px 0", cursor: "pointer", fontSize: 14, color: "var(--gray-900)",
                            }}
                        >
                            <input
                                type="radio"
                                name="archiveAction"
                                checked={archiveAction === action.id}
                                onChange={() => handleActionChange(action.id)}
                                style={{ accentColor: "var(--clever-blue)", width: 18, height: 18 }}
                            />
                            {action.label}
                            {action.learnMore && (
                                <>
                                    {" ("}
                                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                                        Learn more about archives in Google
                                    </a>
                                    {")"}
                                </>
                            )}
                        </label>
                    ))}
                </div>

                <div className={styles.nextBtnRow}>
                    <button className={styles.nextBtn} onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div>

            {/* Right sidebar */}
            <div style={{ width: 220, flexShrink: 0 }}>
                <CleverTipPanel userType="archive" />
            </div>
        </div>
    );
}

/* ── Ignored OUs Edit View ────────────────────── */

function IgnoredOUsEditView({ state, updateState, onBack, setToast }) {
    const ou = state.ous.ignored;
    const [selectedIds, setSelectedIds] = useState(ou.ignoredOUs || []);
    const [section2Visible, setSection2Visible] = useState(false);
    const [handling, setHandling] = useState({
        students: ou.handling?.students || "auto-suspend",
        teachers: ou.handling?.teachers || "auto-suspend",
        staff: ou.handling?.staff || "auto-suspend",
    });

    const ignoredHandlingOptions = [
        {
            id: "auto-suspend",
            label: "Automatically suspend user accounts in ignored OUs when they're removed from Clever.",
        },
        {
            id: "manual-suspend",
            label: "Don't automatically suspend user accounts in ignored OUs when they're removed from Clever. I will suspend these user accounts myself.",
        },
        {
            id: "do-nothing",
            label: "Don't match, update, or suspend users in ignored OUs. I will handle these user accounts myself.",
        },
    ];

    const persistIgnoredState = (nextIgnoredIds, nextHandling = handling) => {
        const paths = nextIgnoredIds.map((nid) => findOUById(GOOGLE_ORG_UNITS, nid)?.path || "/").join(", ") || "/";
        updateState({
            ous: {
                ...state.ous,
                ignored: {
                    ...ou,
                    ignoredOUs: nextIgnoredIds,
                    path: paths,
                    handling: nextHandling,
                    completed: true,
                },
            },
        });
    };

    const handleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            persistIgnoredState(next);
            return next;
        });
    };

    const handleHandlingChange = (userType, optionId) => {
        const nextHandling = {
            ...handling,
            [userType]: optionId,
        };
        setHandling(nextHandling);
        persistIgnoredState(selectedIds, nextHandling);
    };

    const handleNextStep = () => {
        if (!section2Visible) {
            setSection2Visible(true);
            return;
        }

        setToast("Ignored OUs configuration saved.");
        onBack();
    };

    return (
        <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <h1 className={styles.stepTitle}>Ignored OUs (optional)</h1>

                <div className={styles.card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px 0" }}>
                        1. Select OUs you want Clever to ignore. Users will not be moved out of these OUs when Clever runs an IDM sync.
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.5, margin: "0 0 4px 0" }}>
                        <strong>You don&apos;t need to select OUs as ignored</strong> if they aren&apos;t related to users managed by Clever.
                    </p>
                    <p style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.5, margin: "0 0 12px 0" }}>
                        <strong>You may consider selecting an OU as ignored</strong> if you have a particular group of users you would like to manage manually, but they are in a parent OU that would otherwise be managed by Clever (e.g. a group of students who you want to have YouTube access restricted).
                    </p>
                    <GoogleOrgUnitTree
                        mode="checkbox"
                        selectedIds={selectedIds}
                        onSelect={handleSelect}
                        setToast={setToast}
                    />

                    {/* Ignored OU Preview */}
                    <div className={styles.ouPlacementPreview}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                            <EyeIcon /> Ignored OU Preview
                        </div>
                        <div style={{ fontSize: 13, color: "var(--gray-700)" }}>
                            {selectedIds.length > 0
                                ? selectedIds.map((id) => (
                                    <div key={id}>{findOUById(GOOGLE_ORG_UNITS, id)?.path || "/"}</div>
                                ))
                                : <div>/</div>
                            }
                        </div>
                    </div>
                </div>

                {section2Visible && (
                    <>
                        {[
                            { key: "students", step: 2, label: "STUDENTS" },
                            { key: "teachers", step: 3, label: "TEACHERS" },
                            { key: "staff", step: 4, label: "STAFF" },
                        ].map((section) => (
                            <div key={section.key} className={`${styles.card} ${styles.section3Container}`}>
                                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0" }}>
                                    {section.step}. For {section.label}, How do you want Clever IDM to handle these accounts in ignored OUs?
                                </h3>
                                {ignoredHandlingOptions.map((option) => (
                                    <label
                                        key={`${section.key}-${option.id}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 10,
                                            padding: "8px 0",
                                            cursor: "pointer",
                                            fontSize: 14,
                                            color: "var(--gray-900)",
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name={`ignored-${section.key}-handling`}
                                            checked={handling[section.key] === option.id}
                                            onChange={() => handleHandlingChange(section.key, option.id)}
                                            style={{ accentColor: "var(--clever-blue)", width: 18, height: 18, marginTop: 2, flexShrink: 0 }}
                                        />
                                        <span style={{ lineHeight: 1.35 }}>{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        ))}
                    </>
                )}

                <div className={styles.helpBanner}>
                    <span className={styles.helpBannerIcon}>⚙️</span>
                    <span className={styles.helpBannerText}>
                        For additional information please see the{" "}
                        <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                            Organize OUs section
                        </a>{" "}
                        of our Clever IDM course in Clever Academy.
                    </span>
                </div>

                <div className={styles.nextBtnRow}>
                    <button className={styles.nextBtn} onClick={handleNextStep}>
                        {section2Visible ? "Save" : "Next step"}
                    </button>
                </div>
            </div>

            {/* Right sidebar */}
            <div style={{ width: 220, flexShrink: 0 }}>
                <CleverTipPanel userType="ignored" />
            </div>
        </div>
    );
}

/* ── OUs Overview Card ────────────────────────── */

function OUCard({ title, ou, label, onEdit }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                    {title}
                    {ou.completed && (
                        <span className={styles.completedBadge}>
                            <CheckIcon /> Completed
                        </span>
                    )}
                </div>
                <button className={styles.editBtn} onClick={onEdit}>Edit</button>
            </div>
            <div>
                <div className={styles.cardLabel}>{label}</div>
                <div className={styles.cardValue}>{ou.path}</div>
            </div>
        </div>
    );
}

/* ── Main Export ───────────────────────────────── */

export default function OrganizeOUsStep({ state, updateState, goNext, setToast }) {
    const [editingType, setEditingType] = useState(null);

    const ouTypes = [];
    if (state.provisionStudents) ouTypes.push({ key: "students", title: "Student OUs", label: "OUS CREATED" });
    if (state.provisionTeachers) ouTypes.push({ key: "teachers", title: "Teacher OUs", label: "OUS CREATED" });
    if (state.provisionStaff) ouTypes.push({ key: "staff", title: "Staff OUs", label: "OUS CREATED" });
    ouTypes.push({ key: "archive", title: "Archive OU", label: "ARCHIVE OU" });
    ouTypes.push({ key: "ignored", title: "Ignored OUs (optional)", label: "IGNORED OUS" });

    const completedCount = ouTypes.filter((t) => state.ous[t.key]?.completed).length;

    const titles = { students: "Student OUs", teachers: "Teacher OUs", staff: "Staff OUs" };

    // Edit views
    if (editingType === "archive") {
        return (
            <ArchiveOUEditView
                state={state}
                updateState={updateState}
                onBack={() => setEditingType(null)}
                setToast={setToast}
            />
        );
    }

    if (editingType === "ignored") {
        return (
            <IgnoredOUsEditView
                state={state}
                updateState={updateState}
                onBack={() => setEditingType(null)}
                setToast={setToast}
            />
        );
    }

    if (editingType && ["students", "teachers", "staff"].includes(editingType)) {
        return (
            <UserTypeOUEditView
                userType={editingType}
                title={titles[editingType]}
                state={state}
                updateState={updateState}
                onBack={() => setEditingType(null)}
                setToast={setToast}
            />
        );
    }

    // Overview
    return (
        <>
            <div className={styles.infoBanner}>
                <span className={styles.infoBannerIcon}>ℹ️</span>
                <span className={styles.infoBannerText}>
                    Clever IDM recommends an Organizational Unit (OU) setup based on SIS data.
                    For additional information please see the{" "}
                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                        Organize OUs section
                    </a>{" "}
                    of our Clever IDM course in Clever Academy. For questions about setting up your OU
                    hierarchy you can{" "}
                    <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                        contact support
                    </a>.
                </span>
            </div>

            <h1 className={styles.stepTitle}>Organize OUs</h1>

            <div className={styles.progressRow}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${(completedCount / ouTypes.length) * 100}%` }}
                    />
                </div>
                <span className={styles.progressText}>
                    {completedCount} of {ouTypes.length} steps
                </span>
            </div>

            <div className={styles.cardGrid}>
                {ouTypes.map((t) => (
                    <OUCard
                        key={t.key}
                        title={t.title}
                        ou={state.ous[t.key]}
                        label={t.label}
                        onEdit={() => setEditingType(t.key)}
                    />
                ))}
            </div>

            <div className={styles.nextBtnRow}>
                <button className={styles.nextBtn} onClick={goNext}>
                    Configure groups
                </button>
            </div>
        </>
    );
}
