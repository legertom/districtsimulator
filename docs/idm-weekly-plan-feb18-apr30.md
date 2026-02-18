# IDM Enablement Plan (Week-by-Week)

**Program window:** Feb 18, 2026 → Apr 30, 2026  
**Launch requirements:**
- **Training Center live:** April 1
- **Timed races live:** final week of April

## Week of Feb 18
**Focus:** Scope lock + success criteria
- Finalize v1 scope: Training Center + Timed Evaluation + Leaderboard
- Finalize courses: Credentials, OUs, Groups
- Finalize pass/fail rules per course

**Deliverables**
- Approved scope doc
- Course definitions + validation criteria
- KPI list (participation, completion, best time)

**Measurable result**
- 100% of v1 courses have explicit pass criteria and owner

---

## Week of Feb 24
**Focus:** Training Center foundation
- Add Training Center entry point in portal
- Build guided practice flow for Credentials/OUs/Groups
- Persist completion status per user

**Deliverables**
- Training Center shell + 3 guided courses
- Progress state persistence

**Measurable result**
- Internal users can complete all 3 guided courses end-to-end

---

## Week of Mar 3
**Focus:** Validation engine
- Implement deterministic completion checks for each course
- Add fail feedback and retry guidance
- Add event logging for attempts/completions

**Deliverables**
- Course validator logic
- Pass/fail feedback panel
- Attempt event logs

**Measurable result**
- 100% of courses return deterministic pass/fail in QA

---

## Week of Mar 10
**Focus:** Timed Evaluation core
- Start timer at course start
- Stop timer on valid completion
- Store run record (user, course, time, timestamp, validity)

**Deliverables**
- Timed run engine
- Run history storage + retrieval

**Measurable result**
- Timed runs record reliably with <1% logging failure in internal test

---

## Week of Mar 17
**Focus:** Leaderboards + medals
- Best-time leaderboard per course
- Gold/Silver/Bronze assignment for top 3
- Personal best display for each participant

**Deliverables**
- Course leaderboards
- Medal badges and ranking rules

**Measurable result**
- Ranking and medal assignment validated across test datasets

---

## Week of Mar 24
**Focus:** Pilot + stabilization
- Pilot with Tier 2 cohort
- Fix top issues in UX, validation, and timing
- Freeze launch candidate

**Deliverables**
- Pilot feedback report
- Bugfix release
- Launch checklist

**Measurable result**
- Pilot completion rate ≥ 85%

---

## Week of Mar 31 (Launch Week)
**Focus:** IDM Training Center launch
- Launch Training Center on April 1
- Announce usage expectations + support channel
- Capture baseline performance metrics

**Deliverables**
- Production Training Center live
- Week-1 usage report

**Measurable result**
- Baseline participation and completion metrics captured

---

## Week of Apr 7
**Focus:** Optimization sprint #1
- Improve confusing task prompts
- Tune validations for fairness
- Improve course flow speed/usability

**Deliverables**
- Quality patch release
- Updated validation calibration

**Measurable result**
- Improvement in pass rate and average completion time vs launch baseline

---

## Week of Apr 14
**Focus:** Olympics prep + dry run
- Finalize event rules and timing windows
- Validate leaderboard + tie-breakers
- Run dry-run event internally

**Deliverables**
- Event runbook
- Finalized rules text
- Dry-run report

**Measurable result**
- Dry run completes with no critical blockers

---

## Week of Apr 21
**Focus:** Final event readiness
- Open registration/comms
- Lock course versions/datasets for competition
- Final QA and observability checks

**Deliverables**
- Locked competition build
- Communications package

**Measurable result**
- Competition build signed off and ready for launch

---

## Week of Apr 28 (Final week of April)
**Focus:** Timed races live
- Launch IDM Olympics timed races
- Collect and publish leaderboard results
- Award medals

**Deliverables**
- Live event operations
- Final leaderboard + medal results
- Post-event recap

**Measurable result**
- 100% of submitted winning times are valid and auditable
