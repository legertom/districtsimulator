# OUs Step Gap Matrix

> Generated 2026-02-16 via live Clever re-discovery

## Summary

| Category | Total Controls | Implemented | Missing | Severity |
|----------|---------------|-------------|---------|----------|
| Student OUs Edit | 5 | 0 | 5 | P1 |
| Teacher OUs Edit | 5 | 0 | 5 | P1 |
| Staff OUs Edit | 5 | 0 | 5 | P1 |
| Archive OU Edit | 4 | 0 | 4 | P1 |
| Ignored OUs Edit | 4 | 0 | 4 | P1 |
| OUs Overview | 6 | 6 | 0 | — |

---

## OUs Overview (Step 5 main view)

| Interaction | Live Behavior | Simulator Behavior | Gap | Severity |
|-------------|--------------|-------------------|-----|----------|
| Card grid layout | 2-column grid with 5 cards | 2-column grid with 5 cards | None | — |
| Progress bar | Shows "5 of 5 steps" with green fill | Shows "5 of 5 steps" with green fill | None | — |
| Completed badges | Green "✓ Completed" pill on each card | Green "✓ Completed" pill on each card | None | — |
| Edit buttons | Navigate to sub-route (e.g., `/ous/students-ous`) | Shows toast only ("Editing X OU configuration...") | **Blocker** | P1 |
| Card labels | "OUS CREATED" / "ARCHIVE OU" / "IGNORED OUS" | Matches live | None | — |
| Card values | Template paths (e.g., `/Students/{{school_name}}/{{student.grade}}`) | Matches live | None | — |

---

## Student OUs Edit (`/ous/students-ous`)

| Interaction | Live Behavior | Simulator Behavior | Gap | Severity |
|-------------|--------------|-------------------|-----|----------|
| Edit view navigation | Replaces step content with Student OUs edit UI; breadcrumb: `← Back | Organize OUs | Student OUs` | Not implemented — toast only | **Blocker** | P1 |
| Section 1: Preview user | Dropdown to select student; shows Clever Data card (School, Grade, Graduation Year) | Not implemented | **High** | P1 |
| Section 2: Parent OU tree | Radio buttons with Google Org Unit hierarchy (expandable tree); "Students" selected; Refresh button | Not implemented | **Blocker** | P1 |
| Preview panel (right sidebar) | Tree visualization: Fort Virgilfield > Students > Treutelside Middle School > 7 > Rogelio Waelchi | Not implemented | **High** | P1 |
| Clever Tip panel (right sidebar) | "Don't see a parent OU? Create one in Google Admin Console" | Not implemented | **Medium** | P2 |
| Next step button | Returns to OUs overview | Not implemented | **Blocker** | P1 |

---

## Teacher OUs Edit (`/ous/teachers-ous`)

| Interaction | Live Behavior | Simulator Behavior | Gap | Severity |
|-------------|--------------|-------------------|-----|----------|
| Edit view navigation | Same pattern as Student OUs; breadcrumb: `← Back | Organize OUs | Teacher OUs` | Not implemented | **Blocker** | P1 |
| Section 1: Preview user | Dropdown for teacher; Clever Data: School, Title | Not implemented | **High** | P1 |
| Section 2: Parent OU tree | Same radio tree; path shows `/Users/Staff/Teachers` | Not implemented | **Blocker** | P1 |
| Preview panel | Tree: Fort Virgilfield > Users > Staff > Teachers > Betty Bauch | Not implemented | **High** | P1 |
| Clever Tip panel | Same as Student variant but "teachers" | Not implemented | **Medium** | P2 |
| Next step button | Returns to OUs overview | Not implemented | **Blocker** | P1 |

---

## Staff OUs Edit (`/ous/staff-ous`)

| Interaction | Live Behavior | Simulator Behavior | Gap | Severity |
|-------------|--------------|-------------------|-----|----------|
| Edit view navigation | Same pattern as Student/Teacher; breadcrumb: `← Back | Organize OUs | Staff OUs` | Not implemented | **Blocker** | P1 |
| Section 1: Preview user | Dropdown for staff; Clever Data: Title only | Not implemented | **High** | P1 |
| Section 2: Parent OU tree | Same radio tree; path: `/Users/Staff/{{staff.department}}` | Not implemented | **Blocker** | P1 |
| Preview panel | Tree: Fort Virgilfield > Users > Staff > Operations > Oswaldo Pouros | Not implemented | **High** | P1 |
| Clever Tip panel | Same as Student variant but "staff" | Not implemented | **Medium** | P2 |
| Next step button | Returns to OUs overview | Not implemented | **Blocker** | P1 |

---

## Archive OU Edit (`/ous/archive-ou`)

| Interaction | Live Behavior | Simulator Behavior | Gap | Severity |
|-------------|--------------|-------------------|-----|----------|
| Edit view navigation | Different layout from user-type OUs; no user preview section; breadcrumb: `← Back | Organize OUs | Archive OU` | Not implemented | **Blocker** | P1 |
| Section 1: Parent OU tree | Radio tree; currently "Fort Virgilfield Elementary School" selected; sub-text: "Users will be placed in sub-OU for their type: /Students, /Teachers, /Staff" | Not implemented | **Blocker** | P1 |
| Archive OU Preview | Shows `//Students`, `//Teachers`, `//Staff` paths under selected OU | Not implemented | **High** | P1 |
| Section 2: Archive action | 3 radio options: (a) Move + suspend + archive, (b) Move + suspend [selected], (c) Move only | Not implemented | **Blocker** | P1 |
| Clever Tip panel | "Clever uses SIS ID to reactivate user accounts if they return to the district in less than a year." | Not implemented | **Medium** | P2 |
| Save button | Saves and returns to OUs overview | Not implemented | **Blocker** | P1 |

---

## Ignored OUs Edit (`/ous/ignored-ous`)

| Interaction | Live Behavior | Simulator Behavior | Gap | Severity |
|-------------|--------------|-------------------|-----|----------|
| Edit view navigation | Different layout; breadcrumb: `← Back | Organize OUs | Ignored OU` | Not implemented | **Blocker** | P1 |
| Section 1: OU checkboxes | **Checkboxes** (multi-select, not radio); explanatory text about what "ignored" means | Not implemented | **Blocker** | P1 |
| Ignored OU Preview | Shows `/` for currently ignored paths | Not implemented | **High** | P1 |
| Clever Tip panel | "OUs you selected in previous steps to place Clever users cannot be ignored." | Not implemented | **Medium** | P2 |
| Skip button | Skips without saving; returns to OUs overview | Not implemented | **High** | P1 |
| Next step button | Saves and advances to next step | Not implemented | **Blocker** | P1 |

---

## Evidence References

| Screenshot ID | Description |
|--------------|-------------|
| ss_1037ud37y | Live OUs overview (step 5 main view) |
| ss_58103jxsl | Live Student OUs edit view |
| ss_6923qe412 | Live Teacher OUs edit view |
| ss_6200f5i3c | Live Staff OUs edit view |
| ss_57722v4nb | Live Archive OU edit view |
| ss_7806ou2z5 | Live Ignored OUs edit view |

---

## Implementation Notes

### Shared components needed:
1. **GoogleOrgUnitTree** — Reusable tree with radio (single-select) or checkbox (multi-select) mode
2. **OUPreviewPanel** — Right sidebar showing OU path preview hierarchy
3. **CleverTipPanel** — Right sidebar tip box

### Data model additions needed:
- `ouMappings` keyed by user type with `selectedOU`, `archiveAction`, `ignoredOUs[]`
- Google Org Unit tree structure (deterministic mock data)
- Sample user data per type for preview section

### View types:
- **UserTypeOUEdit** (shared by students/teachers/staff) — sections 1+2, preview + tip sidebars, "Next step"
- **ArchiveOUEdit** — OU tree + archive preview + archive action radios, "Save"
- **IgnoredOUsEdit** — checkbox tree + ignored preview, "Skip" + "Next step"
