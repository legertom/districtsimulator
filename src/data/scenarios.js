import { demoCustomer } from "@/data/demoIdentity";

/**
 * Training scenarios for the Help Desk Simulator.
 *
 * Each scenario is a sequence of steps that simulate a customer support ticket.
 * Scenarios are grouped into modules via curriculum.js.
 *
 * New optional fields (consumed by the TicketInbox UI):
 *   customerId   — key into CHARACTERS (characters.js)
 *   moduleId     — which curriculum module owns this scenario
 *   ticketSubject — one-line subject shown in the ticket inbox
 *   ticketPriority — "low" | "normal" | "high"
 *   ticketNumber — display number (e.g. 1005 → "#1005")
 */

export const scenarios = [
    // ═══════════════════════════════════════════════════════════════
    //  MODULE 1 — IDM Overview & Navigation
    //  Two scenarios: page orientation + tab exploration
    // ═══════════════════════════════════════════════════════════════

    // ── Scenario 1A: IDM Page Orientation ────────────────────────
    {
        id: "scenario_idm_orientation",
        title: "IDM Page Orientation",
        description: "Help Principal Jones find and understand the IDM page layout.",
        customerId: "principalJones",
        moduleId: "mod_overview",
        ticketSubject: "Where do I find the Google sync settings?",
        ticketPriority: "normal",
        ticketNumber: 1001,
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Customer opens the ticket ──────────────────────
            {
                id: "step_orient_intro",
                type: "message",
                text: "Hi! I heard we use Clever IDM for managing Google accounts. Where do I find that in the dashboard?",
                sender: "customer",
                actions: [
                    { label: "Let me pull up the IDM page for you.", nextStep: "step_orient_nav_idm" },
                ],
            },
            // ── 2. Navigate to IDM ───────────────────────────────
            {
                id: "step_orient_nav_idm",
                type: "task",
                text: "Great, I'll wait while you navigate there.",
                sender: "customer",
                goalRoute: "idm",
                nextStep: "step_orient_provider",
                guideMessage: "Navigate to the IDM page under User management.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management.",
                },
                autoShowHint: true,
            },
            // ── 3. Identify the provider ─────────────────────────
            {
                id: "step_orient_provider",
                type: "message",
                text: "OK, I can see the page. What provider is shown on the provider card?",
                sender: "customer",
                actions: [
                    { label: "Google Workspace", nextStep: "step_orient_status" },
                    { label: "Microsoft Entra ID", nextStep: "step_orient_provider_wrong" },
                    { label: "Both Google and Microsoft", nextStep: "step_orient_provider_wrong" },
                ],
            },
            // ── 3a. Wrong provider branch ────────────────────────
            {
                id: "step_orient_provider_wrong",
                type: "message",
                text: "Hmm, that doesn't look right. Take another look at the provider card — what logo and name do you see?",
                sender: "customer",
                actions: [
                    { label: "Google Workspace", nextStep: "step_orient_status" },
                ],
            },
            // ── 4. Provider card status ──────────────────────────
            {
                id: "step_orient_status",
                type: "input",
                text: "Good — Google Workspace. What status does the provider card show?",
                sender: "customer",
                guideMessage: "Read the status badge on the Google Workspace provider card.",
                correctAnswer: "active",
                matchMode: "includes",
                successStep: "step_orient_last_sync",
                hint: {
                    target: "google-provider-card",
                    message: "Look at the status badges on the provider card.",
                },
                autoShowHint: true,
            },
            // ── 5. Last sync timestamp ───────────────────────────
            {
                id: "step_orient_last_sync",
                type: "input",
                text: "When was the last sync? You should see a timestamp below the provider card.",
                sender: "customer",
                guideMessage: "Find the last sync timestamp displayed below the provider card.",
                correctAnswer: ["02/16/2026", "feb 16", "february 16", "2/16/2026", "feb 16, 2026"],
                matchMode: "oneOf",
                successStep: "step_orient_issues",
                hint: {
                    target: "last-sync-timestamp",
                    message: "Check the sync timestamp text below the provider card.",
                },
                autoShowHint: false,
            },
            // ── 6. Issues count ──────────────────────────────────
            {
                id: "step_orient_issues",
                type: "input",
                text: "How many issues does the provider card show?",
                sender: "customer",
                guideMessage: "Look at the stats row on the provider card for the Issue count.",
                correctAnswer: "1",
                matchMode: "exact",
                successStep: "step_orient_managed",
                hint: {
                    target: "google-provider-card",
                    message: "Check the Issue stat on the provider card.",
                },
                autoShowHint: false,
            },
            // ── 7. Managed users count ───────────────────────────
            {
                id: "step_orient_managed",
                type: "input",
                text: "Last question about the overview — how many Google users is IDM managing? You should see a notification about it.",
                sender: "customer",
                guideMessage: "Find the notification card that mentions how many Google users IDM manages.",
                correctAnswer: "40",
                matchMode: "exact",
                successStep: "step_orient_done",
                hint: {
                    target: "managed-users-notification",
                    message: "Look at the notification card in the Tasks tab.",
                },
                autoShowHint: false,
            },
            // ── 8. Done ──────────────────────────────────────────
            {
                id: "step_orient_done",
                type: "message",
                text: "Now I know where to find IDM and what the provider card tells us. Thanks for the walkthrough!",
                sender: "customer",
                actions: [
                    { label: "You're welcome! Feel free to reach out if you have more questions.", nextStep: null },
                ],
            },
        ],
    },

    // ── Scenario 1B: Exploring IDM Tabs ──────────────────────────
    {
        id: "scenario_idm_tab_exploration",
        title: "Exploring IDM Tabs",
        description: "Help Sarah Chen navigate and understand each IDM tab.",
        customerId: "sarahChen",
        moduleId: "mod_overview",
        ticketSubject: "I need to check our recent sync logs",
        ticketPriority: "normal",
        ticketNumber: 1002,
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Customer opens the ticket ──────────────────────
            {
                id: "step_tabs_intro",
                type: "message",
                text: "Hi there! Can you walk me through the IDM tabs? I want to understand what each one shows so I know where to look when troubleshooting.",
                sender: "customer",
                actions: [
                    { label: "Sure, let's start with Sync History.", nextStep: "step_tabs_click_sync" },
                ],
            },
            // ── 2. Click Sync History tab ────────────────────────
            {
                id: "step_tabs_click_sync",
                type: "task",
                text: "Go ahead and click on the Sync History tab.",
                sender: "customer",
                goalAction: "idm-tab-sync-history",
                nextStep: "step_tabs_sync_count",
                guideMessage: "Click the 'Sync History' tab on the IDM page.",
                hint: {
                    message: "Click the 'Sync History' tab near the top of the page.",
                },
                autoShowHint: true,
            },
            // ── 3. Count sync records ────────────────────────────
            {
                id: "step_tabs_sync_count",
                type: "input",
                text: "How many sync records are shown in the table?",
                sender: "customer",
                guideMessage: "Count the number of rows in the Sync History table.",
                correctAnswer: "14",
                matchMode: "exact",
                successStep: "step_tabs_sync_issues",
                hint: {
                    message: "Count all the rows in the Sync History table.",
                },
                autoShowHint: false,
            },
            // ── 4. Issues per sync ───────────────────────────────
            {
                id: "step_tabs_sync_issues",
                type: "input",
                text: "And how many issues does each sync show?",
                sender: "customer",
                guideMessage: "Look at the Issues column in the Sync History table.",
                correctAnswer: "1",
                matchMode: "exact",
                successStep: "step_tabs_click_exports",
                hint: {
                    message: "Check the Issues column — what number appears on each row?",
                },
                autoShowHint: false,
            },
            // ── 5. Click Exports tab ─────────────────────────────
            {
                id: "step_tabs_click_exports",
                type: "task",
                text: "Good. Now let's check the Exports tab.",
                sender: "customer",
                goalAction: "idm-tab-exports",
                nextStep: "step_tabs_exports_sftp",
                guideMessage: "Click the 'Exports' tab.",
                hint: {
                    message: "Click the 'Exports' tab near the top of the page.",
                },
                autoShowHint: true,
            },
            // ── 6. SFTP question ─────────────────────────────────
            {
                id: "step_tabs_exports_sftp",
                type: "message",
                text: "Is there an option for automated export on this tab?",
                sender: "customer",
                actions: [
                    { label: "Yes, there's an SFTP toggle for automated exports.", nextStep: "step_tabs_click_events" },
                    { label: "No, there are no automated export options.", nextStep: "step_tabs_exports_wrong" },
                ],
            },
            // ── 6a. Wrong SFTP answer ────────────────────────────
            {
                id: "step_tabs_exports_wrong",
                type: "message",
                text: "Look more carefully — there should be an SFTP section at the bottom of the Exports tab.",
                sender: "customer",
                actions: [
                    { label: "Yes, I see the SFTP toggle now for enabling automated exports.", nextStep: "step_tabs_click_events" },
                ],
            },
            // ── 7. Click Events tab ──────────────────────────────
            {
                id: "step_tabs_click_events",
                type: "task",
                text: "Last one — open the Events tab.",
                sender: "customer",
                goalAction: "idm-tab-events",
                nextStep: "step_tabs_events_student",
                guideMessage: "Click the 'Events' tab.",
                hint: {
                    message: "Click the 'Events' tab near the top of the page.",
                },
                autoShowHint: true,
            },
            // ── 8. Find first Student event ──────────────────────
            {
                id: "step_tabs_events_student",
                type: "input",
                text: "Find the first Student event in the list. What's the student's name?",
                sender: "customer",
                guideMessage: "Look through the events list for the first entry with a Student user type.",
                correctAnswer: ["janelle rodriguez", "janelle", "rodriguez"],
                matchMode: "oneOf",
                successStep: "step_tabs_done",
                hint: {
                    target: "events-tab-content",
                    message: "Look at the User column — the first two events are Staff and Teacher. Find the Student event after those.",
                },
                autoShowHint: false,
            },
            // ── 9. Done ──────────────────────────────────────────
            {
                id: "step_tabs_done",
                type: "message",
                text: "Great, now I know how to check sync status and find specific events. This will be really helpful for troubleshooting. Thanks!",
                sender: "customer",
                actions: [
                    { label: "Happy to help! The Events tab is great for tracking individual user changes.", nextStep: null },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  MODULE 2 — Provisioning Wizard Basics
    //  Two scenarios: wizard navigation + wizard concepts
    // ═══════════════════════════════════════════════════════════════

    // ── Scenario 2A: Wizard Navigation ───────────────────────────
    {
        id: "scenario_wizard_navigation",
        title: "Provisioning Wizard Navigation",
        description: "Help Principal Jones find and explore the 8-step provisioning wizard.",
        customerId: "principalJones",
        moduleId: "mod_provisioning_basics",
        ticketSubject: "How do I set up Google provisioning?",
        ticketPriority: "normal",
        ticketNumber: 1003,
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Customer opens the ticket ──────────────────────
            {
                id: "step_wn_intro",
                type: "message",
                text: "I need to understand the Google provisioning wizard. Can you show me where it is and walk me through the steps?",
                sender: "customer",
                actions: [
                    { label: "Sure! Let me navigate to the IDM page first.", nextStep: "step_wn_nav_idm" },
                ],
            },
            // ── 2. Navigate to IDM ───────────────────────────────
            {
                id: "step_wn_nav_idm",
                type: "task",
                text: "Great, I'll wait while you get to the IDM page.",
                sender: "customer",
                goalRoute: "idm",
                nextStep: "step_wn_open_wizard",
                guideMessage: "Navigate to the IDM page under User management.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management.",
                },
                autoShowHint: true,
            },
            // ── 3. Open the wizard ───────────────────────────────
            {
                id: "step_wn_open_wizard",
                type: "task",
                text: "Now open the provisioning wizard so we can look at the steps.",
                sender: "customer",
                goalAction: "edit-provisioning",
                nextStep: "step_wn_count_steps",
                guideMessage: "Click the 'Edit Google provisioning' button.",
                hint: {
                    target: "edit-provisioning",
                    message: "Click the 'Edit Google provisioning' button.",
                },
                autoShowHint: true,
            },
            // ── 4. Count the wizard steps ────────────────────────
            {
                id: "step_wn_count_steps",
                type: "input",
                text: "I can see the wizard sidebar. How many steps are there in total?",
                sender: "customer",
                guideMessage: "Count the numbered steps in the wizard sidebar.",
                correctAnswer: "8",
                matchMode: "exact",
                successStep: "step_wn_first_step",
                hint: {
                    target: "wizard-step-connect",
                    message: "Count all the numbered steps listed in the wizard sidebar.",
                },
                autoShowHint: false,
            },
            // ── 5. First step name ───────────────────────────────
            {
                id: "step_wn_first_step",
                type: "input",
                text: "What's the first step called?",
                sender: "customer",
                guideMessage: "Read the label of step 1 in the wizard sidebar.",
                correctAnswer: ["connect to google", "connect"],
                matchMode: "oneOf",
                successStep: "step_wn_last_step",
                hint: {
                    target: "wizard-step-connect",
                    message: "Look at the first step in the sidebar — what's its label?",
                },
                autoShowHint: false,
            },
            // ── 6. Last step name ────────────────────────────────
            {
                id: "step_wn_last_step",
                type: "input",
                text: "And what's the last step?",
                sender: "customer",
                guideMessage: "Read the label of step 8 in the wizard sidebar.",
                correctAnswer: ["preview and provision", "preview"],
                matchMode: "oneOf",
                successStep: "step_wn_connected",
                hint: {
                    target: "wizard-step-preview",
                    message: "Look at the last step in the sidebar — what's its label?",
                },
                autoShowHint: false,
            },
            // ── 7. Google connection status ──────────────────────
            {
                id: "step_wn_connected",
                type: "message",
                text: "Is Google already connected for this district?",
                sender: "customer",
                actions: [
                    { label: "Yes, the Connect step shows Google is already connected.", nextStep: "step_wn_mgmt_level" },
                    { label: "No, it still needs to be set up.", nextStep: "step_wn_connected_wrong" },
                ],
            },
            // ── 7a. Wrong connection answer ──────────────────────
            {
                id: "step_wn_connected_wrong",
                type: "message",
                text: "Check again — the Connect step should show a status. Is there a green checkmark or connected indicator?",
                sender: "customer",
                actions: [
                    { label: "You're right, Google is already connected.", nextStep: "step_wn_mgmt_level" },
                ],
            },
            // ── 8. Click Management Level step ───────────────────
            {
                id: "step_wn_mgmt_level",
                type: "task",
                text: "Click on the Management Level step so we can check what's configured.",
                sender: "customer",
                goalAction: "wizard-step-management-level",
                nextStep: "step_wn_check_level",
                guideMessage: "Click the 'Select your IDM Management Level' step in the wizard sidebar.",
                hint: {
                    target: "wizard-step-management-level",
                    message: "Click 'Select your IDM Management Level' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 9. Read management level ─────────────────────────
            {
                id: "step_wn_check_level",
                type: "input",
                text: "What management level is currently selected?",
                sender: "customer",
                guideMessage: "Read the selected management level on this step.",
                correctAnswer: ["full", "full provisioning"],
                matchMode: "oneOf",
                successStep: "step_wn_done",
                hint: {
                    message: "Look at the management level options — which one is selected?",
                },
                autoShowHint: false,
            },
            // ── 10. Done ─────────────────────────────────────────
            {
                id: "step_wn_done",
                type: "message",
                text: "Now I understand the wizard layout. 8 steps, Google connected, full provisioning mode. Thanks for the walkthrough!",
                sender: "customer",
                actions: [
                    { label: "You're welcome! The wizard is where all provisioning settings live.", nextStep: null },
                ],
            },
        ],
    },

    // ── Scenario 2B: Wizard Concepts ─────────────────────────────
    {
        id: "scenario_wizard_concepts",
        title: "Understanding Provisioning Steps",
        description: "Help Marcus Thompson understand what each wizard step does before making changes.",
        customerId: "marcusThompson",
        moduleId: "mod_provisioning_basics",
        ticketSubject: "Explain the provisioning steps before we change anything",
        ticketPriority: "normal",
        ticketNumber: 1004,
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Customer opens the ticket ──────────────────────
            {
                id: "step_wc_intro",
                type: "message",
                text: "Before we make any changes to our provisioning setup, I want to make sure we both understand what each step does. Can you walk me through the 8-step wizard?",
                sender: "customer",
                actions: [
                    { label: "Absolutely. Let's go through them one by one.", nextStep: "step_wc_connect" },
                ],
            },
            // ── 2. Connect to Google ─────────────────────────────
            {
                id: "step_wc_connect",
                type: "message",
                text: "Starting with step 1 — what does 'Connect to Google' do?",
                sender: "customer",
                actions: [
                    { label: "It links Clever to your Google Workspace domain via OAuth so Clever can manage accounts.", nextStep: "step_wc_mgmt" },
                    { label: "It imports all Google users into Clever.", nextStep: "step_wc_connect_wrong" },
                ],
            },
            // ── 2a. Wrong answer ─────────────────────────────────
            {
                id: "step_wc_connect_wrong",
                type: "message",
                text: "That's not quite right — connecting is about authorization, not importing. What does it actually authorize?",
                sender: "customer",
                actions: [
                    { label: "It authorizes Clever to manage accounts in Google Workspace via OAuth.", nextStep: "step_wc_mgmt" },
                ],
            },
            // ── 3. Management Level ──────────────────────────────
            {
                id: "step_wc_mgmt",
                type: "message",
                text: "What's the difference between Full and Password-Only management?",
                sender: "customer",
                actions: [
                    { label: "Full manages accounts, OUs, and groups. Password-Only just sets passwords for existing accounts.", nextStep: "step_wc_users" },
                    { label: "Full is for admin accounts, Password-Only is for students.", nextStep: "step_wc_mgmt_wrong" },
                ],
            },
            // ── 3a. Wrong answer ─────────────────────────────────
            {
                id: "step_wc_mgmt_wrong",
                type: "message",
                text: "Not exactly. The difference is about what Clever controls in Google, not who it applies to.",
                sender: "customer",
                actions: [
                    { label: "Full provisioning manages accounts, OUs, and groups. Password-Only just manages passwords.", nextStep: "step_wc_users" },
                ],
            },
            // ── 4. User Types ────────────────────────────────────
            {
                id: "step_wc_users",
                type: "message",
                text: "Which user types can be provisioned through the wizard?",
                sender: "customer",
                actions: [
                    { label: "Students, Teachers, and Staff.", nextStep: "step_wc_credentials" },
                    { label: "Only Students.", nextStep: "step_wc_users_wrong" },
                ],
            },
            // ── 4a. Wrong answer ─────────────────────────────────
            {
                id: "step_wc_users_wrong",
                type: "message",
                text: "IDM can provision more than just students. What other user types does a school district have?",
                sender: "customer",
                actions: [
                    { label: "Students, Teachers, and Staff.", nextStep: "step_wc_credentials" },
                ],
            },
            // ── 5. Credentials step number ───────────────────────
            {
                id: "step_wc_credentials",
                type: "input",
                text: "'Set login credentials' is one of the most important steps. What step number is it?",
                sender: "customer",
                guideMessage: "Recall the wizard step list — which number is 'Set login credentials'?",
                correctAnswer: "4",
                matchMode: "exact",
                successStep: "step_wc_ous",
                hint: {
                    message: "The wizard steps are: 1-Connect, 2-Management Level, 3-Select Users, 4-?",
                },
                autoShowHint: false,
            },
            // ── 6. OUs ───────────────────────────────────────────
            {
                id: "step_wc_ous",
                type: "message",
                text: "What are OUs used for in Google Workspace?",
                sender: "customer",
                actions: [
                    { label: "Organizing user accounts into a folder structure for applying policies and management.", nextStep: "step_wc_preview" },
                    { label: "Tracking student attendance.", nextStep: "step_wc_ous_wrong" },
                ],
            },
            // ── 6a. Wrong answer ─────────────────────────────────
            {
                id: "step_wc_ous_wrong",
                type: "message",
                text: "OUs are a Google concept, not an attendance feature. Think about how Google organizes user accounts.",
                sender: "customer",
                actions: [
                    { label: "OUs organize accounts into a folder structure for applying policies.", nextStep: "step_wc_preview" },
                ],
            },
            // ── 7. Preview and Provision ─────────────────────────
            {
                id: "step_wc_preview",
                type: "message",
                text: "Last question — what happens at 'Preview and Provision'?",
                sender: "customer",
                actions: [
                    { label: "You see a preview of all changes before they're applied to Google.", nextStep: "step_wc_done" },
                    { label: "It automatically syncs everything immediately.", nextStep: "step_wc_preview_wrong" },
                ],
            },
            // ── 7a. Wrong answer ─────────────────────────────────
            {
                id: "step_wc_preview_wrong",
                type: "message",
                text: "Not automatic — the preview step lets you review before committing any changes.",
                sender: "customer",
                actions: [
                    { label: "It shows you what will be created, updated, or archived before you apply changes.", nextStep: "step_wc_done" },
                ],
            },
            // ── 8. Done ──────────────────────────────────────────
            {
                id: "step_wc_done",
                type: "message",
                text: "Good overview. So the pipeline is: connect, set management level, choose users, configure credentials, organize OUs, set up groups, review the summary, then preview and provision. I feel much more confident now.",
                sender: "customer",
                actions: [
                    { label: "Exactly! You've got the full picture. Let us know when you're ready to make changes.", nextStep: null },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  MODULE 3 — Credential Configuration
    //  (legacy scenario, promoted from the original scenario chain)
    // ═══════════════════════════════════════════════════════════════
    {
        id: "scenario_idm_credentials",
        title: "Changing IDM Student Email Format",
        description: `Help ${demoCustomer.title} ${demoCustomer.lastName} change the student email format in Clever IDM from first name + last name to first initial + last name.`,

        // ── New metadata ──
        customerId: "principalJones",
        moduleId: "mod_credentials",
        ticketSubject: "Change student email format to first initial + last name",
        ticketPriority: "normal",
        ticketNumber: 1005,

        // ── Legacy fields cleaned up ──
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Customer opens the ticket ──────────────────────────
            {
                id: "step_idm_request",
                type: "message",
                text: "Hi! We need to change how student emails are formatted in Clever IDM. Right now they're set to first name + last name (like rogeliowaelchi@maytonlyceum.com), but we need it changed to first initial + last name (like rwaelchi@maytonlyceum.com). Can you walk me through where to update that?",
                sender: "customer",
                actions: [
                    { label: "Absolutely! Let me pull up the IDM page.", nextStep: "step_nav_idm" },
                    { label: "Sure — do you know where the credential settings are?", nextStep: "step_customer_unsure" }
                ]
            },
            // ── 2. Optional branch: customer doesn't know ────────────
            {
                id: "step_customer_unsure",
                type: "message",
                text: "Not exactly. I think it's somewhere under the Identity Management settings? I remember there's a provisioning setup wizard.",
                sender: "customer",
                actions: [
                    { label: "That's right — it's in the IDM page. Let me go there now.", nextStep: "step_nav_idm" }
                ]
            },
            // ── 3. Navigate to IDM ───────────────────────────────────
            {
                id: "step_nav_idm",
                type: "task",
                text: "Great, I'll wait while you pull that up.",
                sender: "customer",
                goalRoute: "idm",
                nextStep: "step_click_edit_provisioning",
                guideMessage: "Navigate to the 'IDM' page under User management.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management."
                },
                autoShowHint: true
            },
            // ── 4. Click Edit Google provisioning ────────────────────
            {
                id: "step_click_edit_provisioning",
                type: "task",
                text: "OK, I can see the IDM page. Now we need to get into the provisioning setup to find the credential settings.",
                sender: "customer",
                goalAction: "edit-provisioning",
                nextStep: "step_find_credentials_step",
                guideMessage: "Click the 'Edit Google provisioning' button to open the wizard.",
                hint: {
                    target: "edit-provisioning",
                    message: "Click the 'Edit Google provisioning' button."
                },
                autoShowHint: true
            },
            // ── 5. Identify the credentials step in the wizard ───────
            {
                id: "step_find_credentials_step",
                type: "message",
                text: "I can see the provisioning wizard. Which step do we need to go to for changing the email format?",
                sender: "customer",
                actions: [
                    { label: "Step 4 — 'Set login credentials'", nextStep: "step_nav_to_credentials" },
                    { label: "Step 1 — 'Connect to Google'", nextStep: "step_wrong_step" },
                    { label: "Step 5 — 'Organize OUs'", nextStep: "step_wrong_step" }
                ]
            },
            // ── 5a. Wrong step branch ────────────────────────────────
            {
                id: "step_wrong_step",
                type: "message",
                text: "Hmm, that doesn't sound right for email format changes. Can you check the step list again?",
                sender: "customer",
                actions: [
                    { label: "Sorry — it's actually Step 4, 'Set login credentials'.", nextStep: "step_nav_to_credentials" }
                ]
            },
            // ── 6. Navigate to the credentials step ──────────────────
            {
                id: "step_nav_to_credentials",
                type: "message",
                text: "That's the one! Go ahead and click on that step.",
                sender: "customer",
                actions: [
                    { label: "I'm on the Set login credentials step now.", nextStep: "step_read_current_format" }
                ]
            },
            // ── 7. Identify the current student email format ─────────
            {
                id: "step_read_current_format",
                type: "input",
                text: "OK, I can see the credential cards. What's the current email format shown on the Student credentials card?",
                sender: "customer",
                guideMessage: "Look at the Student credentials card and enter the current email format.",
                correctAnswer: ["{{name.first}}{{name.last}}@maytonlyceum.com", "name.first name.last", "first name last name", "firstname lastname"],
                matchMode: "oneOf",
                successStep: "step_explain_change",
                hint: {
                    target: "email-format-students",
                    message: "Look at the EMAIL field on the Student credentials card."
                },
                autoShowHint: true
            },
            // ── 8. Explain what needs to change ──────────────────────
            {
                id: "step_explain_change",
                type: "message",
                text: "Right, so it's currently using the full first name + last name. We need to change it so it uses just the first initial + last name instead. Where would I click to change the email format for students?",
                sender: "customer",
                actions: [
                    { label: "Click the 'Edit' button on the Student credentials card.", nextStep: "step_confirm_edit_location" },
                    { label: "You'd need to go to the SIS sync page.", nextStep: "step_wrong_location" }
                ]
            },
            // ── 8a. Wrong location branch ────────────────────────────
            {
                id: "step_wrong_location",
                type: "message",
                text: "I don't think SIS sync controls the email format. Isn't there an Edit button right on the credentials card?",
                sender: "customer",
                actions: [
                    { label: "You're right — click 'Edit' on the Student credentials card.", nextStep: "step_confirm_edit_location" }
                ]
            },
            // ── 9. Confirm they know where the format editor is ──────
            {
                id: "step_confirm_edit_location",
                type: "message",
                text: "Got it! And once I click Edit and get to the email config section, I'd click 'Edit your format' to open the format builder where I can change the variables, right?",
                sender: "customer",
                actions: [
                    { label: "Exactly! That opens the format editor where you can rebuild the email pattern.", nextStep: "step_knowledge_check" },
                    { label: "Yes — you can rearrange or replace the format segments there.", nextStep: "step_knowledge_check" }
                ]
            },
            // ── 10. Final knowledge check ────────────────────────────
            {
                id: "step_knowledge_check",
                type: "input",
                text: "Perfect. So just to make sure I understand — using the sample student Rogelio Waelchi, what would their email look like with the new first-initial + last-name format?",
                sender: "customer",
                guideMessage: "What would Rogelio Waelchi's email be with a first-initial + last-name format at maytonlyceum.com?",
                correctAnswer: "rwaelchi@maytonlyceum.com",
                successStep: "step_idm_success",
                hint: {
                    message: "First initial of 'Rogelio' = 'r', last name = 'waelchi', domain = 'maytonlyceum.com' → rwaelchi@maytonlyceum.com"
                },
                autoShowHint: false
            },
            // ── 11. Success ──────────────────────────────────────────
            {
                id: "step_idm_success",
                type: "message",
                text: "That's exactly right — rwaelchi@maytonlyceum.com! Now I know exactly where to go and what the result should look like. Thank you so much for walking me through this!",
                sender: "customer",
                actions: [
                    { label: "You're welcome! Let us know if you need help with the actual format change.", nextStep: null },
                    { label: `Glad I could help, ${demoCustomer.title} ${demoCustomer.lastName}!`, nextStep: null }
                ]
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════
    //  MODULE 3B — Credential Configuration (Deeper Knowledge)
    // ═══════════════════════════════════════════════════════════════

    // ── Scenario 3B: Understanding Credential Formats ──────────────
    {
        id: "scenario_credential_building",
        title: "Understanding Credential Formats",
        description: "Help Sarah Chen understand how credential formats work across user types before configuring changes.",

        customerId: "sarahChen",
        moduleId: "mod_credentials",
        ticketSubject: "Need to understand credential formats before making changes",
        ticketPriority: "normal",
        ticketNumber: 1006,

        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Customer opens the ticket ──────────────────────
            {
                id: "step_cb_intro",
                type: "message",
                text: "Hi! Before I make any changes to our credential setup, I want to make sure I fully understand how the format system works. I've seen the credential cards but I have a bunch of questions. Can you help me work through them?",
                sender: "customer",
                actions: [
                    { label: "Of course! I'd be happy to walk through the credential system with you.", nextStep: "step_cb_user_types" },
                ],
            },
            // ── 2. How many user types have credentials? ──────────
            {
                id: "step_cb_user_types",
                type: "input",
                text: "Great, let's start basic. How many user types have credential configurations in the provisioning wizard? I want to make sure I'm not missing any.",
                sender: "customer",
                guideMessage: "Count the user types (students, teachers, staff) that have credential cards configured in the wizard.",
                correctAnswer: ["3", "three"],
                matchMode: "oneOf",
                successStep: "step_cb_shared_domain",
                hint: {
                    message: "Think about the different roles in a school district — students, teachers, and staff each have their own credential card.",
                },
                autoShowHint: false,
            },
            // ── 3. Shared domain question ─────────────────────────
            {
                id: "step_cb_shared_domain",
                type: "input",
                text: "Good — students, teachers, and staff. Do they all use the same email domain, or does each type have its own? What domain is it?",
                sender: "customer",
                guideMessage: "Check the email format on any credential card — what comes after the @ sign?",
                correctAnswer: "maytonlyceum.com",
                matchMode: "includes",
                successStep: "step_cb_sis_variables",
                hint: {
                    message: "Look at the email format on the credential cards — the domain after the @ symbol is shared across all three user types.",
                },
                autoShowHint: false,
            },
            // ── 4. SIS variables differ by type ───────────────────
            {
                id: "step_cb_sis_variables",
                type: "message",
                text: "Here's what I'm confused about — are the same SIS variables available for all user types when building email formats, or are they different?",
                sender: "customer",
                actions: [
                    { label: "They're different. Each user type has its own set of SIS variables, plus shared ones like First Name and Last Name.", nextStep: "step_cb_student_variable" },
                    { label: "They're all the same — every user type uses the same variables.", nextStep: "step_cb_sis_variables_wrong" },
                ],
            },
            // ── 4a. Wrong SIS variables answer ────────────────────
            {
                id: "step_cb_sis_variables_wrong",
                type: "message",
                text: "That doesn't sound right. I thought students had a Student Number variable but teachers don't? Aren't the type-specific variables different?",
                sender: "customer",
                actions: [
                    { label: "You're right — each user type has unique variables. Students have Student Number, teachers have Teacher Number, and staff have Title and Department.", nextStep: "step_cb_student_variable" },
                ],
            },
            // ── 5. Student-specific variable count ────────────────
            {
                id: "step_cb_student_variable",
                type: "input",
                text: "OK so students have their own variables. Besides First Name and Last Name, how many additional SIS variables are available specifically for student email formats?",
                sender: "customer",
                guideMessage: "Count the student-specific email SIS variables (excluding name.first and name.last). Check the EMAIL_SIS_VARIABLES reference.",
                correctAnswer: "4",
                matchMode: "exact",
                successStep: "step_cb_password_format",
                hint: {
                    message: "Student email variables include: First Name, Last Name, SIS ID, Student Number, State ID, and District Username. That's 6 total — minus 2 name fields = 4 unique student variables.",
                },
                autoShowHint: false,
            },
            // ── 6. Student password format ────────────────────────
            {
                id: "step_cb_password_format",
                type: "message",
                text: "Now I'm curious about passwords. The student password format looks like a bunch of variables strung together. What does the student password format actually combine?",
                sender: "customer",
                actions: [
                    { label: "It combines the student number, grade, and school SIS ID — three variables concatenated together.", nextStep: "step_cb_teacher_password" },
                    { label: "It uses the student's first name and birthday.", nextStep: "step_cb_password_format_wrong" },
                ],
            },
            // ── 6a. Wrong password format ─────────────────────────
            {
                id: "step_cb_password_format_wrong",
                type: "message",
                text: "Hmm, I don't think that's right. I saw variables like student_number and grade in the password field. Can you look at it again?",
                sender: "customer",
                actions: [
                    { label: "Sorry about that — the student password format is student number + grade + school SIS ID.", nextStep: "step_cb_teacher_password" },
                ],
            },
            // ── 7. Teacher password computation ───────────────────
            {
                id: "step_cb_teacher_password",
                type: "input",
                text: "Let me test my understanding with a real example. Our sample teacher is Betty Bauch with teacher number T001. The teacher password format uses the teacher number plus a fixed string '0420'. What would Betty's actual password be?",
                sender: "customer",
                guideMessage: "The teacher password template is {{teacher.teacher_number}}0420. Substitute Betty Bauch's teacher number (T001) to compute her password.",
                correctAnswer: "t0010420",
                matchMode: "exact",
                successStep: "step_cb_fallback",
                hint: {
                    message: "The teacher password format is {{teacher.teacher_number}}0420. Betty's teacher number is T001, so her password is T0010420.",
                },
                autoShowHint: false,
            },
            // ── 8. Fallback format concept ────────────────────────
            {
                id: "step_cb_fallback",
                type: "message",
                text: "One more concept I've been wondering about — what's a fallback email format? I see there's an option to add one but none of our user types have it enabled right now.",
                sender: "customer",
                actions: [
                    { label: "A fallback format is used when the primary email format produces a conflict — for example, if two users would get the same email address.", nextStep: "step_cb_matching" },
                    { label: "A fallback format is the email used when users forget their password.", nextStep: "step_cb_fallback_wrong" },
                ],
            },
            // ── 8a. Wrong fallback answer ─────────────────────────
            {
                id: "step_cb_fallback_wrong",
                type: "message",
                text: "That doesn't sound right — password reset is a different thing entirely. I think fallback has to do with email conflicts when two users would get the same address?",
                sender: "customer",
                actions: [
                    { label: "Correct — the fallback format kicks in when the primary format would create a duplicate email address, so each user still gets a unique email.", nextStep: "step_cb_matching" },
                ],
            },
            // ── 9. Email matching vs. creating ────────────────────
            {
                id: "step_cb_matching",
                type: "message",
                text: "Last conceptual question. I noticed the credential step mentions 'matching emails' and 'creating emails' as two different things. What's the difference between those?",
                sender: "customer",
                actions: [
                    { label: "Matching links existing Google accounts to Clever users by comparing their SIS email. Creating builds new email addresses for unmatched users using the format you configure.", nextStep: "step_cb_staff_email" },
                    { label: "They're the same thing — both create new Google accounts.", nextStep: "step_cb_matching_wrong" },
                ],
            },
            // ── 9a. Wrong matching answer ─────────────────────────
            {
                id: "step_cb_matching_wrong",
                type: "message",
                text: "I don't think they're the same. The credential step says something about 'SIS email' matching with existing Google accounts. That sounds different from creating new ones, right?",
                sender: "customer",
                actions: [
                    { label: "Right — matching uses the SIS email to find existing Google accounts automatically, while creating builds new addresses for users who don't already have a Google account.", nextStep: "step_cb_staff_email" },
                ],
            },
            // ── 10. Staff email computation ───────────────────────
            {
                id: "step_cb_staff_email",
                type: "input",
                text: "OK final test! Our sample staff member is Oswaldo Pouros. Using the current email format, what would his email address be?",
                sender: "customer",
                guideMessage: "The email format is {{name.first}}{{name.last}}@maytonlyceum.com. Substitute Oswaldo Pouros's name to compute his email.",
                correctAnswer: ["oswaldopouros@maytonlyceum.com", "oswaldo.pouros@maytonlyceum.com"],
                matchMode: "oneOf",
                successStep: "step_cb_done",
                hint: {
                    message: "The format is first name + last name + @maytonlyceum.com. For Oswaldo Pouros: oswaldopouros@maytonlyceum.com",
                },
                autoShowHint: false,
            },
            // ── 11. Done ──────────────────────────────────────────
            {
                id: "step_cb_done",
                type: "message",
                text: "That all makes sense now! Three user types sharing the same domain, different SIS variables per type, password formats using SIS data, fallback for conflicts, and matching vs creating. I feel much more confident about making changes now. Thanks so much for walking me through all of this!",
                sender: "customer",
                actions: [
                    { label: "You've got it! Let us know when you're ready to make the actual format changes.", nextStep: null },
                    { label: "Great understanding, Sarah! Don't hesitate to reach out if you need help editing the formats.", nextStep: null },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  MODULE 4 — OU Organization
    //  Two scenarios: OU navigation + OU configuration/policies
    // ═══════════════════════════════════════════════════════════════

    // ── Scenario 4A: OU Navigation ─────────────────────────────────
    {
        id: "scenario_ou_navigation",
        title: "Understanding OU Organization",
        description: "Help Lisa Wilson understand how Google OUs are structured and how users are mapped into them.",
        customerId: "lisaWilson",
        moduleId: "mod_ou_management",
        ticketSubject: "I need help understanding how our Google OUs are organized",
        ticketPriority: "normal",
        ticketNumber: 1007,
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Intro ────────────────────────────────────────────
            {
                id: "step_on_intro",
                type: "message",
                text: "Hi there! I'm trying to understand how our Google accounts are organized into Organizational Units. The principal asked me to document our OU structure but I'm not sure where to start. Can you walk me through it?",
                sender: "customer",
                actions: [
                    { label: "Sure! Let's go through the OU configuration step by step.", nextStep: "step_on_ou_categories" },
                ],
            },
            // ── 2. OU categories count ──────────────────────────────
            {
                id: "step_on_ou_categories",
                type: "input",
                text: "Great! First, how many OU categories are configured in the provisioning wizard? I want to know how many different types of OU placements there are.",
                sender: "customer",
                guideMessage: "Count the OU categories in the Organize OUs step: students, teachers, staff, archive, and ignored.",
                correctAnswer: ["5", "five"],
                matchMode: "oneOf",
                successStep: "step_on_student_path",
                hint: {
                    message: "The OU step configures placement for five categories: Students, Teachers, Staff, Archive, and Ignored.",
                },
                autoShowHint: false,
            },
            // ── 3. Student OU path ──────────────────────────────────
            {
                id: "step_on_student_path",
                type: "input",
                text: "OK — students, teachers, staff, archive, and ignored. Let's start with students. What's the student OU path template? I want to see the full path pattern that students get placed into.",
                sender: "customer",
                guideMessage: "Check the student OU configuration for the path template including variables.",
                correctAnswer: "/students",
                matchMode: "includes",
                successStep: "step_on_tree_count",
                hint: {
                    message: "The student OU path is /Students/{{school_name}}/{{student.grade}} — it starts with /Students.",
                },
                autoShowHint: false,
            },
            // ── 4. Total OU tree nodes ──────────────────────────────
            {
                id: "step_on_tree_count",
                type: "input",
                text: "That makes sense — students are organized by school and grade. How many total nodes are in the Google OU tree? I mean every OU at every level, including the root.",
                sender: "customer",
                guideMessage: "Count every node in the GOOGLE_ORG_UNITS tree: root, Devices, Students, Treutelside Middle School, 7, 8, Users, Staff, Teachers, Operations = 10.",
                correctAnswer: ["10", "ten"],
                matchMode: "oneOf",
                successStep: "step_on_teacher_ou",
                hint: {
                    message: "Count every OU in the tree: Root, Devices, Students, Treutelside Middle School, 7, 8, Users, Staff, Teachers, Operations = 10 nodes.",
                },
                autoShowHint: false,
            },
            // ── 5. Teacher OU path ──────────────────────────────────
            {
                id: "step_on_teacher_ou",
                type: "input",
                text: "10 nodes — that's more than I expected! Now, what about teachers? What's their OU path?",
                sender: "customer",
                guideMessage: "Check the teacher OU configuration for their assigned path.",
                correctAnswer: "/users/staff/teachers",
                matchMode: "includes",
                successStep: "step_on_student_variables",
                hint: {
                    message: "Teachers go to /Users/Staff/Teachers — a fixed path with no dynamic variables.",
                },
                autoShowHint: false,
            },
            // ── 6. Student sub-OU variables ─────────────────────────
            {
                id: "step_on_student_variables",
                type: "message",
                text: "I noticed students have a more complex path with variables in it. What are the 2 variables used in the student sub-OU format?",
                sender: "customer",
                actions: [
                    { label: "The student sub-OU uses school_name and student.grade — so students are sorted by school first, then by grade level.", nextStep: "step_on_rogelio_path" },
                    { label: "The student sub-OU uses first name and last name.", nextStep: "step_on_student_variables_wrong" },
                ],
            },
            // ── 6a. Wrong variables answer ──────────────────────────
            {
                id: "step_on_student_variables_wrong",
                type: "message",
                text: "That doesn't sound right — names wouldn't make sense for organizing OUs. The path template has variables with double curly braces. I think one is about the school and the other is about the grade?",
                sender: "customer",
                actions: [
                    { label: "You're right — the two variables are school_name and student.grade, creating a school → grade hierarchy.", nextStep: "step_on_rogelio_path" },
                ],
            },
            // ── 7. Rogelio's resolved OU path ───────────────────────
            {
                id: "step_on_rogelio_path",
                type: "input",
                text: "Let me test my understanding with a real student. Rogelio Waelchi attends Treutelside Middle School and is in 7th Grade. What would his actual resolved OU path be?",
                sender: "customer",
                guideMessage: "Apply the template /Students/{{school_name}}/{{student.grade}} with school=Treutelside Middle School and grade=7th Grade.",
                correctAnswer: ["/students/treutelside middle school/7th grade", "/students/treutelside middle school/7"],
                matchMode: "oneOf",
                successStep: "step_on_staff_subou",
                hint: {
                    message: "Substitute the variables: /Students/Treutelside Middle School/7th Grade (or just /7).",
                },
                autoShowHint: false,
            },
            // ── 8. Staff sub-OU question ────────────────────────────
            {
                id: "step_on_staff_subou",
                type: "message",
                text: "Makes sense! What about staff — do staff OUs use sub-OUs too? And if so, what are they organized by?",
                sender: "customer",
                actions: [
                    { label: "Yes, staff OUs use sub-OUs organized by department. Each staff member goes into /Users/Staff/{{staff.department}}.", nextStep: "step_on_oswaldo_path" },
                    { label: "No, staff all go into one flat OU.", nextStep: "step_on_staff_subou_wrong" },
                ],
            },
            // ── 8a. Wrong staff answer ──────────────────────────────
            {
                id: "step_on_staff_subou_wrong",
                type: "message",
                text: "Are you sure? I thought I saw a department variable in the staff OU path. Can you double check?",
                sender: "customer",
                actions: [
                    { label: "You're right — staff are organized by department using /Users/Staff/{{staff.department}}.", nextStep: "step_on_oswaldo_path" },
                ],
            },
            // ── 9. Oswaldo's OU path ────────────────────────────────
            {
                id: "step_on_oswaldo_path",
                type: "input",
                text: "Got it — by department! Let's test that too. Our librarian Oswaldo Pouros is in the Operations department. What would his OU path be?",
                sender: "customer",
                guideMessage: "Apply the template /Users/Staff/{{staff.department}} with department=Operations.",
                correctAnswer: "/users/staff/operations",
                matchMode: "includes",
                successStep: "step_on_done",
                hint: {
                    message: "Substitute the department: /Users/Staff/Operations.",
                },
                autoShowHint: false,
            },
            // ── 10. Done ────────────────────────────────────────────
            {
                id: "step_on_done",
                type: "message",
                text: "This is really helpful! So we have 5 OU categories, students organized by school and grade, teachers in a flat path, staff by department, and 10 total nodes in the tree. I can document all of this now. Thanks so much!",
                sender: "customer",
                actions: [
                    { label: "You're welcome, Lisa! That's a great summary of the OU structure.", nextStep: null },
                    { label: "Happy to help! Let me know if you have questions about archive or ignored OUs too.", nextStep: null },
                ],
            },
        ],
    },

    // ── Scenario 4B: OU Configuration & Policies ────────────────────
    {
        id: "scenario_ou_configuration",
        title: "OU Configuration & Policies",
        description: "Help Marcus Thompson understand archive actions, ignored user handling, and OU policy differences for a board presentation.",
        customerId: "marcusThompson",
        moduleId: "mod_ou_management",
        ticketSubject: "Need to review archive and ignored OU policies for board presentation",
        ticketPriority: "high",
        ticketNumber: 1008,
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Intro ────────────────────────────────────────────
            {
                id: "step_oc_intro",
                type: "message",
                text: "Hi — I'm preparing a board presentation on our Google account lifecycle management. I need to understand the archive and ignored OU policies in detail. Can you help me review the current configuration?",
                sender: "customer",
                actions: [
                    { label: "Absolutely! Let's go through the archive and ignored OU settings.", nextStep: "step_oc_archive_action" },
                ],
            },
            // ── 2. Current archive action ───────────────────────────
            {
                id: "step_oc_archive_action",
                type: "input",
                text: "Let's start with the archive OU. What's the current archive action configured for users who leave the district?",
                sender: "customer",
                guideMessage: "Check the archive OU configuration for the current archiveAction setting.",
                correctAnswer: "move-suspend",
                matchMode: "includes",
                successStep: "step_oc_archive_options",
                hint: {
                    message: "The archive action is set to 'move-suspend' — accounts are moved to the archive OU and suspended.",
                },
                autoShowHint: false,
            },
            // ── 3. Archive action options count ─────────────────────
            {
                id: "step_oc_archive_options",
                type: "input",
                text: "Move and suspend — got it. How many archive action options are available in total? I want to know what alternatives we could present to the board.",
                sender: "customer",
                guideMessage: "Count the archive action options in ARCHIVE_ACTIONS: move-suspend-archive, move-suspend, move.",
                correctAnswer: ["3", "three"],
                matchMode: "oneOf",
                successStep: "step_oc_archive_difference",
                hint: {
                    message: "There are 3 archive actions: move-suspend-archive, move-suspend, and move.",
                },
                autoShowHint: false,
            },
            // ── 4. Archive action differences ───────────────────────
            {
                id: "step_oc_archive_difference",
                type: "message",
                text: "Three options. What's the difference between 'move-suspend' and 'move-suspend-archive'? The board will want to know what the extra 'archive' step does.",
                sender: "customer",
                actions: [
                    { label: "Move-suspend moves the account to the archive OU and suspends it. Move-suspend-archive does the same but also triggers Google's archive feature, which releases the user's license.", nextStep: "step_oc_ignored_handling" },
                    { label: "They're the same thing — just different labels.", nextStep: "step_oc_archive_difference_wrong" },
                ],
            },
            // ── 4a. Wrong archive difference ────────────────────────
            {
                id: "step_oc_archive_difference_wrong",
                type: "message",
                text: "I don't think they're identical — the third word 'archive' must do something additional. Does it have to do with Google's licensing or data retention?",
                sender: "customer",
                actions: [
                    { label: "Good catch — move-suspend-archive adds Google's archive step which releases the license and preserves the account data differently.", nextStep: "step_oc_ignored_handling" },
                ],
            },
            // ── 5. Ignored user handling ─────────────────────────────
            {
                id: "step_oc_ignored_handling",
                type: "input",
                text: "Now let's talk about the ignored OU. How are ignored users handled? What happens to their accounts?",
                sender: "customer",
                guideMessage: "Check the ignored OU handling configuration for all user types.",
                correctAnswer: "auto-suspend",
                matchMode: "includes",
                successStep: "step_oc_staff_subou",
                hint: {
                    message: "Ignored users are set to 'auto-suspend' — their accounts get suspended automatically.",
                },
                autoShowHint: false,
            },
            // ── 6. Staff sub-OU configuration ───────────────────────
            {
                id: "step_oc_staff_subou",
                type: "message",
                text: "Auto-suspend for ignored users — that's a clear policy. Switching gears for the presentation — does the staff OU use sub-OUs? If so, what are they organized by?",
                sender: "customer",
                actions: [
                    { label: "Yes, staff use sub-OUs organized by department. The path template is /Users/Staff/{{staff.department}}.", nextStep: "step_oc_oswaldo_path" },
                    { label: "No, staff accounts all go into one flat OU.", nextStep: "step_oc_staff_subou_wrong" },
                ],
            },
            // ── 6a. Wrong staff sub-OU answer ───────────────────────
            {
                id: "step_oc_staff_subou_wrong",
                type: "message",
                text: "I've seen the staff OU path and it had a variable in it — something about departments. Can you check again?",
                sender: "customer",
                actions: [
                    { label: "You're right — staff are organized into sub-OUs by department using {{staff.department}}.", nextStep: "step_oc_oswaldo_path" },
                ],
            },
            // ── 7. Oswaldo's OU path ────────────────────────────────
            {
                id: "step_oc_oswaldo_path",
                type: "input",
                text: "Let me verify with a real example. Our librarian Oswaldo Pouros is in the Operations department. What would his complete OU path be?",
                sender: "customer",
                guideMessage: "Apply the staff OU template /Users/Staff/{{staff.department}} with department=Operations.",
                correctAnswer: "/users/staff/operations",
                matchMode: "includes",
                successStep: "step_oc_teacher_subou",
                hint: {
                    message: "Substitute the department: /Users/Staff/Operations.",
                },
                autoShowHint: false,
            },
            // ── 8. Teacher sub-OU formatting ────────────────────────
            {
                id: "step_oc_teacher_subou",
                type: "message",
                text: "Good. And do teachers have sub-OU formatting too, or is their path fixed?",
                sender: "customer",
                actions: [
                    { label: "Teachers have a fixed path — /Users/Staff/Teachers. No sub-OU variables, no dynamic formatting.", nextStep: "step_oc_archive_vs_ignored" },
                    { label: "Yes, teachers also have sub-OU formatting by subject area.", nextStep: "step_oc_teacher_subou_wrong" },
                ],
            },
            // ── 8a. Wrong teacher sub-OU answer ─────────────────────
            {
                id: "step_oc_teacher_subou_wrong",
                type: "message",
                text: "I don't think that's right. The teacher OU configuration didn't have any variables — it looked like a static path. Can you check again?",
                sender: "customer",
                actions: [
                    { label: "You're correct — teachers go to /Users/Staff/Teachers with no dynamic sub-OUs.", nextStep: "step_oc_archive_vs_ignored" },
                ],
            },
            // ── 9. Archive vs. ignored fundamental difference ───────
            {
                id: "step_oc_archive_vs_ignored",
                type: "message",
                text: "Last question for the presentation — what's the fundamental difference between archive and ignored users? The board will want a clear distinction.",
                sender: "customer",
                actions: [
                    { label: "Archive is for users who have departed the district — they're no longer in the SIS data. Ignored users are still in the SIS but are managed manually outside of Clever IDM.", nextStep: "step_oc_done" },
                    { label: "Archive and ignored are the same thing — both are for inactive users.", nextStep: "step_oc_archive_vs_ignored_wrong" },
                ],
            },
            // ── 9a. Wrong archive vs. ignored answer ────────────────
            {
                id: "step_oc_archive_vs_ignored_wrong",
                type: "message",
                text: "They can't be the same — the system has two separate categories for a reason. I think one is for users who left the district entirely, and the other is for users who are still in the system but managed differently?",
                sender: "customer",
                actions: [
                    { label: "Exactly — archive is for departed users no longer in SIS data, while ignored users are still in the SIS but their Google accounts are managed manually, outside IDM automation.", nextStep: "step_oc_done" },
                ],
            },
            // ── 10. Done ────────────────────────────────────────────
            {
                id: "step_oc_done",
                type: "message",
                text: "Perfect summary. Archive for departed users, ignored for manually-managed ones. Move-suspend as our current policy with two other options available. Staff by department, teachers flat. This gives me everything I need for the board presentation. Thank you!",
                sender: "customer",
                actions: [
                    { label: "Glad I could help, Marcus! Good luck with the presentation.", nextStep: null },
                    { label: "Great summary! Let us know if the board has questions about changing any policies.", nextStep: null },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  MODULE 5 — Group Configuration
    //  One scenario: Google Groups and membership rules
    // ═══════════════════════════════════════════════════════════════

    // ── Scenario 5: Group Setup ─────────────────────────────────────
    {
        id: "scenario_group_setup",
        title: "Understanding Google Groups in IDM",
        description: "Help Principal Jones understand how Google Groups work in the provisioning wizard and what membership rules do.",
        customerId: "principalJones",
        moduleId: "mod_groups",
        ticketSubject: "What are Google Groups in the provisioning wizard?",
        ticketPriority: "normal",
        ticketNumber: 1009,
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Intro ────────────────────────────────────────────
            {
                id: "step_gs_intro",
                type: "message",
                text: "Hi again! I'm working through the provisioning wizard and I got to step 6 — Configure Groups. I'm not really sure what Google Groups are in this context or how they relate to provisioning. Can you explain?",
                sender: "customer",
                actions: [
                    { label: "Of course! Google Groups in IDM are different from OUs. Let me walk you through it.", nextStep: "step_gs_purpose" },
                ],
            },
            // ── 2. Google Groups purpose ────────────────────────────
            {
                id: "step_gs_purpose",
                type: "message",
                text: "What are Google Groups actually used for? I keep confusing them with OUs.",
                sender: "customer",
                actions: [
                    { label: "Google Groups are used for email distribution lists and access controls — like sending an email to all 3rd-grade teachers at once, or giving a group shared Drive access. OUs are about organizing accounts in a hierarchy.", nextStep: "step_gs_user_type_count" },
                    { label: "Google Groups are the same as OUs — they organize users into folders.", nextStep: "step_gs_purpose_wrong" },
                ],
            },
            // ── 2a. Wrong purpose answer ────────────────────────────
            {
                id: "step_gs_purpose_wrong",
                type: "message",
                text: "That doesn't sound right — OUs are already the folder structure. Groups must serve a different purpose. I've heard of email groups before — are Google Groups related to email lists?",
                sender: "customer",
                actions: [
                    { label: "Yes! Google Groups are for email distribution lists and access controls. They're completely separate from OUs, which handle account organization.", nextStep: "step_gs_user_type_count" },
                ],
            },
            // ── 3. User type count for groups ───────────────────────
            {
                id: "step_gs_user_type_count",
                type: "input",
                text: "OK, so groups are for email lists and access. How many user types can have group membership rules configured in the wizard?",
                sender: "customer",
                guideMessage: "Count the user types in the groups configuration: students, teachers, staff.",
                correctAnswer: ["3", "three"],
                matchMode: "oneOf",
                successStep: "step_gs_rules_configured",
                hint: {
                    message: "The groups step has rules for three user types: students, teachers, and staff.",
                },
                autoShowHint: false,
            },
            // ── 4. Rules currently configured ───────────────────────
            {
                id: "step_gs_rules_configured",
                type: "input",
                text: "Three types — same as credentials and OUs. How many group membership rules are currently configured across all user types?",
                sender: "customer",
                guideMessage: "Check the rulesConfigured count for all three user types in the groups configuration.",
                correctAnswer: ["0", "zero", "none"],
                matchMode: "oneOf",
                successStep: "step_gs_membership_rules",
                hint: {
                    message: "All three user types currently have 0 rules configured — no group automation is set up yet.",
                },
                autoShowHint: false,
            },
            // ── 5. Membership rules concept ─────────────────────────
            {
                id: "step_gs_membership_rules",
                type: "message",
                text: "Zero rules? So nothing is set up yet. What does 'membership rules' actually mean in this context? How would they work if we configured some?",
                sender: "customer",
                actions: [
                    { label: "Membership rules use SIS data to automatically add users to Google Groups. For example, you could create a rule that puts all 7th graders into a '7th-grade-students@' group based on their grade level in the SIS.", nextStep: "step_gs_managed_groups" },
                    { label: "Membership rules let you manually pick which users go into each group.", nextStep: "step_gs_membership_rules_wrong" },
                ],
            },
            // ── 5a. Wrong membership rules answer ───────────────────
            {
                id: "step_gs_membership_rules_wrong",
                type: "message",
                text: "Manual selection doesn't sound very automated. I thought the point of IDM was to sync things automatically from the SIS? Wouldn't the rules use SIS data to determine group membership?",
                sender: "customer",
                actions: [
                    { label: "Exactly — membership rules are automatic. They use SIS data like grade, school, or role to automatically assign users to the right Google Groups during sync.", nextStep: "step_gs_managed_groups" },
                ],
            },
            // ── 6. IDM-managed vs. manual groups ────────────────────
            {
                id: "step_gs_managed_groups",
                type: "message",
                text: "That's helpful. What's the difference between an IDM-managed group and a regular Google Group that someone just creates manually in Google Admin?",
                sender: "customer",
                actions: [
                    { label: "IDM-managed groups are automatically synced — members are added and removed based on SIS data during each sync. Manual groups exist independently in Google and IDM doesn't touch them.", nextStep: "step_gs_no_rules" },
                    { label: "There's no difference — all Google Groups are managed by IDM.", nextStep: "step_gs_managed_groups_wrong" },
                ],
            },
            // ── 6a. Wrong managed groups answer ─────────────────────
            {
                id: "step_gs_managed_groups_wrong",
                type: "message",
                text: "That can't be right — we have Google Groups that were created years before IDM was set up. IDM can't be managing those automatically. The difference must be about which groups IDM is responsible for versus which ones are independent?",
                sender: "customer",
                actions: [
                    { label: "Correct — only groups created through IDM rules are automatically synced. Any groups created manually in Google Admin are left untouched by IDM.", nextStep: "step_gs_no_rules" },
                ],
            },
            // ── 7. What happens with 0 rules ────────────────────────
            {
                id: "step_gs_no_rules",
                type: "message",
                text: "Since we currently have 0 rules configured, what happens during a sync with respect to groups? Does IDM do anything with groups at all?",
                sender: "customer",
                actions: [
                    { label: "With 0 rules, IDM does nothing with groups during sync. No groups are created, no memberships are changed. It's effectively inactive for groups.", nextStep: "step_gs_done" },
                    { label: "IDM will still sync all existing Google Groups even with 0 rules.", nextStep: "step_gs_no_rules_wrong" },
                ],
            },
            // ── 7a. Wrong 0 rules answer ────────────────────────────
            {
                id: "step_gs_no_rules_wrong",
                type: "message",
                text: "That doesn't make sense — if there are no rules telling IDM what to do with groups, how would it know which groups to manage? I think 0 rules means IDM just skips the groups step entirely during sync?",
                sender: "customer",
                actions: [
                    { label: "You're right — with 0 rules, IDM completely skips group management during sync. No groups are created or modified.", nextStep: "step_gs_done" },
                ],
            },
            // ── 8. Done ─────────────────────────────────────────────
            {
                id: "step_gs_done",
                type: "message",
                text: "OK, this all makes sense now. Groups are for email lists and access controls, separate from OUs. Three user types can have rules, we have zero configured, and with zero rules IDM just skips groups entirely. If we want automated group membership we'd need to set up rules based on SIS data. Thanks for the clear explanation!",
                sender: "customer",
                actions: [
                    { label: "You've got it! Groups are a powerful feature whenever you're ready to set them up.", nextStep: null },
                    { label: "Great understanding! Let us know when you want to configure group rules.", nextStep: null },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  MODULE 6 — Review & Provisioning
    //  Two scenarios: review/preview + end-to-end sync management
    // ═══════════════════════════════════════════════════════════════

    // ── Scenario 6A: Review & Preview ───────────────────────────────
    {
        id: "scenario_review_provision",
        title: "Reviewing Before Go-Live",
        description: "Help Sarah Chen review the Summary and Preview steps before approving a live provisioning run.",
        customerId: "sarahChen",
        moduleId: "mod_review_provision",
        ticketSubject: "Need to review provisioning setup before we go live",
        ticketPriority: "high",
        ticketNumber: 1010,
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Intro ────────────────────────────────────────────
            {
                id: "step_rp_intro",
                type: "message",
                text: "Hi! We're getting close to going live with our Google provisioning. Before I approve anything, I want to carefully review the Summary and Preview steps. Can you walk me through what they show?",
                sender: "customer",
                actions: [
                    { label: "Smart approach! Let's review both steps before making any changes.", nextStep: "step_rp_summary_purpose" },
                ],
            },
            // ── 2. Summary step purpose ─────────────────────────────
            {
                id: "step_rp_summary_purpose",
                type: "message",
                text: "What does the Summary step (step 7) actually show? Is it where you make changes, or just review them?",
                sender: "customer",
                actions: [
                    { label: "The Summary step is a read-only review of your entire configuration. It shows all your settings across every step, with Edit buttons that take you back to make changes if needed.", nextStep: "step_rp_accounts_create" },
                    { label: "The Summary step is where you input all your final settings before provisioning.", nextStep: "step_rp_summary_purpose_wrong" },
                ],
            },
            // ── 2a. Wrong summary purpose ───────────────────────────
            {
                id: "step_rp_summary_purpose_wrong",
                type: "message",
                text: "I don't think that's right — I thought each step already has its own configuration. The Summary should just be showing what's already been set up, right? With maybe some Edit buttons to go back?",
                sender: "customer",
                actions: [
                    { label: "Correct — the Summary is read-only. It displays all your configuration in one place with Edit buttons that link back to the relevant steps if you need to make changes.", nextStep: "step_rp_accounts_create" },
                ],
            },
            // ── 3. Accounts to create ───────────────────────────────
            {
                id: "step_rp_accounts_create",
                type: "input",
                text: "Now let's look at the Preview step (step 8). How many accounts will be created according to the preview?",
                sender: "customer",
                guideMessage: "Check the preview data for accountsToCreate.",
                correctAnswer: ["1", "one"],
                matchMode: "oneOf",
                successStep: "step_rp_matched",
                hint: {
                    message: "The preview shows 1 account will be created.",
                },
                autoShowHint: false,
            },
            // ── 4. Matched accounts ─────────────────────────────────
            {
                id: "step_rp_matched",
                type: "input",
                text: "Just 1 new account — that's manageable. How many accounts were matched with existing Google accounts?",
                sender: "customer",
                guideMessage: "Check the preview details for the Matched row.",
                correctAnswer: ["0", "zero", "none"],
                matchMode: "oneOf",
                successStep: "step_rp_match_vs_create",
                hint: {
                    message: "The preview shows 0 matched accounts.",
                },
                autoShowHint: false,
            },
            // ── 5. Match vs. create difference ──────────────────────
            {
                id: "step_rp_match_vs_create",
                type: "message",
                text: "Zero matched. What's the difference between a 'Matched' account and a 'Created' account in the preview? I want to make sure I understand what these mean before we go live.",
                sender: "customer",
                actions: [
                    { label: "Matched means IDM found an existing Google account that corresponds to a Clever user and linked them together. Created means IDM will build a brand new Google account for a user that doesn't have one yet.", nextStep: "step_rp_sync_issues" },
                    { label: "They're the same thing — both create new Google accounts.", nextStep: "step_rp_match_vs_create_wrong" },
                ],
            },
            // ── 5a. Wrong match vs. create answer ───────────────────
            {
                id: "step_rp_match_vs_create_wrong",
                type: "message",
                text: "They can't be the same — the preview lists them separately with different counts. I think 'Matched' is about connecting to accounts that already exist in Google, while 'Created' is about making new ones?",
                sender: "customer",
                actions: [
                    { label: "Exactly — Matched links existing Google accounts to Clever users via their SIS email. Created makes brand new Google accounts for users who don't already have one.", nextStep: "step_rp_sync_issues" },
                ],
            },
            // ── 6. Sync issues ──────────────────────────────────────
            {
                id: "step_rp_sync_issues",
                type: "input",
                text: "Good distinction. How many sync issues does the preview show?",
                sender: "customer",
                guideMessage: "Check the preview data for syncIssues.",
                correctAnswer: ["0", "zero", "none"],
                matchMode: "oneOf",
                successStep: "step_rp_last_run",
                hint: {
                    message: "The preview shows 0 sync issues.",
                },
                autoShowHint: false,
            },
            // ── 7. Last preview run ─────────────────────────────────
            {
                id: "step_rp_last_run",
                type: "input",
                text: "Zero issues — that's reassuring. When was the last time the preview was run? I want to make sure we're looking at recent data.",
                sender: "customer",
                guideMessage: "Check the preview lastRun value.",
                correctAnswer: "3 months ago",
                matchMode: "includes",
                successStep: "step_rp_detail_rows",
                hint: {
                    message: "The preview shows it was last run 3 months ago.",
                },
                autoShowHint: false,
            },
            // ── 8. Preview detail row count ─────────────────────────
            {
                id: "step_rp_detail_rows",
                type: "input",
                text: "3 months ago — we should definitely re-run it before going live. How many detail rows are in the preview breakdown table?",
                sender: "customer",
                guideMessage: "Count the rows in the preview details array.",
                correctAnswer: ["6", "six"],
                matchMode: "oneOf",
                successStep: "step_rp_conflicts",
                hint: {
                    message: "The preview details table has 6 rows: Matched, Creates, Total Updates, Archives, Total Issues, and Conflicts.",
                },
                autoShowHint: false,
            },
            // ── 9. Conflicts meaning ────────────────────────────────
            {
                id: "step_rp_conflicts",
                type: "message",
                text: "I see there's a 'Conflicts' row in the details. What does a conflict mean in the preview?",
                sender: "customer",
                actions: [
                    { label: "A conflict means an account can't be created or matched because its email address is already taken by another Clever IDM user. It's a duplicate email blocking the operation.", nextStep: "step_rp_done" },
                    { label: "A conflict means two different settings disagree with each other.", nextStep: "step_rp_conflicts_wrong" },
                ],
            },
            // ── 9a. Wrong conflicts answer ──────────────────────────
            {
                id: "step_rp_conflicts_wrong",
                type: "message",
                text: "That doesn't sound right for the Preview step. I think the conflict is about user accounts specifically — maybe something about duplicate emails preventing account creation?",
                sender: "customer",
                actions: [
                    { label: "Correct — a conflict happens when Clever IDM tries to create or match a user, but their email address is already taken by another Clever IDM user, blocking the operation.", nextStep: "step_rp_done" },
                ],
            },
            // ── 10. Done ────────────────────────────────────────────
            {
                id: "step_rp_done",
                type: "message",
                text: "Great review! Summary is read-only with Edit buttons, Preview shows 1 create, 0 matched, 0 issues, 6 detail rows, and conflicts mean duplicate emails. The preview is 3 months old so we should refresh it. I feel much more prepared for go-live now. Thank you!",
                sender: "customer",
                actions: [
                    { label: "You're welcome, Sarah! Always good to review thoroughly before provisioning.", nextStep: null },
                    { label: "Great preparation! Make sure to re-run the preview with fresh data before clicking Provision.", nextStep: null },
                ],
            },
        ],
    },

    // ── Scenario 6B: End-to-End Sync Management ─────────────────────
    {
        id: "scenario_sync_management",
        title: "End-to-End Provisioning Flow",
        description: "Help Lisa Wilson understand the complete provisioning pipeline from start to finish.",
        customerId: "lisaWilson",
        moduleId: "mod_review_provision",
        ticketSubject: "Walk me through the entire provisioning process from start to finish",
        ticketPriority: "normal",
        ticketNumber: 1011,
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Intro ────────────────────────────────────────────
            {
                id: "step_sm_intro",
                type: "message",
                text: "Hi! I've learned bits and pieces about the provisioning wizard, but I want to understand the entire process from start to finish. Can you help me put it all together?",
                sender: "customer",
                actions: [
                    { label: "Absolutely! Let's trace through the entire provisioning pipeline.", nextStep: "step_sm_total_steps" },
                ],
            },
            // ── 2. Total wizard steps ───────────────────────────────
            {
                id: "step_sm_total_steps",
                type: "input",
                text: "Let's start at the top level. How many total steps are in the provisioning wizard?",
                sender: "customer",
                guideMessage: "Count the WIZARD_STEPS entries.",
                correctAnswer: ["8", "eight"],
                matchMode: "oneOf",
                successStep: "step_sm_step_before_preview",
                hint: {
                    message: "The wizard has 8 steps: Connect, Management Level, Users, Credentials, OUs, Groups, Summary, Preview.",
                },
                autoShowHint: false,
            },
            // ── 3. Step before Preview ───────────────────────────────
            {
                id: "step_sm_step_before_preview",
                type: "message",
                text: "8 steps. What step comes right before Preview and Provision? That's where you'd do a final review, right?",
                sender: "customer",
                actions: [
                    { label: "Step 7 is Summary — it's a read-only review of all your configuration with Edit buttons to go back and make changes before you Preview.", nextStep: "step_sm_archives_count" },
                    { label: "Step 7 is Configure Groups.", nextStep: "step_sm_step_before_preview_wrong" },
                ],
            },
            // ── 3a. Wrong step before Preview ───────────────────────
            {
                id: "step_sm_step_before_preview_wrong",
                type: "message",
                text: "Groups is step 6, not 7. I think there's a review or summary step between groups and preview — can you check?",
                sender: "customer",
                actions: [
                    { label: "You're right — step 7 is Summary, which comes between Configure Groups (step 6) and Preview and Provision (step 8).", nextStep: "step_sm_archives_count" },
                ],
            },
            // ── 4. Archives count ───────────────────────────────────
            {
                id: "step_sm_archives_count",
                type: "input",
                text: "Makes sense — review everything before committing. Looking at the preview data, how many accounts will be archived?",
                sender: "customer",
                guideMessage: "Check the preview data for accountsToArchive.",
                correctAnswer: ["0", "zero", "none"],
                matchMode: "oneOf",
                successStep: "step_sm_conflicts_meaning",
                hint: {
                    message: "The preview shows 0 accounts will be archived.",
                },
                autoShowHint: false,
            },
            // ── 5. Conflicts concept ────────────────────────────────
            {
                id: "step_sm_conflicts_meaning",
                type: "message",
                text: "Zero archives — good. I see 'Conflicts' in the preview details. What causes a conflict?",
                sender: "customer",
                actions: [
                    { label: "A conflict happens when IDM tries to create or match a user but their email address is already taken by another Clever IDM user. It's a duplicate email issue.", nextStep: "step_sm_preview_actions" },
                    { label: "A conflict means two wizard steps have contradictory settings.", nextStep: "step_sm_conflicts_meaning_wrong" },
                ],
            },
            // ── 5a. Wrong conflicts answer ──────────────────────────
            {
                id: "step_sm_conflicts_meaning_wrong",
                type: "message",
                text: "I don't think wizard settings conflict with each other that way. I think 'Conflicts' in the preview is specifically about user accounts — maybe duplicate emails?",
                sender: "customer",
                actions: [
                    { label: "Yes — a conflict is when a user's email address would be a duplicate of another Clever IDM user's, preventing account creation or matching.", nextStep: "step_sm_preview_actions" },
                ],
            },
            // ── 6. Preview actions ──────────────────────────────────
            {
                id: "step_sm_preview_actions",
                type: "message",
                text: "Good to know. What actions are available from the Preview step? What can you actually do from there?",
                sender: "customer",
                actions: [
                    { label: "From Preview you can: download the preview data, check a specific user, refresh the preview with fresh data, and click Provision to apply the changes.", nextStep: "step_sm_provision_click" },
                    { label: "You can only click Provision — there are no other actions.", nextStep: "step_sm_preview_actions_wrong" },
                ],
            },
            // ── 6a. Wrong preview actions answer ────────────────────
            {
                id: "step_sm_preview_actions_wrong",
                type: "message",
                text: "There must be more than just Provision — I've seen options for downloading data and checking individual users. Can you look again?",
                sender: "customer",
                actions: [
                    { label: "You're right — besides Provision, you can download the preview data, check a specific user, and refresh the preview to get updated numbers.", nextStep: "step_sm_provision_click" },
                ],
            },
            // ── 7. What Provision does ──────────────────────────────
            {
                id: "step_sm_provision_click",
                type: "message",
                text: "And the big question — what actually happens when you click the Provision button?",
                sender: "customer",
                actions: [
                    { label: "Clicking Provision triggers the provisioning process — in our simulator, it shows a confirmation toast and exits the wizard. In the live system, it would apply all the configured changes to Google Workspace.", nextStep: "step_sm_first_step" },
                    { label: "Nothing happens — it just saves your settings.", nextStep: "step_sm_provision_click_wrong" },
                ],
            },
            // ── 7a. Wrong provision answer ──────────────────────────
            {
                id: "step_sm_provision_click_wrong",
                type: "message",
                text: "It has to do more than just save — 'Provision' is the action that actually makes changes happen. Doesn't it apply the configured changes to Google?",
                sender: "customer",
                actions: [
                    { label: "Correct — Provision applies all configured changes. In our simulator it shows a toast confirmation and exits, but in the live system it would create, update, and archive Google accounts based on the preview data.", nextStep: "step_sm_first_step" },
                ],
            },
            // ── 8. First step name ──────────────────────────────────
            {
                id: "step_sm_first_step",
                type: "input",
                text: "Let me make sure I can name the full pipeline. What's the very first wizard step?",
                sender: "customer",
                guideMessage: "Recall step 1 of the WIZARD_STEPS.",
                correctAnswer: ["connect to google", "connect"],
                matchMode: "oneOf",
                successStep: "step_sm_last_step",
                hint: {
                    message: "Step 1 is 'Connect to Google'.",
                },
                autoShowHint: false,
            },
            // ── 9. Last step name ───────────────────────────────────
            {
                id: "step_sm_last_step",
                type: "input",
                text: "And the very last step?",
                sender: "customer",
                guideMessage: "Recall step 8 of the WIZARD_STEPS.",
                correctAnswer: ["preview and provision", "preview"],
                matchMode: "oneOf",
                successStep: "step_sm_done",
                hint: {
                    message: "Step 8 is 'Preview and provision'.",
                },
                autoShowHint: false,
            },
            // ── 10. Done ────────────────────────────────────────────
            {
                id: "step_sm_done",
                type: "message",
                text: "I've got the full picture now! 8 steps from Connect to Google all the way through Preview and Provision. Summary reviews everything, Preview shows the impact, and Provision makes it happen. Zero archives, zero conflicts in our current setup. The whole pipeline makes sense now. Thanks for putting it all together for me!",
                sender: "customer",
                actions: [
                    { label: "You're welcome, Lisa! You now understand the complete provisioning flow from start to finish.", nextStep: null },
                    { label: "Great job! You've mastered the entire provisioning pipeline. Let us know if you need help with an actual provisioning run.", nextStep: null },
                ],
            },
        ],
    },
];
