/**
 * Course and module definitions for the Help Desk Training Simulator.
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
                title: "IDM Overview & Navigation",
                description: "Learn the IDM layout, provider card, and all four tabs",
                prerequisites: [],
                scenarioIds: [
                    "scenario_idm_orientation",
                    "scenario_idm_tab_exploration",
                ],
                bossIntro:
                    "Hey — glad you're here. I'm Alex, the outgoing Clever admin for Cedar Ridge SD. My last day is Friday, so we need to move fast. First thing: the IDM page. This is where all our Google Workspace provisioning lives. Get familiar with the provider card and the four tabs — you'll live here.",
                bossCompletion:
                    "Nice. You know your way around the IDM page now. That's step one. Next I'll show you the provisioning wizard — that's where the real configuration happens.",
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
                    "OK, the provisioning wizard. This is the 8-step setup flow that controls how Clever creates and manages Google accounts. I need you to understand every step — when districts call in confused, this is usually where they're stuck.",
                bossCompletion:
                    "Good — you can navigate the wizard and explain each step. That's exactly what the support calls need. Now let's tackle credentials, which is the #1 ticket type.",
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
                    "Credentials — this is the thing districts mess up most. Email formats, SIS variables, password rules. I get at least two credential tickets a day. You need to be able to read a format string and build one from scratch.",
                bossCompletion:
                    "You've got credentials down. That was the hardest knowledge piece — nice work. Next up: OUs, which is the most complex *configuration* piece.",
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
                    "OUs are where things get nested and confusing. Organizational Units control where Google puts each account in the directory tree. You need to understand sub-OU formats, archive OUs, and the ignored-OU policy — districts call about these constantly.",
                bossCompletion:
                    "OU management is the gnarliest part of IDM, and you handled it. I'm feeling better about leaving. Two more modules and you'll be fully independent.",
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
                    "Google Groups — shorter module, but don't skip it. IDM can auto-manage group memberships, which saves districts a ton of manual work. Know the group types and membership rules cold.",
                bossCompletion:
                    "Groups done. One final module left: review and provisioning. This is the 'go live' step — where mistakes actually cost something.",
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
                    "Last module. This is the review step and the actual provisioning trigger. Once you click 'provision,' real Google accounts get created, modified, or suspended. I need you to read preview stats carefully and know how to pause a sync if something looks wrong.",
                bossCompletion:
                    "That's everything. You've completed IDM Fundamentals — you're ready to handle these tickets on your own. I'll be around for questions through Friday, but honestly? You've got this.",
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
                    "Real talk — most of your day won't be green checkmarks. Things break. Syncs fail. Accounts go missing. These tickets are based on real issues I dealt with. Welcome to the real job.",
                bossCompletion:
                    "You handled those like a pro. I'm officially not worried about leaving anymore. Good luck — you've got this.",
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
