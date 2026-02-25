> Copy-paste this entire document into a new AI chat session pointed at the District Simulator repo.
> The bot should execute all tasks, run tests, lint, and commit.

# Issue #37 — Provisioning Engine Tests + Polish

**Sprint:** mar-02-06 | **Day:** Wednesday | **Depends on:** Issues #35-36

## Overview

Comprehensive test coverage for the provisioning engine, wizard state persistence, and IDM page dynamic rendering. This day is dedicated to testing and polish before the scenario rewrite begins Thursday.

**3 tasks, 3 new files, 2 modified files. Follow task order.**

---

## Task 1: Provisioning Engine Unit Tests

Create `src/__tests__/provisioningEngine.test.js`.

Test the core engine functions from `src/lib/provisioningEngine.js`. The engine generates dynamic IDM events from wizard configuration + Data Browser records.

### Reference: Key imports and data shapes

```js
import {
    generateProvisioningResults,
    applyEmailTemplate,
    applyOUTemplate,
    generateCleverId,
    generateSyncHistory,
} from "@/lib/provisioningEngine";
import { STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA, SCHOOLS_DATA } from "@/data/defaults/dataBrowser";
import { DEFAULT_PROVISIONING_STATE } from "@/data/defaults/idm-provisioning";
```

The `DEFAULT_PROVISIONING_STATE` from `src/data/defaults/idm-provisioning.js` has:
- `credentials.students.emailFormat`: `[{ type: "variable", variable: "name.first" }, { type: "variable", variable: "name.last" }]` → produces `"firstnamelastname@cedarridgesd.org"`
- `credentials.students.domain`: `"cedarridgesd.org"`
- `ous.students.path`: `"/Students/{{school_name}}/{{student.grade}}"` with `subOUFormat`: `[{type:"text",value:"/"},{type:"variable",variable:"school_name"},{type:"text",value:"/"},{type:"variable",variable:"student.grade"}]`
- Counts: `studentCount: 20, teacherCount: 10, staffCount: 10`

Data Browser first student: `STUDENTS_DATA[0]` = `{ first: "Annamarie", last: "Feest", grade: "5", schoolId: "d95145ba-...", studentNumber: "000001", ... }`

### Tests to write

**Email template tests (6 tests):**
1. `applyEmailTemplate` with default student format → `"annamariefeest@cedarridgesd.org"` (first student Annamarie Feest)
2. `applyEmailTemplate` with format containing a text separator `[{type:"variable",variable:"name.first"},{type:"text",value:"."},{type:"variable",variable:"name.last"}]` → `"annamarie.feest@cedarridgesd.org"`
3. `applyEmailTemplate` with student-specific variable `student.student_number` → includes `"000001"`
4. `applyEmailTemplate` with teacher-specific variable `teacher.teacher_number` → includes teacher number
5. `applyEmailTemplate` with empty format segments → falls back to `"firstlast@domain"` pattern
6. `applyEmailTemplate` with no domain → returns username only without `@domain`

**OU template tests (4 tests):**
1. `applyOUTemplate` with default student config → path contains school name and grade (e.g. `/Students/Santa Rosa Elementary School/5`)
2. `applyOUTemplate` with static path (no subOUFormat) → returns base path only
3. `applyOUTemplate` with staff department variable → path contains department
4. `applyOUTemplate` with null/empty config → returns `"/"`

**Clever ID generation tests (2 tests):**
1. `generateCleverId` returns a 24-char hex string
2. `generateCleverId` is deterministic (same input → same output)

**Core engine tests (5 tests):**
1. `generateProvisioningResults` with default config + all types enabled → returns 40 events (20+10+10)
2. `generateProvisioningResults` with only students enabled → returns 20 events, all with `userType: "Student"`
3. Each generated event has all required fields: `date`, `event`, `destination`, `user`, `sisId`, `destinationUsername`, `userType`, `cleverId`, `currentOU`, `modifiedFields`, `allModifiedData`, `personId`
4. `personId` matches `sisId` (both are the Data Browser person ID)
5. `syncSummary.creates` equals total event count

**Sync history tests (2 tests):**
1. `generateSyncHistory` produces 14 rows
2. First row has `creates` matching the sync summary, subsequent rows have `creates: 0` and `matches: totalUsers`

**Total: ~19 tests**

**Commit 1:** `test: add provisioning engine unit tests`

---

## Task 2: Wizard State API Tests

Create `src/__tests__/wizardStateApi.test.js`.

Test the wizard state client functions from `src/lib/progressApi.js`. Follow the same testing pattern as any existing API test files in the codebase.

### Tests to write

```js
import {
    fetchWizardStateFromApi,
    saveWizardStateToApi,
    createDebouncedWizardSave,
} from "@/lib/progressApi";
```

**Fetch tests (3 tests):**
1. `fetchWizardStateFromApi` returns parsed JSON on success (mock fetch returning `{ wizard_data: {...} }`)
2. `fetchWizardStateFromApi` returns null on network error
3. `fetchWizardStateFromApi` returns null on non-OK response

**Save tests (2 tests):**
1. `saveWizardStateToApi` sends PUT with correct payload shape `{ wizard_data: {...} }`
2. `saveWizardStateToApi` does not throw on network error (fire-and-forget)

**Debounce tests (3 tests):**
1. `createDebouncedWizardSave` — `debouncedSave` delays the API call
2. `createDebouncedWizardSave` — `flush` immediately triggers pending save
3. `createDebouncedWizardSave` — `cancel` prevents pending save

Use `vi.useFakeTimers()` for debounce tests and `vi.stubGlobal("fetch", ...)` for fetch mocking.

**Total: ~8 tests**

**Commit 2:** `test: add wizard state API tests`

---

## Task 3: Update Existing Tests + Integration

### 3A: Update `src/__tests__/findProfileIdForEvent.test.js`

This test file tests the `findProfileIdForEvent` function. Add new test cases for the `personId` path:

```js
// Add these tests to the existing test file:

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
    // personId doesn't match any name — but we trust personId
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
        // no personId — static event
    };
    const result = findProfileIdForEvent(ev, scenarioData);
    expect(result.id).toBe("10a98369-7f2b-466b-abf2-1b9411e35351");
});
```

**Note:** You may need to extract `findProfileIdForEvent` from `IDM.jsx` into a shared utility file if it's not already testable. If it's inline in the component, copy it into the test file (same pattern the existing test uses — check the file first).

### 3B: Update `src/__tests__/idm-data-consistency.test.js`

Add a test that verifies the engine output matches Data Browser records:

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

### 3C: Polish and fix any issues

After running all tests, fix any lint errors or test failures. Common issues to watch for:
- Import paths using `@/` alias in test files — ensure vitest config resolves `@/` to `src/`
- The `findProfileIdForEvent` function may need to be extracted or duplicated for testing
- Any unused imports in modified files

**Commit 3:** `test: update existing tests for personId matching and engine integration`

---

## Verification

```bash
npx eslint src/           # 0 errors
npx vitest run            # all tests pass (300+ expected after new tests)
```

Verify:
- [ ] All 19 provisioning engine tests pass
- [ ] All 8 wizard state API tests pass
- [ ] Updated findProfileIdForEvent tests pass (both personId and name-based paths)
- [ ] Engine consistency test passes (all generated events reference real people)
- [ ] All 282 existing tests still pass (no regressions)

## File Summary

| Action | File |
|--------|------|
| Create | `src/__tests__/provisioningEngine.test.js` |
| Create | `src/__tests__/wizardStateApi.test.js` |
| Modify | `src/__tests__/findProfileIdForEvent.test.js` |
| Modify | `src/__tests__/idm-data-consistency.test.js` |
