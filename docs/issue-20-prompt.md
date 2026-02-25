# Issue #20: Clever Profiles (Students, Teachers, Staff)

> **Copy-paste this entire document** into a new AI chat session pointed at the District Simulator repo.
> The bot should execute all tasks, run tests, lint, and commit.

---

## Overview

Build three dedicated profile pages (Student, Teacher, Staff) that **faithfully replicate the real Clever dashboard profile layout**. Each profile is a tabbed page with a hero header, stats bar, card-based detail sections, and a conditional Clever IDM Information card (visible only after IDM setup is complete).

**Layout by user type (matches real Clever):**

| User Type | Tabs | Hero Metadata | Stats Bar |
|-----------|------|---------------|-----------|
| **Student** | Overview · Details · Guardians | Grade, School (link), Email | Student Number · Student ID · Last Login · Last Modified |
| **Teacher** | Overview · Details | School (link), Email, "Messaging Enabled" | Teacher Number · State ID · Last Login · Last Modified |
| **Staff** | Details (only) | Title, School (link), Email | — (no stats bar) |

**Routes:** `/dashboard/student-profile/[id]`, `/dashboard/teacher-profile/[id]`, `/dashboard/staff-profile/[id]`

**9 new files, 4 modified files. Implementation order matters — follow task numbers sequentially.**

---

## Visual Reference: Real Clever Profile Layout

The following descriptions are based on screenshots of the real Clever dashboard. Replicate this layout as closely as possible using existing CSS patterns from `Profile.module.css` and `DataBrowser.module.css`.

### Student Profile

**Hero Section:**
- Left: Large circular avatar (60px, gray background, initials)
- Center: Full name (h1, 24px bold), below that "Clever User ID: 5f8a..." (small gray text)
- Below name: Metadata chips inline — Grade badge ("5"), School name (blue link), Email address
- Right: "Actions ▾" dropdown button (outlined blue)

**Stats Bar** (horizontal row of key-value pairs, light gray background):
- Student Number: 000001
- Student ID: JS3YXAGCX5RK
- Last Login to Clever: Feb 24, 2026
- Last Modified: Feb 1, 2026

**Tabs**: Overview | Details | Guardians

**Overview Tab:**
- **Sections table** — full-width table with columns: Section, Term, School, Period, Grade, Subject, Primary Teacher, Students
- **Apps card** — white card with app icons (placeholder: "No apps shared with this user")
- **Logins to Clever chart** — bar chart placeholder (gray empty state: "No login data")

**Details Tab** — 5 white card sections stacked vertically:
1. **Student Information** card — 2-column grid:
   - Student ID, Clever Student ID, Student Number, State ID, District Username, Clever Username, District Password, Clever Password, Grade, Graduation Year, Created, Verified MFA Types
2. **Clever IDM Information** card (conditional — only when IDM setup complete):
   - Google Email, Google ID, Google Password, "Unlink user" link
3. **Personal Information** card — 2-column grid:
   - Email, Date of Birth, Race, Address (full), Gender, Hispanic Ethnicity, Home Language
4. **Sensitive Education Information** card — 2-column grid:
   - Disability Type, Disability Status, ELL Status, FRL Status, Gifted/Talented, IEP Status, Section 504 Status, Unweighted GPA, Weighted GPA
5. **Schools** card — table with columns: School Name, School ID, Grades

**Guardians Tab:**
- Empty state: "This student does not have any guardians." (centered gray text)
- (The simulator has no guardian data, so this is always the empty state)

### Teacher Profile

**Hero Section:**
- Same layout as student but: No Grade chip. Shows School (blue link), Email, "Messaging Enabled" badge (green)
- "Actions ▾" dropdown has different items

**Stats Bar:**
- Teacher Number · State Teacher ID · Last Login to Clever · Last Modified

**Tabs**: Overview | Details

**Overview Tab:** Same structure as student (Sections taught, Apps, Logins chart)

**Details Tab** — 3 white card sections:
1. **Teacher Information** card:
   - Teacher ID, Clever Teacher ID, Teacher Number, State Teacher ID, District Username, Clever Username, District Password, Clever Password, Created, Last Modified, Verified MFA Types
2. **Clever IDM Information** card (conditional):
   - Google Email, Google ID, Google Password, "Unlink user" link
3. **Schools** card — table: School Name, School ID, Grades

### Staff Profile

**Hero Section:**
- Same but shows Title (e.g. "Secretary"), School (blue link), Email
- No stats bar at all

**Tabs**: Details (single tab — no tab bar rendered, just the content)

**Details Tab** — 3 white card sections:
1. **Staff Information** card:
   - Staff ID, Clever Staff ID, Email, Clever Role, District Username, Clever Username, Department, Clever Password, Created, Last Modified, Verified MFA Types
2. **Clever IDM Information** card (conditional):
   - Google Email, Google ID, "Unlink user" link
3. **Schools** card — table: School Name, School ID, Grades

**Bottom of page (still on Details):** Apps card + Logins chart (same as Overview tab on student/teacher)

---

## Data Field Mapping

Many of the real Clever fields don't exist in our mock data. Use the mapping below. Fields marked "hardcoded" get a realistic static value. Fields marked "computed" are derived from provisioning config.

### Student Fields
| Real Clever Field | Mock Data Source | Notes |
|---|---|---|
| Student ID | `student.stateId` | |
| Clever Student ID | `student.id` | UUID from Data Browser |
| Student Number | `student.studentNumber` | |
| State ID | `student.stateId` | |
| District Username | `student.email.split("@")[0]` | Derive from email |
| Clever Username | `student.email` | Same as email |
| District Password | hardcoded `"••••••••"` | |
| Clever Password | hardcoded `"••••••••"` | |
| Grade | `student.grade` | |
| Graduation Year | hardcoded `"2030"` | |
| Created | hardcoded `"Sep 1, 2025"` | |
| Verified MFA Types | hardcoded `"None"` | |
| Email | `student.email` | |
| Date of Birth | `student.dob` | |
| Race | `student.race` | |
| Gender | `student.gender` | |
| Hispanic Ethnicity | `student.hispanicLatino` | |
| Home Language | `student.homeLanguage` | |
| Address | `student.street, student.city, student.state student.zip` | |
| ELL Status | `student.ellStatus` | |
| FRL Status | `student.frlStatus` | |
| IEP Status | `student.iepStatus` | |
| Disability Type/Status | hardcoded `"—"` | Not in mock data |
| Gifted/Talented | hardcoded `"—"` | Not in mock data |
| Section 504 Status | hardcoded `"—"` | Not in mock data |
| GPA (Unweighted/Weighted) | hardcoded `"—"` | Not in mock data |
| Google Email | computed from provisioning config | Only when IDM setup complete |
| Google ID | hardcoded `"—"` or computed | |

### Teacher Fields
| Real Clever Field | Mock Data Source |
|---|---|
| Teacher ID | `teacher.stateTeacherId` |
| Clever Teacher ID | `teacher.id` |
| Teacher Number | `teacher.teacherNumber` |
| State Teacher ID | `teacher.stateTeacherId` |
| District Username | `teacher.username` |
| Clever Username | `teacher.email` |
| District/Clever Password | hardcoded `"••••••••"` |
| Created/Last Modified | `teacher.lastModified.date` |
| Email | `teacher.email` |
| School | `teacher.school` |
| Google Email | computed from provisioning config |

### Staff Fields
| Real Clever Field | Mock Data Source |
|---|---|
| Staff ID | `staff.id` (first 8 chars) |
| Clever Staff ID | `staff.id` |
| Email | `staff.email` |
| Clever Role | `staff.role` |
| District Username | `staff.username` |
| Clever Username | `staff.email` |
| Department | `staff.department` |
| Clever Password | hardcoded `"••••••••"` |
| Created/Last Modified | `staff.lastModified.date` |
| Google Email | computed from provisioning config |

---

## Task 1: Routing Infrastructure

**File: `src/lib/routing.js`**

Add these 5 functions after the existing `buildProvisioningRoute` function (after line 136):

```js
// ── Profile routes ──────────────────────────────────────────

export function parseProfileId(id) {
    const normalizedId = getRouteParamValue(id).trim();
    if (
        !normalizedId ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedId)
    ) {
        return null;
    }
    return normalizedId;
}

export function buildStudentProfileRoute(id) {
    const parsedId = parseProfileId(id);
    if (parsedId === null) return buildDashboardRoute("data-browser");
    return `/dashboard/student-profile/${parsedId}`;
}

export function buildTeacherProfileRoute(id) {
    const parsedId = parseProfileId(id);
    if (parsedId === null) return buildDashboardRoute("data-browser");
    return `/dashboard/teacher-profile/${parsedId}`;
}

export function buildStaffProfileRoute(id) {
    const parsedId = parseProfileId(id);
    if (parsedId === null) return buildDashboardRoute("data-browser");
    return `/dashboard/staff-profile/${parsedId}`;
}

export function buildProfileRouteByType(userType, id) {
    const type = userType?.toLowerCase();
    if (type === "student") return buildStudentProfileRoute(id);
    if (type === "teacher") return buildTeacherProfileRoute(id);
    if (type === "staff") return buildStaffProfileRoute(id);
    return buildDashboardRoute("data-browser");
}
```

**Do NOT** add anything to `DASHBOARD_PAGE_KEYS` or `DASHBOARD_PAGE_COMPONENTS` — these are nested routes handled by their own `page.js` files (same pattern as `my-applications/[appId]`).

---

## Task 2: Shared CSS Module

**Create file: `src/components/pages/profiles/ProfilePage.module.css`**

This CSS replicates the real Clever profile layout: hero header, stats bar, card sections, and tabs.

```css
/* ── Profile page shared styles ─────────────────────────────── */
/* Replicates the real Clever dashboard profile layout */

.container {
    flex: 1;
    overflow-y: auto;
    background: var(--gray-50);
}

/* ── Hero Header ─────────────────────────────────────────────── */

.heroSection {
    background: white;
    border-bottom: 1px solid var(--gray-200);
    padding: 24px 32px 0;
}

.heroContent {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    max-width: 1200px;
}

.avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: var(--gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 600;
    color: var(--gray-600);
    flex-shrink: 0;
}

.heroInfo {
    flex: 1;
    min-width: 0;
}

.heroName {
    font-size: 24px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0 0 2px 0;
}

.heroSubtext {
    font-size: 13px;
    color: var(--gray-500);
    margin: 0 0 10px 0;
}

.heroMeta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.heroBadge {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    background-color: var(--gray-100);
    color: var(--gray-700);
}

.heroBadgeGreen {
    background-color: #d1fae5;
    color: #065f46;
}

.heroLink {
    font-size: 13px;
    color: var(--clever-blue);
    text-decoration: none;
}

.heroLink:hover {
    text-decoration: underline;
}

.heroEmail {
    font-size: 13px;
    color: var(--gray-600);
}

.heroActions {
    flex-shrink: 0;
}

.actionsButton {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid var(--clever-blue);
    border-radius: 4px;
    background: white;
    color: var(--clever-blue);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.actionsButton:hover {
    background: var(--clever-blue-light, #f0f4ff);
}

/* ── Stats Bar ───────────────────────────────────────────────── */

.statsBar {
    display: flex;
    gap: 32px;
    padding: 16px 32px;
    background: var(--gray-50);
    border-bottom: 1px solid var(--gray-200);
}

.statItem {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.statLabel {
    font-size: 11px;
    font-weight: 600;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.statValue {
    font-size: 14px;
    color: var(--gray-900);
    font-weight: 500;
}

/* ── Tab bar ─────────────────────────────────────────────────── */
/* We use the shared <Tabs> component from ui/Tabs.jsx */

/* ── Content area ────────────────────────────────────────────── */

.content {
    padding: 24px 32px;
    max-width: 1200px;
}

/* ── Back link ───────────────────────────────────────────────── */

.backLink {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: var(--clever-blue);
    text-decoration: none;
    margin-bottom: 16px;
}

.backLink:hover {
    text-decoration: underline;
}

/* ── Card sections ───────────────────────────────────────────── */

.card {
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 24px 32px;
    margin-bottom: 20px;
}

.cardHeader {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0 0 20px 0;
}

.fieldGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px 48px;
}

.fieldGroup {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.fieldLabel {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.fieldValue {
    font-size: 14px;
    color: var(--gray-900);
}

.fieldEmpty {
    font-size: 14px;
    color: var(--gray-400);
}

.fieldLink {
    font-size: 14px;
    color: var(--clever-blue);
    text-decoration: none;
    cursor: pointer;
}

.fieldLink:hover {
    text-decoration: underline;
}

/* ── Tables inside cards ─────────────────────────────────────── */

.cardTable {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.cardTable th {
    text-align: left;
    padding: 10px 16px;
    color: var(--gray-600);
    font-weight: 600;
    border-bottom: 2px solid var(--gray-200);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.cardTable td {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    color: var(--gray-700);
}

.cardTable tr:last-child td {
    border-bottom: none;
}

.cardTable a {
    color: var(--clever-blue);
    text-decoration: none;
}

.cardTable a:hover {
    text-decoration: underline;
}

/* ── Empty states ────────────────────────────────────────────── */

.emptyState {
    text-align: center;
    padding: 40px 24px;
    color: var(--gray-500);
    font-size: 14px;
}

/* ── Apps & Logins placeholders ──────────────────────────────── */

.placeholderCard {
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 24px 32px;
    margin-bottom: 20px;
}

.placeholderCard h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0 0 16px 0;
}

.placeholderEmpty {
    text-align: center;
    padding: 32px;
    color: var(--gray-400);
    font-size: 14px;
    background: var(--gray-50);
    border-radius: 6px;
}

/* ── Status badges ───────────────────────────────────────────── */

.statusProvisioned {
    background-color: #d1fae5;
    color: #065f46;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.statusNotProvisioned {
    background-color: var(--gray-100);
    color: var(--gray-600);
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

/* ── Actions dropdown ────────────────────────────────────────── */

.actionsDropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 260px;
    z-index: 50;
    padding: 6px 0;
}

.actionsDropdownItem {
    display: block;
    width: 100%;
    padding: 10px 16px;
    text-align: left;
    font-size: 14px;
    color: var(--gray-700);
    background: none;
    border: none;
    cursor: pointer;
}

.actionsDropdownItem:hover {
    background: var(--gray-50);
}

.actionsDropdownDivider {
    height: 1px;
    background: var(--gray-200);
    margin: 4px 0;
}
```

---

## Task 3: Shared Components

### 3A: ProfileHero Component

**Create file: `src/components/pages/profiles/ProfileHero.jsx`**

```jsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { buildDashboardRoute } from "@/lib/routing";
import styles from "./ProfilePage.module.css";

/**
 * Hero header for profile pages — replicates real Clever profile layout.
 *
 * @param {{
 *   name: string,
 *   cleverId: string,
 *   metaChips: Array<{ label?: string, value: string, isLink?: boolean, isBadge?: boolean, badgeGreen?: boolean }>,
 *   email: string,
 *   stats: Array<{ label: string, value: string }> | null,
 *   actions: Array<{ label: string, dividerBefore?: boolean }>,
 *   backLabel?: string,
 * }} props
 */
export default function ProfileHero({ name, cleverId, metaChips = [], email, stats, actions = [], backLabel = "Data Browser" }) {
    const [showActions, setShowActions] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        if (!showActions) return;
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowActions(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [showActions]);

    const initials = name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0]?.toUpperCase())
        .slice(0, 2)
        .join("");

    return (
        <>
            {/* Back link sits above the hero */}
            <div style={{ padding: "12px 32px 0", background: "white" }}>
                <Link href={buildDashboardRoute("data-browser")} className={styles.backLink}>
                    ← Back to {backLabel}
                </Link>
            </div>

            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    {/* Avatar */}
                    <div className={styles.avatar}>{initials}</div>

                    {/* Info */}
                    <div className={styles.heroInfo}>
                        <h1 className={styles.heroName}>{name}</h1>
                        <p className={styles.heroSubtext}>
                            Clever User ID: {cleverId.substring(0, 12)}...
                        </p>
                        <div className={styles.heroMeta}>
                            {metaChips.map((chip, i) => {
                                if (chip.isBadge) {
                                    return (
                                        <span
                                            key={i}
                                            className={`${styles.heroBadge} ${chip.badgeGreen ? styles.heroBadgeGreen : ""}`}
                                        >
                                            {chip.value}
                                        </span>
                                    );
                                }
                                if (chip.isLink) {
                                    return (
                                        <Link
                                            key={i}
                                            href={buildDashboardRoute("data-browser")}
                                            className={styles.heroLink}
                                        >
                                            {chip.value}
                                        </Link>
                                    );
                                }
                                return (
                                    <span key={i} className={styles.heroEmail}>
                                        {chip.value}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions dropdown */}
                    {actions.length > 0 && (
                        <div className={styles.heroActions} ref={dropdownRef} style={{ position: "relative" }}>
                            <button
                                className={styles.actionsButton}
                                onClick={() => setShowActions((prev) => !prev)}
                            >
                                Actions ▾
                            </button>
                            {showActions && (
                                <div className={styles.actionsDropdown}>
                                    {actions.map((action, i) => (
                                        <div key={i}>
                                            {action.dividerBefore && <div className={styles.actionsDropdownDivider} />}
                                            <button
                                                className={styles.actionsDropdownItem}
                                                onClick={() => setShowActions(false)}
                                            >
                                                {action.label}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats bar */}
            {stats && stats.length > 0 && (
                <div className={styles.statsBar}>
                    {stats.map((stat, i) => (
                        <div key={i} className={styles.statItem}>
                            <span className={styles.statLabel}>{stat.label}</span>
                            <span className={styles.statValue}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
```

### 3B: CleverIDMSection Component (Details Tab Card)

**Create file: `src/components/pages/profiles/CleverIDMSection.jsx`**

This renders the "Clever IDM Information" card on the Details tab — matching the real Clever layout. It only appears when IDM setup is complete.

```jsx
"use client";

import { useMemo } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "./ProfilePage.module.css";

/**
 * "Clever IDM Information" card for profile Details tabs.
 * Only renders when IDM setup is complete.
 *
 * @param {{ userType: "student"|"teacher"|"staff", person: object }} props
 */
export default function CleverIDMSection({ userType, person }) {
    const { idmSetupComplete } = useInstructional();

    // Read provisioning config from localStorage (set by the wizard)
    const provisioningConfig = useMemo(() => {
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem("idm-provisioning-state");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);

    if (!idmSetupComplete) return null;

    const googleEmail = computeEmail(provisioningConfig, userType, person) || "—";
    const googleId = "—";

    return (
        <div className={styles.card}>
            <h2 className={styles.cardHeader}>Clever IDM Information</h2>
            <div className={styles.fieldGrid}>
                <Field label="Google Email" value={googleEmail} />
                <Field label="Google ID" value={googleId} />
                {userType !== "staff" && (
                    <Field label="Google Password" value="••••••••" />
                )}
                <div className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Actions</span>
                    <span className={styles.fieldLink}>Unlink user</span>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value }) {
    return (
        <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>{label}</span>
            <span className={value && value !== "—" ? styles.fieldValue : styles.fieldEmpty}>
                {value || "—"}
            </span>
        </div>
    );
}

// ── Helpers ─────────────────────────────────────────────────

function computeEmail(config, userType, person) {
    const typeKey = userType + "s"; // "students", "teachers", "staff" → "staffs" is fine, will fallback
    const cred = config?.credentials?.[typeKey] || config?.credentials?.[userType];
    if (!cred?.email || !person) return null;
    const domain = cred.domain || "cedarridgesd.org";
    const first = person.first?.toLowerCase() || "";
    const last = person.last?.toLowerCase() || "";
    let email = cred.email
        .replace(/\{\{name\.first\}\}/gi, first)
        .replace(/\{\{name\.last\}\}/gi, last)
        .replace(/\{\{name\.first_initial\}\}/gi, first.charAt(0));
    if (!email.includes("@")) {
        email = `${first}.${last}@${domain}`;
    }
    return email;
}
```

### 3C: ProfileOverviewTab Component

**Create file: `src/components/pages/profiles/ProfileOverviewTab.jsx`**

```jsx
"use client";

import styles from "./ProfilePage.module.css";

/**
 * Shared Overview tab for Student and Teacher profiles.
 * Shows: Sections table, Apps card, Logins chart placeholder.
 *
 * @param {{ sections: Array, sectionColumns: Array<{ key: string, label: string }> }} props
 */
export default function ProfileOverviewTab({ sections = [], sectionColumns = [] }) {
    return (
        <div className={styles.content}>
            {/* Sections table */}
            <div className={styles.card}>
                <h2 className={styles.cardHeader}>Sections ({sections.length})</h2>
                {sections.length > 0 ? (
                    <table className={styles.cardTable}>
                        <thead>
                            <tr>
                                {sectionColumns.map((col) => (
                                    <th key={col.key}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sections.map((s) => (
                                <tr key={s.id}>
                                    {sectionColumns.map((col) => (
                                        <td key={col.key}>{s[col.key] || "—"}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className={styles.emptyState}>No sections found.</p>
                )}
            </div>

            {/* Apps card */}
            <div className={styles.placeholderCard}>
                <h3>Apps</h3>
                <div className={styles.placeholderEmpty}>
                    No apps shared with this user
                </div>
            </div>

            {/* Logins chart placeholder */}
            <div className={styles.placeholderCard}>
                <h3>Logins to Clever</h3>
                <div className={styles.placeholderEmpty}>
                    No login data available
                </div>
            </div>
        </div>
    );
}
```

### 3D: ProfileField Helper Component

**Create file: `src/components/pages/profiles/ProfileField.jsx`**

```jsx
import styles from "./ProfilePage.module.css";

/**
 * Single label+value field for profile detail cards.
 * Renders "—" in muted style for empty values.
 */
export default function ProfileField({ label, value }) {
    const displayValue = value != null && value !== "" ? String(value) : "—";
    const isEmpty = displayValue === "—";

    return (
        <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>{label}</span>
            <span className={isEmpty ? styles.fieldEmpty : styles.fieldValue}>
                {displayValue}
            </span>
        </div>
    );
}
```

---

## Task 4: Profile Page Components

### 4A: StudentProfile

**Create file: `src/components/pages/StudentProfile.jsx`**

```jsx
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
```

### 4B: TeacherProfile

**Create file: `src/components/pages/TeacherProfile.jsx`**

```jsx
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
```

### 4C: StaffProfile

**Create file: `src/components/pages/StaffProfile.jsx`**

```jsx
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
```

---

## Task 5: Route Files

Follow the **exact** pattern from `src/app/dashboard/my-applications/[appId]/page.js`.

### 5A: Student Profile Route

**Create file: `src/app/dashboard/student-profile/[id]/page.js`**

```jsx
"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentProfile from "@/components/pages/StudentProfile";
import { useScenario } from "@/context/ScenarioContext";
import {
    buildDashboardRoute,
    buildStudentProfileRoute,
    getRouteParamValue,
    parseProfileId,
} from "@/lib/routing";

export default function StudentProfileRoute() {
    const params = useParams();
    const router = useRouter();
    const { scenario } = useScenario();
    const students = scenario.dataBrowser?.students;

    const rawId = getRouteParamValue(params?.id);
    const hasRouteParam = rawId.trim().length > 0;
    const parsedId = useMemo(() => parseProfileId(rawId), [rawId]);
    const hasData = Array.isArray(students);

    const selectedStudent = useMemo(() => {
        if (parsedId === null) return null;
        const list = Array.isArray(students) ? students : [];
        return list.find((s) => s.id === parsedId) ?? null;
    }, [students, parsedId]);

    useEffect(() => {
        if (!hasRouteParam) return;
        if (parsedId === null) {
            router.replace(buildDashboardRoute("data-browser"));
            return;
        }
        if (rawId !== parsedId) {
            router.replace(buildStudentProfileRoute(parsedId));
            return;
        }
        if (hasData && !selectedStudent) {
            router.replace(buildDashboardRoute("data-browser"));
        }
    }, [hasData, hasRouteParam, parsedId, rawId, router, selectedStudent]);

    if (!hasRouteParam || !selectedStudent) return null;

    return <StudentProfile student={selectedStudent} />;
}
```

### 5B: Teacher Profile Route

**Create file: `src/app/dashboard/teacher-profile/[id]/page.js`**

```jsx
"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import TeacherProfile from "@/components/pages/TeacherProfile";
import { useScenario } from "@/context/ScenarioContext";
import {
    buildDashboardRoute,
    buildTeacherProfileRoute,
    getRouteParamValue,
    parseProfileId,
} from "@/lib/routing";

export default function TeacherProfileRoute() {
    const params = useParams();
    const router = useRouter();
    const { scenario } = useScenario();
    const teachers = scenario.dataBrowser?.teachers;

    const rawId = getRouteParamValue(params?.id);
    const hasRouteParam = rawId.trim().length > 0;
    const parsedId = useMemo(() => parseProfileId(rawId), [rawId]);
    const hasData = Array.isArray(teachers);

    const selectedTeacher = useMemo(() => {
        if (parsedId === null) return null;
        const list = Array.isArray(teachers) ? teachers : [];
        return list.find((t) => t.id === parsedId) ?? null;
    }, [teachers, parsedId]);

    useEffect(() => {
        if (!hasRouteParam) return;
        if (parsedId === null) {
            router.replace(buildDashboardRoute("data-browser"));
            return;
        }
        if (rawId !== parsedId) {
            router.replace(buildTeacherProfileRoute(parsedId));
            return;
        }
        if (hasData && !selectedTeacher) {
            router.replace(buildDashboardRoute("data-browser"));
        }
    }, [hasData, hasRouteParam, parsedId, rawId, router, selectedTeacher]);

    if (!hasRouteParam || !selectedTeacher) return null;

    return <TeacherProfile teacher={selectedTeacher} />;
}
```

### 5C: Staff Profile Route

**Create file: `src/app/dashboard/staff-profile/[id]/page.js`**

```jsx
"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import StaffProfile from "@/components/pages/StaffProfile";
import { useScenario } from "@/context/ScenarioContext";
import {
    buildDashboardRoute,
    buildStaffProfileRoute,
    getRouteParamValue,
    parseProfileId,
} from "@/lib/routing";

export default function StaffProfileRoute() {
    const params = useParams();
    const router = useRouter();
    const { scenario } = useScenario();
    const staff = scenario.dataBrowser?.staff;

    const rawId = getRouteParamValue(params?.id);
    const hasRouteParam = rawId.trim().length > 0;
    const parsedId = useMemo(() => parseProfileId(rawId), [rawId]);
    const hasData = Array.isArray(staff);

    const selectedStaff = useMemo(() => {
        if (parsedId === null) return null;
        const list = Array.isArray(staff) ? staff : [];
        return list.find((s) => s.id === parsedId) ?? null;
    }, [staff, parsedId]);

    useEffect(() => {
        if (!hasRouteParam) return;
        if (parsedId === null) {
            router.replace(buildDashboardRoute("data-browser"));
            return;
        }
        if (rawId !== parsedId) {
            router.replace(buildStaffProfileRoute(parsedId));
            return;
        }
        if (hasData && !selectedStaff) {
            router.replace(buildDashboardRoute("data-browser"));
        }
    }, [hasData, hasRouteParam, parsedId, rawId, router, selectedStaff]);

    if (!hasRouteParam || !selectedStaff) return null;

    return <StaffProfile staff={selectedStaff} />;
}
```

---

## Task 6: Wire DataBrowser "View Full Profile" Link

### 6A: Modify `src/components/pages/DataBrowser.jsx`

**Add import** at the top of the file (after existing imports):

```js
import Link from "next/link";
import { buildStudentProfileRoute, buildTeacherProfileRoute, buildStaffProfileRoute } from "@/lib/routing";
```

**Add a "View Full Profile" link** inside the `DetailPanel` component. Find the closing `</div>` of `detailBody` (around line 179) and add a footer AFTER it but BEFORE the closing `</div>` of `detailPanel`. The structure should look like:

```jsx
<div className={styles.detailPanel} onClick={e => e.stopPropagation()}>
    <div className={styles.detailHeader}>
        {/* ... existing header ... */}
    </div>
    <div className={styles.detailBody}>
        {/* ... existing body ... */}
    </div>
    {/* ADD THIS BLOCK: */}
    {(type === "Students" || type === "Teachers" || type === "Staff") && (
        <div className={styles.detailPanelFooter}>
            <Link
                href={
                    type === "Students" ? buildStudentProfileRoute(item.id) :
                    type === "Teachers" ? buildTeacherProfileRoute(item.id) :
                    buildStaffProfileRoute(item.id)
                }
                className={styles.viewProfileLink}
            >
                View Full Profile →
            </Link>
        </div>
    )}
</div>
```

### 6B: Modify `src/components/pages/DataBrowser.module.css`

**Add** at the end of the file:

```css
/* ── Profile link in detail panel ────────────────────────────── */

.detailPanelFooter {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
}

.viewProfileLink {
    color: #1464ff;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
}

.viewProfileLink:hover {
    text-decoration: underline;
}
```

---

## Task 7: Wire IDM Events "Open Profile" Link

**Modify: `src/components/pages/IDM.jsx`**

### 7A: Add imports

Add these imports at the top of IDM.jsx (after the existing imports):

```js
import Link from "next/link";
import { useScenario } from "@/context/ScenarioContext";
import { buildProfileRouteByType } from "@/lib/routing";
```

**Important**: Check if `useScenario` is already imported. If the IDM component already uses `useScenario`, don't add a duplicate import.

### 7B: Add the scenario hook

Inside the `IDM` component function, add (if not already present):

```js
const { scenario } = useScenario();
```

### 7C: Add helper function

Add this helper function INSIDE the IDM component (or just above it):

```js
function findProfileIdForEvent(ev, scenarioData) {
    const userType = ev.userType?.toLowerCase();
    const nameParts = ev.user?.split(" ") || [];
    const firstName = nameParts[0]?.toLowerCase();
    const lastName = nameParts[nameParts.length - 1]?.toLowerCase();

    let collection;
    if (userType === "student") collection = scenarioData.dataBrowser?.students;
    else if (userType === "teacher") collection = scenarioData.dataBrowser?.teachers;
    else if (userType === "staff") collection = scenarioData.dataBrowser?.staff;

    if (!collection || !firstName || !lastName) return null;

    const match = collection.find(
        (p) => p.first?.toLowerCase() === firstName && p.last?.toLowerCase() === lastName
    );
    return match ? { id: match.id, userType: ev.userType } : null;
}
```

### 7D: Replace the placeholder link

Find this code (around line 649):
```jsx
<a href="#" className={styles.detailActionLink} onClick={(e) => e.preventDefault()}>
    Open Profile
</a>
```

Replace it with:
```jsx
{(() => {
    const profileMatch = findProfileIdForEvent(ev, scenario);
    if (!profileMatch) {
        return (
            <span className={styles.detailActionLink} style={{ opacity: 0.4, cursor: "default" }}>
                Open Profile
            </span>
        );
    }
    return (
        <Link
            href={buildProfileRouteByType(profileMatch.userType, profileMatch.id)}
            className={styles.detailActionLink}
            onClick={(e) => e.stopPropagation()}
        >
            Open Profile
        </Link>
    );
})()}
```

---

## Task 8: Tests

### 8A: Routing tests

**Create file: `src/__tests__/profileRouting.test.js`**

```js
import { describe, it, expect } from "vitest";
import {
    parseProfileId,
    buildStudentProfileRoute,
    buildTeacherProfileRoute,
    buildStaffProfileRoute,
    buildProfileRouteByType,
} from "@/lib/routing";

describe("parseProfileId", () => {
    it("returns valid UUID unchanged", () => {
        expect(parseProfileId("10a98369-7f2b-466b-abf2-1b9411e35351")).toBe(
            "10a98369-7f2b-466b-abf2-1b9411e35351"
        );
    });

    it("returns null for empty string", () => {
        expect(parseProfileId("")).toBeNull();
    });

    it("returns null for non-UUID string", () => {
        expect(parseProfileId("not-a-uuid")).toBeNull();
    });

    it("returns null for partial UUID", () => {
        expect(parseProfileId("10a98369-7f2b")).toBeNull();
    });

    it("trims whitespace", () => {
        expect(parseProfileId("  10a98369-7f2b-466b-abf2-1b9411e35351  ")).toBe(
            "10a98369-7f2b-466b-abf2-1b9411e35351"
        );
    });
});

describe("buildStudentProfileRoute", () => {
    it("returns correct route for valid UUID", () => {
        expect(buildStudentProfileRoute("10a98369-7f2b-466b-abf2-1b9411e35351")).toBe(
            "/dashboard/student-profile/10a98369-7f2b-466b-abf2-1b9411e35351"
        );
    });

    it("falls back to data-browser for invalid UUID", () => {
        expect(buildStudentProfileRoute("invalid")).toBe("/dashboard/data-browser");
    });
});

describe("buildTeacherProfileRoute", () => {
    it("returns correct route for valid UUID", () => {
        expect(buildTeacherProfileRoute("d46d528e-b919-4f28-bebb-b54ccde88cab")).toBe(
            "/dashboard/teacher-profile/d46d528e-b919-4f28-bebb-b54ccde88cab"
        );
    });

    it("falls back to data-browser for invalid UUID", () => {
        expect(buildTeacherProfileRoute("")).toBe("/dashboard/data-browser");
    });
});

describe("buildStaffProfileRoute", () => {
    it("returns correct route for valid UUID", () => {
        expect(buildStaffProfileRoute("7c3d8e3e-b96f-477c-844c-2da83cc763ca")).toBe(
            "/dashboard/staff-profile/7c3d8e3e-b96f-477c-844c-2da83cc763ca"
        );
    });
});

describe("buildProfileRouteByType", () => {
    const uuid = "10a98369-7f2b-466b-abf2-1b9411e35351";

    it("routes Student to student-profile", () => {
        expect(buildProfileRouteByType("Student", uuid)).toBe(
            `/dashboard/student-profile/${uuid}`
        );
    });

    it("routes Teacher to teacher-profile", () => {
        expect(buildProfileRouteByType("Teacher", uuid)).toBe(
            `/dashboard/teacher-profile/${uuid}`
        );
    });

    it("routes Staff to staff-profile", () => {
        expect(buildProfileRouteByType("Staff", uuid)).toBe(
            `/dashboard/staff-profile/${uuid}`
        );
    });

    it("falls back to data-browser for unknown type", () => {
        expect(buildProfileRouteByType("Unknown", uuid)).toBe("/dashboard/data-browser");
    });

    it("is case-insensitive", () => {
        expect(buildProfileRouteByType("student", uuid)).toBe(
            `/dashboard/student-profile/${uuid}`
        );
    });
});
```

---

## Verification Checklist

Run these after all tasks are complete:

```bash
# 1. All tests pass
npx vitest run

# 2. Zero lint errors
npx next lint

# 3. Build succeeds
npx next build
```

**Manual checks** (describe in commit message that these were verified by inspecting the code):
- [ ] `/dashboard/student-profile/{valid-uuid}` renders with hero header, stats bar, 3 tabs
- [ ] Student Overview tab shows sections table, Apps placeholder, Logins placeholder
- [ ] Student Details tab shows 5 card sections (Student Info, IDM, Personal, Sensitive Ed, Schools)
- [ ] Student Guardians tab shows empty state
- [ ] `/dashboard/teacher-profile/{valid-uuid}` renders with hero, stats, 2 tabs
- [ ] Teacher Overview tab shows sections taught
- [ ] Teacher Details tab shows 3 card sections (Teacher Info, IDM, Schools)
- [ ] `/dashboard/staff-profile/{valid-uuid}` renders with hero (no stats bar), no tab bar
- [ ] Staff shows 3 card sections + Apps/Logins at bottom
- [ ] Invalid UUID redirects to `/dashboard/data-browser`
- [ ] Data Browser detail panel shows "View Full Profile →" link for Students/Teachers/Staff
- [ ] Data Browser detail panel does NOT show link for Schools/Sections
- [ ] IDM Events "Open Profile" is disabled (grayed) when no Data Browser match exists
- [ ] Clever IDM Information card is hidden when `idmSetupComplete` is false
- [ ] Actions dropdown opens/closes correctly with outside click
- [ ] Avatar shows initials correctly

---

## Commit Guidance

**Commit 1**: Routing + CSS + shared components
```
Add profile routing infrastructure and shared Clever profile components

Route builders (parseProfileId, buildStudentProfileRoute, etc.) in
routing.js. Shared ProfilePage.module.css replicating real Clever
layout. ProfileHero, ProfileOverviewTab, ProfileField, and
CleverIDMSection shared components.
```

**Commit 2**: Profile page components + route files
```
Add Student, Teacher, and Staff profile pages matching Clever layout

Student: 3 tabs (Overview/Details/Guardians), hero header with grade
badge and stats bar, 5 detail card sections. Teacher: 2 tabs, messaging
badge, 3 detail cards. Staff: no tabs, no stats bar, 3 detail cards
with Apps/Logins inline. Three Next.js route files following the
my-applications/[appId] pattern.
```

**Commit 3**: Navigation wiring + tests
```
Wire profile links from DataBrowser and IDM Events

DataBrowser detail panel gets "View Full Profile" link for
Students/Teachers/Staff. IDM Events "Open Profile" placeholder
replaced with functional Link (gracefully disabled when no match).
Profile routing tests added.
```

---

## File Summary

| Action | File |
|--------|------|
| Modify | `src/lib/routing.js` |
| Create | `src/components/pages/profiles/ProfilePage.module.css` |
| Create | `src/components/pages/profiles/ProfileHero.jsx` |
| Create | `src/components/pages/profiles/CleverIDMSection.jsx` |
| Create | `src/components/pages/profiles/ProfileOverviewTab.jsx` |
| Create | `src/components/pages/profiles/ProfileField.jsx` |
| Create | `src/components/pages/StudentProfile.jsx` |
| Create | `src/components/pages/TeacherProfile.jsx` |
| Create | `src/components/pages/StaffProfile.jsx` |
| Create | `src/app/dashboard/student-profile/[id]/page.js` |
| Create | `src/app/dashboard/teacher-profile/[id]/page.js` |
| Create | `src/app/dashboard/staff-profile/[id]/page.js` |
| Modify | `src/components/pages/DataBrowser.jsx` |
| Modify | `src/components/pages/DataBrowser.module.css` |
| Modify | `src/components/pages/IDM.jsx` |
| Create | `src/__tests__/profileRouting.test.js` |

## Architecture Notes

### Why the layout changed from the original prompt
The original prompt used flat single-page profiles with simple `<section>` blocks. This rewrite matches the **real Clever dashboard** which uses:
- A **hero header** (avatar + name + Clever ID + metadata chips + Actions dropdown)
- A **stats bar** (horizontal key-value pairs)
- A **tabbed interface** (different tab counts per user type)
- **Card-based sections** on the Details tab (each with a header and a 2-column field grid)
- **Overview tab** with sections table + Apps + Logins chart placeholders

### Component decomposition
Instead of one monolithic component per profile type, this uses shared building blocks:
- `ProfileHero` — reused by all 3 types (different props for metadata chips, stats, actions)
- `ProfileOverviewTab` — reused by Student and Teacher (Staff doesn't have an Overview tab)
- `ProfileField` — tiny label+value pair, reused everywhere
- `CleverIDMSection` — the IDM card, conditionally rendered on all 3 Detail tabs

### Data flow
- SIS data: `useScenario()` → `scenario.dataBrowser.students/teachers/staff/sections/schools`
- Enrollment: `scenario.dataBrowser.enrollmentsByStudent` (student → section IDs)
- Section teaching: `section.teacherId === teacher.id` (teacher → sections taught)
- IDM status: `useInstructional()` → `idmSetupComplete` boolean
- IDM config: `localStorage("idm-provisioning-state")` → email/OU templates

### Name mismatch reality
The static IDM events use synthetic names (Marcus Hettinger, Vergie Herman-Kutch) that do NOT appear in the Data Browser records (Annamarie Feest, Sierra Hirthe). The IDM Events "Open Profile" link will mostly be disabled until Issue #34 (Provisioning Engine) generates events from actual Data Browser records.
