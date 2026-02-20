# Phase 8: Module 3 Completion — `scenario_credential_building`

## Context

Module 3 (Credential Configuration) has 1 of 2 scenarios authored. The existing `scenario_idm_credentials` covers *navigation* to the credential step and *reading* the current format. The missing `scenario_credential_building` (already listed in `curriculum.js`) should cover *deeper conceptual understanding* of the credential system — SIS variables, password formats, fallback concepts, and matching vs. creating.

Once this scenario is added, Module 3 will have 2/2 scenarios, completing it and activating the prerequisite chain for Module 4.

**Goal:** Author `scenario_credential_building` and update TicketInbox tests.

## Branch
Fresh branch from current main: `git checkout main && git pull && git checkout -b codex/phase-8-credential-building`

## Protected files (DO NOT MODIFY)
CoachMark.jsx, Sidebar.jsx, DataTable.jsx, tests/e2e/*, auth/security files

---

## Step 1: Author `scenario_credential_building` (11 main steps + 4 wrong-answer branches)

**File:** `src/data/scenarios.js` — insert immediately after `scenario_idm_credentials` (line 813).

**Metadata:**
```js
id: "scenario_credential_building",
customerId: "sarahChen",
moduleId: "mod_credentials",
ticketSubject: "Need to understand credential formats before making changes",
ticketPriority: "normal",
ticketNumber: 1006,
```

**Character:** Sarah Chen — IT Coordinator at Treutelside Middle School. First scenario use. Technically minded, asking deep questions before making changes.

**Design:** Conceptual/knowledge scenario (no task steps, no navigation). All answers derive from `DEFAULT_PROVISIONING_STATE`, `EMAIL_SIS_VARIABLES`, and sample user data.

**Steps:**

| # | ID | Type | Question | Answer / Validation |
|---|-----|------|---------|---------------------|
| 1 | `step_cb_intro` | message | "Before I make changes, I want to understand the format system." | Single action → step 2 |
| 2 | `step_cb_user_types` | input | "How many user types have credential configurations?" | `["3", "three"]`, oneOf. (students/teachers/staff all provisioned) |
| 3 | `step_cb_shared_domain` | input | "Do they share a domain? What is it?" | `matchMode: "includes"`, `correctAnswer: "maytonlyceum.com"`. Accepts any response containing the domain. |
| 4 | `step_cb_sis_variables` | message | "Are SIS variables the same for all types?" | Correct: "They're different per type" / Wrong → 4a |
| 4a | `step_cb_sis_variables_wrong` | message | "Students have Student Number but teachers don't…" | Correction → step 5 |
| 5 | `step_cb_student_variable` | input | "Besides First/Last Name, how many student email variables?" | `"4"`, exact. (sis_id, student_number, state_id, district_username) |
| 6 | `step_cb_password_format` | message | "What does the student password format combine?" | Correct: "student number + grade + school SIS ID" / Wrong → 6a |
| 6a | `step_cb_password_format_wrong` | message | "I saw student_number and grade variables…" | Correction → step 7 |
| 7 | `step_cb_teacher_password` | input | "Betty Bauch, teacher number T001 — what's her password?" | `"t0010420"`, exact. (format: `{{teacher.teacher_number}}0420`, checkAnswer lowercases both sides) |
| 8 | `step_cb_fallback` | message | "What's a fallback email format?" | Correct: "Used when primary produces a conflict" / Wrong → 8a |
| 8a | `step_cb_fallback_wrong` | message | "Password reset is different. Fallback is about conflicts?" | Correction → step 9 |
| 9 | `step_cb_matching` | message | "What's the difference between matching and creating?" | Correct: "Matching links existing Google accts via SIS email; creating builds new ones" / Wrong → 9a |
| 9a | `step_cb_matching_wrong` | message | "SIS email matching sounds different from creating new ones?" | Correction → step 10 |
| 10 | `step_cb_staff_email` | input | "Oswaldo Pouros — what would his email be?" | `["oswaldopouros@maytonlyceum.com", "oswaldo.pouros@maytonlyceum.com"]`, oneOf. Accepts both concatenated and dotted formats. |
| 11 | `step_cb_done` | message | "Three types, shared domain, different SIS variables… I'm confident now!" | Two closing actions → null |

**Answer sources:**
- Step 2: `provisionStudents/Teachers/Staff` all `true` in DEFAULT_PROVISIONING_STATE. oneOf `["3", "three"]` for natural phrasing.
- Step 3: All 3 credential configs use `domain: "maytonlyceum.com"`. `includes` match so "maytonlyceum.com", "it's maytonlyceum.com", etc. all pass.
- Step 5: `EMAIL_SIS_VARIABLES.students` has 6 entries minus 2 name fields = 4
- Step 7: `credentials.teachers.password` = `"{{teacher.teacher_number}}0420"`, `SAMPLE_TEACHER.teacherNumber` = `"T001"`
- Step 10: `SAMPLE_STAFF.name` = `"Oswaldo Pouros"`, format = `{{name.first}}{{name.last}}@maytonlyceum.com`. oneOf accepts both `oswaldopouros@` and `oswaldo.pouros@` to avoid false negatives.

---

## Step 2: Update TicketInbox Tests

**File:** `src/__tests__/TicketInbox.test.jsx`

**What changes:** Module 3 now has 2 authored scenarios, so the inbox will render a second Module 3 ticket. Tests should verify:

1. **Add** a test that Module 3 renders both ticket subjects:
   ```js
   it("renders Module 3 scenarios", () => {
       renderInbox({
           completedModules: new Set(["mod_overview", "mod_provisioning_basics"]),
       });
       expect(screen.getByText("Change student email format to first initial + last name")).toBeInTheDocument();
       expect(screen.getByText("Need to understand credential formats before making changes")).toBeInTheDocument();
   });
   ```

2. **Update** the existing "renders ticket cards" test to include the new ticket subject.

3. **Update** the "Module 3 unlocks" test (if it asserts locked state based on Module 4 having no scenarios — Module 4 auto-satisfies, so this should still work, but verify).

---

## Verification

1. **Lint:** `npx eslint src/data/scenarios.js src/__tests__/TicketInbox.test.jsx`
2. **Tests:** `npx vitest run` — all tests pass
3. **Build:** `npm run build` — no compilation errors
4. **Dev console:** Zero `[Scenario "scenario_credential_building"]` validation warnings
5. **Inbox check:** Module 3 shows 2 tickets (#1005, #1006) when Module 2 is completed
