# Portal Reference Audit — Live Clever District Admin Portal

> **Inspected**: 2026-02-15
> **District**: #DEMO Mayton Lyceum (clever.com/in/mayton)
> **Browser**: Chrome via Browser Relay (MCP)
> **Logged-in role**: District Admin (Tom Leger)

---

## 1. Portal Top-Level View (Admin Portal / Resources)

**URL**: `https://clever.com/in/mayton/district-admin/portal`
**Page title**: "Resources"

### Structural Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP NAV BAR  (height: 88px, bg: rgb(20,100,255) — Clever blue) │
│ ┌──────────────┐                    ┌──────────────────────────┐│
│ │ Clever  Name │                    │ Search Portal Dashboard  ││
│ │ (logo)(user) │                    │ Notifications  Account   ││
│ └──────────────┘                    └──────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  LEFT: "Resource categories" nav (empty when no apps)           │
│                                                                 │
│  INFO BANNER (light purple bg, star icon)                       │
│    "We've streamlined your Portal organization experience"      │
│    - One-Stop Organizing: ...                                   │
│    - Admin SSO: ...                                             │
│                                                                 │
│  HEADING: "Resources" (24px, 600 weight, rgb(19,21,26))         │
│                                                                 │
│  WARNING BANNER (yellow/cream bg, triangle-warning icon)        │
│    "No district applications"                                   │
│    "Your district hasn't set up any applications yet..."        │
│                                                                 │
│  PAGE BACKGROUND: rgb(248, 249, 251)                            │
└─────────────────────────────────────────────────────────────────┘
```

### Top Navigation Bar — Detail

| Element | Value |
|---------|-------|
| Height | 88px |
| Background | `rgb(20, 100, 255)` (#1464FF) |
| Padding | `0 40px` |
| Font (logo "Clever") | Proxima Nova, bold, white |
| User name | Shown as `<h1>` next to logo, white |
| Nav buttons | 5 icon+label buttons in a row |
| Button size | 68px x 40px, padding `8px 24px`, border-radius `4px` |
| Inactive bg | Same as nav bg (transparent feel) |
| **Active bg** | `rgb(22, 62, 141)` — deep navy pill |
| Icon style | White SVG icons (search, apps/grid, analytics, bell, person) |
| Labels | "Search", "Portal", "Dashboard", "Notifications", "Account" |
| Label position | Below icon |

### Nav Button Icons Mapping

| Label | Icon | Notes |
|-------|------|-------|
| Search | Magnifying glass | Opens inline search bar replacing icons |
| Portal | 3x3 dot grid | Active = dark pill bg |
| Dashboard | Bar chart with arrow | Navigates to schools.clever.com dashboard |
| Notifications | Bell | Opens modal dialog ("Announcements") |
| Account | Person silhouette | Opens dropdown (name, role, email, MFA, logout) |

### Interaction Notes

- **Search**: Clicking replaces the entire right-side nav with a full-width search input. Content below stays visible. Escape/click-away closes.
- **Portal**: Active state with dark navy pill (`rgb(22,62,141)`). This is the "home" view.
- **Dashboard**: Full page navigation to `schools.clever.com/` with left sidebar layout.
- **Notifications**: Modal overlay — "Announcements" title, bell icon, empty state message. Close button (X).
- **Account**: Dropdown popover — "Hi, [Name]", role, email, MFA settings link, Log out link. Account button gets active pill while open.

### Screenshot References

| View | Screenshot ID |
|------|---------------|
| Portal page (clean) | ss_3805tfil2 |
| Top nav zoomed (icons) | zoomed region (700,0)-(1185,55) |
| Logo + name zoomed | zoomed region (0,0)-(250,55) |
| Search mode | ss_4372x4lss |
| Account dropdown | ss_789088g53 |
| Notifications modal | ss_6136fft4b |

---

## 2. Dashboard Home

**URL**: `https://schools.clever.com/`
**Page title**: "Clever | Home"

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  CONTENT AREA                                        │
│ 248px    │                                                      │
│          │  "Dashboard Home"  (h1)                               │
│ Clever   │  subtitle: user counts                               │
│ #DEMO    │  ┌──────────────┐  ┌──────────┐                      │
│ Mayton   │  │ Portal link  │  │ Tom ▾    │  (top-right)         │
│ Lyceum   │  └──────────────┘  └──────────┘                      │
│          │  ┌──────────────────────────────────────────┐         │
│ Dashboard│  │ Search for users or applications         │         │
│ home *   │  └──────────────────────────────────────────┘         │
│ Apps   ▾ │                                                      │
│ Data   ▾ │  ┌──────────────────────────────────────────┐         │
│ Data     │  │ Onboarding banner: "Hi, Tom! Finish..."  │         │
│ browser  │  │ Setup checklist + Add/Setup apps cards   │         │
│ ──────── │  └──────────────────────────────────────────┘         │
│ User   ▾ │                                                      │
│ Auth   ▾ │                                                      │
│ ──────── │                                                      │
│ Portal ▾ │                                                      │
│ Support▾ │  ┌──────────────────────────────────────────┐         │
│ Analytics│  │ Training & Support (bottom)               │         │
│          │  └──────────────────────────────────────────┘         │
└──────────┴──────────────────────────────────────────────────────┘
```

### Sidebar CSS Values

| Property | Value |
|----------|-------|
| Width | 248px |
| Background | `rgb(12, 30, 87)` — deep navy |
| Active item bg | `rgb(191, 206, 255)` — light lavender |
| Active item size | 224px x 33px |
| Separator | `rgb(142, 147, 166)`, 1px |
| Text color | White |
| Font | Proxima Nova |
| Component class | `SidebarV3--container` |

### Sidebar Navigation Items

| Group | Items |
|-------|-------|
| Top | Dashboard home (icon: building) |
| Data | Applications (dropdown), Data sources (dropdown), Data browser |
| --- separator --- | |
| Users | User management (dropdown), Authentication (dropdown) |
| --- separator --- | |
| Portal | Portal (dropdown) → Organize district portal, Portal settings, Communication |
| Tools | Support tools (dropdown), Analytics (dropdown) |
| Bottom | Training & Support |

### Top Bar (within dashboard)

| Element | Value |
|---------|-------|
| Height | ~74.5px |
| "Portal" link | Blue text `rgb(20,100,255)`, 16px, top-right corner, grid icon |
| User dropdown | "Tom Leger ▾", top-right, opens account menu |
| Search bar | Full-width text input, placeholder "Search for users or applications" |
| Content bg | `rgb(248, 249, 251)` |

### Screenshot References

| View | Screenshot ID |
|------|---------------|
| Dashboard home full | ss_0655xmm9t |
| Sidebar zoomed | zoomed region (0,0)-(190,400) |
| Portal sidebar expanded | ss_9467p6de4 |

---

## 3. Organize District Portal

**URL**: `https://schools.clever.com/portal/customize`
**Page title**: "Clever | Home"

### Structural Breakdown

- Same sidebar as Dashboard Home
- "Organize district portal" is the active sidebar item (under Portal dropdown)
- Main content:
  - Heading: "Organize District Portal"
  - Description paragraph
  - **"Add to the Portal"** dropdown button (outlined, blue)
  - **"Preview Portal as"** dropdown button (outlined, blue)
  - Right panel: **"Arrange categories"** with drag/sort, "Sort alphabetically" option
  - **Cancel** / **Publish changes** buttons (top-right)

### Screenshot Reference

| View | Screenshot ID |
|------|---------------|
| Organize portal | ss_14314xk7m |

---

## 4. Portal Settings

**URL**: `https://schools.clever.com/portal/settings/url`
**Page title**: "Clever | Portal settings"

### Structural Breakdown

- Same sidebar, "Portal settings" active
- Horizontal tab bar: **URL** | **Customization** | **Substitute Access** | **Digital Learning Directory** | **Teacher Page Settings**
- URL tab content:
  - Info banner with Quick Start Guide + Help Center links
  - "Your Clever Portal URL" section
  - District Shortname input field
  - "Update" button (blue filled)
  - Download login instructions link

### Screenshot Reference

| View | Screenshot ID |
|------|---------------|
| Portal settings | ss_5449cmzpm |

---

## 5. District Admin Login Page

**URL**: `https://clever.com/oauth/district_admin/login?...`
**Page title**: "Clever | District Administrator Login"

### Structural Breakdown

- Blue header bar with "Clever" logo (same blue as portal nav)
- "Log in" main heading
- "District Administrator Login" subheading + "School Login" link
- Email + Password fields (label above, floating label style)
- "Forgot your password?" link
- "Log in" button (disabled until fields filled)
- Footer: Terms of Use | Privacy Policy | Clever (c) 2026

### Screenshot Reference

| View | Screenshot ID |
|------|---------------|
| District admin login | clever-district-admin-login.png |

---

## 6. Design Token Summary

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Clever Blue (primary) | `#1464FF` / `rgb(20,100,255)` | Top nav bg, links, buttons |
| Navy (sidebar) | `rgb(12, 30, 87)` | Dashboard sidebar bg |
| Navy (active pill) | `rgb(22, 62, 141)` | Active nav button in portal top bar |
| Active sidebar item | `rgb(191, 206, 255)` | Light lavender highlight |
| Page background | `rgb(248, 249, 251)` | Main content area bg |
| Text primary | `rgb(19, 21, 26)` | Headings |
| Separator | `rgb(142, 147, 166)` | Sidebar dividers |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings | Proxima Nova | 24px | 600 |
| Nav button labels | Proxima Nova | ~12px | 500 |
| Logo "Clever" | Proxima Nova | ~22-24px | 700 |
| User name | Proxima Nova | ~16px | 600 |
| Portal link | Proxima Nova | 16px | 500 |

### Dimensions

| Element | Value |
|---------|-------|
| Portal top nav height | 88px |
| Portal top nav padding | 0 40px |
| Nav button size | 68px x 40px |
| Nav button border-radius | 4px |
| Sidebar width | 248px |
| Dashboard top bar height | ~74.5px |
| Active sidebar item | 224px x 33px |

---

## 7. Parity Assessment: Simulator vs Live

### What we replicate well (NOW)

| Feature | Status | Notes |
|---------|--------|-------|
| Portal as entry point | Done | PortalLobby.jsx serves as post-login landing |
| App card grid | Done | Grid of tile cards with icons |
| Two sections (live vs coming soon) | Done | Apps split by launchMode |
| Header with Clever branding | Done | Logo + "Portal" label |
| Dashboard link in header | Done | Button to enter dashboard mode |
| Hover/focus states on tiles | Done | translateY, shadow transitions |
| Responsive breakpoints | Done | 768px and 480px breakpoints |
| District name display | Done | From scenario context |

### Parity gaps — small tweaks justified NOW

| Gap | Live Reference | Current Simulator | Fix |
|-----|---------------|-------------------|-----|
| Nav bar height | 88px | 56px | Increase to ~64px (compromise) |
| Header bg color | `#1464FF` (bright Clever blue) | `var(--clever-navy)` (dark navy) | Update to brighter blue |
| Active nav pill | Dark navy `rgb(22,62,141)` pill for active tab | No active indicator | Not critical for simulator |
| Page background | `rgb(248,249,251)` | `var(--gray-50)` | Verify parity, likely close |
| Top nav button style | Icon + label below, pill shape | Text button "Admin Dashboard" | Acceptable difference for simulator |
| Font family | Proxima Nova | System font stack | Acceptable — not replicating proprietary fonts |

### Deferred to later

| Feature | Reason |
|---------|--------|
| Search overlay mode | Not needed for simulator training |
| Notifications modal | Not needed for simulator training |
| Account dropdown (MFA, logout) | Auth handled separately |
| Left-side "Resource categories" nav | Empty state in live; simulator uses grid instead |
| Info/warning banners | Simulator doesn't need onboarding banners |
| Dashboard sidebar sub-menus (expandable dropdowns) | Already handled in existing dashboard mode |
| Portal settings tabs | Admin config, not training flow |
| Organize district portal (drag/drop) | Admin config, not training flow |
| Communication sub-page | Admin config, not training flow |

---

## 8. Key Architectural Observations

1. **Two distinct UIs**: Clever has a clear split between the "Portal" view (top nav with icon buttons, no sidebar) and the "Dashboard" view (left sidebar, different top bar). Our simulator mirrors this with `portal` vs `dashboard` modes.

2. **Portal is the admin's app launcher**: The Portal top-level view shows "Resources" — the apps the admin has access to for SSO. Our simulator reinterprets this as the training module launcher, which is a valid adaptation.

3. **Navigation hierarchy**: Portal uses a horizontal top nav; Dashboard uses a vertical left sidebar. The "Portal" link appears in the dashboard top-right as a way to switch back. Our implementation has a similar pattern with `onEnterDashboard` / portal header link.

4. **The portal top nav is NOT the same as the dashboard top bar**: These are completely separate UI surfaces. Portal = full-width top nav with 5 icon buttons. Dashboard = sidebar + minimal top bar with search + portal link + user menu.

5. **Empty states are well-handled**: Both info banners (star icon, purple bg) and warning banners (triangle icon, yellow bg) provide contextual guidance.

---

## 9. My Applications (Batch 1)

**URL**: `https://schools.clever.com/applications`
**Page title**: "Clever | My applications"
**Sidebar location**: Applications > My applications

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR: Search | Portal link | Tom Leger ▾        │
│ 248px    ├──────────────────────────────────────────────────────┤
│          │  HEADER ROW                                          │
│ Apps ▾   │  h1: "My applications"         [Add applications]   │
│  *My     │                                 (blue filled btn)   │
│  apps*   ├──────────────────────────────────────────────────────┤
│  Add     │  INFO BANNER (light blue bg, globe icon)            │
│  apps    │  "Learn more about types of applications and        │
│  LMS     │   adding applications in our Help Center."          │
│  Library │                                                      │
│          ├──────────────────────────────────────────────────────┤
│ Data ▾   │  TABLE (full width, white bg)                       │
│ Data     │  Columns: Name | App Status | Next step |           │
│ browser  │           App Type | Total logins last 7 days |     │
│          │           Sharing                                    │
│ Users ▾  │  Empty state: "NO DATA" (centered, gray)            │
│ Auth  ▾  │                                                      │
│ Portal ▾ │  PAGINATION (bottom, numbered buttons)              │
└──────────┴──────────────────────────────────────────────────────┘
```

### Key Observations from Live

| Element | Live Value | Simulator Value | Parity? |
|---------|-----------|-----------------|---------|
| Page title | "My applications" | "My applications" | Yes |
| "Add applications" button | Blue filled, top-right | Blue filled, top-right | Yes |
| Info banner | Globe icon, light blue bg, links to Help Center | Same structure | Yes |
| Table columns | Name, App Status, Next step, App Type, Total logins last 7 days, Sharing | Name ↑, App Status ↕, Next step, App Type ↕, Students, Teachers, Sharing ↕ | Drift |
| Column "Total logins last 7 days" | Single column | Simulator splits into "Students" + "Teachers" | Fix needed |
| Empty state | "NO DATA" centered in table | "No data available" below table | Minor drift |
| Sort indicators | ↕ on sortable columns (native browser) | Hardcoded ↑ ↕ in header text | Fix: remove from text |
| Page background | `rgb(248, 249, 251)` | `var(--gray-50)` | Match |

### Interaction Notes

- "Add applications" button navigates to `/applications/add`
- Table rows are clickable (navigate to app detail)
- App name is a blue link
- Sort by clicking column headers (Name, App Status, App Type, Sharing)
- No pagination shown when empty

### Parity Fixes (Batch 1)

- [x] Rename "Students"/"Teachers" columns to single "Total logins last 7 days"
- [x] Remove hardcoded sort arrows from column header text
- [x] Update empty state text to "NO DATA"

---

## 10. Add Applications (Batch 1)

**URL**: `https://schools.clever.com/applications/add`
**Page title**: "Clever | Add applications"
**Sidebar location**: Applications > Add applications

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR: Search | Portal link | Tom Leger ▾        │
│ 248px    ├──────────────────────────────────────────────────────┤
│          │  HEADER ROW                                          │
│ Apps ▾   │  h1: "Add applications"                             │
│  My apps │  (no action button in header)                       │
│ *Add     ├──────────────────────────────────────────────────────┤
│  apps*   │  INFO BANNER (globe icon, light blue)               │
│  LMS     │  "Learn more about types of applications and        │
│  Library │   adding applications in our Help Center."          │
│          ├──────────────────────────────────────────────────────┤
│          │  FILTER ROW                                          │
│          │  [APP TYPE ▾] [APP SUBJECT ▾]  [SEARCH________]     │
│          ├──────────────────────────────────────────────────────┤
│          │  TABLE                                               │
│          │  Columns: Application | Subjects | Description |    │
│          │           Actions                                    │
│          │  Rows: App icon + Name + Type | subjects | desc |   │
│          │         "Request App" link                           │
│          ├──────────────────────────────────────────────────────┤
│          │  PAGINATION: Prev [1] [2] [3] [4] [5] ... [290] Next│
└──────────┴──────────────────────────────────────────────────────┘
```

### Key Observations from Live

| Element | Live Value | Simulator Value | Parity? |
|---------|-----------|-----------------|---------|
| Page title | "Add applications" | "Add applications" | Yes |
| Info banner | Same as My Applications | Same | Yes |
| Filter labels | "APP TYPE", "APP SUBJECT" (uppercase) | "APP TYPE", "APP SUBJECT" | Yes |
| Search label | "SEARCH" (uppercase) | "SEARCH" | Yes |
| Table columns | Application, Subjects, Description, Actions | Same | Yes |
| App cell layout | Icon (48px square) + Name (blue link) + Type below | Same structure | Yes |
| "Request App" link | Blue text link | Blue text link | Yes |
| Pagination | Prev/1-5.../290/Next buttons | Not implemented | Gap |
| App icon | Real brand icon images | Emoji placeholders | Acceptable for simulator |

### Interaction Notes

- Filter dropdowns (APP TYPE / APP SUBJECT) are combobox-style with search
- SEARCH is a plain text input, filters table in real-time
- Each row is clickable / expandable
- "Request App" links to `/applications/add/{slug}`
- Pagination: 290 pages of apps in library

### Parity Fixes (Batch 1)

- Structure is already at parity; no code changes needed for Batch 1
- Pagination is a known gap — defer to later batch

---

## 11. Admin Team (Batch 1)

**URL**: `https://schools.clever.com/team/members`
**Page title**: "Clever | Team"
**Sidebar location**: User management > Admin team

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR: Search | Portal link | Tom Leger ▾        │
│ 248px    ├──────────────────────────────────────────────────────┤
│          │  HEADER ROW                                          │
│ Users ▾  │  h1: "Team"                   [Actions ▾]           │
│  IDM     │                                (blue filled btn)    │
│  License │                                                      │
│ *Admin   ├──────────────────────────────────────────────────────┤
│  team*   │  INFO BANNER (globe icon, light blue)               │
│          │  "Clever requires Multi-Factor Authentication for    │
│ Auth  ▾  │   all Clever Admin. Learn more about this feature   │
│          │   here."                                             │
│          ├──────────────────────────────────────────────────────┤
│          │  TABS: Members | Roles | Access control |           │
│          │        Role settings                                 │
│          │  (active tab = blue text + blue underline)           │
│          ├──────────────────────────────────────────────────────┤
│          │  FILTER ROW                                          │
│          │  [User Type ▾] [Role ▾]        [🔍 Search]          │
│          ├──────────────────────────────────────────────────────┤
│          │  TABLE                                               │
│          │  Columns: Name ↕ | Email ↕ | Roles ⓘ ↕ |          │
│          │           Title ↕ | MFA Status ⓘ ↕ | Actions       │
│          │                                                      │
│          │  Row: "Tom Leger 🔄" | email | role | title |       │
│          │        ⚠ Unactivated MFA (orange badge) |           │
│          │        (no actions for Owner)                        │
│          ├──────────────────────────────────────────────────────┤
│          │  PAGINATION: ◀ [1] ▶                                │
└──────────┴──────────────────────────────────────────────────────┘
```

### Key Observations from Live

| Element | Live Value | Simulator Value | Parity? |
|---------|-----------|-----------------|---------|
| Page title | "Team" | "Team" | Yes |
| Actions button | "Actions ▾" blue filled dropdown | "Actions ▾" blue filled dropdown | Yes |
| Actions menu items | "Add team member", "Create custom role" | "Add team member", "Create custom role", "Change account owner" | Sim has extra item |
| Info banner text | MFA requirement notice with "here" link | Same | Yes |
| Tabs | Members, Roles, Access control, Role settings | Same | Yes |
| Active tab style | Blue text + blue bottom border | Blue text + bottom border | Yes |
| Filters | User Type, Role dropdowns + Search | Same structure | Yes |
| Table columns | Name, Email, Roles (ⓘ), Title, MFA Status (ⓘ), Actions | Name, Email, Roles, Title, MFA Status, Actions | Missing ⓘ tooltips |
| Sort indicators | ↕ on all columns except Actions | sortable prop on columns | Yes |
| MFA badge | Orange triangle + "Unactivated MFA" in orange-bordered badge | Yellow bg badge with warning icon | Close |
| Owner row | No Actions column button | `isOwner` check hides actions | Yes |
| Sync icon on name | 🔄 icon for synced users | Emoji 🖊️ | Drift — use sync icon |
| Pagination | ◀ [1] ▶ | Pagination component | Yes |
| Page background | White | White (`#ffffff`) | Yes |

### Interaction Notes

- Actions dropdown: "Add team member" opens modal, "Create custom role" navigates
- Row actions for non-owners: "Access Portal as user", "Access Dashboard as user"
- Column sorts: click header to toggle asc/desc
- Roles and MFA Status headers have info (ⓘ) tooltip icons
- Tabs navigate to different sub-routes: `/team/members`, `/team/roles`, `/team/AccessControl`, `/team/settings`
- Filter dropdowns are combobox-style (type to filter)

### Parity Fixes (Batch 1)

- [x] Update page background from `#ffffff` to `var(--gray-50)` for content area consistency
- [x] Remove "Change account owner" from Actions menu (not in live)
- [x] Replace emoji nickname icons with sync/user-type indicators

---

## 12. Access Logs (Batch 1)

**URL**: `https://schools.clever.com/access-logs`
**Page title**: "Clever | Access logs"
**Sidebar location**: Authentication > Access logs

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR: Search | Portal link | Tom Leger ▾        │
│ 248px    ├──────────────────────────────────────────────────────┤
│          │  HEADER                                              │
│ Auth  ▾  │  h1: "Access logs"                                  │
│ *Access  │  (no header actions — title only, uses PageHeader)  │
│  logs*   ├──────────────────────────────────────────────────────┤
│  SSO     │  INFO BANNER (globe icon, light blue)               │
│  Badges  │  "Discover how to make the most of your             │
│  MFA     │   Access Logs here."                                │
│          ├──────────────────────────────────────────────────────┤
│          │  SUMMARY CARDS (2 side-by-side)                     │
│          │  ┌─────────────────────┐ ┌─────────────────────┐    │
│          │  │ Successful logins   │ │ Failed logins       │    │
│          │  │ (last 5 days)       │ │ (last 5 days)       │    │
│          │  │        4            │ │        0            │    │
│          │  └─────────────────────┘ └─────────────────────┘    │
│          ├──────────────────────────────────────────────────────┤
│          │  FILTER ROW                                          │
│          │  From [📅 02/10/2026]  To [📅 02/15/2026]           │
│          │              [🔍 Reference ID] [Clear] [Search]     │
│          ├──────────────────────────────────────────────────────┤
│          │  ACTION ROW                                          │
│          │  ⊕ Add filter                    ✉ Export CSV       │
│          ├──────────────────────────────────────────────────────┤
│          │  TABLE                                               │
│          │  Columns: (expand) | Status and time |              │
│          │    Final action | User name | User type |           │
│          │    IP address                                        │
│          │                                                      │
│          │  Each row: ▾ | ✅ Feb 15, 2026; 08:54:29 p.m. EST |│
│          │    Clever Admin | Tom Leger | District Admin |      │
│          │    194.33.45.65                                      │
│          ├──────────────────────────────────────────────────────┤
│          │  PAGINATION: ◀ [1] ▶                                │
└──────────┴──────────────────────────────────────────────────────┘
```

### Key Observations from Live

| Element | Live Value | Simulator Value | Parity? |
|---------|-----------|-----------------|---------|
| Page title | "Access logs" | "Access logs" | Yes |
| Uses PageHeader? | No — plain h1 | No — plain h1 | Yes |
| Info banner | "Discover how to make the most of your Access Logs here." | Missing | Fix needed |
| Summary cards | 2 cards side-by-side, white bg, light border | 2 cards, same structure | Yes |
| Card labels | "Successful logins (last 5 days)" / "Failed logins (last 5 days)" | Same | Yes |
| Date filters | "From" / "To" with calendar icon date pickers (MM/DD/YYYY) | Date inputs (YYYY-MM-DD format) | Minor drift |
| Reference ID search | 🔍 icon + text input + "Clear" button | Same structure | Yes |
| Search button | Blue filled "Search" button | Blue filled, slightly different shade | Minor |
| Add filter | "⊕ Add filter" blue text button | "+ Add filter" | Close |
| Export CSV | "✉ Export CSV" blue text button | "✉ Export CSV" | Yes |
| Table columns | (expand), Status and time, Final action, User name, User type, IP address | Same | Yes |
| Status icon | Green filled circle ✅ (`check_circle` Material icon) | Green checkmark ✓ | Minor drift |
| Expand button | ▾ chevron button per row | ▼ text | Fix: use button |
| Pagination | ◀ [1] ▶ | Not present | Gap |
| Page background | `var(--gray-50)` | Direct `#333` color text | Fix needed |

### Interaction Notes

- Expand row: clicking ▾ chevron reveals detailed login flow below the row
- Date pickers use calendar popover (Material-style)
- "Add filter" adds additional filter criteria (dropdowns for user type, etc.)
- "Export CSV" triggers file download
- Search button filters by date range + Reference ID
- "Clear" button clears the Reference ID input only

### Parity Fixes (Batch 1)

- [x] Add InfoBanner with "Discover how to..." text
- [x] Use PageHeader component for consistent header styling
- [x] Fix page background color to use `var(--gray-50)` instead of hardcoded
- [x] Fix page text color to use `var(--text-primary)` instead of `#333`
- [x] Add Pagination component

---

## 13. SIS Sync (Batch 2)

**URL**: `https://schools.clever.com/sync`
**Page title**: "Clever | Sync Settings"
**Sidebar location**: Data sources > SIS sync

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR: Search | Portal link | Tom Leger ▾        │
│ 248px    ├──────────────────────────────────────────────────────┤
│          │  HEADER ROW                                          │
│ Data     │  h1: "Sync"  [Successful] badge (green/teal)        │
│ sources▾ │                                                      │
│ *SIS     ├──────────────────────────────────────────────────────┤
│  sync*   │  STATUS ROW (4 items inline)                        │
│  Custom  │  STATUS | LAST SYNC | SYNC TYPE | SYNC MANAGER      │
│  data    │  (text)  | 18h ago  | SFTP      | District Admin    │
│          ├──────────────────────────────────────────────────────┤
│ Data     │  INFO BANNER (globe icon, light blue)               │
│ browser  │  "Learn more about uploading data to Clever..."     │
│          ├──────────────────────────────────────────────────────┤
│          │  TABS: Last Attempted Sync | Settings | Upload |    │
│          │        Staff Data                                    │
│          ├──────────────────────────────────────────────────────┤
│          │  WARNING BANNER (globe icon)                         │
│          │  "If data is missing or incorrect..."               │
│          ├──────────────────────────────────────────────────────┤
│          │  TABLE                                               │
│          │  Columns: Record Type | Existing | Created |        │
│          │   Updated | Deleted | Errors | Download Changes |   │
│          │   Download SIS File                                  │
│          │  9 rows: Schools thru District Admins                │
└──────────┴──────────────────────────────────────────────────────┘
```

### Key Observations from Live

| Element | Live Value | Simulator Value (Before) | Parity? |
|---------|-----------|--------------------------|---------|
| Page title | "Sync" | "Sync" | Yes |
| Badge | Green/teal "Successful" pill | StatusBadge component | Yes |
| Status row | 4 items: STATUS, LAST SYNC, SYNC TYPE, SYNC MANAGER | Same | Yes |
| Info banner | Globe icon, "Learn more about uploading data to Clever" | Used `xCircle` icon | Fix |
| Inline header | No — provided by dashboard layout | Had redundant search/portal/user | Fix |
| Tabs | Last Attempted Sync, Settings, Upload, Staff Data | Same | Yes |
| Table columns | Record Type, Existing, Created, Updated, Deleted, Errors, Download Changes, Download SIS File | Same | Yes |
| Page background | `var(--gray-50)` | Hardcoded `#333` text, no bg | Fix |
| Tab sub-URLs | /sync, /sync/settings, /sync/upload, /sync/staff | N/A (client-side tabs) | OK |

### Screenshot References

| View | Screenshot ID |
|------|---------------|
| SIS Sync full (Last Attempted Sync tab) | ss_931854b4t |
| SIS Sync — Settings tab | ss_0695e9arn |
| SIS Sync — Upload tab | ss_67929lsvp |
| SIS Sync — Staff Data tab | ss_3503ngwy8 |
| Title/badge zoomed | zoomed region (230,80)-(1140,200) |
| Table header zoomed | zoomed region (230,340)-(1140,520) |

### Parity Fixes (Batch 2)

- [x] Remove redundant inline search/portal/user header (dashboard provides this)
- [x] Fix InfoBanner to use default `info` icon instead of `xCircle`
- [x] Fix page background to `var(--gray-50)` and text to `var(--text-primary)`
- [x] Fix page padding to `24px 40px` (matching live)
- [x] Remove unused `demoUsers` import

### Deferred Gaps

| Gap | Severity | Rationale |
|-----|----------|-----------|
| Tab sub-route URLs (e.g. /sync/settings) | P2 | Simulator uses client-side tab state, not routes |
| SFTP Credentials section (Settings tab) | P2 | Read-only config data, not training-critical |
| Download SIS File actions | P2 | Non-functional in simulator; icon presence is sufficient |

---

## 14. Data Browser (Batch 2)

**URL**: `https://schools.clever.com/data-browser`
**Page title**: "Clever | Data browser"
**Sidebar location**: Data sources > Data browser

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR: Search | Portal link | Tom Leger ▾        │
│ 248px    ├──────────────────────────────────────────────────────┤
│          │  HEADER ROW                                          │
│ Data     │  h1: "Data browser"    [Export schools] (blue btn)  │
│ sources▾ │  DISTRICT ID:                                       │
│  *Data   │  69179df5346c9d9bf7323d1e                           │
│  browser*├──────────────────────────────────────────────────────┤
│          │  INFO BANNER (globe icon, light blue)               │
│          │  "Learn to effectively browse data here."           │
│          ├──────────────────────────────────────────────────────┤
│          │  TABS: Schools | Students | Teachers | Staff |      │
│          │  Sections | Terms | Courses | Contacts              │
│          ├──────────────────────────────────────────────────────┤
│          │  ACTION ROW                                          │
│          │  [Add Filter] (blue btn)  "4 schools found"         │
│          ├──────────────────────────────────────────────────────┤
│          │  TABLE (white bg)                                    │
│          │  Schools tab columns: Name ↕ | City ↕ | State ↕ |  │
│          │    Students | Data Source ⓘ | Sections | Teachers | │
│          │    Last Modified ↕                                   │
└──────────┴──────────────────────────────────────────────────────┘
```

### Key Observations from Live

| Element | Live Value | Simulator Value (Before) | Parity? |
|---------|-----------|--------------------------|---------|
| Page title | "Data browser" | "Data browser" | Yes |
| Export button | Blue filled, text "Export {tab}" | Blue filled | Yes |
| District ID | Shown below title, monospace | Same | Yes |
| Tabs | 8 tabs matching | Same | Yes |
| Add Filter | Blue filled button | Blue filled (was indigo) | Fix |
| Active tab color | Blue (#1464ff) | Was indigo (#4351e8) | Fix |
| Schools sortable cols | Name, City, State, Last Modified only | Students, Sections, Teachers were sortable | Fix |
| Data Source header | Has ⓘ tooltip icon | No tooltip | Deferred |
| Page background | White | White | Yes |

### Screenshot References

| View | Screenshot ID |
|------|---------------|
| Data Browser — Schools tab | ss_5953psybx |
| Data Browser — Students tab | ss_50506gwpg |
| Column headers zoomed | zoomed region (250,400)-(1140,460) |
| Add Filter zoomed | zoomed region (250,340)-(600,410) |

### Parity Fixes (Batch 2)

- [x] Change all accent colors from indigo `#4351e8` to Clever blue `#1464ff`
- [x] Change hover color from `#3b46d1` to `#1158e0`
- [x] Fix Schools tab: Students, Sections, Teachers columns now non-sortable (matching live)

### Deferred Gaps

| Gap | Severity | Rationale |
|-----|----------|-----------|
| Data Source ⓘ tooltip icon on column header | P2 | Minor UI detail, non-interactive |
| Tab sub-routes via query params (?collection=students) | P2 | Simulator uses client-side state |
| Pagination on Students/Teachers/etc tabs | P1 | Already partially implemented; needs polish |

---

## 15. SSO Settings (Batch 2)

**URL**: `https://schools.clever.com/instant-login/accesscontrol`
**Page title**: "Clever | SSO settings"
**Sidebar location**: Authentication > SSO settings

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR: Search | Portal link | Tom Leger ▾        │
│ 248px    ├──────────────────────────────────────────────────────┤
│          │  HEADER ROW                                          │
│ Auth  ▾  │  h1: "SSO settings"    [Add Login Method] (blue)   │
│ Access   │                                                      │
│ logs     │  TECH SUPPORT CONTACT ⓘ                             │
│ *SSO     │  tom@maytonlyceum.com ✎                             │
│ settings*├──────────────────────────────────────────────────────┤
│ Badges   │  TABS: Access control | Login method |              │
│ MFA      │  Password Settings | Customize                      │
│          ├──────────────────────────────────────────────────────┤
│          │  SECTION: Access Control                             │
│          │  Description paragraph                               │
│          │  INFO BANNER: "Learn more about access control"     │
│          │  TABLE: User Type | Access | Disable Start | End    │
│          │  3 rows: Students, Teachers, Staff (all "Enabled")  │
│          │  [Edit] link                                         │
│          ├──────────────────────────────────────────────────────┤
│          │  SECTION: Account Claiming                           │
│          │  Toggle + "Copy URL to Claim Flow" button           │
│          │  TABLE: User Type | Status | Actions | Destinations │
│          ├──────────────────────────────────────────────────────┤
│          │  SECTION: Account Notifications                     │
│          │  TABLE: User Type | Notification Status | etc.      │
└──────────┴──────────────────────────────────────────────────────┘
```

### Key Observations from Live

| Element | Live Value | Simulator Value (Before) | Parity? |
|---------|-----------|--------------------------|---------|
| Page title | "SSO settings" | "SSO settings" | Yes |
| "Add Login Method" button | Blue filled, top-right | Missing | Fix |
| Tabs | 4 tabs: Access control, Login method, Password Settings, Customize | 5 tabs (had "SSO Policy") | Fix |
| Tech support contact | "tom@maytonlyceum.com" | Different email | Fix |
| Access Control table | 4 columns, 3 rows, "Enabled" green badges | Same structure | Yes |
| Info banner | Uses shared InfoBanner style | Inline `.infoBox` div | Fix |
| Account Claiming section | Toggle + table + "Copy URL to Claim Flow" | Missing | Deferred |
| Account Notifications section | Table with notification status | Missing | Deferred |
| Page background | `var(--gray-50)` | Hardcoded `#333` | Fix |

### Screenshot References

| View | Screenshot ID |
|------|---------------|
| SSO Settings — Access control tab | ss_707594069 |
| SSO Settings — Login method tab | ss_9111v3v0i |
| SSO Settings — scrolled (Account Claiming) | ss_99316oc2m (scrolled) |

### Parity Fixes (Batch 2)

- [x] Remove "SSO Policy" tab (does not exist on live)
- [x] Add "Add Login Method" blue filled button via PageHeader
- [x] Replace inline `.infoBox` with shared InfoBanner component
- [x] Fix page background to `var(--gray-50)` and text to `var(--text-primary)`
- [x] Update tech support contact email to `tom@maytonlyceum.com`
- [x] Fix Edit button color from `#0077c8` to `#1464ff`

### Deferred Gaps

| Gap | Severity | Rationale |
|-----|----------|-----------|
| Account Claiming section (toggle, URL, table) | P1 | Important feature but complex; needs dedicated implementation |
| Account Notifications section | P2 | Admin config, not training-critical |
| Login method tab content (Google Auth config) | P2 | Read-only config, not training flow |
| Password Settings tab content | P2 | Admin config |
| Customize tab content | P2 | Admin config |

---

## 16. Badges (Batch 2)

**URL**: `https://schools.clever.com/badges/overview`
**Page title**: "Clever | Badges"
**Sidebar location**: Authentication > Badges

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR: Search | Portal link | Tom Leger ▾        │
│ 248px    ├──────────────────────────────────────────────────────┤
│          │  HEADER ROW                                          │
│ Auth  ▾  │  h1: "Clever Badges"  [Download all Badges]        │
│ Access   │                       (outlined blue btn)           │
│ logs     │  GRADES WITH BADGES                                 │
│ SSO      │  Infant/Toddler, Preschool, ... Post Graduate      │
│ *Badges* ├──────────────────────────────────────────────────────┤
│ MFA      │  TABS: Overview | Chromebook | Windows | Settings | │
│          │        Badges+                                       │
│          ├──────────────────────────────────────────────────────┤
│          │  INFO BANNER: "Learn about setting up Badges..."    │
│          ├──────────────────────────────────────────────────────┤
│          │  h2: "Downloaded Badges"                             │
│          │  ACTION ROW: ⬇ 0 New Badges | ⬇ All Badges |       │
│          │  🗑 Void all Badges | "3 of 3 schools selected"     │
│          ├──────────────────────────────────────────────────────┤
│          │  TABLE                                               │
│          │  Columns: ☑ | School name ↕ | Downloaded Badges ↕ | │
│          │    New Badges ⓘ ↕ | Download | Void Badges          │
│          │  3 rows with school data                             │
│          ├──────────────────────────────────────────────────────┤
│          │  PAGINATION: [1]                                     │
└──────────┴──────────────────────────────────────────────────────┘
```

### Key Observations from Live

| Element | Live Value | Simulator Value (Before) | Parity? |
|---------|-----------|--------------------------|---------|
| Page title | "Clever Badges" | "Clever Badges" | Yes |
| "Download all Badges" button | Outlined blue, no arrow | Had `▼` arrow | Fix |
| Column headers | Sort arrows via sortable prop | Hardcoded `↕` in text | Fix |
| Download links | Icon + "New" / "All" text | Emoji `📥` | Fix |
| Void link | Trash icon + "Void" text in red | Emoji `🗑` | Fix |
| Action row icons | SVG download/trash icons | Emoji `📥`/`🗑` | Fix |
| School names | Fort Virgilfield, Santa Rosa, Treutelside | Generic names | Fix |
| Badge counts | downloaded: 3/8/9, new: 0 | downloaded: 0, new: 1/6/7 | Fix |
| Page background | `var(--gray-50)` | Hardcoded `#333` | Fix |
| Tabs | 5 tabs matching | Same | Yes |

### Screenshot References

| View | Screenshot ID |
|------|---------------|
| Badges — Overview tab | ss_5210lqt40 |
| Badges — Chromebook tab | ss_3709amc0g |
| Badges — Settings tab | ss_4459atmf6 |
| Table zoomed | zoomed region (260,340)-(1140,680) |
| Header/button zoomed | zoomed region (260,80)-(1140,230) |

### Parity Fixes (Batch 2)

- [x] Remove `▼` arrow from "Download all Badges" button
- [x] Use PageHeader for title + button layout
- [x] Remove hardcoded `↕` sort arrows from column header text; use `sortable` prop
- [x] Replace emoji icons (`📥`/`🗑`) with SVG Icons (Icons.download / Icons.trash)
- [x] Add `Icons.trash` to shared Icons component
- [x] Update badge data: use live school names (Fort Virgilfield, Santa Rosa, Treutelside)
- [x] Update badge counts to match live (downloaded: 3/8/9, new: 0)
- [x] Fix page background to `var(--gray-50)` and text to `var(--text-primary)`
- [x] Dynamic "New Badges" count in action row (calculates from data)

---

## 17. Portal Settings (Batch 3)

**URL**: `https://schools.clever.com/portal/settings/url`
**Page title**: "Clever | Portal settings"
**Sidebar location**: Portal > Portal settings

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR: Search | Portal link | Tom Leger ▾        │
│ 248px    ├──────────────────────────────────────────────────────┤
│          │  HEADER ROW                                          │
│ Portal ▾ │  h1: "Portal settings"  (no action button)          │
│ Organize │                                                      │
│ *Portal  ├──────────────────────────────────────────────────────┤
│ settings*│  TABS: URL | Customization | Substitute Access |    │
│ Communi- │  Digital Learning Directory | Teacher Page Settings  │
│ cation   ├──────────────────────────────────────────────────────┤
│          │  INFO BANNER (globe icon, light blue)               │
│          │  "Learn about setting up a stellar... Quick Start   │
│          │   Guide... Help Center"                              │
│          ├──────────────────────────────────────────────────────┤
│          │  CARD: "Your Clever Portal URL" (gray header bar)   │
│          │  Description paragraphs                              │
│          │  https://clever.com/in/mayton  ⬇ Copy Link          │
│          │  District Shortname: [mayton]                        │
│          │  [Update] (blue filled button)                       │
│          │  Download login instructions link                    │
└──────────┴──────────────────────────────────────────────────────┘
```

### Key Observations from Live

| Element | Live Value | Simulator Value (Before) | Parity? |
|---------|-----------|--------------------------|---------|
| Page title | "Portal settings" | "Portal settings" | Yes |
| Uses PageHeader? | Yes — plain h1 above tabs | Raw `<h1>` with custom class | Fix |
| Tabs | URL, Customization, Substitute Access, Digital Learning Directory, Teacher Page Settings | Same | Yes |
| Info banner | Globe icon, light blue bg | Same (shared InfoBanner) | Yes |
| URL section | White card with gray header bar "Your Clever Portal URL" | Gray `#f9f9f9` section, no header bar | Fix |
| Shortname default | "mayton" | "print-center" | Fix |
| Copy Link icon | Download/share icon (⬇) | `Icons.profile` (person icon) | Fix |
| Update button | Blue filled (`#1464ff`) | Gray `#e0e0e0` | Fix |
| Link color | `#1464ff` (Clever blue) | `#0077c8` | Fix |
| Page background | `var(--gray-50)` | No explicit bg, hardcoded `#333` text | Fix |
| Download row | Inline with section, proper text color | Inline `style` with `#333` | Fix |

### Screenshot References

| View | Screenshot ID |
|------|---------------|
| Portal Settings — URL tab | ss_3823zv76z |
| Header/tabs zoomed | zoomed (230,80)-(1140,230) |
| Content zoomed | zoomed (230,300)-(1140,700) |

### Parity Fixes (Batch 3)

- [x] Use `PageHeader` component for title
- [x] Fix page background to `var(--gray-50)` and text to `var(--text-primary)` via CSS vars
- [x] Update shortname default from "print-center" to "mayton" (matching live district)
- [x] Replace `Icons.profile` with `Icons.download` for Copy Link icon
- [x] Change Update button from gray `#e0e0e0` to blue `var(--clever-blue)`
- [x] Fix all link colors from `#0077c8` to `var(--clever-blue)` (`#1464ff`)
- [x] Replace section bg from `#f9f9f9` to white card with gray header bar (matching live)
- [x] Remove inline style from download row, use CSS class
- [x] Remove unused `customizationEnabled` state variable

### Deferred Gaps

| Gap | Severity | Rationale |
|-----|----------|-----------|
| Customization tab content (logo upload, theme settings) | P2 | Admin config, not training-critical |
| Substitute Access tab content | P2 | Niche feature |
| Digital Learning Directory tab content | P2 | Admin config |
| Teacher Page Settings tab content | P2 | Admin config |
| Copy Link button functionality | P2 | Non-functional in simulator, icon presence sufficient |

---

## 18. LMS Connect (Batch 3)

**URL**: `https://schools.clever.com/lms-connect`
**Page title**: "Clever | LMS Connect"
**Sidebar location**: Applications > LMS Connect

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR: Search | Portal link | Tom Leger ▾        │
│ 248px    ├──────────────────────────────────────────────────────┤
│          │  HEADER ROW (white bg, border-bottom)               │
│ Apps  ▾  │  h1: "LMS Connect"        Supported LMSs           │
│  My apps │  [Join waitlist] (blue)    [Canvas] [Schoology]     │
│  Add     │  [Submit app interest      [Google Classroom]       │
│  *LMS    │   form] (outlined)                                  │
│  Connect*├──────────────────────────────────────────────────────┤
│  Library │  ALERT BANNER (light purple bg, star icon)          │
│          │  "Your applications are not available on LMS        │
│ Data  ▾  │   Connect... Learn more about LMS Connect."        │
│          ├──────────────────────────────────────────────────────┤
│          │  BENEFITS SECTION                                    │
│          │  h2: "LMS and application connections made easy"    │
│          │  3 illustration cards (SVG icons, not emojis)       │
│          ├──────────────────────────────────────────────────────┤
│          │  PARTNERSHIP SECTION                                 │
│          │  h3: "In partnership with Edlink"                   │
│          │  Description + link                                  │
└──────────┴──────────────────────────────────────────────────────┘
```

### Key Observations from Live

| Element | Live Value | Simulator Value (Before) | Parity? |
|---------|-----------|--------------------------|---------|
| Page title | "LMS Connect" | "LMS Connect" | Yes |
| Title layout | h1 + buttons left, "Supported LMSs" + logos right | Same structure | Yes |
| "Join waitlist" | Blue filled button | Blue filled | Yes |
| "Submit app interest form" | Outlined blue button | Outlined blue | Yes |
| LMS logos | Real brand logos (Canvas red dots, Schoology S circle, Google Classroom green) | Emoji placeholders (`🎨`, `S`, `📚`) | Fix |
| Alert banner bg | Light purple/lavender `#ede9fe` | Light blue `#f0f9ff` | Fix |
| Alert icon | Black star (★) | Yellow star emoji (⭐) | Fix |
| Benefit card icons | SVG illustrations (computer/device style) | Emojis (`📱`, `📊`, `✅`) | Fix |
| Partnership section | Same text content | Same | Yes |
| Page background | `var(--gray-50)` | `var(--gray-50)` | Yes |

### Screenshot References

| View | Screenshot ID |
|------|---------------|
| LMS Connect — full page | ss_0995wzj12 |
| Header/logos zoomed | zoomed (230,80)-(1100,210) |
| Alert banner zoomed | zoomed (260,260)-(1100,350) |

### Parity Fixes (Batch 3)

- [x] Replace emoji LMS logo placeholders with SVG brand icons (Canvas red dashed circle, Schoology S in blue circle, Google Classroom green card)
- [x] Fix alert banner background from light blue `#f0f9ff` to light purple `#ede9fe`
- [x] Fix alert banner layout: add border-radius, margin padding to match live card style
- [x] Replace emoji alert icon `⭐` with text star `★`
- [x] Replace emoji benefit icons (`📱`, `📊`, `✅`) with SVG Icons (applicationsGrid, analytics, checkCircle)
- [x] Fix benefit icon sizing for SVG (48px, centered)

### Deferred Gaps

| Gap | Severity | Rationale |
|-----|----------|-----------|
| Real LMS brand logos (pixel-perfect) | P2 | SVG approximations acceptable for simulator |
| Benefit card SVG illustrations (detailed device drawings) | P2 | Live uses complex multi-element illustrations; SVG icons are sufficient representation |
| Waitlist/form submit button functionality | P2 | Non-functional in simulator, presence sufficient |

---

## 19. Library Controls (Batch 3)

**URL**: `https://schools.clever.com/library/overview`
**Page title**: "Clever | Library"
**Sidebar location**: Applications > Library controls

### Structural Breakdown

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR: Search | Portal link | Tom Leger ▾        │
│ 248px    ├──────────────────────────────────────────────────────┤
│          │  HEADER (white bg, border-bottom)                   │
│ Apps  ▾  │  h1: "Library"                                     │
│  My apps │  TABS: Overview | Settings | Applications |        │
│  Add     │         Recommended                                 │
│  LMS     ├──────────────────────────────────────────────────────┤
│ *Library │  OVERVIEW TAB:                                      │
│ controls*│  Description text                                   │
│          │  Library Preview Card (Clever Library mockup)       │
│          │  - Blue gradient header "Clever Library"            │
│          │  - 3 app cards: Edmodo, Code.org, Newsela           │
│          │  - Real brand icons (not emojis)                    │
│          │  - "ADD TO PORTAL" blue buttons                     │
│          │  - Browse subjects: English/Tech/Math/Science/Other │
│          │                                                      │
│          │  SETTINGS TAB:                                      │
│          │  Card: "Clever Library Access" (gray header bar)    │
│          │  Toggle (green/teal) + description text             │
│          │  "Learn more about the Clever Library" link         │
│          │                                                      │
│          │  APPLICATIONS TAB:                                  │
│          │  "Block specific Library applications" header       │
│          │  Search input | Table with sortable columns         │
│          │  8 rows | Pagination (1-47) | Export button         │
└──────────┴──────────────────────────────────────────────────────┘
```

### Key Observations from Live

| Element | Live Value | Simulator Value (Before) | Parity? |
|---------|-----------|--------------------------|---------|
| Page title | "Library" | "Library" | Yes |
| Tabs | Overview, Settings, Applications, Recommended | Same | Yes |
| Overview description | Same text | Same | Yes |
| Preview card | Real brand app icons | Emoji placeholders (`👓`, `CODE`, `N`) | Acceptable |
| Search icon in preview | SVG search icon | Emoji `🔍` | Fix |
| Settings tab | "Clever Library Access" card with single toggle + description | Two checkboxes with different labels | Fix |
| Settings toggle | Green/teal toggle (on state) | Checkbox inputs | Fix |
| Applications: sort arrows | Via sortable prop only | Hardcoded `↕` in header text | Fix |
| Applications: app icon | Real brand icons | Emoji `📱` | Fix |
| Applications: Grades column | Not sortable | `sortable: true` | Fix |
| Export button | Outlined blue | Outlined blue | Yes |
| Pagination | 1-47 pages | 1-47 pages | Yes |
| Page background | `var(--gray-50)` | `var(--gray-50)` | Yes |

### Screenshot References

| View | Screenshot ID |
|------|---------------|
| Library — Overview tab | ss_5607iitpj |
| Library — Applications tab | ss_5224rt0wc |
| Library — Settings tab | ss_9624ansb6 |
| Header/tabs zoomed | zoomed (230,80)-(1100,180) |
| Preview card zoomed | zoomed (430,260)-(910,560) |

### Parity Fixes (Batch 3)

- [x] Rewrite Settings tab: replace two checkboxes with single "Clever Library Access" card matching live layout (gray header bar + toggle + description)
- [x] Add toggle switch CSS (matching PortalSettings toggle pattern, green/teal `#278c75`)
- [x] Remove hardcoded `↕` from "Application Name" and "Status" column headers
- [x] Replace emoji `📱` app icon in table with `Icons.applications` SVG
- [x] Replace emoji `🔍` search icon in preview card with `Icons.search` SVG
- [x] Remove `sortable: true` from Grades column (not sortable on live)
- [x] Add `searchIconWrap` CSS class for SVG search icon in preview
- [x] Import `Icons` component

### Deferred Gaps

| Gap | Severity | Rationale |
|-----|----------|-----------|
| Preview card app icons (pixel-perfect brand logos) | P2 | Current SVG/text approximations acceptable for simulator |
| Preview card left/right carousel arrows | P2 | Decorative, non-functional in simulator |
| Recommended tab "Recommend a resource" search functionality | P2 | Empty state is sufficient for training |
| Applications tab real search filtering | P1 | Would require client-side filter implementation; static table sufficient |
| Settings tab "Learn more" link destination | P2 | Placeholder `#` link acceptable |

---

## 10. Clever IDM (Identity Management)

**URL**: `https://schools.clever.com/identity-management`
**Status**: Parity (Behavior)
**Updated**: 2026-02-16

### Workflow Matrix

| # | Flow | Trigger | Live Behavior | Simulator Status |
|---|------|---------|---------------|------------------|
| 1 | Add New Destination dropdown | Click "Add new destination" button | Dropdown with "Microsoft Active Directory", "Microsoft Entra ID" | Implemented |
| 2 | Add Destination confirmation modal | Click dropdown item | Modal: "Add new destination?" / bold name / [Add destination] [Cancel] | Implemented |
| 3 | Pause Sync confirmation modal | Click "Pause Google sync" | Modal: "Pause syncs?" / warning text / [Pause syncs] [Cancel] | Implemented |
| 4 | Resume Sync toggle | Click "Resume Google sync" | Button toggles back to "Pause Google sync" (no modal) | Implemented |
| 5 | Edit Google Provisioning | Click "Edit Google provisioning" | Multi-step wizard (8 steps) at /identity-management/setup/* | Deferred — stub toast |
| 6 | Download user emails | Click download link (Tasks tab) | Browser file download | Implemented — toast feedback |
| 7 | Sync History tab | Click tab | DataTable: Destination, Date/Time, Creates, Matches, Updates, Archives, Issues, Log | Implemented |
| 8 | Exports tab | Click tab | 3 sections: user emails, recent accounts, SFTP toggle | Implemented |
| 9 | Events tab | Click tab | Date filters, Add filter, data table + pagination | Implemented |
| 10 | Events row expansion | Click row chevron | Detail panel: User details, Sync details, Modified data, Additional sync details | Implemented |
| 11 | Modified data modal | Click "See X more fields" | Modal with full key-value field list + Close button | Implemented |

### Deferred Gaps

| Gap | Severity | Rationale |
|-----|----------|-----------|
| Edit Google Provisioning wizard (8-step setup) | P1 | Separate epic — full multi-page wizard with Connect to Google, Select Management Level, Select Users, Set Login Credentials, Organize OUs, Configure Groups, Summary, Preview & Provision. Stub toast shown. |
| Real file downloads for CSVs | P2 | Toast feedback sufficient for training simulator |
| Events date filter parsing | P2 | Basic date comparison; edge cases around timezone may differ from live |
