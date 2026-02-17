# Claude OUs Clickthrough Guide (Live Clever)

Use this guide when validating **Organize OUs** on the real Clever site so no sub-step/feature setting is missed.

## Objective

Force a full interaction crawl of the OUs flow by:
1. Entering each OU sub-route (Students, Teachers, Staff, Archive, Ignored).
2. Clicking the actionable blue button in the lower-right area on each screen (usually **Next step**).
3. Repeating until the flow advances to the next feature section.

---

## Critical Rule (Do Not Skip)

At every OUs sub-screen, Claude must:

- Scroll to bottom-right.
- Find the primary blue CTA in that position (**Next step**, **Next**, **Continue**, or equivalent).
- Click it.
- Wait for route or heading change.
- Capture screenshot + notes.
- Repeat.

If CTA is disabled, Claude must resolve required selections first (e.g., choose parent OU), then click CTA.

---

## Starting Point

Typical entry URL pattern:

- `https://schools.clever.com/identity-management/setup/ous/...`

Example seen:

- `.../setup/ous/staff-ous?configID=<id>`

---

## Required OUs Sub-Flows to Traverse

Claude must explicitly visit and document all of the following (if present):

1. `students-ous`
2. `teachers-ous`
3. `staff-ous`
4. `archive-ous`
5. `ignored-ous`

For each, complete this mini-loop:

1. Verify page heading matches sub-flow.
2. Interact with preview user dropdown (if present).
3. Select a parent OU (radio/tree row).
4. Expand at least one tree node (if expandable).
5. Click bottom-right blue CTA.
6. Confirm transition to next sub-flow/step.
7. Save evidence.

---

## Interaction Checklist (per sub-flow)

- [ ] Heading captured (e.g., **Staff OUs**)
- [ ] Preview card state captured
- [ ] OU tree state captured (collapsed/expanded)
- [ ] Selection performed (radio/checkbox)
- [ ] Validation behavior observed (enabled/disabled CTA)
- [ ] Bottom-right blue CTA clicked
- [ ] Resulting route captured
- [ ] Resulting heading captured

---

## Evidence Requirements

Store screenshots under:

- `docs/evidence/idm-provisioning/`

Naming convention:

- `live-ous-<subflow>-before.png`
- `live-ous-<subflow>-after-next.png`

Examples:

- `live-ous-staff-before.png`
- `live-ous-staff-after-next.png`
- `live-ous-archive-before.png`

Also log route transitions in markdown:

- `docs/evidence/idm-provisioning/ous-route-trace.md`

Format:

```md
- staff-ous -> archive-ous
  - before: /identity-management/setup/ous/staff-ous?... 
  - after: /identity-management/setup/ous/archive-ous?...
```

---

## Fallback Behavior

If CTA is not visible/clickable:

1. Scroll container and page to bottom.
2. Collapse overlays/panels obstructing lower-right area.
3. Resize viewport to common desktop size (e.g., 1440x900+).
4. Retry click.
5. As last resort, click via evaluate() and still record the obstruction as a bug.

---

## Browser Relay / MCP Guidance

When automating via Browser Relay:

- Prefer stable refs from snapshot for CTA clicks.
- Re-snapshot after every route transition.
- Do **not** stop after first successful click; keep clicking next CTA until OUs section fully traversed.

---

## Output Format Claude Must Return

1. **Sub-flows completed** (students/teachers/staff/archive/ignored)
2. **Route trace** (before -> after for each CTA click)
3. **Blocked points** (if any)
4. **Evidence files** (exact paths)
5. **Parity gaps discovered**
6. **Simulator changes required** (mapped 1:1 to observed behavior)

---

## Acceptance Criteria

This task is complete only if:

- All OUs sub-flows were traversed with CTA clicks.
- Every transition is evidenced by route + screenshot.
- No "stopped early" in OUs.
- Any obstruction issues are documented with repro notes.
