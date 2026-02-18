# District Admin Roleplay Simulator

## Working Product Definition
This simulator trains **Clever Support Agents** to roleplay as a **District Admin (DA / Clever Admin)** in realistic day-to-day operations.

The DA is the central operator for district identity + roster + app access workflows. They receive requests from:
- School leadership (principal, superintendent, IT director)
- Internal colleagues (registrars, SIS owners, security/compliance)
- Teachers/staff support channels

In product terms, these requests become **tickets/scenarios** the learner must handle inside the simulator.

### Primary Audience (Now)
- **Tier 2 Clever Support Agents** (initial launch focus)
- Goal: build practical IDM troubleshooting and configuration fluency by simulating real DA workflows

### Secondary Audience (Later)
- New support hires
- Cross-functional support roles
- Team leads running skill drills and assessments

---

## Training Arc (How users progress)

### Phase 1 — Guided Practice
- User gets a ticket
- System guides step-by-step
- UI highlights and hints are available
- User learns correct paths, settings, and terminology

### Phase 2 — Assisted Application
- User gets a similar ticket with lighter guidance
- Fewer hints, more self-navigation
- User must apply prior pattern to a new variant

### Phase 3 — Independent Performance
- User gets realistic, mixed-complexity tickets
- Minimal/no hints
- User demonstrates expertise by:
  - answering stakeholder questions
  - navigating correct pages/settings
  - making correct config updates
  - validating outcomes and communicating back

### Phase 4 — Advanced/Edge Cases
- Ambiguous or multi-system issues
- Time pressure and competing priorities
- Requires triage, judgment, and clean communication

---

## Core Simulation Loop
1. **Ticket arrives** (from boss/colleague/requestor)
2. **Interpret request** (what is being asked, urgency, impact)
3. **Investigate in product** (SIS Sync, IDM, settings, logs, etc.)
4. **Take action** (change settings, run sync choices, adjust provisioning config)
5. **Verify** (preview/sync outcome, check affected users)
6. **Respond** (clear stakeholder update + next steps)
7. **Score + feedback** (accuracy, speed, safety, communication quality)

---

## Scenario/Ticket Design Model

Each ticket should include structured metadata:
- `id`
- `title`
- `persona` (who submitted it)
- `channel` (email/chat/helpdesk)
- `priority` (low/med/high/urgent)
- `objective`
- `acceptanceCriteria[]`
- `requiredSkills[]`
- `hints[]` (for guided mode)
- `failureModes[]` (common mistakes)
- `datasetTemplate` (which district data pack to load)
- `expectedActions[]` (key clicks/settings/updates)
- `expectedResponse` (what DA should communicate back)

---

## Skill Domains to Train
### Phase 1 Focus (Now): IDM
1. **Provisioning & Login Credential Logic**
2. **OU/Group Organization**
3. **IDM troubleshooting and recovery workflows**
4. **Stakeholder communication under pressure**

### Phase 2 Expansion: broader Clever 101
5. **SIS Data & Sync Fundamentals**
6. **Access/Roster Troubleshooting**
7. **Security + Identity hygiene**

---

## Scoring Rubric (v1)
- **Correctness (40%)**: did user apply correct settings/actions?
- **Process (20%)**: did user validate before/after changes?
- **Efficiency (15%)**: unnecessary steps or clean navigation?
- **Safety (15%)**: avoided risky/mass-impact mistakes?
- **Communication (10%)**: clear, concise update to requestor?

Pass criteria can be scenario-specific but should map back to this common rubric.

## Gamification Layer (v1 → v2)
### v1 (basic, immediate)
- Points per ticket completion
- Bonus for first-pass correctness
- Time bonus for efficient resolution
- Streak bonus for consecutive successful tickets
- Visible learner level/badge progression (e.g., IDM Apprentice → IDM Specialist)

### v2 (team competition)
- Leaderboards by cohort/team
- Weekly challenge playlists
- Timed puzzle tickets with tie-breaker by quality score
- **"IDM Olympics" mode** with event rounds:
  - Sprint (speed + accuracy)
  - Deep Dive (complex troubleshooting)
  - Communication Relay (best stakeholder response)

---

## UX Requirements
- Ticket inbox panel (queue of incoming requests)
- Context panel (boss/colleague messages + constraints)
- Task checklist (visible in guided modes)
- Evidence capture (what action proved completion)
- End-of-ticket debrief:
  - what went right
  - what was missed
  - best-practice answer template

---

## Data Strategy
Use deterministic district datasets tied to scenario templates:
- Enables reproducible outcomes
- Supports "same skill, different district" variation
- Pairs naturally with embedded Example District Generator

Every scenario should specify a required data template to avoid non-deterministic grading.

---

## Content Pipeline
1. Draft scenario from real DA pain points
2. Define objective + acceptance criteria
3. Bind to dataset template
4. Add guided script + hint levels
5. Add independent mode variant
6. QA with roleplay walkthrough
7. Publish to scenario catalog

---

## MVP Scope Recommendation
For first launch (Tier 2 IDM enablement), focus on:
- 8–12 high-value **IDM** scenarios
- 3 difficulty bands (guided, assisted, independent)
- Basic scoring + debrief
- Ticket inbox + scenario runner
- Deterministic datasets (prebuilt templates)
- Basic gamification (points + streaks + badges)

Avoid overbuilding dynamic AI generation until baseline learning loop is solid.

---

## Proposed Milestones
### Milestone 1: Framework
- Ticket schema
- Scenario runner shell
- Guided hint rails

### Milestone 2: DA Core Tracks
- SIS sync + IDM + credentials + OUs ticket sets
- Basic scoring + completion logic

### Milestone 3: Performance Mode
- Independent ticket queue
- Multi-ticket prioritization
- Communication scoring

### Milestone 4: Scale & Authoring
- Scenario authoring toolkit
- Dataset template library
- Reporting dashboard for learner progress

---

## Definition of Success
- Learners can complete common DA workflows without guidance
- Learners can explain *why* they took actions, not just click-path memory
- Support-team-observed reduction in repeat admin errors in analogous workflows
- Clear progression from novice → confident DA operator

---

## One-line Product Positioning
**"A roleplay simulator that trains district admins to handle real Clever operations tickets with confidence, accuracy, and clear stakeholder communication."**
