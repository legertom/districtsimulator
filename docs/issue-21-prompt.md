# Issue #21: Integration, Testing, Polish

> **Copy-paste this entire document** into a new AI chat session pointed at the District Simulator repo.
> The bot should execute all tasks, run tests, lint, and commit.

---

## Overview

This is the final polish issue for the sprint. The app now has: Supabase persistence (Issues #17-18), IDM scenario flow (Issue #19), and profile pages (Issue #20). This issue ties them together: fix data consistency bugs, add error handling, improve loading states, add missing test coverage, and remove dead code paths.

**6 tasks. 4 new files, 9 modified files. Follow task order — some tasks depend on earlier ones.**

---

## Task 1: Fix IDM Events ↔ Data Browser Name Mismatch (Critical)

The IDM events in `src/data/defaults/idm.js` use names like "Marcus Hettinger" and "Vergie Herman-Kutch" that do NOT exist in the Data Browser data (`src/data/defaults/dataBrowser.js`). This means the "Open Profile" link on IDM Events is **always disabled** — a broken experience.

**Fix:** Replace the 19 synthetic names in `idm.js` events with actual names from `dataBrowser.js`, using the correct `userType` to pull from the right collection.

### Steps

**Modify: `src/data/defaults/idm.js`**

1. Import or reference the names from `dataBrowser.js`. You need to update each event's `user` field and related fields to use real Data Browser person names.

2. For each event entry, replace the `user` name with a real person from the matching collection:
   - Events with `userType: "Student"` → use names from `STUDENTS_DATA`
   - Events with `userType: "Teacher"` → use names from `TEACHERS_DATA`
   - Events with `userType: "Staff"` → use names from `STAFF_DATA`

3. Also update the corresponding `sisId` to match the person's `id` from the Data Browser, so the data is fully consistent.

4. Update `modifiedFields` and `allModifiedData` entries to match the new names:
   - `"Given name"` → the person's `first` name
   - `"Family name"` → the person's `last` name
   - `"Domain username"` → derived from the person's name (e.g. `first.last`)
   - `"Primary Email"` → `first.last@cedarridgesd.org`
   - `"Sis Id"` → the person's `id` from Data Browser

5. Keep the same event structure, timestamps, destinations, OUs, and other fields. Only change the person-identifying fields.

**Here's the mapping to use** (pick 19 unique people total — the counts below match the existing event distribution):

- **10 Students** (events 3-7, 10-14): Use the first 10 students from `STUDENTS_DATA`:
  - Annamarie Feest, Remington Stoltenberg, Ephraim Kreiger, Clint O'Connell, Aniya Macejkovic, Sierra Hirthe... wait — pick 10 from STUDENTS_DATA, keeping the same indexes (0-9).

  Actually, the simplest approach: **at the top of `idm.js`, import the data arrays** and programmatically reference names:

```js
import { STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA } from './dataBrowser';
```

Then for each event, replace the hardcoded name. For example, event index 0 (currently "Marcus Hettinger", Staff):

```js
{
    // ... existing fields ...
    user: `${STAFF_DATA[0].first} ${STAFF_DATA[0].last}`,
    sisId: STAFF_DATA[0].id,
    destinationUsername: `${STAFF_DATA[0].first.toLowerCase()}.${STAFF_DATA[0].last.toLowerCase()}@cedarridgesd.org`,
    // ... rest unchanged ...
    modifiedFields: [
        { field: "Given name", value: STAFF_DATA[0].first },
        { field: "Family name", value: STAFF_DATA[0].last },
        { field: "Domain username", value: `${STAFF_DATA[0].first.toLowerCase()}.${STAFF_DATA[0].last.toLowerCase()}` },
    ],
    allModifiedData: [
        // ... update Clever Id, Family Name, Given Name, Primary Email, Sis Id ...
    ],
}
```

**Distribution by userType** (matching existing events):
- Staff events (indices 0, 7, 18): use `STAFF_DATA[0]`, `STAFF_DATA[1]`, `STAFF_DATA[2]`
- Teacher events (indices 1, 5, 10, 14): use `TEACHERS_DATA[0]`, `TEACHERS_DATA[1]`, `TEACHERS_DATA[2]`, `TEACHERS_DATA[3]`
- Student events (indices 2, 3, 4, 6, 8, 9, 11, 12, 13, 15, 16, 17): use `STUDENTS_DATA[0]` through `STUDENTS_DATA[11]`

**Each person must be unique** — don't reuse the same Data Browser person across multiple events.

**Verification:** After this change, `findProfileIdForEvent()` in `IDM.jsx` should return a match for every event, and the "Open Profile" link should be clickable (blue, not grayed out) for all events.

---

## Task 2: Add Error Boundary and Dashboard Error Page

### 2A: Create Next.js Error Page

**Create file: `src/app/dashboard/error.js`**

```jsx
"use client";

import { useEffect } from "react";
import styles from "./error.module.css";

export default function DashboardError({ error, reset }) {
    useEffect(() => {
        console.error("Dashboard error:", error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Something went wrong</h2>
                <p className={styles.message}>
                    An error occurred while loading this page. This might be a temporary issue.
                </p>
                <div className={styles.actions}>
                    <button className={styles.retryButton} onClick={() => reset()}>
                        Try again
                    </button>
                    <a href="/dashboard" className={styles.homeLink}>
                        Go to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
```

### 2B: Error Page Styles

**Create file: `src/app/dashboard/error.module.css`**

```css
.container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gray-50);
    padding: 32px;
}

.card {
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 48px;
    text-align: center;
    max-width: 480px;
}

.title {
    font-size: 20px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0 0 12px 0;
}

.message {
    font-size: 14px;
    color: var(--gray-600);
    margin: 0 0 24px 0;
    line-height: 1.5;
}

.actions {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.retryButton {
    background-color: var(--clever-blue);
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    border: none;
    cursor: pointer;
}

.retryButton:hover {
    background-color: var(--clever-blue-dark);
}

.homeLink {
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    border: 1px solid var(--gray-300);
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-700);
    text-decoration: none;
}

.homeLink:hover {
    background-color: var(--gray-50);
}
```

### 2C: Add try/catch to InstructionalContext Phase 2

**Modify: `src/context/InstructionalContext.jsx`**

Find the Phase 2 async function that fetches from Supabase. It starts with a `Promise.all` that calls `fetchProgressFromApi()` and `fetchSessionStateFromApi()`. Wrap the entire async body in a try/catch:

Find the block that looks like:
```js
const [dbProgress, dbSession] = await Promise.all([
    fetchProgressFromApi(),
    fetchSessionStateFromApi(),
]);
```

Wrap it:
```js
try {
    const [dbProgress, dbSession] = await Promise.all([
        fetchProgressFromApi(),
        fetchSessionStateFromApi(),
    ]);
    // ... existing logic that applies DB state ...
} catch (err) {
    console.warn("Phase 2 DB sync failed, continuing with localStorage:", err);
    // Silently continue — localStorage data is already loaded from Phase 1
}
```

This ensures a Supabase outage or network error doesn't crash the entire app.

---

## Task 3: Add Loading States to Profile Routes

All 3 profile route files currently return `null` when the person hasn't been resolved yet, causing a blank white flash. Add a minimal loading indicator.

### Modify all 3 files:
- `src/app/dashboard/student-profile/[id]/page.js`
- `src/app/dashboard/teacher-profile/[id]/page.js`
- `src/app/dashboard/staff-profile/[id]/page.js`

In each file, replace:
```jsx
if (!hasRouteParam || !selectedStudent) return null;
```

With:
```jsx
if (!hasRouteParam || !selectedStudent) {
    return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
            <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading profile...</p>
        </div>
    );
}
```

Do the same for `selectedTeacher` and `selectedStaff` in their respective files.

---

## Task 4: Fix ProfileHero Inline Style

**Modify: `src/components/pages/profiles/ProfileHero.jsx`**

The back link wrapper uses an inline `style` attribute. Replace it with a CSS class.

Find:
```jsx
<div style={{ padding: "12px 32px 0", background: "white" }}>
```

Replace with:
```jsx
<div className={styles.backLinkWrapper}>
```

**Modify: `src/components/pages/profiles/ProfilePage.module.css`**

Add this class (near the existing `.backLink` class):

```css
.backLinkWrapper {
    padding: 12px 32px 0;
    background: white;
}
```

Also add `"use client";` to the top of `src/components/pages/profiles/ProfileField.jsx` for consistency with all other components in the `profiles/` directory.

---

## Task 5: Integration & Unit Tests

### 5A: CleverIDMSection computeEmail tests

**Create file: `src/__tests__/cleverIdmSection.test.js`**

```js
import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to test computeEmail — extract it or test via the component
// Since computeEmail is a private function inside CleverIDMSection, we test behavior through the component
// Actually, let's directly test the computation logic by extracting the function

// For testability, extract the computeEmail logic:
// This test assumes you'll export computeEmail from a helper file,
// or we can test the behavior by mocking localStorage and rendering the component.

// Approach: test the email computation logic directly
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

describe("computeEmail", () => {
    const student = { first: "Annamarie", last: "Feest" };
    const teacher = { first: "Sierra", last: "Hirthe" };

    it("computes email from first.last template", () => {
        const config = {
            credentials: {
                students: {
                    email: "{{name.first}}.{{name.last}}@cedarridgesd.org",
                    domain: "cedarridgesd.org",
                },
            },
        };
        expect(computeEmail(config, "student", student)).toBe("annamarie.feest@cedarridgesd.org");
    });

    it("computes email from first_initial.last template", () => {
        const config = {
            credentials: {
                students: {
                    email: "{{name.first_initial}}.{{name.last}}@cedarridgesd.org",
                    domain: "cedarridgesd.org",
                },
            },
        };
        expect(computeEmail(config, "student", student)).toBe("a.feest@cedarridgesd.org");
    });

    it("falls back to first.last@domain when template has no @", () => {
        const config = {
            credentials: {
                students: { email: "no-at-symbol", domain: "example.org" },
            },
        };
        expect(computeEmail(config, "student", student)).toBe("annamarie.feest@example.org");
    });

    it("returns null when no config", () => {
        expect(computeEmail(null, "student", student)).toBeNull();
    });

    it("returns null when no person", () => {
        const config = {
            credentials: {
                students: { email: "{{name.first}}@test.com", domain: "test.com" },
            },
        };
        expect(computeEmail(config, "student", null)).toBeNull();
    });

    it("works with teacher credentials", () => {
        const config = {
            credentials: {
                teachers: {
                    email: "{{name.first}}.{{name.last}}@cedarridgesd.org",
                    domain: "cedarridgesd.org",
                },
            },
        };
        expect(computeEmail(config, "teacher", teacher)).toBe("sierra.hirthe@cedarridgesd.org");
    });

    it("falls back to singular key if plural not found", () => {
        const config = {
            credentials: {
                staff: {
                    email: "{{name.first}}.{{name.last}}@cedarridgesd.org",
                    domain: "cedarridgesd.org",
                },
            },
        };
        const staff = { first: "Percival", last: "Beier" };
        expect(computeEmail(config, "staff", staff)).toBe("percival.beier@cedarridgesd.org");
    });

    it("uses default domain when not specified", () => {
        const config = {
            credentials: {
                students: { email: "{{name.first}}.{{name.last}}@cedarridgesd.org" },
            },
        };
        expect(computeEmail(config, "student", student)).toBe("annamarie.feest@cedarridgesd.org");
    });
});
```

### 5B: findProfileIdForEvent tests

**Create file: `src/__tests__/findProfileIdForEvent.test.js`**

```js
import { describe, it, expect } from "vitest";

// Copy the function for direct testing (same as in IDM.jsx)
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

const mockScenario = {
    dataBrowser: {
        students: [
            { id: "stu-1", first: "Annamarie", last: "Feest" },
            { id: "stu-2", first: "Remington", last: "Stoltenberg" },
        ],
        teachers: [
            { id: "tea-1", first: "Sierra", last: "Hirthe" },
        ],
        staff: [
            { id: "stf-1", first: "Percival", last: "Beier" },
        ],
    },
};

describe("findProfileIdForEvent", () => {
    it("finds a matching student", () => {
        const ev = { user: "Annamarie Feest", userType: "Student" };
        const result = findProfileIdForEvent(ev, mockScenario);
        expect(result).toEqual({ id: "stu-1", userType: "Student" });
    });

    it("finds a matching teacher", () => {
        const ev = { user: "Sierra Hirthe", userType: "Teacher" };
        const result = findProfileIdForEvent(ev, mockScenario);
        expect(result).toEqual({ id: "tea-1", userType: "Teacher" });
    });

    it("finds a matching staff", () => {
        const ev = { user: "Percival Beier", userType: "Staff" };
        const result = findProfileIdForEvent(ev, mockScenario);
        expect(result).toEqual({ id: "stf-1", userType: "Staff" });
    });

    it("returns null when no match found", () => {
        const ev = { user: "Nobody Exists", userType: "Student" };
        expect(findProfileIdForEvent(ev, mockScenario)).toBeNull();
    });

    it("returns null for empty user", () => {
        const ev = { user: "", userType: "Student" };
        expect(findProfileIdForEvent(ev, mockScenario)).toBeNull();
    });

    it("returns null for null scenario data", () => {
        const ev = { user: "Annamarie Feest", userType: "Student" };
        expect(findProfileIdForEvent(ev, {})).toBeNull();
    });

    it("is case-insensitive", () => {
        const ev = { user: "annamarie feest", userType: "Student" };
        const result = findProfileIdForEvent(ev, mockScenario);
        expect(result).toEqual({ id: "stu-1", userType: "Student" });
    });

    it("handles middle names by using first and last parts", () => {
        const ev = { user: "Annamarie Finley Feest", userType: "Student" };
        const result = findProfileIdForEvent(ev, mockScenario);
        expect(result).toEqual({ id: "stu-1", userType: "Student" });
    });

    it("does not cross-match between user types", () => {
        const ev = { user: "Annamarie Feest", userType: "Teacher" };
        expect(findProfileIdForEvent(ev, mockScenario)).toBeNull();
    });
});
```

### 5C: IDM events → Data Browser consistency test

**Create file: `src/__tests__/idm-data-consistency.test.js`**

```js
import { describe, it, expect } from "vitest";
import { events } from "@/data/defaults/idm";
import { STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA } from "@/data/defaults/dataBrowser";

/**
 * Verifies that every IDM event references a real person from the Data Browser.
 * This test will fail if the IDM event names get out of sync with the Data Browser data.
 */
describe("IDM Events ↔ Data Browser consistency", () => {
    function findPerson(name, userType) {
        const nameParts = name?.split(" ") || [];
        const firstName = nameParts[0]?.toLowerCase();
        const lastName = nameParts[nameParts.length - 1]?.toLowerCase();
        const type = userType?.toLowerCase();

        let collection;
        if (type === "student") collection = STUDENTS_DATA;
        else if (type === "teacher") collection = TEACHERS_DATA;
        else if (type === "staff") collection = STAFF_DATA;
        else return null;

        return collection?.find(
            (p) => p.first?.toLowerCase() === firstName && p.last?.toLowerCase() === lastName
        ) ?? null;
    }

    it("every IDM event user exists in the Data Browser", () => {
        const mismatches = events.filter(
            (ev) => findPerson(ev.user, ev.userType) === null
        );
        if (mismatches.length > 0) {
            const names = mismatches.map((ev) => `${ev.user} (${ev.userType})`);
            throw new Error(
                `IDM events reference people not in Data Browser:\n  - ${names.join("\n  - ")}`
            );
        }
        expect(mismatches).toHaveLength(0);
    });

    it("every IDM event sisId matches the Data Browser person ID", () => {
        const mismatches = events.filter((ev) => {
            const person = findPerson(ev.user, ev.userType);
            return person && person.id !== ev.sisId;
        });
        if (mismatches.length > 0) {
            const info = mismatches.map(
                (ev) => `${ev.user}: event sisId=${ev.sisId}, DB id=${findPerson(ev.user, ev.userType)?.id}`
            );
            throw new Error(
                `IDM event sisId doesn't match Data Browser id:\n  - ${info.join("\n  - ")}`
            );
        }
        expect(mismatches).toHaveLength(0);
    });

    it("no duplicate people across IDM events", () => {
        const seen = new Set();
        const duplicates = [];
        for (const ev of events) {
            const key = `${ev.user}|${ev.userType}`;
            if (seen.has(key)) duplicates.push(key);
            seen.add(key);
        }
        expect(duplicates).toHaveLength(0);
    });
});
```

---

## Task 6: Final Cleanup

### 6A: Remove console.log statements

Search across `src/components/` and `src/context/` for any `console.log` calls that aren't in error handlers. Remove debug logging but keep `console.warn` and `console.error` calls that are in catch blocks.

### 6B: Verify all imports are used

Run `npx eslint` and fix any unused import warnings in the files modified during this sprint:
- `src/components/pages/IDM.jsx`
- `src/components/pages/DataBrowser.jsx`
- `src/components/pages/profiles/*.jsx`
- `src/context/InstructionalContext.jsx`

### 6C: Verify the profile "← Back to Data Browser" link uses the shared style

In `ProfileHero.jsx`, confirm the `backLink` class is applied from `ProfilePage.module.css`, not an inline style.

---

## Verification Checklist

Run these after all tasks are complete:

```bash
# 1. All tests pass (should be 280+ with new tests)
npx vitest run

# 2. Zero lint errors
npx eslint

# 3. Build succeeds
npx next build
```

**Manual verification** (describe in commit message):
- [ ] IDM Events tab: "Open Profile" links are **clickable** (blue) for all events
- [ ] Click "Open Profile" from an IDM Student event → lands on correct student profile
- [ ] Click "Open Profile" from an IDM Teacher event → lands on correct teacher profile
- [ ] Click "Open Profile" from an IDM Staff event → lands on correct staff profile
- [ ] Data Browser → click student → "View Full Profile" → profile matches
- [ ] Profile pages show "Loading profile..." briefly before rendering (not blank white)
- [ ] Navigate to `/dashboard/nonexistent-page` → dashboard error page shows
- [ ] Clever IDM Information card hidden when `idmSetupComplete` is false
- [ ] After completing wizard, IDM card appears on profile pages

---

## Commit Guidance

**Commit 1**: IDM data consistency fix
```
Fix IDM events to use real Data Browser names

Replace 19 synthetic IDM event names (Marcus Hettinger, etc.) with
actual people from the Data Browser data (Annamarie Feest, etc.).
This makes "Open Profile" links functional in the IDM Events tab.
Add idm-data-consistency integration test to prevent future drift.
```

**Commit 2**: Error handling + loading states
```
Add error boundary, loading states, and Phase 2 resilience

Add dashboard error.js page for graceful error recovery.
Wrap InstructionalContext Phase 2 DB fetch in try/catch so
Supabase outages don't crash the app. Add loading indicator
to profile route files to prevent blank white flash.
```

**Commit 3**: Tests + cleanup
```
Add integration tests and polish

Tests for computeEmail helper, findProfileIdForEvent function,
and IDM-DataBrowser name consistency. Fix ProfileHero inline
style, add "use client" to ProfileField, remove debug console.logs.
```

---

## File Summary

| Action | File |
|--------|------|
| Modify | `src/data/defaults/idm.js` |
| Create | `src/app/dashboard/error.js` |
| Create | `src/app/dashboard/error.module.css` |
| Modify | `src/context/InstructionalContext.jsx` |
| Modify | `src/app/dashboard/student-profile/[id]/page.js` |
| Modify | `src/app/dashboard/teacher-profile/[id]/page.js` |
| Modify | `src/app/dashboard/staff-profile/[id]/page.js` |
| Modify | `src/components/pages/profiles/ProfileHero.jsx` |
| Modify | `src/components/pages/profiles/ProfilePage.module.css` |
| Modify | `src/components/pages/profiles/ProfileField.jsx` |
| Create | `src/__tests__/cleverIdmSection.test.js` |
| Create | `src/__tests__/findProfileIdForEvent.test.js` |
| Create | `src/__tests__/idm-data-consistency.test.js` |

## Architecture Notes

### Why the IDM name mismatch is the #1 priority
The IDM Events tab has 19 events with an "Open Profile" link for each. Currently, every single one of these links is grayed out and non-functional because the event names (from `idm.js`) don't match any Data Browser records (from `dataBrowser.js`). These two datasets were generated independently with different faker seeds. Syncing the names makes the entire IDM → Profile navigation flow work end-to-end.

### What ISN'T in this issue (deferred)
- **Wizard state persistence to Supabase** — the `wizard_state` table exists but the API route (`/api/progress/wizard`) doesn't. This is scoped to Issue #34 (Provisioning Engine).
- **`cedarridge-welcome-seen` localStorage-only** — acceptable for a "seen" flag, low priority.
- **Breadcrumbs** — the "← Back to Data Browser" link is sufficient for the current flow. Multi-level breadcrumbs can be added when there are more navigation paths.
- **E2E test for full IDM flow** — existing E2E tests cover the route persistence and basic flows. A full scenario E2E test would require significant test infrastructure.

### The `idm-provisioning-state` gap
`CleverIDMSection` reads provisioning config from `localStorage("idm-provisioning-state")` to compute the Google Email shown on profile pages. This config is NOT persisted to Supabase — if a user clears localStorage, they'll see `"—"` for Google Email even though `idmSetupComplete` is true. This is a known gap documented in Issue #34 (Provisioning Engine). For now, the app degrades gracefully — the section renders, just with dashes.
