# Future Training Scenarios — IDM Provisioning Wizard

Ticket-based training scenarios covering each configuration area of the IDM provisioning wizard. Each follows the same pattern as existing scenarios — a support ticket arrives, the user walks through resolving it in the wizard, with guided/unguided modes, checkpoints, and scoring.

---

## Scenario Progression (All Modules)

```
Module 1: IDM Fundamentals (done)
  1A  Setting Up IDM
  1B  Exploring IDM Tabs

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

**Total: 13 scenarios across 4 modules** — 2 complete, 11 to build.

---

## Module 2: Credentials Configuration (Wizard Step 4)

### 2A — Student Login Credentials

- **Ticket:** "Students can't log into Google Workspace."
- **Skills:** Configure student email formula (token-based format with domain), password settings, and fallback format.
- **Wizard area:** Credentials step → Students tab
- **Key concepts:** Email tokens (first name, last name, student number), domain selection, fallback formats for name collisions, password policy

### 2B — Teacher Login Credentials

- **Ticket:** "New teachers aren't getting Google accounts with the right email addresses."
- **Skills:** Configure teacher email formula, password settings, and fallback format.
- **Wizard area:** Credentials step → Teachers tab
- **Key concepts:** Teacher email conventions (first.last@domain), state ID-based fallback, password sync vs. one-time set

### 2C — Staff Login Credentials

- **Ticket:** "Staff accounts are being created with incorrect usernames."
- **Skills:** Configure staff email formula, password settings, and fallback format.
- **Wizard area:** Credentials step → Staff tab
- **Key concepts:** Staff-specific naming conventions, department-aware formats, role-based email patterns

---

## Module 3: Organizational Units (Wizard Step 5)

### 3A — Student OU Assignment

- **Ticket:** "Students are landing in the wrong OU and getting the wrong Chrome policies."
- **Skills:** Configure student organizational unit path and sub-OU format (by school, grade, etc.).
- **Wizard area:** OUs step → Students tab
- **Key concepts:** OU hierarchy, sub-OU tokens (school name, grade level), policy inheritance, how OU placement affects device and app access

### 3B — Teacher OU Assignment

- **Ticket:** "Teachers at the new school aren't getting the right Google Drive permissions."
- **Skills:** Configure teacher OU path and sub-OU structure.
- **Wizard area:** OUs step → Teachers tab
- **Key concepts:** Teacher OU best practices, school-based sub-OUs, permissions inherited from parent OU

### 3C — Staff OU Assignment

- **Ticket:** "IT staff are grouped with front-office staff and have the wrong access."
- **Skills:** Configure staff OU path and sub-OU structure.
- **Wizard area:** OUs step → Staff tab
- **Key concepts:** Role-based vs. department-based OU strategy, separating staff types for granular policy control

### 3D — Archive OU Settings

- **Ticket:** "Graduated students still have active Google accounts consuming licenses."
- **Skills:** Configure the archive OU path and archive action (suspend, move, delete).
- **Wizard area:** OUs step → Archive tab
- **Key concepts:** User lifecycle management, suspend vs. delete tradeoffs, license reclamation, data retention policies, graduated/transferred user handling

### 3E — Ignored OUs Settings

- **Ticket:** "Clever keeps overwriting accounts in our manually managed admin OU."
- **Skills:** Configure which OUs are excluded from sync and how users in those OUs are handled per user type.
- **Wizard area:** OUs step → Ignored tab
- **Key concepts:** Protecting manually managed accounts, per-user-type ignore rules, preventing sync conflicts with admin/service accounts

---

## Module 4: Group Rules (Wizard Step 6)

### 4A — Student Group Rules

- **Ticket:** "We need students auto-added to grade-level Google Groups for Classroom."
- **Skills:** Configure Google Group membership rules for students (by school, grade, section, etc.).
- **Wizard area:** Groups step → Students tab
- **Key concepts:** Dynamic group membership, school-based groups, grade-level groups, section-based groups for Google Classroom integration

### 4B — Teacher Group Rules

- **Ticket:** "Teachers aren't being added to their school's staff mailing list automatically."
- **Skills:** Configure Google Group rules for teachers.
- **Wizard area:** Groups step → Teachers tab
- **Key concepts:** School-wide teacher groups, department mailing lists, all-staff distribution groups, role-based group membership

### 4C — Staff Group Rules

- **Ticket:** "Department-wide announcements aren't reaching new staff members."
- **Skills:** Configure Google Group rules for staff.
- **Wizard area:** Groups step → Staff tab
- **Key concepts:** Department groups, role-based groups, building-level groups, ensuring new hires are automatically added to relevant distribution lists
