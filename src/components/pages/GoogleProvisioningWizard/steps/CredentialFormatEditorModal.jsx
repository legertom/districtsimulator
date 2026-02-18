"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui";
import {
    EMAIL_SIS_VARIABLES,
    FORMAT_FUNCTIONS,
} from "@/data/defaults/idm-provisioning";
import styles from "../GoogleProvisioningWizard.module.css";

/* ── Helpers ──────────────────────────────────── */

/** Resolve a credential format segment array to a preview username string */
export function resolveEmailPreview(rows, sampleUser, domain) {
    if (!rows?.length) return "";
    const username = rows
        .map((seg) => {
            if (seg.type === "text") return seg.value;
            if (seg.type === "variable") {
                const map = {
                    "name.first": sampleUser.name?.split(" ")[0]?.toLowerCase() || "",
                    "name.last": sampleUser.name?.split(" ").slice(1).join("").toLowerCase() || "",
                    "student.sis_id": sampleUser.sisId || "",
                    "student.student_number": sampleUser.studentNumber || "",
                    "student.state_id": sampleUser.stateId || "",
                    "student.district_username": sampleUser.districtUsername || "",
                    "teacher.sis_id": sampleUser.sisId || "",
                    "teacher.teacher_number": sampleUser.teacherNumber || "",
                    "staff.sis_id": sampleUser.sisId || "",
                    "staff.title": sampleUser.title?.toLowerCase() || "",
                };
                return map[seg.variable] ?? seg.variable;
            }
            if (seg.type === "function") return `[${seg.fn}]`;
            return "";
        })
        .join("");
    return domain ? `${username}@${domain}` : username;
}

/** Convert format segments back to emailTokens display array */
export function formatToTokens(rows) {
    return rows
        .filter((seg) => seg.type === "variable")
        .map((seg) => `{{${seg.variable}}}`);
}

/** Build an email template string from format segments + domain */
export function formatToEmailString(rows, domain) {
    const username = rows
        .map((seg) => {
            if (seg.type === "text") return seg.value;
            if (seg.type === "variable") return `{{${seg.variable}}}`;
            if (seg.type === "function") return `[${seg.fn}]`;
            return "";
        })
        .join("");
    return `${username}@${domain}`;
}

/* ── Format Row Component ─────────────────────── */

function FormatRow({ row, index, total, onMoveUp, onMoveDown, onChange, onRemove, userType }) {
    const typeBadgeClass =
        row.type === "variable"
            ? `${styles.formatRowType} ${styles.formatRowTypeVariable}`
            : row.type === "function"
            ? `${styles.formatRowType} ${styles.formatRowTypeFunction}`
            : `${styles.formatRowType} ${styles.formatRowTypeText}`;

    const typeLabel =
        row.type === "variable" ? "Variable" : row.type === "function" ? "Function" : "Text";

    return (
        <div className={styles.formatRow}>
            <div className={styles.formatRowArrows}>
                <button
                    className={styles.formatRowArrowBtn}
                    disabled={index === 0}
                    onClick={() => onMoveUp(index)}
                    title="Move up"
                >
                    ▲
                </button>
                <button
                    className={styles.formatRowArrowBtn}
                    disabled={index === total - 1}
                    onClick={() => onMoveDown(index)}
                    title="Move down"
                >
                    ▼
                </button>
            </div>

            <span className={typeBadgeClass}>{typeLabel}</span>

            <div className={styles.formatRowValue}>
                {row.type === "text" && (
                    <input
                        className={styles.formatRowInput}
                        value={row.value}
                        onChange={(e) => onChange(index, { ...row, value: e.target.value })}
                    />
                )}
                {row.type === "variable" && (
                    <select
                        className={styles.formatRowSelect}
                        value={row.variable}
                        onChange={(e) => {
                            const v = EMAIL_SIS_VARIABLES[userType]?.find(
                                (sv) => sv.variable === e.target.value
                            );
                            onChange(index, {
                                ...row,
                                variable: e.target.value,
                                label: v?.label || e.target.value,
                            });
                        }}
                    >
                        {(EMAIL_SIS_VARIABLES[userType] || []).map((v) => (
                            <option key={v.variable} value={v.variable}>
                                {v.label}
                            </option>
                        ))}
                    </select>
                )}
                {row.type === "function" && (
                    <span style={{ fontSize: 14, color: "var(--gray-700)" }}>{row.fn}</span>
                )}
            </div>

            <button
                className={styles.formatRowRemoveBtn}
                onClick={() => onRemove(index)}
                title="Remove"
            >
                &times;
            </button>
        </div>
    );
}

/* ── Main Modal Component ─────────────────────── */

export default function CredentialFormatEditorModal({
    userType,
    format,
    domain,
    sampleUser,
    onSave,
    onCancel,
    title,
}) {
    const [rows, setRows] = useState(() => (format?.length ? [...format.map((r) => ({ ...r }))] : []));
    const [functionsOpen, setFunctionsOpen] = useState(false);
    const funcRef = useRef(null);

    useEffect(() => {
        if (!functionsOpen) return;
        const handler = (e) => {
            if (funcRef.current && !funcRef.current.contains(e.target)) {
                setFunctionsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [functionsOpen]);

    /* ── Row operations ─────── */

    const moveUp = (i) => {
        if (i === 0) return;
        setRows((prev) => {
            const next = [...prev];
            [next[i - 1], next[i]] = [next[i], next[i - 1]];
            return next;
        });
    };

    const moveDown = (i) => {
        setRows((prev) => {
            if (i >= prev.length - 1) return prev;
            const next = [...prev];
            [next[i], next[i + 1]] = [next[i + 1], next[i]];
            return next;
        });
    };

    const updateRow = (i, updated) => {
        setRows((prev) => prev.map((r, idx) => (idx === i ? updated : r)));
    };

    const removeRow = (i) => {
        setRows((prev) => prev.filter((_, idx) => idx !== i));
    };

    /* ── Add actions ─────── */

    const addVariable = () => {
        const vars = EMAIL_SIS_VARIABLES[userType] || [];
        const first = vars[0];
        setRows((prev) => [
            ...prev,
            { type: "variable", variable: first?.variable || "name.first", label: first?.label || "First Name" },
        ]);
    };

    const addCustomText = () => {
        setRows((prev) => [...prev, { type: "text", value: "" }]);
    };

    const addDot = () => {
        setRows((prev) => [...prev, { type: "text", value: "." }]);
    };

    const addFunction = (fn) => {
        setRows((prev) => [...prev, { type: "function", fn }]);
        setFunctionsOpen(false);
    };

    const startOver = () => {
        setRows([]);
    };

    /* ── Derived ─────── */

    const userTypeLabel = userType === "students" ? "student" : userType === "teachers" ? "teacher" : "staff";
    const previewEmail = resolveEmailPreview(rows, sampleUser, domain);

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={title || `Build email format for ${userTypeLabel}s`}
            maxWidth="900px"
        >
            <div className={styles.formatEditorBody}>
                {/* Left column: builder */}
                <div className={styles.formatEditorLeft}>
                    <p className={styles.formatEditorSubtitle}>
                        Configure how {userTypeLabel} email usernames are constructed.
                        The domain <strong>@{domain}</strong> will be appended automatically.
                    </p>
                    <p className={styles.formatEditorLinks}>
                        <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                            Learn more about formats
                        </a>
                        {" | "}
                        <a
                            href="#"
                            className={styles.helpLink}
                            onClick={(e) => {
                                e.preventDefault();
                                startOver();
                            }}
                        >
                            Start over
                        </a>
                    </p>

                    {/* Rows */}
                    {rows.map((row, i) => (
                        <FormatRow
                            key={i}
                            row={row}
                            index={i}
                            total={rows.length}
                            onMoveUp={moveUp}
                            onMoveDown={moveDown}
                            onChange={updateRow}
                            onRemove={removeRow}
                            userType={userType}
                        />
                    ))}

                    {rows.length === 0 && (
                        <div
                            style={{
                                padding: 24,
                                textAlign: "center",
                                color: "var(--gray-500)",
                                fontSize: 14,
                                border: "2px dashed var(--gray-200)",
                                borderRadius: 8,
                                marginBottom: 8,
                            }}
                        >
                            No format segments yet. Use the buttons below to build your email format.
                        </div>
                    )}

                    {/* Add buttons */}
                    <div className={styles.addButtonsRow}>
                        <button className={styles.addBtn} onClick={addDot}>
                            + Add &quot;.&quot;
                        </button>
                        <button className={styles.addBtn} onClick={addVariable}>
                            + Add an SIS Variable
                        </button>
                        <button className={styles.addBtn} onClick={addCustomText}>
                            + Add Custom Text
                        </button>
                        <div className={styles.addBtnWrapper} ref={funcRef}>
                            <button
                                className={styles.addBtn}
                                onClick={() => setFunctionsOpen((v) => !v)}
                            >
                                + Add a Function ▼
                            </button>
                            {functionsOpen && (
                                <div className={styles.functionsMenu}>
                                    {FORMAT_FUNCTIONS.map((fn) => (
                                        <button
                                            key={fn}
                                            className={styles.functionsMenuItem}
                                            onClick={() => addFunction(fn)}
                                        >
                                            {fn}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.modalFooter}>
                        <button className={styles.nextBtn} onClick={() => onSave(rows)}>
                            Save format
                        </button>
                        <button className={styles.cancelBtn} onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Right column: preview */}
                <div className={styles.formatEditorRight}>
                    <div className={styles.modalPreviewPanel}>
                        <div className={styles.modalPreviewSection}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-600)", marginBottom: 8 }}>
                                PREVIEW
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", marginBottom: 2 }}>
                                    USER NAME
                                </div>
                                <select
                                    style={{
                                        width: "100%",
                                        padding: "6px 8px",
                                        border: "1px solid var(--gray-300)",
                                        borderRadius: 4,
                                        fontSize: 13,
                                        background: "white",
                                    }}
                                    defaultValue={sampleUser.name}
                                >
                                    <option>{sampleUser.name}</option>
                                </select>
                            </div>

                            {rows.length > 0 && (
                                <div className={styles.modalPreviewResult}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-900)" }}>
                                        Example email
                                    </div>
                                    <div style={{ fontSize: 14, color: "var(--gray-800)", marginTop: 4, wordBreak: "break-all" }}>
                                        {previewEmail}
                                    </div>
                                </div>
                            )}

                            {rows.length === 0 && (
                                <div style={{ fontSize: 13, color: "var(--gray-500)", fontStyle: "italic" }}>
                                    Add format segments to see a preview.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
