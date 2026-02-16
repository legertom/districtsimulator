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
