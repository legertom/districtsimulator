# Narrative Rewrite Prompt — Cedar Ridge District Simulator

You are rewriting the copy/text in a training simulation game. The UX/structural code is already done and working. **You are only changing strings** — question text, labels, status messages, and overlay content. You are not changing layout, components, state, or CSS.

Read this entire document before touching any file.

---

## THE GAME IN 30 SECONDS

Cedar Ridge District Simulator is a first-day-on-the-job experience. The user plays a new Clever IDM administrator at a fictional K-12 school district. They receive support tickets from coworkers, investigate them by navigating a simulated Clever dashboard, and report findings back.

There are **7 modules, 14 scenarios, 4 customer characters, and 1 boss character (Alex Rivera).**

---

## THE VOICE

**Charming, not sarcastic.** Think "helpful coworker you'd actually want to sit next to" — warm, self-aware, occasionally funny, never mean.

The game's voice is already strong in two places:
- **Alex Rivera's boss messages** (warm, dry, encouraging without being patronizing)
- **Ticket messages from coworkers** (each sounds like a real person)

The voice **dies** in three places — these are what you're fixing:
1. **Step-level questions** — currently read like standardized test items
2. **System/scaffolding text** — functional but lifeless
3. **WelcomeOverlay** — reads like an LMS syllabus instead of Alex talking
4. **Completion messages** — sound like report card comments

---

## CHARACTER VOICE GUIDES

| Character | Personality | Voice Rules |
|-----------|------------|-------------|
| **Alex Rivera** (boss) | Protective mentor, dry wit | Warm. Self-deprecating about the job, never about the learner. Uses "I" and "we." Never says "great job!" — shows pride through specific observations. |
| **Principal Jones** | Technologically overwhelmed, gamely trying | Cheerful confusion. Uses qualifiers ("I'm told...", "I think..."). Never dumb — just outside her domain. |
| **Sarah Chen** (IT coordinator) | Cautious, experienced, has seen things break | Risk-aware. References past disasters. Professional but not stiff. |
| **Marcus Thompson** (district director) | Board-presentation pragmatist, hates jargon | Formal-casual hybrid. Translates technical concepts into organizational language. |
| **Lisa Wilson** (secretary) | Frontline pragmatist, dry humor | Short sentences. Practical questions. Humor from understatement. |

---

## ABSOLUTE RULES

1. **NEVER modify `src/context/InstructionalContext.jsx`** — it's the state engine.
2. **NEVER modify `src/data/characters.js`** — character definitions are locked.
3. **NEVER modify any CSS file** — the visual design is done.
4. **NEVER change `correctAnswer`, `matchMode`, `choices` arrays, `nextStep`, `successStep`, `goalRoute`, `goalAction`, `hint` objects, `scored`, `type`, `id`, or any structural field in scenarios.js** — only change `question` strings and `checklistLabel` strings.
5. **NEVER change `bossIntro` or `bossCompletion`** in curriculum.js — they're already good.
6. **NEVER change `ticketMessage` or `ticketSubject`** in scenarios.js — they're already good.
7. **Preserve the pedagogical intent.** If a question teaches the user to identify the provider, the rewrite must still teach that. You're changing the wrapper, not the lesson.
8. **Don't force character voice where it would feel awkward.** Some questions are better as clean, direct prompts. Use judgment.
9. **Run `npm run build` when done** — must compile with zero errors.

---

## TASK 1: REWRITE WELCOMEOVERLAY.JSX

**File:** `src/components/onboarding/WelcomeOverlay.jsx`

**What to change:** The JSX content inside the `return(...)` statement. Keep the exact same component structure, className references, `handleStart` handler, `{firstName}` variable, `{DISTRICT.name}` reference, and all wrapper divs/classes. Only change the text strings.

**Current text (lines 43-78):**
```jsx
<div className={styles.badge}>Day 1</div>
<h1 className={styles.title}>
    Welcome, {firstName}!
</h1>
<p className={styles.subtitle}>
    Today is your first day as the new <strong>Clever Admin</strong> at{" "}
    <strong>{DISTRICT.name}</strong>.
</p>
<p className={styles.description}>
    Your onboarding buddy Alex Rivera will show you the ropes.
    You'll learn to manage the district's Google Workspace accounts through Clever IDM —
    set up the integration, then handle real requests from your coworkers.
</p>
<div className={styles.steps}>
    <div className={styles.step}>
        <span className={styles.stepNumber}>1</span>
        <span>Set up Google Workspace provisioning in Clever IDM</span>
    </div>
    <div className={styles.step}>
        <span className={styles.stepNumber}>2</span>
        <span>Handle requests from your coworkers</span>
    </div>
    <div className={styles.step}>
        <span className={styles.stepNumber}>3</span>
        <span>Master credentials, OUs, and group configuration</span>
    </div>
</div>
<button className={styles.ctaButton} onClick={handleStart}>
    Enter the Dashboard
</button>
```

**What's wrong:** It reads like a course description. Alex Rivera should be the one talking. The player should feel like they just walked into a new job and someone friendly is introducing themselves.

**Rewrite rules:**
- The `<h1>` title should feel like Alex greeting the player (e.g., "Hey, {firstName}!")
- The `subtitle` paragraph should introduce Alex by name and role, mentioning the district
- The `description` paragraph should be Alex explaining the job in his voice — warm, slightly self-deprecating, direct
- The three steps should be rewritten to sound like Alex describing the plan, not a syllabus
- The CTA button text should feel active and inviting (not "Enter the Dashboard")
- Keep `<strong>` tags around key terms, keep `{DISTRICT.name}` and `{firstName}` references
- Keep the "Day 1" badge exactly as-is

**Target tone example (for reference, don't copy verbatim):**
> "Hey — you must be the new admin. I'm Alex Rivera, senior IT here at Cedar Ridge. Don't worry about the badge photo, it gets better after the first week. Here's the deal: we need someone to manage our Google accounts through Clever IDM. That someone is now you. I'll walk you through everything. Fair warning — I over-explain. It's a feature, not a bug."

---

## TASK 2: REWRITE COMPLETION MESSAGES IN INVESTIGATIONVIEW.JSX

**File:** `src/components/helpdesk/InvestigationView.jsx`

**What to change:** Two pairs of strings inside the `{scenarioJustCompleted && ...}` completion card block (around lines 278-286).

### String pair 1: completionTitle

**Current (line 281):**
```jsx
{coachMarksEnabled ? "Excellent Work with Guidance!" : "Strong Independent Performance!"}
```

**What's wrong:** "Excellent Work with Guidance!" and "Strong Independent Performance!" sound like report card comments. These should sound like Alex reacting to your work.

**Rewrite rules:**
- Guided title: Something that acknowledges they followed the system and got it right. Warm, not patronizing.
- Unguided title: Something that shows genuine respect for figuring it out solo. Not a gold star — an observation.
- Keep them SHORT — these are titles (5-8 words max).
- Examples: Guided → "Nice work following the thread." / Unguided → "You didn't need any help."

### String pair 2: completionMessage

**Current (lines 283-286):**
```jsx
{coachMarksEnabled
    ? "With coach marks and guidance, you successfully navigated this investigation. Consider trying the unguided mode to test your independence."
    : "You successfully completed this investigation unaided — demonstrating strong independent problem-solving skills."}
```

**What's wrong:** These are formal and generic. They should sound like Alex — specific, warm, lightly encouraging without being preachy.

**Rewrite rules:**
- Guided message: Acknowledge they learned the workflow. Gently suggest trying unguided next time — but make it sound like a casual suggestion, not a homework assignment.
- Unguided message: Show genuine pride. Alex notices competence. Short and punchy.
- 1-2 sentences each. No corporate language.
- Examples: Guided → "You followed the thread and got the right answer — that's exactly how it should go when you're learning a new system. Try it without coach marks next time?" / Unguided → "You figured that out without any hand-holding. I'm going to stop worrying about you."

---

## TASK 3: REWRITE SCAFFOLDING TEXT IN INVESTIGATIONVIEW.JSX

**File:** `src/components/helpdesk/InvestigationView.jsx`

These are short status strings scattered through the footer section. Find each one and replace it. There are exactly 5 strings to change:

### String 1: Goal step navigation prompt
**Location:** Appears twice — once in the thread area (inside `stepType === "goal"` block, around line 201) and once in the footer (around line 317).
**Current:** `"Navigate to complete this step..."`
**Replace with:** `"Head over to the right spot in the dashboard..."`

### String 2: Choice step footer hint
**Location:** Footer, around line 328.
**Current:** `"Choose an answer above"`
**Replace with:** `"Pick the best answer above"`

### String 3: Loading fallback
**Location:** Footer, around line 338.
**Current:** `"Loading..."`
**Replace with:** `"Pulling up the next step..."`

### String 4: Ticket resolved status
**Location:** Footer, around line 318.
**Current:** `"Ticket resolved"`
**Replace with:** `"Ticket closed — nice work"`

### String 5: Enter to submit hint
**Location:** Footer, freetext section, around line 348.
**Current:** `"Press Enter to send"`
**Replace with:** `"Enter to submit"`

**IMPORTANT:** Search the entire file for each string to make sure you catch every occurrence. The goal-step prompt appears in TWO places (thread area and footer).

---

## TASK 4: REWRITE STEP QUESTIONS IN SCENARIOS.JS

**File:** `src/data/scenarios.js`

This is the biggest task. You are rewriting `question` and `checklistLabel` strings across all 14 scenarios. **You must not change anything else** — no `correctAnswer`, no `matchMode`, no `choices` arrays, no `nextStep`/`successStep`, no `hint` objects, no `type`, no `id`, no `scored` fields.

### General rules for step question rewrites:

1. **Frame questions as part of the investigation, not as a quiz.** The user is investigating a ticket for a real person — keep them in that fiction.
2. **Reference the customer by name when it makes sense** (e.g., "Principal Jones is waiting for your update. What provider do you see?")
3. **Don't force every question into character voice if it would feel awkward.** Navigation steps ("Navigate to the IDM page") are fine as-is. Simple observational prompts can stay clean and direct.
4. **Resolution step questions should feel like "time to report back"** — the user is choosing how to communicate their findings.
5. **Retry/wrong-answer step questions can stay instructional** — they're teaching moments, not fiction moments. But soften the tone if possible.
6. **checklistLabel strings are very short (3-8 words)** — these appear as compact one-liners in completed/future step rows. Keep them concise. Many existing ones are fine and don't need changes.
7. **guideMessage strings can also be rewritten** if they feel robotic, but most are fine.

### What to rewrite vs. what to leave alone:

- **REWRITE:** `question` strings that read like test items (e.g., "What identity provider is configured on this IDM page?")
- **LEAVE ALONE:** `question` strings on retry steps (the `scored: false` steps) — these are corrective and can stay direct
- **LEAVE ALONE:** `checklistLabel` strings that are already natural (e.g., "Navigate to the IDM page", "Report back to Principal Jones")
- **OPTIONALLY TOUCH:** `checklistLabel` strings that are stiff (e.g., "Assess the integration health" → "Check if the integration is healthy")
- **LEAVE ALONE:** All `guideMessage` strings unless they're particularly robotic

### SCENARIO-BY-SCENARIO GUIDE

Below is every scenario with its scored question steps listed. For each, I show the current `question` text and guidance on how to rewrite it. **Retry steps (scored: false) are omitted — leave those alone.**

---

#### SCENARIO 1A: IDM Page Orientation (`scenario_idm_orientation`)
**Customer:** Principal Jones — she's cheerfully confused and just wants to know things are working.

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_orient_provider` | "What identity provider is configured on this IDM page?" | Frame as investigation: "What provider do you see on the IDM page? That's what we need to tell Principal Jones." |
| `step_orient_health` | "Based on the provider card status badges, is the Google integration healthy or are there problems?" | Soften slightly: "Looking at the status badges on the provider card — is the Google integration healthy, or are there problems?" |
| `step_orient_sync_health` | "Looking at the sync history, are syncs running regularly or has there been a gap?" | Fine as-is or light touch: "Are syncs running on a regular schedule, or has there been a gap?" |
| `step_orient_managed_users` | "The Tasks tab shows a notification about managed users. How many Google users is IDM managing?" | Add context: "There's a notification about managed users here. How many Google accounts is IDM managing? Principal Jones will want to know." |
| `step_orient_resolution` | "Choose the best summary to report back to Principal Jones:" | Good as-is. |

---

#### SCENARIO 1B: Exploring IDM Tabs (`scenario_idm_tab_exploration`)
**Customer:** Sarah Chen — she's documenting for the wiki and wants thoroughness.

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_tabs_sync_assess` | "Looking at the Sync History tab, what's the overall health of the sync process?" | Light touch: "What's the overall health of the sync process? Sarah needs this for the wiki." |
| `step_tabs_exports_assess` | "What export capabilities does the Exports tab offer?" | Add context: "What export options does this tab offer? Sarah specifically asked about exports." |
| `step_tabs_events_assess` | "What kind of information does the Events tab show?" | Frame it: "What does the Events tab track? This is the last piece Sarah needs for the wiki." |
| `step_tabs_resolution` | "Choose the best wiki description of the IDM tabs to send to Sarah:" | Good as-is. |

---

#### SCENARIO 2A: Wizard Navigation (`scenario_wizard_navigation`)
**Customer:** Principal Jones (relaying for the district director).

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_wn_connection_check` | "The first wizard step is 'Connect to Google.' Is Google already connected for this district?" | Slightly warmer: "First wizard step: Connect to Google. Is it already connected for Cedar Ridge?" |
| `step_wn_assess_level` | "What management level is this district using? This determines how much Clever controls in Google." | Good as-is — already informative. Keep or light touch. |
| `step_wn_resolution` | "Choose the best summary of the wizard structure to send to Principal Jones:" | Good as-is. |

---

#### SCENARIO 2B: Wizard Concepts (`scenario_wizard_concepts`)
**Customer:** Marcus Thompson — needs board-ready, jargon-free explanations.

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_wc_connect_purpose` | "Step 1 is 'Connect to Google.' What does this step actually do?" | Add Marcus context: "Step 1 is 'Connect to Google.' How would you explain what this step does to the board?" |
| `step_wc_mgmt_purpose` | "What's the difference between Full and Password-Only management levels?" | Frame for board: "Marcus needs a plain-English explanation: what's the difference between Full and Password-Only?" |
| `step_wc_users_purpose` | "Which user types can be provisioned through the wizard?" | Light touch: "Which user types can be provisioned? The board will want to know who's covered." |
| `step_wc_ous_purpose` | "What are Organizational Units (OUs) used for in Google Workspace?" | Frame for board: "The board won't know what 'OUs' means. In plain terms, what are they used for?" |
| `step_wc_preview_purpose` | "What happens at the Preview and Provision step?" | Frame for board: "Last step. What actually happens when you click Preview and Provision? The board needs to understand this." |
| `step_wc_resolution` | "Choose the best board-ready description of the provisioning pipeline to send to Marcus:" | Good as-is. |

---

#### SCENARIO 3A: Changing Student Email Format (`scenario_idm_credentials`)
**Customer:** Principal Jones — she's been told "it's in the wizard somewhere."

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_cred_identify_format` | "What is the current email format shown on the Student credentials card?" | Frame as investigation: "What's the current student email format? That's what we need to change." |
| `step_cred_where_to_edit` | "Where would you click to change the student email format?" | Frame as task: "Now that you can see the format — where would you go to change it?" |
| `step_cred_compute_email` | "Using the sample student Rogelio Waelchi, what would his email look like with the new first-initial + last-name format?" | Keep — already well-framed as a practical task. |
| `step_cred_resolution` | "Choose the best response to send back to Principal Jones:" | Good as-is. |

---

#### SCENARIO 3B: Understanding Credential Formats (`scenario_credential_building`)
**Customer:** Sarah Chen — she wants to understand the system before touching it.

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_cb_sis_variables` | "Looking at the credential cards, are the same SIS variables available for all user types when building email formats?" | Frame for Sarah: "Sarah wants to know: do all user types share the same SIS variables for email formats, or are they different?" |
| `step_cb_domain_check` | "What email domain do all three user types share?" | Light touch: "What domain do all three user types share? Quick one." |
| `step_cb_password_assess` | "Looking at the student password format, what SIS data does it combine?" | Frame: "Looking at the student password — what SIS data goes into it?" |
| `step_cb_teacher_password` | "The teacher password format uses the teacher number plus '0420'. Our sample teacher Betty Bauch has teacher number T001. What would her password be?" | Good as-is — practical and specific. |
| `step_cb_fallback_concept` | "There's an option to add a 'fallback' email format. What is a fallback format used for?" | Soften: "There's a 'fallback' email format option. What's that for?" |
| `step_cb_matching_concept` | "The credentials step mentions 'matching' and 'creating' emails. What's the difference?" | Frame: "Sarah specifically asked about matching vs. creating. What's the difference?" |
| `step_cb_staff_compute` | "Using the current format, what would staff member Oswaldo Pouros's email address be?" | Good as-is — practical. |
| `step_cb_resolution` | "Choose the best summary of the credential system to send to Sarah:" | Good as-is. |

---

#### SCENARIO 4A: OU Navigation (`scenario_ou_navigation`)
**Customer:** Lisa Wilson — parent is on the phone asking about folders.

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_on_student_structure` | "Looking at the student OU configuration, how are students organized into the Google directory?" | Frame for Lisa: "Lisa has a parent on the phone. How are students organized into Google's directory structure?" |
| `step_on_rogelio_path` | "Rogelio Waelchi attends Cedar Ridge Middle School, 7th grade. Using the template, what would his resolved OU path be?" | Good as-is — practical trace. |
| `step_on_teacher_path` | "Do teachers have dynamic sub-OUs like students, or a fixed path?" | Light touch: "What about teachers — dynamic sub-OUs or a fixed path?" |
| `step_on_staff_structure` | "How are staff accounts organized into OUs?" | Frame: "Last one — how are staff accounts organized?" |
| `step_on_oswaldo_path` | "Librarian Oswaldo Pouros is in the Operations department. What would his OU path be?" | Good as-is. |
| `step_on_resolution` | "Choose the best explanation for Lisa about why a student's account is in the 'Cedar Ridge Middle School' folder:" | Good as-is. |

---

#### SCENARIO 4B: OU Configuration & Policies (`scenario_ou_configuration`)
**Customer:** Marcus Thompson — board wants "account lifecycle management strategy."

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_oc_archive_action` | "What archive action is currently configured for users who leave the district?" | Frame for board: "When someone leaves the district, what happens to their account? Check the archive action." |
| `step_oc_archive_difference` | "There are three archive actions available. What's the difference between 'move-suspend' and 'move-suspend-archive'?" | Frame for Marcus: "Marcus will ask: what's the difference between these archive options? The board needs a clear answer." |
| `step_oc_ignored_handling` | "How are ignored users handled? What happens to their accounts?" | Soften: "What happens to ignored users? What action is set for their accounts?" |
| `step_oc_archive_vs_ignored` | "What's the fundamental difference between archive and ignored users? The board will need a clear distinction." | Good as-is — already framed for Marcus. |
| `step_oc_teacher_path` | "For the presentation: do teachers have dynamic sub-OUs or a fixed path?" | Good as-is. |
| `step_oc_resolution` | "Choose the best lifecycle summary for Marcus's board presentation:" | Good as-is. |

---

#### SCENARIO 5: Group Setup (`scenario_group_setup`)
**Customer:** Principal Jones — she wants to email all 7th graders at once.

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_gs_purpose` | "How are Google Groups different from OUs?" | Frame for PJ: "Principal Jones heard about 'Google Groups.' How are they different from OUs?" |
| `step_gs_current_rules` | "How many group membership rules are currently configured across all user types?" | Frame: "How many membership rules are actually set up right now?" |
| `step_gs_rules_concept` | "With 0 rules configured, nothing is automated. How do membership rules work when they're set up?" | Good as-is. |
| `step_gs_managed_vs_manual` | "What's the difference between IDM-managed groups and groups created manually in Google Admin?" | Frame: "Important distinction — what's the difference between IDM-managed groups and ones created manually in Google Admin?" |
| `step_gs_zero_impact` | "Since we have 0 rules, what happens with groups during each sync?" | Frame for PJ: "So with 0 rules set up, what actually happens with groups during a sync? Is Principal Jones's email list being managed?" |
| `step_gs_resolution` | "Choose the best response for Principal Jones about setting up automated grade-level email lists:" | Good as-is. |

---

#### SCENARIO 6A: Review & Preview (`scenario_review_provision`)
**Customer:** Sarah Chen — she's cautious and wants a safety check before provisioning.

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_rp_summary_purpose` | "You're now on the Summary step. What is this step for?" | Frame: "You're on the Summary step. What's its purpose? Sarah wants to understand each layer of the safety check." |
| `step_rp_accounts_create` | "Look at the Preview data. How many accounts will be created?" | Frame: "Sarah's first question: how many new accounts will this provisioning run create?" |
| `step_rp_matched` | "How many accounts were matched with existing Google accounts?" | Light: "How many accounts were matched to existing Google accounts?" |
| `step_rp_match_vs_create` | "What's the difference between a 'Matched' account and a 'Created' account in this preview?" | Frame for Sarah: "Sarah will want to understand this: what's the difference between Matched and Created in the preview?" |
| `step_rp_sync_issues` | "How many sync issues does the Preview show?" | Direct: "Any sync issues showing in the preview?" |
| `step_rp_last_run` | "When was the preview last run? Is the data recent enough to trust?" | Frame: "When was this preview last run? Sarah's whole concern is whether the data is fresh enough to trust." |
| `step_rp_conflicts` | "The preview has a 'Conflicts' row. What does a conflict mean in this context?" | Frame: "There's a 'Conflicts' row. What does a conflict actually mean here?" |
| `step_rp_safe_to_provision` | "Based on everything you've seen — 1 create, 0 matched, 0 issues, 0 conflicts, but the preview is 3 months old — what should you tell Sarah?" | Good as-is — already well-framed. |

---

#### SCENARIO 6B: End-to-End Sync Management (`scenario_sync_management`)
**Customer:** Lisa Wilson — she wants the full picture plus the emergency stop button.

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_sm_connect_purpose` | "You're on the first wizard step. What does the Connect step handle?" | Frame: "First stop in the pipeline. What does this Connect step actually handle?" |
| `step_sm_summary_role` | "You've jumped from step 1 to step 7. What role does Summary play in the pipeline?" | Good as-is — already has good framing. |
| `step_sm_archives_count` | "How many accounts will be archived according to the preview?" | Direct: "How many accounts will be archived in this run?" |
| `step_sm_provision_meaning` | "You can see the Provision button on this page. What actually happens when you click it?" | Frame for Lisa: "Lisa wants to know: what actually happens when you click Provision? This is the big button." |
| `step_sm_pause_sync` | "Lisa asked about stopping syncs in an emergency. You can see the Pause Sync button on the IDM page. When would you use it?" | Good as-is — already Lisa-framed. |
| `step_sm_resolution` | "Choose the best summary to give Lisa about the full provisioning pipeline:" | Good as-is. |

---

#### SCENARIO 7A: Sync Failure Investigation (`scenario_sync_failure`)
**Customer:** Sarah Chen — teachers are reporting missing accounts.

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_sf_check_sync` | "What does the most recent sync entry indicate?" | Frame: "Sarah's teachers are missing accounts. What does the latest sync entry tell you?" |
| `step_sf_identify_error` | "Which root cause is most consistent with the failure event details?" | Frame: "Based on the event details, what's the most likely root cause?" |
| `step_sf_resolution` | "Choose the best report-back summary:" | Frame: "What should you tell Sarah?" |

---

#### SCENARIO 7B: Missing Teacher Account (`scenario_missing_teacher`)
**Customer:** Marcus Thompson — Betty Bauch can't log in and he feels bad about it.

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_mt_find_teacher` | "What status appears for Betty Bauch's recent event?" | Frame: "Find Betty Bauch in the events. What's her status?" |
| `step_mt_root_cause` | "What is the most likely root cause for Betty's missing account?" | Frame: "Based on what you see, what's blocking Betty's account?" |
| `step_mt_resolution` | "Choose the best response:" | Frame: "What should you tell Marcus about Betty's account?" |

---

#### SCENARIO 7C: Stale Provisioning Check (`scenario_stale_provisioning`)
**Customer:** Lisa Wilson — things look stale.

| Step ID | Current question | Rewrite direction |
|---------|-----------------|-------------------|
| `step_sp_assess_recency` | "Based on the latest run timestamps, what is the best assessment?" | Frame: "Lisa thinks things look stale. Based on these timestamps, is she right?" |
| `step_sp_resolution` | "Choose the best summary for the Tech Director:" | Frame: "What should you report back to Lisa?" |

---

## TASK 5: REVIEW (DO NOT REWRITE) BOSS MESSAGES AND TICKET MESSAGES

**Boss messages** (`curriculum.js` → `bossIntro` / `bossCompletion`): Read all 7 pairs. They are already strong. **Do not change them** unless you find a genuinely flat spot — and if you do, note what you changed and why.

**Ticket messages** (`scenarios.js` → `ticketMessage`, `ticketSubject`): Read all 14. They are already strong. **Do not change them.**

---

## EXECUTION ORDER

1. Rewrite `WelcomeOverlay.jsx` (Task 1)
2. Rewrite completion messages in `InvestigationView.jsx` (Task 2)
3. Rewrite scaffolding text in `InvestigationView.jsx` (Task 3)
4. Rewrite step questions in `scenarios.js` — all 14 scenarios (Task 4)
5. Review boss messages and ticket messages — confirm no changes needed (Task 5)
6. Run `npm run build` — must compile with zero errors
7. Verify with the dev server if running

---

## COMPLETION CHECKLIST

When done, update the completion report comment at the top of `InvestigationView.jsx`. Replace the existing report with one that covers both the UX work (already done) and your narrative work. Use this template for the narrative section:

```
 * NARRATIVE CHANGES:
 * 7. WelcomeOverlay.jsx — [what changed]
 * 8. scenarios.js — [summary: how many question strings rewritten, general approach]
 * 9. curriculum.js — [what changed, or "no changes needed — messages already strong"]
 * 10. InvestigationView.jsx scaffolding text — [list the 5 strings changed]
 * 11. InvestigationView.jsx completion messages — [what the new titles/messages are]
 *
 * NARRATIVE SAMPLES (show 3 before/after rewrites):
 * 1. [file:line] BEFORE: "..." → AFTER: "..."
 * 2. [file:line] BEFORE: "..." → AFTER: "..."
 * 3. [file:line] BEFORE: "..." → AFTER: "..."
```

---

## WHAT SUCCESS LOOKS LIKE

After your changes:
- A user opens the game and Alex is talking to them — not a course description
- Step questions feel like investigating a ticket, not taking a test
- Completion messages sound like a real person noticed what you did
- Status messages have a light, natural tone
- Every question still teaches the same lesson it taught before
- `npm run build` passes with zero errors
- Nothing is broken
