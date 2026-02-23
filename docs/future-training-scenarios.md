# Future Training Scenarios — IDM Provisioning Wizard

Ticket-based training scenarios covering each configuration area of the IDM provisioning wizard. Each follows the same pattern as existing scenarios — a support ticket arrives, the user walks through resolving it in the wizard, with guided/unguided modes, checkpoints, and scoring.

IDM tab skills (Tasks, Sync History, Exports, Events) are woven into individual scenarios rather than taught as a standalone module. Each scenario teaches the relevant tab in context — e.g., checking Sync History after configuring credentials, reviewing Events after OU changes, using Exports to verify group membership.

---

## Scenario Progression (All Modules)

```
Module 1: IDM Fundamentals (done)
  1A  Setting Up IDM

Module 2: Credentials Configuration
  2A  Student Login Credentials
  2B  Teacher Login Credentials
  2C  Staff Login Credentials

Module 3: Organizational Units
  3A  Student OU Assignment
  3B  Teacher OU Assignment
  3C  Staff OU Assignment
  3D  Archive OU Settings
  3E  Ignored OUs Settings

Module 4: Group Rules
  4A  Student Group Rules
  4B  Teacher Group Rules
  4C  Staff Group Rules
```

**Total: 12 scenarios across 4 modules** — 1 complete, 11 to build.

---

## Module 2: Credentials Configuration (Wizard Step 4)

### 2A — Student Login Credentials

- **Ticket:** "Students can't log into Google Workspace."
- **Skills:** Configure student email formula (token-based format with domain), password settings, and fallback format.
- **Wizard area:** Credentials step → Students tab
- **Key concepts:** Email tokens (first name, last name, student number), domain selection, fallback formats for name collisions, password policy
- **IDM tab skill — Sync History:** After configuring credentials, check the Sync History tab to verify accounts were created with the correct email format. Identify sync errors caused by duplicate emails.

### 2B — Teacher Login Credentials

- **Ticket:** "New teachers aren't getting Google accounts with the right email addresses."
- **Skills:** Configure teacher email formula, password settings, and fallback format.
- **Wizard area:** Credentials step → Teachers tab
- **Key concepts:** Teacher email conventions (first.last@domain), state ID-based fallback, password sync vs. one-time set
- **IDM tab skill — Tasks:** Review the Tasks tab to see pending credential syncs for new teachers. Understand task states (pending, in progress, completed, failed).

### 2C — Staff Login Credentials

- **Ticket:** "Staff accounts are being created with incorrect usernames."
- **Skills:** Configure staff email formula, password settings, and fallback format.
- **Wizard area:** Credentials step → Staff tab
- **Key concepts:** Staff-specific naming conventions, department-aware formats, role-based email patterns
- **IDM tab skill — Events:** Use the Events tab to trace what happened to a specific staff account — when it was created, what email was assigned, and whether it was later updated.

---

## Module 3: Organizational Units (Wizard Step 5)

### 3A — Student OU Assignment

- **Ticket:** "Students are landing in the wrong OU and getting the wrong Chrome policies."
- **Skills:** Configure student organizational unit path and sub-OU format (by school, grade, etc.).
- **Wizard area:** OUs step → Students tab
- **Key concepts:** OU hierarchy, sub-OU tokens (school name, grade level), policy inheritance, how OU placement affects device and app access
- **IDM tab skill — Events:** After changing OU configuration, review the Events tab to see which students were moved and to which OUs. Verify the changes match expectations.

### 3B — Teacher OU Assignment

- **Ticket:** "Teachers at the new school aren't getting the right Google Drive permissions."
- **Skills:** Configure teacher OU path and sub-OU structure.
- **Wizard area:** OUs step → Teachers tab
- **Key concepts:** Teacher OU best practices, school-based sub-OUs, permissions inherited from parent OU
- **IDM tab skill — Sync History:** Check Sync History to see OU move operations for teachers. Identify any failures where teachers couldn't be moved due to conflicts.

### 3C — Staff OU Assignment

- **Ticket:** "IT staff are grouped with front-office staff and have the wrong access."
- **Skills:** Configure staff OU path and sub-OU structure.
- **Wizard area:** OUs step → Staff tab
- **Key concepts:** Role-based vs. department-based OU strategy, separating staff types for granular policy control
- **IDM tab skill — Exports:** Use the Exports tab to generate a report of all staff and their current OU placements. Verify the new configuration separated IT staff from front-office staff correctly.

### 3D — Archive OU Settings

- **Ticket:** "Graduated students still have active Google accounts consuming licenses."
- **Skills:** Configure the archive OU path and archive action (suspend, move, delete).
- **Wizard area:** OUs step → Archive tab
- **Key concepts:** User lifecycle management, suspend vs. delete tradeoffs, license reclamation, data retention policies, graduated/transferred user handling
- **IDM tab skill — Tasks:** Check the Tasks tab to monitor archive operations in progress. Understand how long archive tasks take and what happens when they fail.

### 3E — Ignored OUs Settings

- **Ticket:** "Clever keeps overwriting accounts in our manually managed admin OU."
- **Skills:** Configure which OUs are excluded from sync and how users in those OUs are handled per user type.
- **Wizard area:** OUs step → Ignored tab
- **Key concepts:** Protecting manually managed accounts, per-user-type ignore rules, preventing sync conflicts with admin/service accounts
- **IDM tab skill — Events:** Review Events to find instances where Clever modified accounts in the admin OU. Use this evidence to confirm the ignore rules are now working correctly.

---

## Module 4: Group Rules (Wizard Step 6)

### 4A — Student Group Rules

- **Ticket:** "We need students auto-added to grade-level Google Groups for Classroom."
- **Skills:** Configure Google Group membership rules for students (by school, grade, section, etc.).
- **Wizard area:** Groups step → Students tab
- **Key concepts:** Dynamic group membership, school-based groups, grade-level groups, section-based groups for Google Classroom integration
- **IDM tab skill — Exports:** After configuring group rules, export group membership lists to verify the right students ended up in the right groups.

### 4B — Teacher Group Rules

- **Ticket:** "Teachers aren't being added to their school's staff mailing list automatically."
- **Skills:** Configure Google Group rules for teachers.
- **Wizard area:** Groups step → Teachers tab
- **Key concepts:** School-wide teacher groups, department mailing lists, all-staff distribution groups, role-based group membership
- **IDM tab skill — Sync History:** Check Sync History for group membership sync operations. Identify teachers who were skipped or errored during group assignment.

### 4C — Staff Group Rules

- **Ticket:** "Department-wide announcements aren't reaching new staff members."
- **Skills:** Configure Google Group rules for staff.
- **Wizard area:** Groups step → Staff tab
- **Key concepts:** Department groups, role-based groups, building-level groups, ensuring new hires are automatically added to relevant distribution lists
- **IDM tab skill — Tasks:** Review pending group sync tasks to understand the timeline for new staff members being added to department groups. Monitor for failures.

---

## IDM Tab Skills Distribution

Each IDM tab is covered multiple times across different scenarios for reinforcement:

| Tab | Scenarios |
|-----|-----------|
| **Tasks** | 2B (teacher credentials), 3D (archive OU), 4C (staff groups) |
| **Sync History** | 2A (student credentials), 3B (teacher OUs), 4B (teacher groups) |
| **Exports** | 3C (staff OUs), 4A (student groups) |
| **Events** | 2C (staff credentials), 3A (student OUs), 3E (ignored OUs) |
