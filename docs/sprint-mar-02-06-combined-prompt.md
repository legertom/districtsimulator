# Sprint Mar 02-06: Provisioning Engine + Scenario 1 Expansion

> Paste this into a single Claude Code session. Execute all 5 phases in order.
> Each phase has a verification gate — tests + lint must pass before proceeding.

---

## Read These Files First

Read ALL of these files upfront before starting any work.

### Read for context (do not modify)

```
src/data/defaults/dataBrowser.js          # STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA, SCHOOLS_DATA shapes
src/data/defaults/idm.js                  # buildEvent() field shape reference
src/data/defaults/idm-provisioning.js     # DEFAULT_PROVISIONING_STATE, email/OU format segment shapes
src/app/api/progress/session/route.js     # Pattern to follow for wizard state API route
src/components/pages/GoogleProvisioningWizard/steps/CredentialFormatEditorModal.jsx  # EMAIL_USER_MAP reference (lines 13-24)
src/context/InstructionalContext.jsx       # Phase 2 async DB load pattern (lines 317-380)
src/__tests__/findProfileIdForEvent.test.js  # Existing test patterns
src/__tests__/idm-data-consistency.test.js   # Existing test patterns
```

### Will be modified

```
src/lib/progressApi.js                                                    # Phase 1: append wizard state functions
src/components/pages/GoogleProvisioningWizard/index.jsx                   # Phase 1: dual-write + Supabase fetch
src/components/pages/GoogleProvisioningWizard/steps/PreviewStep.jsx       # Phase 1 + Phase 5: engine wiring + refresh goalAction
src/components/pages/IDM.jsx                                              # Phase 2 + Phase 5: dynamic events + tab goalAction
src/components/pages/profiles/CleverIDMSection.jsx                        # Phase 2: read provisioning results
src/context/InstructionalContext.jsx                                      # Phase 2: parallel fetch wizard state
src/components/pages/GoogleProvisioningWizard/steps/SetCredentialsStep.jsx  # Phase 4: checkActionGoal triggers
src/components/pages/GoogleProvisioningWizard/steps/OrganizeOUsStep.jsx   # Phase 4: checkActionGoal triggers (if needed)
src/components/pages/GoogleProvisioningWizard/steps/ConfigureGroupsStep.jsx # Phase 4: checkActionGoal triggers (if needed)
src/data/scenarios.js                                                     # Phase 4 + Phase 5: scenario expansion
```

### Will be created

```
src/app/api/progress/wizard/route.js      # Phase 1: wizard state API
src/lib/provisioningEngine.js             # Phase 1: core engine
src/__tests__/provisioningEngine.test.js  # Phase 3: engine tests
src/__tests__/wizardStateApi.test.js       # Phase 3: API tests
```

---

## Reference Data Shapes

Used across multiple phases. Defined once here. The IDM event field shape is in the `provisioningEngine.js` code below (Phase 1.3) -- refer to `events.push({...})` for the exact shape. It matches `buildEvent()` in `src/data/defaults/idm.js` plus a new `personId` field.

### Data Browser Person Records

**Student** (`STUDENTS_DATA`): `{ id, school, schoolId, first, last, middleName, grade, studentNumber, stateId, ... }`
**Teacher** (`TEACHERS_DATA`): `{ id, school, schoolId, first, last, title, teacherNumber, stateTeacherId, ... }`
**Staff** (`STAFF_DATA`): `{ id, school, schoolId, first, last, title, department, ... }`

### Email Format Segments

Wizard stores email formats as segment arrays:
```js
emailFormat: [
    { type: "variable", variable: "name.first", label: "First Name" },
    { type: "variable", variable: "name.last", label: "Last Name" },
]
// Produces: "firstnamelastname@cedarridgesd.org"
```

Segment types: `{ type: "variable", variable: "name.first" }`, `{ type: "text", value: "." }`, `{ type: "function", fn: "To Lowercase" }` (ignore functions for now).

### OU Format Segments

Same pattern for sub-OU formats:
```js
subOUFormat: [
    { type: "text", value: "/" },
    { type: "variable", variable: "school_name" },
    { type: "text", value: "/" },
    { type: "variable", variable: "student.grade" },
]
// With base path "/Students" produces: "/Students/Cedar Ridge Middle School/5"
```

### Variable Resolver Map

| Variable | Student | Teacher | Staff |
|---|---|---|---|
| `name.first` | `person.first.toLowerCase()` | same | same |
| `name.last` | `person.last.toLowerCase()` | same | same |
| `student.student_number` | `person.studentNumber` | N/A | N/A |
| `student.state_id` | `person.stateId` | N/A | N/A |
| `student.sis_id` | `person.id` | N/A | N/A |
| `student.grade` | `person.grade` | N/A | N/A |
| `teacher.teacher_number` | N/A | `person.teacherNumber` | N/A |
| `teacher.sis_id` | N/A | `person.id` | N/A |
| `staff.title` | N/A | N/A | `person.title?.toLowerCase()` |
| `staff.sis_id` | N/A | N/A | `person.id` |
| `staff.department` | N/A | N/A | `person.department` |
| `school_name` | school lookup by `person.schoolId` | same | same |

### Existing goalAction Triggers (wizard)

- `wizard-step-{stepId}` — navigating between steps (from `index.jsx`)
- `wizard-connect-google` — clicking Connect (from `ConnectStep.jsx`)
- `wizard-select-full-provisioning` — selecting full provisioning (from `ManagementLevelStep.jsx`)
- `wizard-select-all-users` — all 3 types checked (from `SelectUsersStep.jsx`)
- `wizard-provision-google` — provisioning (from `PreviewStep.jsx`)

### Existing `data-instruction-target` Attributes

- `credential-card-{userType}`, `edit-credential-{userType}`, `edit-format-link-{userType}`

---

## Commit Strategy

Commit once per phase (5 total commits):
1. `feat: provisioning engine core + wizard state persistence`
2. `feat: wire dynamic data to IDM page and profiles`
3. `test: provisioning engine, wizard API, and integration tests`
4. `feat: expand Scenario 1 with credentials, OUs, and groups steps`
5. `feat: complete Scenario 1 with summary, provision, and events verification`

---

## Phase 1: Provisioning Engine Core + Wizard State Persistence

**Creates:** `src/app/api/progress/wizard/route.js`, `src/lib/provisioningEngine.js`
**Modifies:** `src/lib/progressApi.js`, `src/components/pages/GoogleProvisioningWizard/index.jsx`, `src/components/pages/GoogleProvisioningWizard/steps/PreviewStep.jsx`

### 1.1: Wizard State API Route

Create `src/app/api/progress/wizard/route.js` — same pattern as `src/app/api/progress/session/route.js`. The `wizard_state` table already exists with columns: `id`, `user_id`, `wizard_data` (jsonb), `created_at`, `updated_at`.

```js
// src/app/api/progress/wizard/route.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

### 1.2: Wizard State Client Functions

Append to `src/lib/progressApi.js` after the existing `createDebouncedSessionSave()` function:

```js
// ═══════════════════════════════════════════════════════════════
//  Wizard state persistence (provisioning wizard config)
// ═══════════════════════════════════════════════════════════════

export async function fetchWizardStateFromApi() {
    try {
        const res = await fetch("/api/progress/wizard");
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

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

### 1.3: Provisioning Engine

Create `src/lib/provisioningEngine.js`:

```js
// src/lib/provisioningEngine.js

import { SCHOOLS_DATA } from "@/data/defaults/dataBrowser";

// ═══════════════════════════════════════════════════════════════
//  Variable resolver
// ═══════════════════════════════════════════════════════════════

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

export function applyEmailTemplate(formatSegments, domain, person, userType, schoolsData) {
    if (!formatSegments?.length) {
        const first = person.first?.toLowerCase() || "";
        const last = person.last?.toLowerCase() || "";
        return `${first}${last}@${domain}`;
    }

    const resolve = createVariableResolver(person, userType, schoolsData);

    const username = formatSegments
        .map((seg) => {
            if (seg.type === "text") return seg.value;
            if (seg.type === "variable") return resolve(seg.variable);
            if (seg.type === "function") return "";
            return "";
        })
        .join("");

    return domain ? `${username}@${domain}` : username;
}

export function applyOUTemplate(ouConfig, person, userType, schoolsData) {
    if (!ouConfig?.path) return "/";

    if (!ouConfig.subOUFormat?.length) {
        return ouConfig.path;
    }

    const resolve = createVariableResolver(person, userType, schoolsData);

    const subOU = ouConfig.subOUFormat
        .map((seg) => {
            if (seg.type === "text") return seg.value;
            if (seg.type === "variable") return resolve(seg.variable);
            return "";
        })
        .join("");

    const basePath = ouConfig.path.replace(/\/+$/, "");
    return `${basePath}${subOU}`;
}

export function generateCleverId(personId) {
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

export function generateProvisioningResults(wizardConfig, dataBrowserData) {
    const { students, teachers, staff, schools } = dataBrowserData;
    const events = [];
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

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

export function generateSyncHistory(syncSummary, totalUsers) {
    const rows = [];
    const now = new Date();

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

### 1.4: Wire Engine to Wizard (Dual-Write + Provision/Refresh)

**Modify `src/components/pages/GoogleProvisioningWizard/index.jsx`:**

Add imports after existing imports:
```js
import { useSession } from "next-auth/react";
import {
    fetchWizardStateFromApi,
    createDebouncedWizardSave,
} from "@/lib/progressApi";
```

Add session + debounce setup inside the component, after existing `useState` calls:
```js
const { data: session } = useSession();
const wizardSaveRef = React.useRef(null);

useEffect(() => {
    if (session?.user) {
        wizardSaveRef.current = createDebouncedWizardSave();
    }
    return () => {
        wizardSaveRef.current?.flush();
    };
}, [session?.user]);
```

Replace the existing localStorage persist useEffect (around line 56-62) with dual-write:
```js
// Persist wizard state to localStorage + Supabase
useEffect(() => {
    try {
        localStorage.setItem("idm-provisioning-state", JSON.stringify(wizardState));
    } catch {
        // ignore
    }
    wizardSaveRef.current?.debouncedSave(wizardState);
}, [wizardState]);
```

Add Supabase fetch useEffect after the dual-write one:
```js
// Phase 2: Fetch wizard state from Supabase and merge if newer
useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    (async () => {
        const dbData = await fetchWizardStateFromApi();
        if (cancelled || !dbData?.wizard_data) return;

        const localRaw = localStorage.getItem("idm-provisioning-state");
        if (!localRaw) {
            setWizardState(dbData.wizard_data);
            localStorage.setItem("idm-provisioning-state", JSON.stringify(dbData.wizard_data));
        }
    })();

    return () => { cancelled = true; };
}, [session?.user]);
```

Ensure `onUpdateState={updateState}` is passed to the step component where it renders `<StepComponent>`. The `updateState` function already exists (calls `setWizardState(prev => ({ ...prev, ...updates }))`).

**Modify `src/components/pages/GoogleProvisioningWizard/steps/PreviewStep.jsx`:**

Add imports:
```js
import { generateProvisioningResults, generateSyncHistory } from "@/lib/provisioningEngine";
import { STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA, SCHOOLS_DATA } from "@/data/defaults/dataBrowser";
```

Update component signature to accept `onUpdateState`:
```js
export default function PreviewStep({ state, setToast, onExit, onProvisionComplete, onUpdateState }) {
```

Replace `handleRefresh` (around line 46-48):
```js
const handleRefresh = () => {
    const results = generateProvisioningResults(state, {
        students: STUDENTS_DATA,
        teachers: TEACHERS_DATA,
        staff: STAFF_DATA,
        schools: SCHOOLS_DATA,
    });

    try {
        localStorage.setItem("idm-provisioning-results", JSON.stringify(results));
    } catch { /* ignore */ }

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

Replace `handleProvision` (around line 50-55):
```js
const handleProvision = () => {
    const results = generateProvisioningResults(state, {
        students: STUDENTS_DATA,
        teachers: TEACHERS_DATA,
        staff: STAFF_DATA,
        schools: SCHOOLS_DATA,
    });

    try {
        localStorage.setItem("idm-provisioning-results", JSON.stringify(results));
    } catch { /* ignore */ }

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

### Phase 1 Verification Gate

```bash
npx vitest run && npx eslint src/
```

**Commit:** `feat: provisioning engine core + wizard state persistence`

---

## Phase 2: Wire Dynamic Data to IDM Page + Profiles

**Modifies:** `src/components/pages/IDM.jsx`, `src/components/pages/profiles/CleverIDMSection.jsx`, `src/context/InstructionalContext.jsx`

### 2.1: IDM Page Dynamic Events + Sync History

Modify `src/components/pages/IDM.jsx`.

After `const idm = resolvedData?.idm ?? {};` (around line 93), add:
```js
const [dynamicEvents, setDynamicEvents] = useState(null);
const [dynamicSyncHistory, setDynamicSyncHistory] = useState(null);

useEffect(() => {
    if (!idmSetupComplete) return;
    try {
        const eventsRaw = localStorage.getItem("idm-provisioning-results");
        if (eventsRaw) {
            const parsed = JSON.parse(eventsRaw);
            setDynamicEvents(parsed.events || null);
        }
        const syncRaw = localStorage.getItem("idm-provisioning-sync-history");
        if (syncRaw) {
            setDynamicSyncHistory(JSON.parse(syncRaw));
        }
    } catch {
        // Fall back to static data
    }
}, [idmSetupComplete]);
```

Change the static data lines:
```js
// BEFORE:
const configuredDestinations = idm.destinations ?? [];
const syncHistory = idm.syncHistory ?? [];
const allEvents = idm.events ?? [];

// AFTER:
const configuredDestinations = idm.destinations ?? [];
const syncHistoryData = dynamicSyncHistory || (idm.syncHistory ?? []);
const allEvents = dynamicEvents || (idm.events ?? []);
```

Rename all `syncHistory` variable references to `syncHistoryData` (4-5 occurrences). Do NOT rename the "Sync History" tab label strings.

Add `const totalProvisionedUsers = allEvents.length;` and use it where the Google provider card displays managed user count.

### 2.2: Update `findProfileIdForEvent` to prefer personId

Replace the function (lines 70-87 in IDM.jsx):

```js
function findProfileIdForEvent(ev, scenarioData) {
    // Prefer personId from engine-generated events (exact match)
    if (ev.personId) {
        return { id: ev.personId, userType: ev.userType };
    }

    // Fall back to name-based heuristic for static events
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

### 2.3: Profile IDM Section — Read Provisioning Results

Replace entire content of `src/components/pages/profiles/CleverIDMSection.jsx`:

```jsx
"use client";

import { useMemo } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "./ProfilePage.module.css";

export default function CleverIDMSection({ userType, person }) {
    const { idmSetupComplete } = useInstructional();

    const provisionedEvent = useMemo(() => {
        if (typeof window === "undefined" || !person?.id) return null;
        try {
            const raw = localStorage.getItem("idm-provisioning-results");
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            const events = parsed.events || [];
            return events.find((ev) => ev.personId === person.id) || null;
        } catch {
            return null;
        }
    }, [person?.id]);

    const provisioningConfig = useMemo(() => {
        if (provisionedEvent) return null;
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem("idm-provisioning-state");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, [provisionedEvent]);

    if (!idmSetupComplete) return null;

    const googleEmail = provisionedEvent
        ? provisionedEvent.destinationUsername
        : computeEmail(provisioningConfig, userType, person) || "\u2014";
    const googleId = provisionedEvent ? provisionedEvent.cleverId : "\u2014";
    const googleOU = provisionedEvent ? provisionedEvent.currentOU : null;

    return (
        <div className={styles.card}>
            <h2 className={styles.cardHeader}>Clever IDM Information</h2>
            <div className={styles.fieldGrid}>
                <Field label="Google Email" value={googleEmail} />
                <Field label="Google ID" value={googleId} />
                {googleOU && <Field label="Google OU" value={googleOU} />}
                {userType !== "staff" && (
                    <Field label="Google Password" value="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
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
            <span className={value && value !== "\u2014" ? styles.fieldValue : styles.fieldEmpty}>
                {value || "\u2014"}
            </span>
        </div>
    );
}

function computeEmail(config, userType, person) {
    const typeKey = userType + "s";
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

### 2.4: InstructionalContext — Parallel Fetch Wizard State

Modify `src/context/InstructionalContext.jsx`.

Add `fetchWizardStateFromApi` to the import from `@/lib/progressApi`.

Change the Phase 2 Promise.all (around line 326):
```js
// BEFORE:
const [progressData, sessionData] = await Promise.all([
    fetchProgressFromApi(),
    fetchSessionStateFromApi(),
]);

// AFTER:
const [progressData, sessionData, wizardData] = await Promise.all([
    fetchProgressFromApi(),
    fetchSessionStateFromApi(),
    fetchWizardStateFromApi(),
]);
```

After the session recovery block (around line 372, before `catch`), add:
```js
if (wizardData?.wizard_data) {
    try {
        const localWizard = localStorage.getItem("idm-provisioning-state");
        if (!localWizard) {
            localStorage.setItem("idm-provisioning-state", JSON.stringify(wizardData.wizard_data));
        }
        if (wizardData.wizard_data.provisioning_results) {
            const localResults = localStorage.getItem("idm-provisioning-results");
            if (!localResults) {
                localStorage.setItem("idm-provisioning-results", JSON.stringify(wizardData.wizard_data.provisioning_results));
            }
        }
    } catch {
        // ignore localStorage errors
    }
}
```

### Phase 2 Verification Gate

```bash
npx vitest run && npx eslint src/
```

**Commit:** `feat: wire dynamic data to IDM page and profiles`

---

## Phase 3: Tests

**Creates:** `src/__tests__/provisioningEngine.test.js`, `src/__tests__/wizardStateApi.test.js`
**Modifies:** `src/__tests__/findProfileIdForEvent.test.js`, `src/__tests__/idm-data-consistency.test.js`

### 3.1: Provisioning Engine Unit Tests

Create `src/__tests__/provisioningEngine.test.js`. Import `generateProvisioningResults`, `applyEmailTemplate`, `applyOUTemplate`, `generateCleverId`, `generateSyncHistory` from `@/lib/provisioningEngine`, plus `STUDENTS_DATA`, `TEACHERS_DATA`, `STAFF_DATA`, `SCHOOLS_DATA` from `@/data/defaults/dataBrowser` and `DEFAULT_PROVISIONING_STATE` from `@/data/defaults/idm-provisioning`.

Write **19 tests** covering:
- `applyEmailTemplate`: default format -> `"annamariefeest@cedarridgesd.org"`, dot separator -> `"annamarie.feest@..."`, student_number variable, teacher_number variable, empty segments fallback, no domain
- `applyOUTemplate`: default student -> school+grade path, static path only, staff department, null config -> `"/"`
- `generateCleverId`: 24-char hex, deterministic
- `generateProvisioningResults`: all types -> 40 events, students only -> 20, all required fields present, `personId === sisId`, `syncSummary.creates === events.length`
- `generateSyncHistory`: 14 rows, row 0 has creates, rows 1-13 have matches only

### 3.2: Wizard State API Tests

Create `src/__tests__/wizardStateApi.test.js`. Import `fetchWizardStateFromApi`, `saveWizardStateToApi`, `createDebouncedWizardSave` from `@/lib/progressApi`.

Write **8 tests**: fetch success/error/non-OK (3), save correct payload/no-throw (2), debounce delays/flush/cancel using `vi.useFakeTimers()` (3).

### 3.3: Update Existing Tests

**`src/__tests__/findProfileIdForEvent.test.js`** — add 3 tests:
```js
test("prefers personId when present (engine-generated event)", () => {
    const ev = {
        user: "Annamarie Feest",
        userType: "Student",
        personId: "10a98369-7f2b-466b-abf2-1b9411e35351",
    };
    const result = findProfileIdForEvent(ev, scenarioData);
    expect(result).toEqual({
        id: "10a98369-7f2b-466b-abf2-1b9411e35351",
        userType: "Student",
    });
});

test("personId takes precedence over name matching", () => {
    const ev = {
        user: "Wrong Name",
        userType: "Student",
        personId: "some-known-id",
    };
    const result = findProfileIdForEvent(ev, scenarioData);
    expect(result).toEqual({
        id: "some-known-id",
        userType: "Student",
    });
});

test("falls back to name matching when personId is absent", () => {
    const ev = {
        user: "Annamarie Feest",
        userType: "Student",
    };
    const result = findProfileIdForEvent(ev, scenarioData);
    expect(result.id).toBe("10a98369-7f2b-466b-abf2-1b9411e35351");
});
```

**`src/__tests__/idm-data-consistency.test.js`** — add engine consistency test:
```js
import { generateProvisioningResults } from "@/lib/provisioningEngine";
import { STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA, SCHOOLS_DATA } from "@/data/defaults/dataBrowser";
import { DEFAULT_PROVISIONING_STATE } from "@/data/defaults/idm-provisioning";

test("engine-generated events reference real Data Browser people", () => {
    const { events } = generateProvisioningResults(DEFAULT_PROVISIONING_STATE, {
        students: STUDENTS_DATA,
        teachers: TEACHERS_DATA,
        staff: STAFF_DATA,
        schools: SCHOOLS_DATA,
    });

    const allPeople = [...STUDENTS_DATA, ...TEACHERS_DATA, ...STAFF_DATA];
    for (const ev of events) {
        const person = allPeople.find((p) => p.id === ev.personId);
        expect(person).toBeDefined();
        expect(ev.user).toBe(`${person.first} ${person.last}`);
        expect(ev.sisId).toBe(person.id);
    }
});
```

Fix any import path or lint issues after running tests.

### Phase 3 Verification Gate

```bash
npx vitest run && npx eslint src/
```

Expect 300+ tests passing (282 existing + ~30 new).

**Commit:** `test: provisioning engine, wizard API, and integration tests`

---

## Phase 4: Scenario 1 Expansion — Credentials, OUs, Groups

**Modifies:** `src/data/scenarios.js`, `src/components/pages/GoogleProvisioningWizard/steps/SetCredentialsStep.jsx`, and possibly `OrganizeOUsStep.jsx`, `ConfigureGroupsStep.jsx`

### 4.1: Add checkActionGoal Triggers to Wizard Steps

**`SetCredentialsStep.jsx`:**

Add import:
```js
import { useInstructional } from "@/context/InstructionalContext";
```

Inside `CredentialEditView` component, after `const [section, setSection]`:
```js
const { checkActionGoal } = useInstructional();
```

Replace `handleNextStep`:
```js
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
```

Inside main `SetCredentialsStep` component, after `const [editingType, setEditingType]`:
```js
const { checkActionGoal } = useInstructional();
```

Update each `onEdit` callback:
```js
onEdit={() => { checkActionGoal("credential-edit-students"); setEditingType("students"); }}
onEdit={() => { checkActionGoal("credential-edit-teachers"); setEditingType("teachers"); }}
onEdit={() => { checkActionGoal("credential-edit-staff"); setEditingType("staff"); }}
```

**`OrganizeOUsStep.jsx` and `ConfigureGroupsStep.jsx`:** Ensure they import `useInstructional` if not already. Scenario OU/Groups steps are checkpoint-only (no Edit interactions).

### 4.2: Expand Scenario 1 Steps in `src/data/scenarios.js`

**Update step 8 references.** In `step_setup_users_assessment`:
- Change `nextStep: "step_setup_nav_preview"` to `nextStep: "step_setup_nav_credentials"` (correct answer)
- Change all `unguidedNextStep: "step_setup_nav_preview"` to `unguidedNextStep: "step_setup_nav_credentials"`

In `step_setup_users_wrong`:
- Change `nextStep: "step_setup_nav_preview"` to `nextStep: "step_setup_nav_credentials"`

**Remove** old step 9 (`step_setup_nav_preview`). **Keep** `step_setup_provision` and `step_setup_resolution` at the end.

**Insert the following new steps** after `step_setup_users_wrong`:

```js
// ══════════════════════════════════════════════════════════
//  WIZARD STEP 4: LOGIN CREDENTIALS
// ══════════════════════════════════════════════════════════

{
    id: "step_setup_nav_credentials",
    type: "task",
    checklistLabel: "Move to the Login Credentials step",
    goalAction: "wizard-step-credentials",
    nextStep: "step_setup_edit_student_creds",
    guideMessage: "Click 'Set login credentials' in the wizard sidebar.",
    alexPrompt: "Now we need to set up how Clever creates email addresses and passwords for Google accounts. Click \"Set login credentials\" in the sidebar.",
    alexCorrectResponse: "This is the credentials step. You'll configure email formats and passwords for each user type \u2014 students, teachers, and staff. Let's start with students.",
    hint: {
        target: "wizard-step-credentials",
        message: "Click 'Set login credentials' in the wizard sidebar.",
    },
    autoShowHint: true,
},
{
    id: "step_setup_edit_student_creds",
    type: "task",
    checklistLabel: "Edit student credentials",
    goalAction: "credential-edit-students",
    nextStep: "step_setup_student_creds_next",
    guideMessage: "Click 'Edit' on the Student credentials card.",
    alexPrompt: "Start with students. Click \"Edit\" on the Student credentials card.",
    alexCorrectResponse: "This shows a sample student's Clever data \u2014 Rogelio Waelchi. You can see their SIS email, student number, and other fields. Click \"Next Step\" to see the email configuration.",
    hint: { target: "edit-credential-students", message: "Click 'Edit' on the Student credentials card." },
    autoShowHint: true,
},
{
    id: "step_setup_student_creds_next",
    type: "task",
    checklistLabel: "View student email configuration",
    goalAction: "credential-next-step-students",
    nextStep: "step_setup_student_creds_save",
    guideMessage: "Click 'Next Step' to see the email format.",
    alexPrompt: "Click \"Next Step\" to see how student emails will be generated.",
    alexCorrectResponse: "Here's the email configuration. The format uses first name + last name to create emails like \"rogeliowaelchi@cedarridgesd.org\". The format is already configured \u2014 no changes needed for now.",
    hint: { target: null, message: "Click the 'Next Step' button at the bottom." },
    autoShowHint: true,
},
{
    id: "step_setup_student_creds_save",
    type: "task",
    checklistLabel: "Save student credentials",
    goalAction: "credential-save-students",
    nextStep: "step_setup_edit_teacher_creds",
    guideMessage: "Click 'Save' to confirm the student credentials.",
    alexPrompt: "The email format looks good. Click \"Save\" to confirm the student email and password settings.",
    alexCorrectResponse: "Student credentials saved. Now let's do the same for teachers.",
    hint: { target: null, message: "Click the 'Save' button at the bottom." },
    autoShowHint: true,
},
{
    id: "step_setup_edit_teacher_creds",
    type: "task",
    checklistLabel: "Edit teacher credentials",
    goalAction: "credential-edit-teachers",
    nextStep: "step_setup_teacher_creds_next",
    guideMessage: "Click 'Edit' on the Teacher credentials card.",
    alexPrompt: "Now teachers. Click \"Edit\" on the Teacher credentials card.",
    alexCorrectResponse: "Here's the sample teacher data \u2014 Betty Bauch. Click \"Next Step\" to see the email format.",
    hint: { target: "edit-credential-teachers", message: "Click 'Edit' on the Teacher credentials card." },
    autoShowHint: true,
},
{
    id: "step_setup_teacher_creds_next",
    type: "task",
    checklistLabel: "View teacher email configuration",
    goalAction: "credential-next-step-teachers",
    nextStep: "step_setup_teacher_creds_save",
    guideMessage: "Click 'Next Step' to see the email format.",
    alexPrompt: "Click \"Next Step\" to see the teacher email format.",
    alexCorrectResponse: "Same format as students \u2014 first name + last name. Teachers get emails like \"bettybauch@cedarridgesd.org\". Click \"Save\" to confirm.",
    hint: { target: null, message: "Click the 'Next Step' button." },
    autoShowHint: true,
},
{
    id: "step_setup_teacher_creds_save",
    type: "task",
    checklistLabel: "Save teacher credentials",
    goalAction: "credential-save-teachers",
    nextStep: "step_setup_edit_staff_creds",
    guideMessage: "Click 'Save' to confirm teacher credentials.",
    alexPrompt: "Click \"Save\" to confirm the teacher email and password settings.",
    alexCorrectResponse: "Teacher credentials saved. One more \u2014 staff.",
    hint: { target: null, message: "Click the 'Save' button." },
    autoShowHint: true,
},
{
    id: "step_setup_edit_staff_creds",
    type: "task",
    checklistLabel: "Edit staff credentials",
    goalAction: "credential-edit-staff",
    nextStep: "step_setup_staff_creds_next",
    guideMessage: "Click 'Edit' on the Staff credentials card.",
    alexPrompt: "Last one \u2014 staff. Click \"Edit\" on the Staff credentials card.",
    alexCorrectResponse: "Here's the sample staff member \u2014 Oswaldo Pouros, a librarian. Click \"Next Step\" to see the email format.",
    hint: { target: "edit-credential-staff", message: "Click 'Edit' on the Staff credentials card." },
    autoShowHint: true,
},
{
    id: "step_setup_staff_creds_next",
    type: "task",
    checklistLabel: "View staff email configuration",
    goalAction: "credential-next-step-staff",
    nextStep: "step_setup_staff_creds_save",
    guideMessage: "Click 'Next Step' to see the email format.",
    alexPrompt: "Click \"Next Step\" to see the staff email format.",
    alexCorrectResponse: "Same pattern \u2014 first name + last name. Click \"Save\" to confirm.",
    hint: { target: null, message: "Click the 'Next Step' button." },
    autoShowHint: true,
},
{
    id: "step_setup_staff_creds_save",
    type: "task",
    checklistLabel: "Save staff credentials",
    goalAction: "credential-save-staff",
    nextStep: "step_setup_creds_assessment",
    guideMessage: "Click 'Save' to confirm staff credentials.",
    alexPrompt: "Click \"Save\" to confirm the staff email and password settings.",
    alexCorrectResponse: "All credentials configured. Let me quiz you on what we just set up.",
    hint: { target: null, message: "Click the 'Save' button." },
    autoShowHint: true,
},
{
    id: "step_setup_creds_assessment",
    type: "checkpoint",
    checklistLabel: "Confirm student email format",
    question: "What email format is being used for students?",
    alexPrompt: "Quick check \u2014 what email format did we just configure for students?",
    alexCorrectResponse: "That's right \u2014 first name followed by last name, at the Cedar Ridge domain. Simple and consistent across all user types.",
    alexWrongResponse: "Look at the student credentials card. The format combines two name parts with the district domain.",
    choices: [
        { label: "{{name.first}}{{name.last}}@cedarridgesd.org", nextStep: "step_setup_nav_ous", correct: true },
        { label: "{{name.first}}.{{name.last}}@cedarridgesd.org", nextStep: "step_setup_creds_wrong", unguidedNextStep: "step_setup_nav_ous", correct: false },
        { label: "Their SIS email from Clever", nextStep: "step_setup_creds_wrong", unguidedNextStep: "step_setup_nav_ous", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_creds_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Confirm email format (retry)",
    question: "The format combines first name and last name with no separator. Which one is it?",
    alexPrompt: "Look again \u2014 the format uses two name variables with no dot between them.",
    choices: [
        { label: "{{name.first}}{{name.last}}@cedarridgesd.org", nextStep: "step_setup_nav_ous" },
    ],
},

// ══════════════════════════════════════════════════════════
//  WIZARD STEP 5: ORGANIZE OUs
// ══════════════════════════════════════════════════════════

{
    id: "step_setup_nav_ous",
    type: "task",
    checklistLabel: "Move to the Organize OUs step",
    goalAction: "wizard-step-ous",
    nextStep: "step_setup_ou_assessment",
    guideMessage: "Click 'Organize OUs' in the wizard sidebar.",
    alexPrompt: "Next up: Organizational Units. OUs determine where in Google's directory each user account lives. Click \"Organize OUs\" in the sidebar.",
    alexCorrectResponse: "Here's the OU configuration. Each user type gets assigned to a specific location in Google's org unit tree. Let me test your understanding.",
    hint: { target: "wizard-step-ous", message: "Click 'Organize OUs' in the wizard sidebar." },
    autoShowHint: true,
},
{
    id: "step_setup_ou_assessment",
    type: "checkpoint",
    checklistLabel: "Identify student OU path",
    question: "Looking at the Student OU configuration, what path template organizes students?",
    alexPrompt: "Look at the Student OUs card. What path template is used to organize students into sub-OUs?",
    alexCorrectResponse: "Right \u2014 students are organized by school and grade. A 5th grader at Santa Rosa would land in /Students/Santa Rosa Elementary School/5.",
    alexWrongResponse: "Check the Student OUs card \u2014 the path uses school name and grade variables.",
    choices: [
        { label: "/Students/{{school_name}}/{{student.grade}}", nextStep: "step_setup_ou_archive_assessment", correct: true },
        { label: "/Students", nextStep: "step_setup_ou_wrong", unguidedNextStep: "step_setup_ou_archive_assessment", correct: false },
        { label: "/Users/Students/{{student.grade}}", nextStep: "step_setup_ou_wrong", unguidedNextStep: "step_setup_ou_archive_assessment", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_ou_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Identify student OU path (retry)",
    question: "The student OU path includes both school name and grade. Which option shows that?",
    alexPrompt: "Look at the student OU card again. It has two variables: school name and grade.",
    choices: [
        { label: "/Students/{{school_name}}/{{student.grade}}", nextStep: "step_setup_ou_archive_assessment" },
    ],
},
{
    id: "step_setup_ou_archive_assessment",
    type: "checkpoint",
    checklistLabel: "Understand archive behavior",
    question: "What happens to users who are no longer in Clever?",
    alexPrompt: "Check the Archive OU card. What happens when a user is removed from Clever's data?",
    alexCorrectResponse: "Correct. Archived users get moved to the archive OU and their accounts are suspended. They're not deleted \u2014 they can be recovered if needed.",
    alexWrongResponse: "Look at the Archive OU card \u2014 it says 'Move to archive OU and suspend'.",
    choices: [
        { label: "They are moved to an archive OU and suspended", nextStep: "step_setup_nav_groups", correct: true },
        { label: "They are permanently deleted from Google", nextStep: "step_setup_ou_archive_wrong", unguidedNextStep: "step_setup_nav_groups", correct: false },
        { label: "Nothing happens \u2014 they stay in their current OU", nextStep: "step_setup_ou_archive_wrong", unguidedNextStep: "step_setup_nav_groups", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_ou_archive_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Understand archive behavior (retry)",
    question: "Clever IDM moves archived users and suspends them \u2014 it never permanently deletes.",
    alexPrompt: "Look at the Archive card again. The action says 'Move to archive OU and suspend'.",
    choices: [
        { label: "They are moved to an archive OU and suspended", nextStep: "step_setup_nav_groups" },
    ],
},

// ══════════════════════════════════════════════════════════
//  WIZARD STEP 6: CONFIGURE GROUPS
// ══════════════════════════════════════════════════════════

{
    id: "step_setup_nav_groups",
    type: "task",
    checklistLabel: "Move to the Configure Groups step",
    goalAction: "wizard-step-groups",
    nextStep: "step_setup_groups_assessment",
    guideMessage: "Click 'Configure groups' in the wizard sidebar.",
    alexPrompt: "Last configuration step: Groups. Google Groups let you manage email distribution lists and access control. Click \"Configure groups\" in the sidebar.",
    alexCorrectResponse: "Groups are optional. Cedar Ridge hasn't set up any group rules yet \u2014 and that's fine for initial provisioning. Let's verify.",
    hint: { target: "wizard-step-groups", message: "Click 'Configure groups' in the wizard sidebar." },
    autoShowHint: true,
},
{
    id: "step_setup_groups_assessment",
    type: "checkpoint",
    checklistLabel: "Confirm group configuration",
    question: "How many group rules are configured for Cedar Ridge?",
    alexPrompt: "Look at the group cards. How many rules are configured for each user type?",
    alexCorrectResponse: "Zero rules \u2014 and that's intentional. Groups are optional and Cedar Ridge will set those up later. For now, we just need email accounts and OUs. Let's move on to the summary.",
    alexWrongResponse: "Check each group card \u2014 they all show '0 rules configured'.",
    choices: [
        { label: "0 \u2014 no rules configured for any user type", nextStep: "step_setup_nav_summary", correct: true },
        { label: "3 \u2014 one rule per user type", nextStep: "step_setup_groups_wrong", unguidedNextStep: "step_setup_nav_summary", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_groups_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Confirm group configuration (retry)",
    question: "Each user type card shows the number of rules configured. What's the count?",
    alexPrompt: "Look at each card \u2014 Students, Teachers, Staff. They all say 0 rules.",
    choices: [
        { label: "0 \u2014 no rules configured", nextStep: "step_setup_nav_summary" },
    ],
},
```

**Remove** old `step_setup_nav_preview` (step 9). Keep `step_setup_provision` and `step_setup_resolution` at end. Add temporary `step_setup_nav_summary` placeholder so scenario validates:
```js
{
    id: "step_setup_nav_summary",
    type: "task",
    checklistLabel: "Move to the Summary step",
    goalAction: "wizard-step-summary",
    nextStep: "step_setup_provision",
    guideMessage: "Click 'Summary' in the wizard sidebar.",
    alexPrompt: "Let's review everything in the Summary. Click \"Summary\" in the sidebar.",
    alexCorrectResponse: "Here's the summary of your complete configuration.",
    hint: { target: "wizard-step-summary", message: "Click 'Summary' in the wizard sidebar." },
    autoShowHint: true,
},
```

### Phase 4 Verification Gate

```bash
npx vitest run && npx eslint src/
```

**Commit:** `feat: expand Scenario 1 with credentials, OUs, and groups steps`

---

## Phase 5: Scenario 1 Completion — Summary + Provision + Events Verification

**Modifies:** `src/data/scenarios.js`, `src/components/pages/GoogleProvisioningWizard/steps/PreviewStep.jsx`, `src/components/pages/IDM.jsx`

### 5.1: Add Refresh goalAction to PreviewStep

In `src/components/pages/GoogleProvisioningWizard/steps/PreviewStep.jsx`, at the beginning of `handleRefresh`, add:
```js
checkActionGoal("wizard-refresh-preview");
```

Add `data-instruction-target` to the Refresh button:
```jsx
<button className={styles.previewActionLink} data-instruction-target="preview-refresh-btn" onClick={handleRefresh}>
    <RefreshIcon /> Refresh
</button>
```

### 5.2: Add Events Tab goalAction to IDM.jsx

In `src/components/pages/IDM.jsx`, find the tab change handler. When the "events" tab is selected:
```js
if (tab === "events") {
    checkActionGoal("idm-tab-events");
}
```

Add `data-instruction-target="events-tab"` to the Events tab element.

### 5.3: Replace Scenario 1 Ending Steps

In `src/data/scenarios.js`, **remove** temporary `step_setup_nav_summary`, old `step_setup_provision`, and old `step_setup_resolution`. **Replace** with:

```js
// ══════════════════════════════════════════════════════════
//  WIZARD STEP 7: SUMMARY
// ══════════════════════════════════════════════════════════

{
    id: "step_setup_nav_summary",
    type: "task",
    checklistLabel: "Move to the Summary step",
    goalAction: "wizard-step-summary",
    nextStep: "step_setup_summary_level_check",
    guideMessage: "Click 'Summary' in the wizard sidebar.",
    alexPrompt: "Almost done! The Summary gives you a bird's eye view of everything you just configured. Click \"Summary\" in the sidebar.",
    alexCorrectResponse: "Here's the complete configuration summary. Take a moment to review \u2014 this shows your management level, user types, credentials, OUs, and groups all in one place.",
    hint: { target: "wizard-step-summary", message: "Click 'Summary' in the wizard sidebar." },
    autoShowHint: true,
},
{
    id: "step_setup_summary_level_check",
    type: "checkpoint",
    checklistLabel: "Confirm management level in summary",
    question: "According to the summary, what management level is selected?",
    alexPrompt: "Look at the Management Level section of the summary. What option did we choose for Cedar Ridge?",
    alexCorrectResponse: "Full Provisioning and Password Management \u2014 the most comprehensive option. Clever handles account creation, updates, archiving, and passwords.",
    alexWrongResponse: "Check the first section of the summary \u2014 Management Level.",
    choices: [
        { label: "Full Provisioning and Password Management", nextStep: "step_setup_summary_users_check", correct: true },
        { label: "Password Management only", nextStep: "step_setup_summary_level_wrong", unguidedNextStep: "step_setup_summary_users_check", correct: false },
        { label: "Sync only", nextStep: "step_setup_summary_level_wrong", unguidedNextStep: "step_setup_summary_users_check", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_summary_level_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Confirm management level (retry)",
    question: "Look at the first card in the summary. We chose the most comprehensive option.",
    alexPrompt: "The summary shows the management level at the top. We chose the option that handles everything.",
    choices: [
        { label: "Full Provisioning and Password Management", nextStep: "step_setup_summary_users_check" },
    ],
},
{
    id: "step_setup_summary_users_check",
    type: "checkpoint",
    checklistLabel: "Confirm user types in summary",
    question: "How many user types are being provisioned according to the summary?",
    alexPrompt: "Look at the Select Users section. How many user types did we enable?",
    alexCorrectResponse: "Three user types \u2014 the whole Cedar Ridge district is getting managed. That's 40 total accounts.",
    alexWrongResponse: "Count the user types listed under Select Users \u2014 we enabled all three.",
    choices: [
        { label: "3 \u2014 Students, Teachers, and Staff", nextStep: "step_setup_nav_preview", correct: true },
        { label: "2 \u2014 Students and Teachers", nextStep: "step_setup_summary_users_wrong", unguidedNextStep: "step_setup_nav_preview", correct: false },
        { label: "1 \u2014 Students only", nextStep: "step_setup_summary_users_wrong", unguidedNextStep: "step_setup_nav_preview", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_summary_users_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Confirm user types (retry)",
    question: "We enabled all three user types in step 3. The summary should show all of them.",
    alexPrompt: "Check the Select Users summary \u2014 we checked Students, Teachers, AND Staff.",
    choices: [
        { label: "3 \u2014 Students, Teachers, and Staff", nextStep: "step_setup_nav_preview" },
    ],
},

// ══════════════════════════════════════════════════════════
//  WIZARD STEP 8: PREVIEW AND PROVISION
// ══════════════════════════════════════════════════════════

{
    id: "step_setup_nav_preview",
    type: "task",
    checklistLabel: "Move to Preview and Provision",
    goalAction: "wizard-step-preview",
    nextStep: "step_setup_refresh_preview",
    guideMessage: "Click 'Preview and provision' in the wizard sidebar.",
    alexPrompt: "Time for the moment of truth. Click \"Preview and provision\" in the sidebar to see what Clever will do with your configuration.",
    alexCorrectResponse: "This is the Preview step. Before provisioning, you should always refresh the preview to see exactly what will happen. Let's do that now.",
    hint: { target: "wizard-step-preview", message: "Click 'Preview and provision' in the wizard sidebar." },
    autoShowHint: true,
},
{
    id: "step_setup_refresh_preview",
    type: "task",
    checklistLabel: "Refresh the preview",
    goalAction: "wizard-refresh-preview",
    nextStep: "step_setup_preview_assessment",
    guideMessage: "Click 'Refresh' to generate the preview.",
    alexPrompt: "Click the \"Refresh\" button to generate a fresh preview based on your configuration. This shows exactly what accounts will be created.",
    alexCorrectResponse: "Preview refreshed! Look at the numbers \u2014 the \"Accounts to Create\" count shows how many Google accounts Clever will make.",
    hint: { target: "preview-refresh-btn", message: "Click the 'Refresh' button to update the preview." },
    autoShowHint: true,
},
{
    id: "step_setup_preview_assessment",
    type: "checkpoint",
    checklistLabel: "Confirm account count",
    question: "How many Google accounts will be created?",
    alexPrompt: "Look at the \"Accounts to Create\" number. How many Google accounts will Clever create for Cedar Ridge?",
    alexCorrectResponse: "40 accounts \u2014 20 students, 10 teachers, 10 staff. Every user in the district gets a Google account.",
    alexWrongResponse: "Check the 'Accounts to Create' stat at the top of the preview.",
    choices: [
        { label: "40 accounts", nextStep: "step_setup_provision", correct: true },
        { label: "20 accounts", nextStep: "step_setup_preview_wrong", unguidedNextStep: "step_setup_provision", correct: false },
        { label: "0 accounts", nextStep: "step_setup_preview_wrong", unguidedNextStep: "step_setup_provision", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_preview_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Confirm account count (retry)",
    question: "We selected 20 students + 10 teachers + 10 staff. What's the total?",
    alexPrompt: "The preview shows all user types combined. Add them up: 20 + 10 + 10.",
    choices: [
        { label: "40 accounts", nextStep: "step_setup_provision" },
    ],
},
{
    id: "step_setup_provision",
    type: "task",
    checklistLabel: "Provision Google accounts",
    goalAction: "wizard-provision-google",
    nextStep: "step_setup_check_events",
    guideMessage: "Click the 'Provision Google' button.",
    alexPrompt: "Everything looks right. Go ahead \u2014 click \"Provision Google\" to create 40 Google accounts for Cedar Ridge.",
    alexCorrectResponse: "Provisioning complete! Clever has created Google accounts for all 40 users based on your configuration. Let's verify the results.",
    hint: { target: "provision-google-btn", message: "Click the 'Provision Google' button at the bottom." },
    autoShowHint: true,
},
{
    id: "step_setup_check_events",
    type: "task",
    checklistLabel: "Check the IDM Events tab",
    goalAction: "idm-tab-events",
    nextStep: "step_setup_events_assessment",
    guideMessage: "Click the 'Events' tab on the IDM page.",
    alexPrompt: "You're back on the IDM page. Click the \"Events\" tab to see every account that was just created.",
    alexCorrectResponse: "Here are all the provisioning events. Each row represents a Google account that Clever just created \u2014 you can see the user name, their new email address, and which OU they were placed in.",
    hint: { target: "events-tab", message: "Click the 'Events' tab to see provisioning results." },
    autoShowHint: true,
},
{
    id: "step_setup_events_assessment",
    type: "checkpoint",
    checklistLabel: "Identify event types",
    question: "What type of event do you see for the provisioned users?",
    alexPrompt: "Look at the event rows. What does the \"Event\" column say for each user?",
    alexCorrectResponse: "Created \u2014 every single one. That means Clever made brand new Google accounts for all 40 users. If we ran a sync tomorrow, they'd show as \"Matched\" instead.",
    alexWrongResponse: "Look at the Event column in the table \u2014 the first word in each row tells you what happened.",
    choices: [
        { label: "Created \u2014 each user has a new Google account", nextStep: "step_setup_resolution", correct: true },
        { label: "Matched \u2014 existing accounts were linked", nextStep: "step_setup_events_wrong", unguidedNextStep: "step_setup_resolution", correct: false },
        { label: "Updated \u2014 existing accounts were modified", nextStep: "step_setup_events_wrong", unguidedNextStep: "step_setup_resolution", correct: false },
    ],
    autoShowHint: false,
},
{
    id: "step_setup_events_wrong",
    type: "checkpoint",
    scored: false,
    checklistLabel: "Identify event types (retry)",
    question: "These are brand new accounts. What word describes creating something new?",
    alexPrompt: "This was the first provisioning run \u2014 no accounts existed before. Each one was newly 'Created'.",
    choices: [
        { label: "Created \u2014 new accounts were made", nextStep: "step_setup_resolution" },
    ],
},
{
    id: "step_setup_resolution",
    type: "resolution",
    checklistLabel: "Wrap up",
    question: "How would you summarize what you just did?",
    alexPrompt: "OK \u2014 if someone asked you \"what did you set up today?\", what would you say?",
    alexCorrectResponse: "That's a great summary. You just completed your first full IDM setup \u2014 from connecting Google to verifying the provisioned accounts. Welcome to the team.",
    choices: [
        { label: "I connected Google Workspace, chose full provisioning, selected all user types, configured email templates and OUs, reviewed the summary, and provisioned 40 Google accounts.", nextStep: null, correct: true },
        { label: "I browsed the IDM page and checked some tabs.", nextStep: null, correct: false },
    ],
},
```

### Phase 5 Verification Gate

```bash
npx vitest run && npx eslint src/
```

Scenario validation test must pass (unique step IDs, valid nextStep/unguidedNextStep references).

**Commit:** `feat: complete Scenario 1 with summary, provision, and events verification`
