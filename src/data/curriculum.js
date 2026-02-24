/**
 * Course and module definitions for the Cedar Ridge District Simulator.
 *
 * This is the top-level organizational layer that sits above scenarios.
 * It groups scenario IDs into pedagogical modules, defines prerequisites,
 * and provides the boss character's intro/completion messages.
 *
 * DESIGN DECISION — Module 1 covers all four IDM tabs:
 * The tabs (Tasks, Sync History, Exports, Events) show the *output* of IDM —
 * what happened during syncs, what issues exist, what data can be exported.
 * Teaching "reading comprehension" before "writing" gives learners a mental
 * model of what the system *does* before they learn to *configure* it.
 */

export const COURSES = [
    {
        id: "course_idm_fundamentals",
        title: "Clever IDM Fundamentals",
        description: "Master identity management for Google Workspace provisioning",
        modules: [
            // ── Module 1 ──────────────────────────────────────────────
            {
                id: "mod_overview",
                title: "IDM Setup",
                description: "Set up IDM and get familiar with the dashboard",
                prerequisites: [],
                scenarioIds: [
                    "scenario_idm_orientation",
                ],
                bossIntro:
                    "Welcome to Cedar Ridge! I'm Sam — I'll be walking you through everything in chat. Your first job: get familiar with Clever IDM. Let's do this.",
                bossCompletion:
                    "Not bad for day one. You can already navigate IDM better than most people who've been here a year. Don't tell them I said that. Next up: the provisioning wizard.",
            },

            // ── Module 2 ──────────────────────────────────────────────
            {
                id: "mod_provisioning_basics",
                title: "Provisioning Wizard Basics",
                description: "Navigate the 8-step wizard and understand its structure",
                prerequisites: ["mod_overview"],
                scenarioIds: [
                    "scenario_wizard_navigation",
                    "scenario_wizard_concepts",
                ],
                bossIntro:
                    "OK — the provisioning wizard. An 8-step setup flow that controls how Clever creates and manages Google accounts. I know, I know — eight steps sounds like a lot. But trust me, once you get this, you're basically a wizard yourself. A very specific, niche wizard.",
                bossCompletion:
                    "You can explain an 8-step wizard without putting anyone to sleep. That's a genuine skill. Next up: credentials — the most important config piece you'll touch.",
            },

            // ── Module 3 ──────────────────────────────────────────────
            {
                id: "mod_credentials",
                title: "Credential Configuration",
                description: "Read and build email formats, understand SIS variables",
                prerequisites: ["mod_provisioning_basics"],
                scenarioIds: [
                    "scenario_idm_credentials",      // legacy scenario, promoted
                    "scenario_credential_building",
                ],
                bossIntro:
                    "Credentials. This is the part where you learn why I mutter 'SIS variables' in my sleep. Email formats, password rules, fallback templates — it's the most important config piece in your system. You need to be able to read a format string and build one from scratch.",
                bossCompletion:
                    "That was the hardest knowledge piece, and you got through it. I'm going to stop worrying about you. Mostly. Next up: OUs — the most complex *configuration* piece.",
            },

            // ── Module 4 ──────────────────────────────────────────────
            {
                id: "mod_ou_management",
                title: "OU Organization",
                description: "Google OU trees, sub-OU formats, archive and ignored OU policies",
                prerequisites: ["mod_credentials"],
                scenarioIds: [
                    "scenario_ou_navigation",
                    "scenario_ou_configuration",
                ],
                bossIntro:
                    "OUs — Organizational Units. Google's way of putting accounts into folders. Sounds simple. It is not simple. You'll need to understand sub-OU formats, archive OUs, and the ignored-OU policy. But you'll be fine.",
                bossCompletion:
                    "OU management is the gnarliest part of IDM, and you handled it. I think you might actually like this job. Two more modules to go.",
            },

            // ── Module 5 ──────────────────────────────────────────────
            {
                id: "mod_groups",
                title: "Group Configuration",
                description: "Google Groups selection and membership rules",
                prerequisites: ["mod_ou_management"],
                scenarioIds: [
                    "scenario_group_setup",
                ],
                bossIntro:
                    "Good news: this one's shorter. Bad news: I'm still going to make you learn it. Google Groups can save the district hours of manual work by auto-managing memberships. Know the group types and membership rules cold.",
                bossCompletion:
                    "Groups: done. You're getting dangerously competent. One more module: review and provisioning — the 'go live' step.",
            },

            // ── Module 6 ──────────────────────────────────────────────
            {
                id: "mod_review_provision",
                title: "Review & Provisioning",
                description: "Summary review, preview stats, provisioning, and sync management",
                prerequisites: ["mod_groups"],
                scenarioIds: [
                    "scenario_review_provision",
                    "scenario_sync_management",
                ],
                bossIntro:
                    "This is the 'measure twice, cut once' step. Once you click Provision, real Google accounts get created, modified, or suspended. No take-backs. Well, some take-backs. But let's not find out. Read preview stats carefully and know how to pause a sync if something looks wrong.",
                bossCompletion:
                    "You've completed IDM Fundamentals. I'd say 'you're ready' but honestly you were ready two modules ago. I just like being thorough.",
            },

            // ── Module 7 ──────────────────────────────────────────────
            {
                id: "mod_troubleshooting",
                title: "Troubleshooting",
                description: "Diagnose failed syncs, missing accounts, and stale provisioning signals",
                prerequisites: ["mod_review_provision"],
                scenarioIds: [
                    "scenario_sync_failure",
                    "scenario_missing_teacher",
                    "scenario_stale_provisioning",
                ],
                bossIntro:
                    "OK, real talk. Everything we've covered so far? That's the sunny-day version. Now let's talk about what happens when things break. Spoiler: things break. These tickets are based on real issues — syncs fail, accounts go missing, and someone always needs an answer yesterday.",
                bossCompletion:
                    "You handled those like someone who's been doing this for years. Welcome to the team — for real this time.",
            },
        ],
    },
];

/**
 * Flat lookup: scenarioId → module object.
 * Built once at import time for O(1) lookups.
 */
export const SCENARIO_TO_MODULE = {};
for (const course of COURSES) {
    for (const mod of course.modules) {
        for (const scenarioId of mod.scenarioIds) {
            SCENARIO_TO_MODULE[scenarioId] = mod;
        }
    }
}

/**
 * Flat list of all module IDs in order, for progress tracking.
 */
export const MODULE_ORDER = COURSES.flatMap(c => c.modules.map(m => m.id));
