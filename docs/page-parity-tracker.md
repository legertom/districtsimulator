# Page Parity Tracker

Track live Clever pages and simulator parity status.

## Status Legend

- **Not started** — no simulator implementation yet
- **In progress** — actively being built
- **Parity (UI)** — visual/layout parity reached
- **Parity (Behavior)** — key interactions mirrored
- **QA passed** — verified and approved

## Priority Legend

- **P0** — most common / highest training impact
- **P1** — important but less frequent
- **P2** — niche/advanced

---

## Inventory

| Page Name | Live URL | Simulator Route / Target | Priority | Status | Owner | Last Updated | Notes / Gaps |
|---|---|---|---|---|---|---|---|
| Portal (Resources) | https://clever.com/in/mayton/district-admin/portal | portal-lobby | P0 | Parity (UI) |  | 2026-02-15 | Lobby + Organize District Portal + Communication all built |
| Dashboard Home | https://schools.clever.com/ | dashboard | P0 | Parity (UI) |  | 2026-02-15 | Batch 4 — Rewritten to match live steady-state layout |
| My Applications | https://schools.clever.com/applications | my-applications | P0 | Parity (UI) |  | 2026-02-15 | Batch 6 — Split logins column (Students/Teachers), custom table with rowSpan/colSpan |
| Add Applications | https://schools.clever.com/applications/add | add-applications | P1 | Parity (UI) |  | 2026-02-15 | Batch 6 — Confirmed matching live layout |
| Organize District Portal | https://schools.clever.com/portal/customize | organize-district-portal | P1 | Parity (UI) |  | 2026-02-15 | Batch 6 — New page: app cards grid, Add to Portal/Preview buttons, categories panel |
| Communication | https://schools.clever.com/portal/communication/notifications | communication | P1 | Parity (UI) |  | 2026-02-15 | Batch 6 — New page: Portal Notifications/District Messaging tabs, notification table with empty state |
| SIS Sync | https://schools.clever.com/sync | sis-sync | P0 | Parity (UI) |  | 2026-02-15 | Batch 2 — URL confirmed, parity fixes applied |
| Data Browser | https://schools.clever.com/data-browser | data-browser | P1 | Parity (UI) |  | 2026-02-15 | Batch 2 — URL confirmed, parity fixes applied |
| Admin Team | https://schools.clever.com/team/members | admin-team | P0 | Parity (UI) |  | 2026-02-15 | Batch 1 — URL confirmed, parity audit done |
| Access Logs | https://schools.clever.com/access-logs | access-logs | P0 | Parity (UI) |  | 2026-02-15 | Batch 1 — URL confirmed, parity audit done |
| SSO Settings | https://schools.clever.com/instant-login/accesscontrol | sso-settings | P1 | Parity (UI) |  | 2026-02-15 | Batch 2 — URL confirmed, parity fixes applied |
| Badges | https://schools.clever.com/badges/overview | badges | P2 | Parity (UI) |  | 2026-02-15 | Batch 2 — URL confirmed, parity fixes applied |
| Portal Settings | https://schools.clever.com/portal/settings/url | portal-settings | P1 | Parity (UI) |  | 2026-02-15 | Batch 3 — URL confirmed, parity fixes applied |
| LMS Connect | https://schools.clever.com/lms-connect | lms-connect | P2 | Parity (UI) |  | 2026-02-15 | Batch 3 — URL confirmed, parity fixes applied |
| Library Controls | https://schools.clever.com/library/overview | library-controls | P2 | Parity (UI) |  | 2026-02-15 | Batch 3 — URL confirmed, parity fixes applied |
| Custom Data | https://schools.clever.com/custom-data/browse/students | custom-data | P1 | Parity (UI) |  | 2026-02-15 | Batch 4 — URL confirmed, rewritten with pipeline viz + tabs |
| Profile | https://schools.clever.com/profile | profile | P1 | Parity (UI) |  | 2026-02-15 | Batch 4 — URL confirmed, design tokens applied |
| IDM | https://schools.clever.com/identity-management | idm | P0 | Parity (Behavior) |  | 2026-02-16 | Batch 5 UI + Deep Workflow + **Google Provisioning Wizard**: Full 8-step wizard (Connect, Management Level, Select Users, Set Credentials, Organize OUs, Configure Groups, Summary, Preview & Provision) with state machine, localStorage persistence, sidebar nav, sub-step credential editing. 22 unit tests. **OU Edit Parity** (Batch 9): All 5 OU edit workflows (Student, Teacher, Staff, Archive, Ignored) with Google Org Unit tree, OU preview panels, Clever tips, archive action radios, ignored checkbox multi-select. Stateful edits propagate to Summary/Preview + survive reload. 45 unit tests. |
| License Manager | https://schools.clever.com/license-manager | license-manager | P1 | Parity (UI) |  | 2026-02-15 | Batch 5 — URL confirmed, already close to live marketing layout |
| Troubleshoot Login | https://schools.clever.com/troubleshoot-login | troubleshoot-login | P2 | Parity (UI) |  | 2026-02-15 | Batch 7 — New page: diagnostic form + test summary sidebar + details panel |
| Troubleshoot Sharing | https://schools.clever.com/troubleshoot-sharing | troubleshoot-sharing | P2 | Parity (UI) |  | 2026-02-15 | Batch 7 — New page: shares same CSS as Troubleshoot Login |
| Data Quality | https://schools.clever.com/data-quality | data-quality | P2 | Parity (UI) |  | 2026-02-15 | Batch 7 — New page: info banner + "No data issues" success card |
| Portal Analytics | https://schools.clever.com/analytics/sso-usage | portal-analytics | P2 | Parity (UI) |  | 2026-02-15 | Batch 7 — New page: filters grid, key metrics, chart placeholder, logins sections |
| Edtech Analytics | https://schools.clever.com/analytics/edtech-usage | edtech-analytics | P2 | Parity (UI) |  | 2026-02-15 | Batch 7 — New page: marketing layout with preview card showing sample data |
| Reports | https://schools.clever.com/analytics/reports/signup | reports | P2 | Parity (UI) |  | 2026-02-15 | Batch 7 — New page: signup form with timezone, email notifications, tools fields |
| Classroom MFA | https://schools.clever.com/mfa | classroom-mfa | P2 | Parity (UI) |  | 2026-02-15 | Pre-existing page — not yet audited against live |

---

## Batch Planning (copy/paste section per sprint)

### Batch 1 (2026-02-15)

**Scope pages:**
- My Applications
- Add Applications
- Admin Team
- Access Logs

**Capture links:**
- https://schools.clever.com/applications
- https://schools.clever.com/applications/add
- https://schools.clever.com/team/members
- https://schools.clever.com/access-logs

**Definition of done:**
- UI parity reached for scoped pages
- Behavior parity reached for critical interactions
- Tracker statuses updated
- Build passes

**Result:** Completed — lightweight parity fixes applied, build passing.

---

### Batch 2 (2026-02-15)

**Scope pages:**
- SIS Sync
- Data Browser
- SSO Settings
- Badges

**Capture links:**
- https://schools.clever.com/sync
- https://schools.clever.com/data-browser
- https://schools.clever.com/instant-login/accesscontrol
- https://schools.clever.com/badges/overview

**Definition of done:**
- UI parity reached for scoped pages
- Behavior parity reached for critical interactions
- Tracker statuses updated
- Build passes

**Result:** Completed — parity fixes applied across all 4 pages, build passing. Key fixes: removed redundant inline headers, fixed color scheme to Clever blue (#1464ff), corrected tab lists to match live, replaced emoji icons with SVGs, updated data to match live school names/counts.

---

### Batch 3 (2026-02-15)

**Scope pages:**
- Portal Settings
- LMS Connect
- Library Controls

**Capture links:**
- https://schools.clever.com/portal/settings/url
- https://schools.clever.com/lms-connect
- https://schools.clever.com/library/overview

**Definition of done:**
- UI parity reached for scoped pages
- Behavior parity reached for critical interactions
- Tracker statuses updated
- Build passes

**Result:** Completed — parity fixes applied across all 3 pages, build passing. Key fixes: updated Portal Settings to use PageHeader + Clever blue Update button + correct shortname "mayton", replaced LMS Connect emoji icons with SVG logos and fixed alert banner to live purple, rewrote Library Settings tab to match live single-toggle card layout, removed hardcoded sort arrows from column headers.

---

### Batch 4 (2026-02-15)

**Scope pages:**
- Dashboard Home
- Custom Data
- Profile

**Capture links:**
- https://schools.clever.com/
- https://schools.clever.com/custom-data/browse/students
- https://schools.clever.com/profile

**Definition of done:**
- UI parity reached for scoped pages
- Behavior parity reached for critical interactions
- Tracker statuses updated
- Build passes

**Result:** Completed — parity fixes applied across all 3 pages, build passing. Key fixes: rewrote Dashboard Home to match live steady-state layout (status cards with SIS Sync/SSO/Awaiting Action, IDM card, Applications section with stats + app cards, PageHeader with subtitle, search bar), rewrote Custom Data with pipeline visualization + Browse/Reports tabs + Students/Teachers/Staff/Sections/Admins sub-tabs + data table, updated Profile to use PageHeader + design tokens replacing all hardcoded colors (#4351e8→var(--clever-blue), #c53030 removed, #111827→var(--gray-900), etc.), updated dashboard data to match live (20 students/10 teachers/10 staff, "Successful" SIS status, ABCya! app).

---

### Batch 5 (2026-02-15)

**Scope pages:**
- IDM (Clever IDM)
- License Manager

**Capture links:**
- https://schools.clever.com/identity-management
- https://schools.clever.com/license-manager

**Definition of done:**
- UI parity reached for scoped pages
- Behavior parity reached for critical interactions
- Tracker statuses updated
- Build passes

**Result:** Completed — parity fixes applied across both pages, build passing. Key fixes: rewrote IDM from marketing/purchase page to active management view matching live (Google Workspace card with Active/Issue badges, Create/Update/Archive/Issue stats, sync timestamp, Edit/Pause buttons, Tasks/Sync History/Exports/Events tabs, Notifications + Issues sections). Updated License Manager with PageHeader import. Live URL discovered: /identity-management (not /idm).

---

### Batch 6 (2026-02-15)

**Scope pages:**
- My Applications
- Add Applications
- Organize District Portal (new)
- Communication (new)

**Capture links:**
- https://schools.clever.com/applications
- https://schools.clever.com/applications/add
- https://schools.clever.com/portal/customize
- https://schools.clever.com/portal/communication/notifications

**Definition of done:**
- UI parity reached for scoped pages
- Behavior parity reached for critical interactions
- Tracker statuses updated
- Build passes

**Result:** Completed — parity fixes applied across all 4 pages, build passing. Key fixes: My Applications rewritten with custom table using rowSpan/colSpan for split "Total logins last 7 days" sub-columns (Students/Teachers), data updated from totalLogins to studentLogins/teacherLogins. Created new Organize District Portal page matching live /portal/customize (app cards grid with drag-and-drop styling, Add to Portal/Preview Portal as outline buttons, categories panel with sort). Created new Communication page matching live /portal/communication/notifications (Portal Notifications/District Messaging Settings tabs, bell icon with badge, notification table with empty state CTA). Added chevronRight and moreVertical icons to Icons component. Wired both new pages into page.js routing.

---

### Batch 7 (2026-02-15)

**Scope pages:**
- Troubleshoot Login
- Troubleshoot Sharing
- Data Quality
- Portal Analytics
- Edtech Analytics
- Reports

**Capture links:**
- https://schools.clever.com/troubleshoot-login
- https://schools.clever.com/troubleshoot-sharing
- https://schools.clever.com/data-quality
- https://schools.clever.com/analytics/sso-usage
- https://schools.clever.com/analytics/edtech-usage
- https://schools.clever.com/analytics/reports/signup

**Definition of done:**
- UI parity reached for scoped pages
- Tracker statuses updated
- Build passes

**Result:** Completed — all 6 remaining placeholder pages replaced with live-parity implementations. Troubleshoot Login and Sharing share a CSS module (two-panel layout with form card and details sidebar). Data Quality shows "No data issues" success state. Portal Analytics has full filter grid, key metrics, chart placeholder, and logins sections. Edtech Analytics matches live marketing layout with preview card. Reports has signup form. Removed dead "Clever admin checklist" from sidebar (404 on live).

---

### Batch 8 — Google Provisioning Wizard (2026-02-16)

**Scope:**
- IDM Google Provisioning Setup Wizard (full 8-step flow)

**Capture links:**
- https://schools.clever.com/identity-management/setup/connect
- https://schools.clever.com/identity-management/setup/management-level
- https://schools.clever.com/identity-management/setup/users
- https://schools.clever.com/identity-management/setup/credentials
- https://schools.clever.com/identity-management/setup/ous
- https://schools.clever.com/identity-management/setup/groups
- https://schools.clever.com/identity-management/setup/summary
- https://schools.clever.com/identity-management/setup/preview

**Definition of done:**
- All 8 wizard steps implemented with full UI parity
- Wizard state machine with localStorage persistence
- Sidebar navigation between steps with completion indicators
- Buttons and controls mutate real local state
- Validation states (disabled Next when no users selected, etc.)
- 22 automated unit tests passing
- lint + build clean

**Result:** Completed — Full 8-step provisioning wizard implemented. Architecture: modular per-step components under `GoogleProvisioningWizard/steps/`, shared wizard shell with sidebar + step router, CSS Module for all wizard styling, data module for defaults and mock data. Entry point wired from IDM page "Edit Google provisioning" button. Vitest added as test runner with 22 passing unit tests for wizard state machine. Evidence screenshots captured from live Clever for all 8 steps.

---

### Batch X (template)

**Scope pages:**
-
-
-

**Capture links:**
-
-
-

**Definition of done:**
- UI parity reached for scoped pages
- Behavior parity reached for critical interactions
- Tracker statuses updated
- Build passes

---

## Open Questions

- Which district/user roles should be captured for parity (district admin only, or school admin too)?
- Which pages are out-of-scope for T1 training?
- What is the minimum parity bar for launch (UI-only vs UI+behavior)?
