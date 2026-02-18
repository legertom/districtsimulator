# IDM Olympics — Event Description (Async Competition)

## Purpose
IDM Olympics is a timed, skills-based competition where agents demonstrate IDM mastery by completing standardized courses as quickly and accurately as possible.

## Event Format
- **Tracks/Courses:**
  1. Credentials course
  2. OU course
  3. Group logic course
- Courses are fixed-version for the event window.
- All participants run the same course definitions and datasets.

## Event Window (US async team)
- Opens: **Monday 7:00 AM ET**
- Closes: **Friday 8:30 PM ET**
- This window supports all US time zones and async schedules.

## Attempts Policy
- Participants may attempt each course **unlimited times** within the event window.
- Official score = participant’s **fastest valid time** per course.
- Only valid completions (all required checks passed) are eligible.

## Scoring & Ranking
- Primary ranking metric: **Fastest valid completion time**
- Medal awards per course:
  - 🥇 Gold = 1st fastest valid time
  - 🥈 Silver = 2nd fastest valid time
  - 🥉 Bronze = 3rd fastest valid time

## Tie-breakers (in order)
1. Fewer validation errors/hints used
2. Earlier timestamp of the best valid run
3. (Optional) fastest combined time across all three courses

## Integrity & Fairness Rules
- Course/dataset version lock during event week
- Invalid runs do not count toward rankings
- Full run history retained for auditability
- Public leaderboard shows best valid time only
- Admins can review run logs for disputes

## Required Data Captured Per Run
- `userId`
- `courseId`
- `startedAt`
- `completedAt`
- `durationMs`
- `isValidCompletion`
- `validationDetails` (errors/hints)
- `courseVersion`
- `datasetVersion`

## Participant-Friendly Rules Copy
"During the IDM Olympics event window, you may run each course as many times as you want. Your official result for each course is your fastest valid completion time. Top three valid times earn Gold, Silver, and Bronze."

## Operational Checklist (Event Week)
- [ ] Freeze course and dataset versions
- [ ] Confirm timer + validator + leaderboard are healthy
- [ ] Publish event kickoff and deadline reminders
- [ ] Monitor run ingest and ranking updates
- [ ] Export final standings at close
- [ ] Publish winners and recap
