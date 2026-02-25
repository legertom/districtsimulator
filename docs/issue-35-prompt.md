> Copy-paste this entire document into a new AI chat session pointed at the District Simulator repo.
> The bot should execute all tasks, run tests, lint, and commit.

# Issue #35 — Wizard State Persistence + Provisioning Engine Core

**Sprint:** mar-02-06 | **Day:** Monday | **Depends on:** Issues #17–21 (closed)

## Overview

This issue creates the provisioning engine — the core infrastructure that generates dynamic IDM events from wizard configuration + Data Browser records. It also wires wizard state persistence to Supabase (dual-write with localStorage).

**4 tasks, 2 new files, 3 modified files. Follow task order.**

After this issue:
- Wizard config persists to Supabase per user (same dual-write pattern as progress)
- Clicking "Provision" runs the engine and generates dynamic IDM events from real Data Browser records
- Clicking "Refresh" on the Preview step runs the engine and updates the preview stats
- Results are stored in localStorage for the IDM page to read (Issue #36 will wire that)

---

## Task 1: Wizard State API Route

Create `src/app/api/progress/wizard/route.js` — follows the exact same pattern as the existing `src/app/api/progress/session/route.js`.

The `wizard_state` Supabase table already exists with columns: `id`, `user_id`, `wizard_data` (jsonb), `created_at`, `updated_at`.

```js
// src/app/api/progress/wizard/route.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/progress/wizard
 * Returns the authenticated user's wizard state.
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
        .from("wizard_state")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return Response.json({ wizard_data: null });
    }

    return Response.json(data);
}

/**
 * PUT /api/progress/wizard
 * Upserts the authenticated user's wizard state.
 * Body: { wizard_data: { ...full wizard config + optional provisioning_results } }
 */
export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const row = {
        user_id: session.user.id,
        wizard_data: body.wizard_data ?? {},
    };

    const { data, error } = await supabase
        .from("wizard_state")
        .upsert(row, { onConflict: "user_id" })
        .select()
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}
```

**Commit 1:** `feat: add wizard state API route (GET/PUT)`

---

## Task 2: Wizard State Client Functions

Add to `src/lib/progressApi.js` — append these three functions after the existing `createDebouncedSessionSave()` function (after line 241). Follow the exact same patterns as the existing progress and session functions.

```js
// ═══════════════════════════════════════════════════════════════
//  Wizard state persistence (provisioning wizard config)
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch the user's wizard state from the API.
 * Returns { wizard_data } or null on failure.
 */
export async function fetchWizardStateFromApi() {
    try {
        const res = await fetch("/api/progress/wizard");
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

/**
 * Save the user's wizard state to the API.
 * Fire-and-forget with error logging.
 */
export async function saveWizardStateToApi(wizardData) {
    try {
        await fetch("/api/progress/wizard", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wizard_data: wizardData }),
        });
    } catch (err) {
        console.warn("[progressApi] Failed to save wizard state:", err);
    }
}

/**
 * Create a debounced save function for wizard state writes.
 * Returns { debouncedSave, cancel, flush }.
 */
export function createDebouncedWizardSave() {
    let timer = null;
    let pendingState = null;

    function debouncedSave(wizardData) {
        pendingState = wizardData;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            pendingState = null;
            saveWizardStateToApi(wizardData);
        }, 1000);
    }

    function cancel() {
        if (timer) clearTimeout(timer);
        timer = null;
        pendingState = null;
    }

    function flush() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        if (pendingState) {
            saveWizardStateToApi(pendingState);
            pendingState = null;
        }
    }

    return { debouncedSave, cancel, flush };
}
```

**Commit 2:** `feat: add wizard state client functions to progressApi`

---

## Task 3: Provisioning Engine

Create `src/lib/provisioningEngine.js` — the core engine that generates dynamic IDM events.

### Important context

The engine must produce events matching the **exact same field shape** as the existing `buildEvent()` in `src/data/defaults/idm.js`. Here is that shape for reference:

```js
{
    date,                    // string like "Feb 15, 2026"
    event: "Created",        // always "Created" for initial provisioning
    destination: "Google Workspace",
    user,                    // "First Last"
    sisId,                   // person.id from dataBrowser
    destinationUsername,     // generated email like "firstname.lastname@cedarridgesd.org"
    userType,                // "Student" | "Teacher" | "Staff"
    cleverId,                // hex string like "63a1b7c4d5e6f7..."
    currentOU,               // resolved OU path like "/Students/Cedar Ridge Middle School/7"
    previousOU: "N/A",
    currentManagedGroups,    // string like "Grade 10 All Students"
    previousManagedGroups: "N/A",
    modifiedFields: [        // array of { field, value }
        { field: "Given name", value: first },
        { field: "Family name", value: last },
        { field: "Domain username", value: domainUsername },
    ],
    allModifiedData: [       // array of { field, value }
        { field: "Clever Id", value: cleverId },
        { field: "Completion Timestamp", value: "..." },
        { field: "Config String", value: "..." },
        { field: "Family Name", value: last },
        { field: "Given Name", value: first },
        { field: "Org Unit", value: currentOU },
        { field: "Password", value: "redacted" },
        { field: "Primary Email", value: email },
        { field: "Sis Id", value: sisId },
        { field: "User Type", value: userType.toLowerCase() },
    ],
    additionalFields: [{ field: "Templates Used", value: templateName }],
    // NEW field — not in static events:
    personId,               // person.id — for profile page matching
}
```

### Data Browser person record shapes

**Student** (from `STUDENTS_DATA` in `src/data/defaults/dataBrowser.js`):
```js
{
    id: "10a98369-...",
    school: "Santa Rosa Elementary School",
    schoolId: "d95145ba-...",
    first: "Annamarie",
    last: "Feest",
    middleName: "Finley",
    grade: "5",
    studentNumber: "000001",
    stateId: "JS3YXAGCX5RK",
    // ... other fields
}
```

**Teacher** (from `TEACHERS_DATA`):
```js
{
    id: "d46d528e-...",
    school: "Fort Virgilfield Elementary School",
    schoolId: "5fb9220d-...",
    first: "Sierra",
    last: "Hirthe",
    title: "Mrs.",
    teacherNumber: "0001",
    stateTeacherId: "Z2SXHA12PM",
    // ... other fields
}
```

**Staff** (from `STAFF_DATA`):
```js
{
    id: "7c3d8e3e-...",
    school: "Treutelside Middle School",
    schoolId: "1d5209a0-...",
    first: "Percival",
    last: "Beier",
    title: "Teaching Assistant",
    department: "Counseling",
    // ... other fields
}
```

### Email format segment array shape

The wizard state stores email formats as arrays of segments (from `DEFAULT_PROVISIONING_STATE.credentials`):
```js
emailFormat: [
    { type: "variable", variable: "name.first", label: "First Name" },
    { type: "variable", variable: "name.last", label: "Last Name" },
]
// This produces: "firstnamelastname" (segments concatenated)
// With domain: "firstnamelastname@cedarridgesd.org"
```

Segments can be:
- `{ type: "variable", variable: "name.first" }` — SIS variable
- `{ type: "text", value: "." }` — literal text
- `{ type: "function", fn: "To Lowercase" }` — format function (ignore for now)

### OU format segment array shape

Same segment pattern for sub-OU formats (`DEFAULT_PROVISIONING_STATE.ous`):
```js
subOUFormat: [
    { type: "text", value: "/" },
    { type: "variable", variable: "school_name", label: "School Name" },
    { type: "text", value: "/" },
    { type: "variable", variable: "student.grade", label: "Grade" },
]
// With selectedOU "students" (path "/Students"), produces: "/Students/Cedar Ridge Middle School/5"
```

### Variable resolver map

Use the existing `EMAIL_USER_MAP` from `src/components/pages/GoogleProvisioningWizard/steps/CredentialFormatEditorModal.jsx` (line 13-24) as reference, but adapt for Data Browser person record field names (which use `first`/`last` instead of `name` with `.split()`):

| Variable | Student resolution | Teacher resolution | Staff resolution |
|---|---|---|---|
| `name.first` | `person.first.toLowerCase()` | `person.first.toLowerCase()` | `person.first.toLowerCase()` |
| `name.last` | `person.last.toLowerCase()` | `person.last.toLowerCase()` | `person.last.toLowerCase()` |
| `student.student_number` | `person.studentNumber` | N/A | N/A |
| `student.state_id` | `person.stateId` | N/A | N/A |
| `student.sis_id` | `person.id` | N/A | N/A |
| `teacher.teacher_number` | N/A | `person.teacherNumber` | N/A |
| `teacher.sis_id` | N/A | `person.id` | N/A |
| `staff.title` | N/A | N/A | `person.title?.toLowerCase()` |
| `staff.sis_id` | N/A | N/A | `person.id` |
| `school_name` | school lookup by `person.schoolId` | school lookup by `person.schoolId` | school lookup by `person.schoolId` |
| `student.grade` | `person.grade` | N/A | N/A |
| `staff.department` | N/A | N/A | `person.department` |

### Implementation

```js
// src/lib/provisioningEngine.js

/**
 * Provisioning Engine — generates dynamic IDM events from wizard config + Data Browser data.
 *
 * Usage:
 *   import { generateProvisioningResults } from "@/lib/provisioningEngine";
 *   const { events, syncSummary } = generateProvisioningResults(wizardConfig, dataBrowserData);
 */

import { SCHOOLS_DATA } from "@/data/defaults/dataBrowser";

// ═══════════════════════════════════════════════════════════════
//  Variable resolver
// ═══════════════════════════════════════════════════════════════

/**
 * Build a variable resolver map for a given person and user type.
 * Returns a function: (variableName) => resolvedValue
 */
function createVariableResolver(person, userType, schoolsData) {
    const school = schoolsData.find((s) => s.id === person.schoolId);
    const schoolName = school?.name || "Unknown School";

    const map = {
        "name.first": person.first?.toLowerCase() || "",
        "name.last": person.last?.toLowerCase() || "",
        "school_name": schoolName,
    };

    if (userType === "Student") {
        map["student.student_number"] = person.studentNumber || "";
        map["student.state_id"] = person.stateId || "";
        map["student.sis_id"] = person.id || "";
        map["student.grade"] = person.grade || "";
        map["student.graduation_year"] = person.graduationYear || "";
    } else if (userType === "Teacher") {
        map["teacher.teacher_number"] = person.teacherNumber || "";
        map["teacher.sis_id"] = person.id || "";
        map["teacher.title"] = person.title?.toLowerCase() || "";
    } else if (userType === "Staff") {
        map["staff.title"] = person.title?.toLowerCase() || "";
        map["staff.sis_id"] = person.id || "";
        map["staff.department"] = person.department || "";
    }

    return (variableName) => map[variableName] ?? variableName;
}

// ═══════════════════════════════════════════════════════════════
//  Template resolvers
// ═══════════════════════════════════════════════════════════════

/**
 * Apply an email format segment array to generate a username.
 * @param {Array} formatSegments - Array of { type, variable/value/fn } segments
 * @param {string} domain - Email domain (e.g. "cedarridgesd.org")
 * @param {Object} person - Data Browser person record
 * @param {string} userType - "Student" | "Teacher" | "Staff"
 * @param {Array} schoolsData - SCHOOLS_DATA array
 * @returns {string} Full email like "annamariefeest@cedarridgesd.org"
 */
export function applyEmailTemplate(formatSegments, domain, person, userType, schoolsData) {
    if (!formatSegments?.length) {
        // Fallback: first.last format
        const first = person.first?.toLowerCase() || "";
        const last = person.last?.toLowerCase() || "";
        return `${first}${last}@${domain}`;
    }

    const resolve = createVariableResolver(person, userType, schoolsData);

    const username = formatSegments
        .map((seg) => {
            if (seg.type === "text") return seg.value;
            if (seg.type === "variable") return resolve(seg.variable);
            if (seg.type === "function") return ""; // ignore functions for now
            return "";
        })
        .join("");

    return domain ? `${username}@${domain}` : username;
}

/**
 * Apply an OU format to generate the full OU path for a person.
 * @param {Object} ouConfig - { selectedOU, path, subOUFormat } from wizard state
 * @param {Object} person - Data Browser person record
 * @param {string} userType - "Student" | "Teacher" | "Staff"
 * @param {Array} schoolsData - SCHOOLS_DATA array
 * @returns {string} Full OU path like "/Students/Cedar Ridge Middle School/5"
 */
export function applyOUTemplate(ouConfig, person, userType, schoolsData) {
    if (!ouConfig?.path) return "/";

    // If there's no sub-OU format, return the base path
    if (!ouConfig.subOUFormat?.length) {
        return ouConfig.path;
    }

    const resolve = createVariableResolver(person, userType, schoolsData);

    // Build the sub-OU suffix from the format segments
    const subOU = ouConfig.subOUFormat
        .map((seg) => {
            if (seg.type === "text") return seg.value;
            if (seg.type === "variable") return resolve(seg.variable);
            return "";
        })
        .join("");

    // The base path from selectedOU (e.g. "/Students") + the sub-OU format
    // The subOUFormat already includes leading "/" segments
    const basePath = ouConfig.path.replace(/\/+$/, ""); // trim trailing slashes
    return `${basePath}${subOU}`;
}

/**
 * Generate a deterministic Clever ID from a person's SIS ID.
 * Produces a hex-like string that's consistent per person.
 */
export function generateCleverId(personId) {
    // Simple deterministic hash — convert each char code to hex
    let hash = 0;
    const str = personId || "unknown";
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    return `${hex}${hex.split("").reverse().join("")}`.slice(0, 24);
}

// ═══════════════════════════════════════════════════════════════
//  Core engine
// ═══════════════════════════════════════════════════════════════

/**
 * Generate provisioning results from wizard configuration and Data Browser data.
 *
 * @param {Object} wizardConfig - Full wizard state (matches DEFAULT_PROVISIONING_STATE shape)
 * @param {Object} dataBrowserData - { students, teachers, staff, schools }
 * @returns {{ events: Array, syncSummary: Object }}
 */
export function generateProvisioningResults(wizardConfig, dataBrowserData) {
    const { students, teachers, staff, schools } = dataBrowserData;
    const events = [];
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    // Config templates per user type
    const userTypes = [
        {
            type: "Student",
            enabled: wizardConfig.provisionStudents,
            records: students,
            count: wizardConfig.studentCount || 20,
            credKey: "students",
            ouKey: "students",
            configTemplate: "STUDENT_CONFIG",
            templateName: "Cedar Ridge Student Template",
            groupLabel: (person) => `Grade ${person.grade} All Students`,
        },
        {
            type: "Teacher",
            enabled: wizardConfig.provisionTeachers,
            records: teachers,
            count: wizardConfig.teacherCount || 10,
            credKey: "teachers",
            ouKey: "teachers",
            configTemplate: "TEACHER_CONFIG",
            templateName: "Cedar Ridge Teacher Template",
            groupLabel: () => "All Teachers",
        },
        {
            type: "Staff",
            enabled: wizardConfig.provisionStaff,
            records: staff,
            count: wizardConfig.staffCount || 10,
            credKey: "staff",
            ouKey: "staff",
            configTemplate: "STAFF_CONFIG",
            templateName: "Cedar Ridge Staff Template",
            groupLabel: (person) => `${person.department || "All"} Staff`,
        },
    ];

    for (const ut of userTypes) {
        if (!ut.enabled) continue;

        const cred = wizardConfig.credentials?.[ut.credKey] || {};
        const ou = wizardConfig.ous?.[ut.ouKey] || {};
        const sliced = ut.records.slice(0, ut.count);

        for (const person of sliced) {
            const email = applyEmailTemplate(
                cred.emailFormat,
                cred.domain || "cedarridgesd.org",
                person,
                ut.type,
                schools,
            );
            const currentOU = applyOUTemplate(ou, person, ut.type, schools);
            const cleverId = generateCleverId(person.id);
            const domainUsername = email.split("@")[0];
            const first = person.first;
            const last = person.last;

            events.push({
                date: dateStr,
                event: "Created",
                destination: "Google Workspace",
                user: `${first} ${last}`,
                sisId: person.id,
                destinationUsername: email,
                userType: ut.type,
                cleverId,
                currentOU,
                previousOU: "N/A",
                currentManagedGroups: ut.groupLabel(person),
                previousManagedGroups: "N/A",
                modifiedFields: [
                    { field: "Given name", value: first },
                    { field: "Family name", value: last },
                    { field: "Domain username", value: domainUsername },
                ],
                allModifiedData: [
                    { field: "Clever Id", value: cleverId },
                    { field: "Completion Timestamp", value: today.toISOString() },
                    { field: "Config String", value: ut.configTemplate },
                    { field: "Family Name", value: last },
                    { field: "Given Name", value: first },
                    { field: "Org Unit", value: currentOU },
                    { field: "Password", value: "redacted" },
                    { field: "Primary Email", value: email },
                    { field: "Sis Id", value: person.id },
                    { field: "User Type", value: ut.type.toLowerCase() },
                ],
                additionalFields: [{ field: "Templates Used", value: ut.templateName }],
                personId: person.id,
            });
        }
    }

    const syncSummary = {
        creates: events.length,
        matches: 0,
        updates: 0,
        archives: 0,
        issues: 0,
    };

    return { events, syncSummary };
}

/**
 * Generate a sync history array for display on the IDM page.
 * Row 0 is the provisioning run. Rows 1-13 are simulated daily syncs.
 *
 * @param {Object} syncSummary - { creates, matches, updates, archives, issues }
 * @param {number} totalUsers - Total provisioned users
 * @returns {Array} 14 sync history rows
 */
export function generateSyncHistory(syncSummary, totalUsers) {
    const rows = [];
    const now = new Date();

    // Row 0: the provisioning run
    rows.push({
        destination: "Google",
        dateTime: now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
            + "; " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        creates: syncSummary.creates,
        matches: syncSummary.matches,
        updates: syncSummary.updates,
        archives: syncSummary.archives,
        issues: syncSummary.issues,
    });

    // Rows 1-13: simulated daily syncs after provisioning (all matches, no new creates)
    for (let i = 1; i <= 13; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        rows.push({
            destination: "Google",
            dateTime: d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                + "; " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            creates: 0,
            matches: totalUsers,
            updates: 0,
            archives: 0,
            issues: 0,
        });
    }

    return rows;
}
```

**Commit 3:** `feat: create provisioning engine with template resolvers`

---

## Task 4: Wire Engine to Wizard (Dual-Write + Provision/Refresh)

### 4A: Wizard Component Dual-Write

Modify `src/components/pages/GoogleProvisioningWizard/index.jsx`:

**Add imports** (after existing imports at the top):
```js
import { useSession } from "next-auth/react";
import {
    fetchWizardStateFromApi,
    createDebouncedWizardSave,
} from "@/lib/progressApi";
```

**Add session + debounce setup** inside the component function, after the existing `useState` calls (around line 53):
```js
const { data: session } = useSession();
const wizardSaveRef = React.useRef(null);

// Initialize debounced wizard save
useEffect(() => {
    if (session?.user) {
        wizardSaveRef.current = createDebouncedWizardSave();
    }
    return () => {
        wizardSaveRef.current?.flush();
    };
}, [session?.user]);
```

**Modify the existing localStorage persist useEffect** (line 56-62). Change it to dual-write:
```js
// Persist wizard state to localStorage + Supabase
useEffect(() => {
    try {
        localStorage.setItem("idm-provisioning-state", JSON.stringify(wizardState));
    } catch {
        // ignore
    }
    // Dual-write to Supabase when authenticated
    wizardSaveRef.current?.debouncedSave(wizardState);
}, [wizardState]);
```

**Add Phase 2 Supabase fetch** — add a new useEffect after the dual-write one:
```js
// Phase 2: Fetch wizard state from Supabase and merge if newer
useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    (async () => {
        const dbData = await fetchWizardStateFromApi();
        if (cancelled || !dbData?.wizard_data) return;

        // If DB has wizard data, check if we should use it
        // (DB data takes precedence if local has no data or is in unconfigured state)
        const localRaw = localStorage.getItem("idm-provisioning-state");
        if (!localRaw) {
            setWizardState(dbData.wizard_data);
            localStorage.setItem("idm-provisioning-state", JSON.stringify(dbData.wizard_data));
        }
    })();

    return () => { cancelled = true; };
}, [session?.user]);
```

### 4B: Preview Step — Run Engine on Provision and Refresh

Modify `src/components/pages/GoogleProvisioningWizard/steps/PreviewStep.jsx`:

**Add imports** at the top:
```js
import { generateProvisioningResults, generateSyncHistory } from "@/lib/provisioningEngine";
import { STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA, SCHOOLS_DATA } from "@/data/defaults/dataBrowser";
```

**Replace `handleRefresh`** (line 46-48):
```js
const handleRefresh = () => {
    const results = generateProvisioningResults(state, {
        students: STUDENTS_DATA,
        teachers: TEACHERS_DATA,
        staff: STAFF_DATA,
        schools: SCHOOLS_DATA,
    });

    // Store results in localStorage for the IDM page to read
    try {
        localStorage.setItem("idm-provisioning-results", JSON.stringify(results));
    } catch { /* ignore */ }

    // Update preview stats in wizard state via onUpdateState
    if (onUpdateState) {
        onUpdateState({
            preview: {
                lastRun: "just now",
                accountsToCreate: results.syncSummary.creates,
                accountsToUpdate: results.syncSummary.updates,
                accountsToArchive: results.syncSummary.archives,
                syncIssues: results.syncSummary.issues,
                details: [
                    { action: "Matched", detail: `${results.syncSummary.matches} Clever accounts will be matched with Google accounts.`, nextSteps: "-" },
                    { action: "Creates", detail: `${results.syncSummary.creates} Google account${results.syncSummary.creates !== 1 ? "s" : ""} will be created based on Clever data.`, nextSteps: "-" },
                    { action: "Total Updates", detail: `${results.syncSummary.updates} Google accounts will be updated based on Clever data.`, nextSteps: "-" },
                    { action: "Archives", detail: `${results.syncSummary.archives} Google accounts will be suspended and moved to an archive OU.`, nextSteps: "-" },
                    { action: "Total Issues", detail: `There will be ${results.syncSummary.issues} issues.`, nextSteps: "-" },
                    { action: "Conflicts", detail: "0 accounts will not be created or matched because of conflicts.", nextSteps: "-" },
                ],
            },
        });
    }

    setToast("Preview refreshed with provisioning engine results.");
};
```

**Replace `handleProvision`** (line 50-55):
```js
const handleProvision = () => {
    // Run the engine one final time to generate definitive results
    const results = generateProvisioningResults(state, {
        students: STUDENTS_DATA,
        teachers: TEACHERS_DATA,
        staff: STAFF_DATA,
        schools: SCHOOLS_DATA,
    });

    // Store results in localStorage for IDM page
    try {
        localStorage.setItem("idm-provisioning-results", JSON.stringify(results));
    } catch { /* ignore */ }

    // Also generate and store sync history
    const syncHist = generateSyncHistory(results.syncSummary, results.events.length);
    try {
        localStorage.setItem("idm-provisioning-sync-history", JSON.stringify(syncHist));
    } catch { /* ignore */ }

    checkActionGoal("wizard-provision-google");
    onProvisionComplete?.();
    setToast("Provisioning started! Google accounts are being created. Returning to IDM...");
    setTimeout(() => onExit(), 2500);
};
```

**Update the component signature** — add `onUpdateState` prop:

Find the function signature:
```js
export default function PreviewStep({ state, setToast, onExit, onProvisionComplete }) {
```

Change to:
```js
export default function PreviewStep({ state, setToast, onExit, onProvisionComplete, onUpdateState }) {
```

**Then wire `onUpdateState` from the parent wizard.** In `src/components/pages/GoogleProvisioningWizard/index.jsx`, find where `PreviewStep` is rendered. The `STEP_COMPONENTS` map already handles this, but props are passed generically. Find the section where the active step component is rendered (around line 140+) and ensure `onUpdateState={updateState}` is passed.

Look for the rendering pattern — it likely renders like:
```jsx
<StepComponent
    state={wizardState}
    ...
/>
```

Add `onUpdateState={updateState}` to the props passed to the step component. The `updateState` function already exists (line 72-74) and calls `setWizardState(prev => ({ ...prev, ...updates }))`.

**Commit 4:** `feat: wire provisioning engine to wizard (dual-write + provision/refresh)`

---

## Verification

```bash
npx eslint src/           # 0 errors
npx vitest run            # all tests pass (282+ existing)
```

Manual checks:
- [ ] Open the provisioning wizard, navigate to Preview step, click "Refresh" — preview stats should update with computed counts (40 creates)
- [ ] Click "Provision Google" — should store results in localStorage keys `idm-provisioning-results` and `idm-provisioning-sync-history`
- [ ] Check browser devtools → Application → Local Storage → `idm-provisioning-results` should contain an array of 40 event objects
- [ ] Each event should have `personId`, `destinationUsername` (email), `currentOU`, `user` (name), `sisId`

## File Summary

| Action | File |
|--------|------|
| Create | `src/app/api/progress/wizard/route.js` |
| Create | `src/lib/provisioningEngine.js` |
| Modify | `src/lib/progressApi.js` |
| Modify | `src/components/pages/GoogleProvisioningWizard/index.jsx` |
| Modify | `src/components/pages/GoogleProvisioningWizard/steps/PreviewStep.jsx` |
