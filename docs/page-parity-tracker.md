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
| Portal (Resources) | https://clever.com/in/mayton/district-admin/portal | portal-lobby | P0 | In progress |  |  | Lobby implemented; continue parity polish |
| Dashboard Home | https://schools.clever.com/ | dashboard | P0 | Parity (UI) |  | 2026-02-15 | Batch 4 — Rewritten to match live steady-state layout |
| My Applications | https://schools.clever.com/applications | my-applications | P0 | In progress |  | 2026-02-15 | Batch 1 — URL confirmed, parity audit done |
| Add Applications | https://schools.clever.com/applications/add | add-applications | P1 | In progress |  | 2026-02-15 | Batch 1 — URL confirmed, parity audit done |
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
