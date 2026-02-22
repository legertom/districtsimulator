/**
 * Training scenarios for the Cedar Ridge District Simulator.
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
        description: "Investigate the IDM page layout and report whether Google sync is healthy.",
        customerId: "principalJones",
        moduleId: "mod_overview",
        ticketSubject: "Welcome! Can you check on our Google sync?",
        ticketPriority: "normal",
        ticketNumber: 1001,
        ticketMessage: "Hi! Welcome aboard! I'm not going to pretend I understand what Clever IDM does, but the previous admin told me it's important. Can you just... check that everything's working? Green lights are good, right?",
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Navigate to IDM ───────────────────────────────
            {
                id: "step_orient_nav_idm",
                type: "task",
                checklistLabel: "Navigate to the IDM page",
                goalRoute: "idm",
                nextStep: "step_orient_provider",
                guideMessage: "Open the IDM page under User management in the sidebar.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management.",
                },
                autoShowHint: true,
            },
            // ── 2. Identify the provider ─────────────────────────
            {
                id: "step_orient_provider",
                type: "checkpoint",
                checklistLabel: "Identify the provider",
                question: "What identity provider is configured on this IDM page?",
                choices: [
                    { label: "Google Workspace", nextStep: "step_orient_health", correct: true },
                    { label: "Microsoft Entra ID", nextStep: "step_orient_provider_wrong", unguidedNextStep: "step_orient_health", correct: false },
                    { label: "Both Google and Microsoft", nextStep: "step_orient_provider_wrong", unguidedNextStep: "step_orient_health", correct: false },
                ],
                hint: {
                    target: "google-provider-card",
                    message: "Look at the provider card at the top of the IDM page.",
                },
                autoShowHint: false,
            },
            // ── 2a. Wrong provider branch ────────────────────────
            {
                id: "step_orient_provider_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Identify the provider (retry)",
                question: "Look again at the provider card — what logo and name do you see?",
                choices: [
                    { label: "Google Workspace", nextStep: "step_orient_health" },
                ],
            },
            // ── 3. Assess integration health ─────────────────────
            {
                id: "step_orient_health",
                type: "observe",
                checklistLabel: "Assess the integration health",
                question: "Based on the provider card status badges, is the Google integration healthy or are there problems?",
                correctAnswer: "active",
                matchMode: "includes",
                successStep: "step_orient_nav_sync",
                hint: {
                    target: "google-provider-card",
                    message: "Check the status badges and stats row on the provider card.",
                },
                autoShowHint: false,
            },
            // ── 4. Navigate to sync timestamp area ───────────────
            {
                id: "step_orient_nav_sync",
                type: "task",
                checklistLabel: "Find the last sync timestamp",
                goalAction: "idm-tab-sync-history",
                nextStep: "step_orient_sync_health",
                guideMessage: "Click on the Sync History tab to see when the last sync ran.",
                hint: {
                    target: "last-sync-timestamp",
                    message: "Look below the provider card for sync information, or click the Sync History tab.",
                },
                autoShowHint: false,
            },
            // ── 5. Evaluate sync recency ─────────────────────────
            {
                id: "step_orient_sync_health",
                type: "checkpoint",
                checklistLabel: "Evaluate whether syncs are running regularly",
                question: "Looking at the sync history, are syncs running regularly or has there been a gap?",
                choices: [
                    { label: "Syncs are running regularly — the most recent one was within the last few days", nextStep: "step_orient_nav_tasks", correct: true },
                    { label: "Syncs have stopped — the last one was weeks ago", nextStep: "step_orient_sync_wrong", unguidedNextStep: "step_orient_nav_tasks", correct: false },
                ],
                hint: {
                    message: "Check the dates in the Sync History table — are they recent and consistent?",
                },
                autoShowHint: false,
            },
            // ── 5a. Wrong sync assessment ────────────────────────
            {
                id: "step_orient_sync_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Evaluate sync recency (retry)",
                question: "Look at the sync dates more carefully. The table shows multiple recent entries. Are they spaced regularly?",
                choices: [
                    { label: "Yes, syncs are running regularly", nextStep: "step_orient_nav_tasks" },
                ],
            },
            // ── 6. Navigate to Tasks tab ─────────────────────────
            {
                id: "step_orient_nav_tasks",
                type: "task",
                checklistLabel: "Check the Tasks tab for notifications",
                goalAction: "idm-tab-tasks",
                nextStep: "step_orient_managed_users",
                guideMessage: "Click the Tasks tab to see any active notifications or tasks.",
                hint: {
                    message: "Click the 'Tasks' tab near the top of the IDM page.",
                },
                autoShowHint: true,
            },
            // ── 7. Managed users assessment ──────────────────────
            {
                id: "step_orient_managed_users",
                type: "observe",
                checklistLabel: "Note how many users IDM manages",
                question: "The Tasks tab shows a notification about managed users. How many Google users is IDM managing?",
                guideMessage: "Look at the notification card that mentions how many Google users IDM manages.",
                correctAnswer: "40",
                matchMode: "exact",
                successStep: "step_orient_resolution",
                hint: {
                    target: "managed-users-notification",
                    message: "Look at the notification card in the Tasks tab for the user count.",
                },
                autoShowHint: false,
            },
            // ── 8. Resolution ────────────────────────────────────
            {
                id: "step_orient_resolution",
                type: "resolution",
                checklistLabel: "Report back to Principal Jones",
                question: "Choose the best summary to report back to Principal Jones:",
                choices: [
                    { label: "Our IDM is active with Google Workspace. Syncs are running regularly and we're managing 40 users. There's 1 minor issue to review, but overall the system is healthy.", nextStep: null, correct: true },
                    { label: "IDM is down. The sync has failed and Google accounts aren't being managed. We need to call Clever support immediately.", nextStep: null, correct: false },
                ],
            },
        ],
    },

    // ── Scenario 1B: Exploring IDM Tabs ──────────────────────────
    {
        id: "scenario_idm_tab_exploration",
        title: "Exploring IDM Tabs",
        description: "Navigate all four IDM tabs and document what each one shows for the IT wiki.",
        customerId: "sarahChen",
        moduleId: "mod_overview",
        ticketSubject: "Documenting IDM for the team wiki",
        ticketPriority: "normal",
        ticketNumber: 1002,
        ticketMessage: "Hey — welcome to Cedar Ridge! I've been meaning to document our IDM page for the IT wiki but haven't had time. Since you're getting oriented anyway, want to kill two birds with one stone? I especially need to know about sync logs, exports, and event tracking.",
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Navigate to IDM ──────────────────────────────
            {
                id: "step_tabs_nav_idm",
                type: "task",
                checklistLabel: "Navigate to the IDM page",
                goalRoute: "idm",
                nextStep: "step_tabs_click_sync",
                guideMessage: "Open the IDM page under User management in the sidebar.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management.",
                },
                autoShowHint: true,
            },
            // ── 2. Click Sync History tab ────────────────────────
            {
                id: "step_tabs_click_sync",
                type: "task",
                checklistLabel: "Open the Sync History tab",
                goalAction: "idm-tab-sync-history",
                nextStep: "step_tabs_sync_assess",
                guideMessage: "Click the 'Sync History' tab on the IDM page.",
                hint: {
                    message: "Click the 'Sync History' tab near the top of the page.",
                },
                autoShowHint: true,
            },
            // ── 3. Assess sync health ────────────────────────────
            {
                id: "step_tabs_sync_assess",
                type: "checkpoint",
                checklistLabel: "Assess sync history health",
                question: "Looking at the Sync History tab, what's the overall health of the sync process?",
                choices: [
                    { label: "All syncs completed successfully, though each has a minor issue flagged", nextStep: "step_tabs_click_exports", correct: true },
                    { label: "Multiple syncs have failed — there are serious problems", nextStep: "step_tabs_sync_wrong", unguidedNextStep: "step_tabs_click_exports", correct: false },
                    { label: "There's no sync history — syncing hasn't been set up", nextStep: "step_tabs_sync_wrong", unguidedNextStep: "step_tabs_click_exports", correct: false },
                ],
                hint: {
                    message: "Look at the Status column in the Sync History table — are they showing success or failure?",
                },
                autoShowHint: false,
            },
            // ── 3a. Wrong sync assessment ────────────────────────
            {
                id: "step_tabs_sync_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Assess sync health (retry)",
                question: "Check the Status column more carefully. The syncs show a consistent pattern — what do you see?",
                choices: [
                    { label: "All syncs completed successfully with minor issues", nextStep: "step_tabs_click_exports" },
                ],
            },
            // ── 4. Click Exports tab ─────────────────────────────
            {
                id: "step_tabs_click_exports",
                type: "task",
                checklistLabel: "Open the Exports tab",
                goalAction: "idm-tab-exports",
                nextStep: "step_tabs_exports_assess",
                guideMessage: "Click the 'Exports' tab.",
                hint: {
                    message: "Click the 'Exports' tab near the top of the page.",
                },
                autoShowHint: true,
            },
            // ── 5. Evaluate export capabilities ──────────────────
            {
                id: "step_tabs_exports_assess",
                type: "checkpoint",
                checklistLabel: "Identify export capabilities",
                question: "What export capabilities does the Exports tab offer?",
                choices: [
                    { label: "Manual CSV downloads plus an SFTP option for automated exports", nextStep: "step_tabs_click_events", correct: true },
                    { label: "Only manual downloads — there's no automation option", nextStep: "step_tabs_exports_wrong", unguidedNextStep: "step_tabs_click_events", correct: false },
                ],
                hint: {
                    target: "exports-tab-content",
                    message: "Look at the full Exports tab — is there a section about SFTP at the bottom?",
                },
                autoShowHint: false,
            },
            // ── 5a. Wrong exports assessment ─────────────────────
            {
                id: "step_tabs_exports_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Identify export capabilities (retry)",
                question: "Scroll down on the Exports tab — there should be an SFTP section. Do you see it?",
                choices: [
                    { label: "Yes — there's an SFTP toggle for automated exports alongside the manual downloads", nextStep: "step_tabs_click_events" },
                ],
            },
            // ── 6. Click Events tab ──────────────────────────────
            {
                id: "step_tabs_click_events",
                type: "task",
                checklistLabel: "Open the Events tab",
                goalAction: "idm-tab-events",
                nextStep: "step_tabs_events_assess",
                guideMessage: "Click the 'Events' tab.",
                hint: {
                    message: "Click the 'Events' tab near the top of the page.",
                },
                autoShowHint: true,
            },
            // ── 7. Evaluate events tab usefulness ────────────────
            {
                id: "step_tabs_events_assess",
                type: "checkpoint",
                checklistLabel: "Describe what the Events tab tracks",
                question: "What kind of information does the Events tab show?",
                choices: [
                    { label: "Individual user-level changes — account creations, updates, and which user types were affected", nextStep: "step_tabs_nav_tasks", correct: true },
                    { label: "Only system-level errors and warnings, not individual user changes", nextStep: "step_tabs_events_wrong", unguidedNextStep: "step_tabs_nav_tasks", correct: false },
                ],
                hint: {
                    target: "events-tab-content",
                    message: "Look at the columns in the Events table — what kind of entries do you see?",
                },
                autoShowHint: false,
            },
            // ── 7a. Wrong events assessment ──────────────────────
            {
                id: "step_tabs_events_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Describe events tab (retry)",
                question: "Look at the Events table columns — you should see user names, types (Student, Teacher, Staff), and actions. This is user-level tracking, right?",
                choices: [
                    { label: "Yes — it shows individual user changes like account creations and updates", nextStep: "step_tabs_nav_tasks" },
                ],
            },
            // ── 8. Navigate back to Tasks tab ────────────────────
            {
                id: "step_tabs_nav_tasks",
                type: "task",
                checklistLabel: "Return to the Tasks tab",
                goalAction: "idm-tab-tasks",
                nextStep: "step_tabs_resolution",
                guideMessage: "Click the Tasks tab to see the default view.",
                hint: {
                    message: "Click the 'Tasks' tab to return to the overview.",
                },
                autoShowHint: true,
            },
            // ── 9. Resolution ────────────────────────────────────
            {
                id: "step_tabs_resolution",
                type: "resolution",
                checklistLabel: "Report back to Sarah Chen",
                question: "Choose the best wiki description of the IDM tabs to send to Sarah:",
                choices: [
                    { label: "The IDM page has four tabs: Tasks (overview and notifications), Sync History (log of all sync runs with status and issues), Exports (manual CSV downloads plus SFTP automation), and Events (individual user-level changes during syncs).", nextStep: null, correct: true },
                    { label: "The IDM page has two tabs: one for viewing syncs and one for downloading data. There's no way to see individual user changes.", nextStep: null, correct: false },
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
        description: "Navigate the provisioning wizard and document its structure for the district director.",
        customerId: "principalJones",
        moduleId: "mod_provisioning_basics",
        ticketSubject: "Need our Google provisioning setup documented",
        ticketPriority: "normal",
        ticketNumber: 1003,
        ticketMessage: "The district director wants documentation of our Google provisioning setup before the board meeting. I told him you'd handle it. Hope that's OK! 😅 Can you open the wizard, check what's configured, and give me a summary of the structure?",
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Navigate to IDM ───────────────────────────────
            {
                id: "step_wn_nav_idm",
                type: "task",
                checklistLabel: "Navigate to the IDM page",
                goalRoute: "idm",
                nextStep: "step_wn_open_wizard",
                guideMessage: "Open the IDM page under User management in the sidebar.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management.",
                },
                autoShowHint: true,
            },
            // ── 2. Open the wizard ───────────────────────────────
            {
                id: "step_wn_open_wizard",
                type: "task",
                checklistLabel: "Open the provisioning wizard",
                goalAction: "edit-provisioning",
                nextStep: "step_wn_connection_check",
                guideMessage: "Click the 'Edit Google provisioning' button on the provider card.",
                hint: {
                    target: "edit-provisioning",
                    message: "Click the 'Edit Google provisioning' button.",
                },
                autoShowHint: true,
            },
            // ── 3. Check Google connection status ────────────────
            {
                id: "step_wn_connection_check",
                type: "checkpoint",
                checklistLabel: "Verify Google is connected",
                question: "The first wizard step is 'Connect to Google.' Is Google already connected for this district?",
                choices: [
                    { label: "Yes — the Connect step shows Google is already connected and authorized", nextStep: "step_wn_nav_mgmt", correct: true },
                    { label: "No — Google still needs to be set up", nextStep: "step_wn_connection_wrong", unguidedNextStep: "step_wn_nav_mgmt", correct: false },
                ],
                hint: {
                    target: "wizard-step-connect",
                    message: "Look at the Connect step — is there a connected status indicator?",
                },
                autoShowHint: false,
            },
            // ── 3a. Wrong connection answer ──────────────────────
            {
                id: "step_wn_connection_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Verify connection (retry)",
                question: "Check the Connect step again — there should be a status showing whether Google is linked. Do you see a connected indicator?",
                choices: [
                    { label: "Yes, Google is already connected", nextStep: "step_wn_nav_mgmt" },
                ],
            },
            // ── 4. Navigate to Management Level ──────────────────
            {
                id: "step_wn_nav_mgmt",
                type: "task",
                checklistLabel: "Open the Management Level step",
                goalAction: "wizard-step-management-level",
                nextStep: "step_wn_assess_level",
                guideMessage: "Click the 'Select your IDM Management Level' step in the wizard sidebar.",
                hint: {
                    target: "wizard-step-management-level",
                    message: "Click 'Select your IDM Management Level' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 5. Assess management level ───────────────────────
            {
                id: "step_wn_assess_level",
                type: "checkpoint",
                checklistLabel: "Identify the management level",
                question: "What management level is this district using? This determines how much Clever controls in Google.",
                choices: [
                    { label: "Full provisioning — Clever manages accounts, OUs, and groups", nextStep: "step_wn_nav_users", correct: true },
                    { label: "Password-Only — Clever just manages passwords for existing accounts", nextStep: "step_wn_level_wrong", unguidedNextStep: "step_wn_nav_users", correct: false },
                ],
                hint: {
                    message: "Look at which management level option is currently selected.",
                },
                autoShowHint: false,
            },
            // ── 5a. Wrong level assessment ───────────────────────
            {
                id: "step_wn_level_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Identify management level (retry)",
                question: "Check the selected option again — is it Full or Password-Only?",
                choices: [
                    { label: "Full provisioning is selected", nextStep: "step_wn_nav_users" },
                ],
            },
            // ── 6. Navigate to Users step ────────────────────────
            {
                id: "step_wn_nav_users",
                type: "task",
                checklistLabel: "Open the Select Users step",
                goalAction: "wizard-step-users",
                nextStep: "step_wn_nav_credentials",
                guideMessage: "Click the 'Select users to provision' step in the wizard sidebar.",
                hint: {
                    target: "wizard-step-users",
                    message: "Click 'Select users to provision' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 7. Navigate to Credentials step ─────────────────
            {
                id: "step_wn_nav_credentials",
                type: "task",
                checklistLabel: "Open the Credentials step",
                goalAction: "wizard-step-credentials",
                nextStep: "step_wn_nav_preview",
                guideMessage: "Click the 'Set login credentials' step in the wizard sidebar.",
                hint: {
                    target: "wizard-step-credentials",
                    message: "Click 'Set login credentials' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 8. Navigate to Preview step ──────────────────────
            {
                id: "step_wn_nav_preview",
                type: "task",
                checklistLabel: "Open the Preview and Provision step",
                goalAction: "wizard-step-preview",
                nextStep: "step_wn_resolution",
                guideMessage: "Click the 'Preview and provision' step — the last step in the wizard.",
                hint: {
                    target: "wizard-step-preview",
                    message: "Click 'Preview and provision' at the bottom of the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 9. Resolution ────────────────────────────────────
            {
                id: "step_wn_resolution",
                type: "resolution",
                checklistLabel: "Report back to Principal Jones",
                question: "Choose the best summary of the wizard structure to send to Principal Jones:",
                choices: [
                    { label: "The provisioning wizard has 8 steps: Connect to Google (already linked), Management Level (set to Full), Select Users, Set Credentials, Organize OUs, Configure Groups, Summary, and Preview & Provision. The district is fully configured.", nextStep: null, correct: true },
                    { label: "The provisioning wizard has 3 steps: Connect, Configure, and Provision. Google isn't connected yet.", nextStep: null, correct: false },
                ],
            },
        ],
    },

    // ── Scenario 2B: Wizard Concepts ─────────────────────────────
    {
        id: "scenario_wizard_concepts",
        title: "Understanding Provisioning Steps",
        description: "Walk through each wizard step and explain what it does for a board presentation.",
        customerId: "marcusThompson",
        moduleId: "mod_provisioning_basics",
        ticketSubject: "Board presentation prep — provisioning overview",
        ticketPriority: "normal",
        ticketNumber: 1004,
        ticketMessage: "I'm presenting to the board next Thursday on our Google Workspace infrastructure. I need a clear, non-technical explanation of the provisioning pipeline. Board members... do not enjoy jargon. Can you walk through the wizard and explain what each step configures?",
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Navigate to IDM ──────────────────────────────
            {
                id: "step_wc_nav_idm",
                type: "task",
                checklistLabel: "Navigate to the IDM page",
                goalRoute: "idm",
                nextStep: "step_wc_open_wizard",
                guideMessage: "Open the IDM page under User management in the sidebar.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management.",
                },
                autoShowHint: true,
            },
            // ── 2. Open the wizard ───────────────────────────────
            {
                id: "step_wc_open_wizard",
                type: "task",
                checklistLabel: "Open the provisioning wizard",
                goalAction: "edit-provisioning",
                nextStep: "step_wc_connect_purpose",
                guideMessage: "Click the 'Edit Google provisioning' button.",
                hint: {
                    target: "edit-provisioning",
                    message: "Click the 'Edit Google provisioning' button.",
                },
                autoShowHint: true,
            },
            // ── 3. Connect step purpose ──────────────────────────
            {
                id: "step_wc_connect_purpose",
                type: "checkpoint",
                checklistLabel: "Explain what 'Connect to Google' does",
                question: "Step 1 is 'Connect to Google.' What does this step actually do?",
                choices: [
                    { label: "It links Clever to your Google Workspace domain via OAuth so Clever can manage accounts", nextStep: "step_wc_nav_mgmt", correct: true },
                    { label: "It imports all Google users into Clever's database", nextStep: "step_wc_connect_wrong", unguidedNextStep: "step_wc_nav_mgmt", correct: false },
                ],
                hint: {
                    target: "wizard-step-connect",
                    message: "Think about what 'connecting' means — is it about authorization or data import?",
                },
                autoShowHint: false,
            },
            // ── 3a. Wrong Connect answer ─────────────────────────
            {
                id: "step_wc_connect_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Explain Connect step (retry)",
                question: "Connecting is about authorization, not importing. It establishes an OAuth link so Clever has permission to manage Google accounts. Does that make sense?",
                choices: [
                    { label: "Yes — Connect authorizes Clever to manage Google Workspace via OAuth", nextStep: "step_wc_nav_mgmt" },
                ],
            },
            // ── 4. Navigate to Management Level ──────────────────
            {
                id: "step_wc_nav_mgmt",
                type: "task",
                checklistLabel: "Open the Management Level step",
                goalAction: "wizard-step-management-level",
                nextStep: "step_wc_mgmt_purpose",
                guideMessage: "Click the 'Select your IDM Management Level' step.",
                hint: {
                    target: "wizard-step-management-level",
                    message: "Click 'Select your IDM Management Level' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 5. Management Level purpose ──────────────────────
            {
                id: "step_wc_mgmt_purpose",
                type: "observe",
                checklistLabel: "Explain the management level options",
                question: "What's the difference between Full and Password-Only management levels?",
                correctAnswer: "full",
                matchMode: "includes",
                successStep: "step_wc_nav_users",
                hint: {
                    message: "Think about scope — what does each level let Clever control in Google?",
                },
                autoShowHint: false,
            },
            // ── 6. Navigate to Users step ────────────────────────
            {
                id: "step_wc_nav_users",
                type: "task",
                checklistLabel: "Open the Select Users step",
                goalAction: "wizard-step-users",
                nextStep: "step_wc_users_purpose",
                guideMessage: "Click the 'Select users to provision' step.",
                hint: {
                    target: "wizard-step-users",
                    message: "Click 'Select users to provision' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 7. User types question ───────────────────────────
            {
                id: "step_wc_users_purpose",
                type: "observe",
                checklistLabel: "Identify which user types can be provisioned",
                question: "Which user types can be provisioned through the wizard?",
                correctAnswer: "students",
                matchMode: "includes",
                successStep: "step_wc_nav_ous",
                hint: {
                    message: "Look at the user selection options on this step.",
                },
                autoShowHint: false,
            },
            // ── 8. Navigate to OUs step ──────────────────────────
            {
                id: "step_wc_nav_ous",
                type: "task",
                checklistLabel: "Open the Organize OUs step",
                goalAction: "wizard-step-ous",
                nextStep: "step_wc_ous_purpose",
                guideMessage: "Click the 'Organize OUs' step.",
                hint: {
                    target: "wizard-step-ous",
                    message: "Click 'Organize OUs' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 9. OUs purpose ───────────────────────────────────
            {
                id: "step_wc_ous_purpose",
                type: "checkpoint",
                checklistLabel: "Explain what OUs are used for",
                question: "What are Organizational Units (OUs) used for in Google Workspace?",
                choices: [
                    { label: "Organizing user accounts into a folder structure so you can apply different policies and management rules per group", nextStep: "step_wc_nav_preview", correct: true },
                    { label: "Tracking student attendance and grade information", nextStep: "step_wc_ous_wrong", unguidedNextStep: "step_wc_nav_preview", correct: false },
                ],
                hint: {
                    message: "OUs are a Google concept — they organize accounts for policy management.",
                },
                autoShowHint: false,
            },
            // ── 9a. Wrong OUs answer ─────────────────────────────
            {
                id: "step_wc_ous_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Explain OUs (retry)",
                question: "OUs are a Google Workspace concept, not a student information system feature. They organize user accounts into a directory structure for applying different management policies.",
                choices: [
                    { label: "OUs organize accounts into a folder structure for applying policies", nextStep: "step_wc_nav_preview" },
                ],
            },
            // ── 10. Navigate to Preview step ─────────────────────
            {
                id: "step_wc_nav_preview",
                type: "task",
                checklistLabel: "Open the Preview and Provision step",
                goalAction: "wizard-step-preview",
                nextStep: "step_wc_preview_purpose",
                guideMessage: "Click the 'Preview and provision' step.",
                hint: {
                    target: "wizard-step-preview",
                    message: "Click 'Preview and provision' at the bottom of the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 11. Preview purpose ──────────────────────────────
            {
                id: "step_wc_preview_purpose",
                type: "checkpoint",
                checklistLabel: "Explain what Preview and Provision does",
                question: "What happens at the Preview and Provision step?",
                choices: [
                    { label: "You see a preview of all changes (accounts to create, update, archive) before they're applied to Google — nothing happens until you click Provision", nextStep: "step_wc_resolution", correct: true },
                    { label: "It automatically syncs everything immediately with no review step", nextStep: "step_wc_preview_wrong", unguidedNextStep: "step_wc_resolution", correct: false },
                ],
                hint: {
                    message: "Is Preview a review step or an automatic action?",
                },
                autoShowHint: false,
            },
            // ── 11a. Wrong Preview answer ────────────────────────
            {
                id: "step_wc_preview_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Explain Preview step (retry)",
                question: "The Preview step is a safety net — it shows you exactly what changes will be made before you commit. Nothing is applied until you explicitly click Provision.",
                choices: [
                    { label: "It shows a preview of changes before applying — you must click Provision to execute", nextStep: "step_wc_resolution" },
                ],
            },
            // ── 12. Resolution ───────────────────────────────────
            {
                id: "step_wc_resolution",
                type: "resolution",
                checklistLabel: "Report back to Marcus Thompson",
                question: "Choose the best board-ready description of the provisioning pipeline to send to Marcus:",
                choices: [
                    { label: "The wizard has 8 steps: Connect to Google (OAuth authorization), set Management Level (Full vs Password-Only), Select Users (students/teachers/staff), Set Credentials, Organize OUs, Configure Groups, Summary review, and Preview & Provision. Changes only apply when you click Provision.", nextStep: null, correct: true },
                    { label: "The wizard connects to Google and automatically provisions all users. There's no review step — changes apply immediately when you save.", nextStep: null, correct: false },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  MODULE 3 — Credential Configuration
    //  Two scenarios: email format change + credential format deep-dive
    // ═══════════════════════════════════════════════════════════════

    // ── Scenario 3A: Changing Student Email Format ────────────────
    {
        id: "scenario_idm_credentials",
        title: "Changing Student Email Format",
        description: "Navigate to the credentials step, identify the current student email format, and determine the new format.",
        customerId: "principalJones",
        moduleId: "mod_credentials",
        ticketSubject: "Student email format change request",
        ticketPriority: "normal",
        ticketNumber: 1005,
        ticketMessage: `So we decided to change how student emails work. Instead of rogeliowaelchi@cedarridgesd.org, we want first initial + last name — like rwaelchi@cedarridgesd.org. I'm told this is "in the wizard somewhere." That's all I've got. Good luck!`,
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Navigate to IDM ───────────────────────────────
            {
                id: "step_cred_nav_idm",
                type: "task",
                checklistLabel: "Navigate to the IDM page",
                goalRoute: "idm",
                nextStep: "step_cred_open_wizard",
                guideMessage: "Open the IDM page under User management in the sidebar.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management.",
                },
                autoShowHint: true,
            },
            // ── 2. Open the provisioning wizard ──────────────────
            {
                id: "step_cred_open_wizard",
                type: "task",
                checklistLabel: "Open the provisioning wizard",
                goalAction: "edit-provisioning",
                nextStep: "step_cred_nav_credentials",
                guideMessage: "Click the 'Edit Google provisioning' button.",
                hint: {
                    target: "edit-provisioning",
                    message: "Click the 'Edit Google provisioning' button.",
                },
                autoShowHint: true,
            },
            // ── 3. Navigate to credentials step ──────────────────
            {
                id: "step_cred_nav_credentials",
                type: "task",
                checklistLabel: "Open the Set Credentials step",
                goalAction: "wizard-step-credentials",
                nextStep: "step_cred_identify_format",
                guideMessage: "Click the 'Set login credentials' step (step 4) in the wizard sidebar.",
                hint: {
                    target: "wizard-step-credentials",
                    message: "Click 'Set login credentials' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 4. Identify the current format ───────────────────
            {
                id: "step_cred_identify_format",
                type: "observe",
                checklistLabel: "Read the current student email format",
                question: "What is the current email format shown on the Student credentials card?",
                guideMessage: "Look at the Student credentials card and read the EMAIL field.",
                correctAnswer: ["{{name.first}}{{name.last}}@cedarridgesd.org", "name.first name.last", "first name last name", "firstname lastname"],
                matchMode: "oneOf",
                successStep: "step_cred_where_to_edit",
                hint: {
                    target: "email-format-students",
                    message: "Look at the EMAIL field on the Student credentials card.",
                },
                autoShowHint: true,
            },
            // ── 5. Where to edit the format ──────────────────────
            {
                id: "step_cred_where_to_edit",
                type: "checkpoint",
                checklistLabel: "Identify where to edit the email format",
                question: "Where would you click to change the student email format?",
                choices: [
                    { label: "Click the 'Edit' button on the Student credentials card, then 'Edit your format' in the email section", nextStep: "step_cred_compute_email", correct: true },
                    { label: "Go to the SIS sync settings to change how names are imported", nextStep: "step_cred_where_wrong", unguidedNextStep: "step_cred_compute_email", correct: false },
                ],
                hint: {
                    target: "edit-credential-students",
                    message: "Look for an Edit button on the Student credentials card.",
                },
                autoShowHint: false,
            },
            // ── 5a. Wrong edit location ──────────────────────────
            {
                id: "step_cred_where_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Identify edit location (retry)",
                question: "SIS sync doesn't control email formats — that's handled in the credentials step. Look for an Edit button directly on the Student credentials card.",
                choices: [
                    { label: "Click 'Edit' on the Student credentials card to access the format editor", nextStep: "step_cred_compute_email" },
                ],
            },
            // ── 6. Compute the new email ─────────────────────────
            {
                id: "step_cred_compute_email",
                type: "observe",
                checklistLabel: "Compute the new email for a sample student",
                question: "Using the sample student Rogelio Waelchi, what would his email look like with the new first-initial + last-name format?",
                guideMessage: "First initial of 'Rogelio' = 'r', last name = 'waelchi', domain = 'cedarridgesd.org'.",
                correctAnswer: "rwaelchi@cedarridgesd.org",
                successStep: "step_cred_resolution",
                hint: {
                    message: "First initial of 'Rogelio' = 'r', last name = 'waelchi' → rwaelchi@cedarridgesd.org",
                },
                autoShowHint: false,
            },
            // ── 7. Resolution ────────────────────────────────────
            {
                id: "step_cred_resolution",
                type: "resolution",
                checklistLabel: "Report back to Principal Jones",
                question: "Choose the best response to send back to Principal Jones:",
                choices: [
                    { label: "The student email format is in the Credentials step (step 4) of the provisioning wizard. Currently it's firstname+lastname@cedarridgesd.org. To change it, click Edit on the Student card, then 'Edit your format.' The new format would produce emails like rwaelchi@cedarridgesd.org.", nextStep: null, correct: true },
                    { label: "Email formats can't be changed in the wizard. You'd need to contact Clever support to update the domain configuration.", nextStep: null, correct: false },
                ],
            },
        ],
    },

    // ── Scenario 3B: Understanding Credential Formats ──────────────
    {
        id: "scenario_credential_building",
        title: "Understanding Credential Formats",
        description: "Document the credential system for all user types including email patterns, password formats, and key concepts.",
        customerId: "sarahChen",
        moduleId: "mod_credentials",
        ticketSubject: "Document our credential system before we touch anything",
        ticketPriority: "normal",
        ticketNumber: 1006,
        ticketMessage: "Before we change any credential settings, I want to make sure we actually understand the current system. I've seen too many 'quick changes' turn into 'why can't 200 students log in.' Can you document the email and password formats for all user types? I also need fallback formats and how matching vs. creating works.",
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Navigate to IDM ──────────────────────────────
            {
                id: "step_cb_nav_idm",
                type: "task",
                checklistLabel: "Navigate to the IDM page",
                goalRoute: "idm",
                nextStep: "step_cb_open_wizard",
                guideMessage: "Open the IDM page under User management in the sidebar.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management.",
                },
                autoShowHint: true,
            },
            // ── 2. Open the wizard ───────────────────────────────
            {
                id: "step_cb_open_wizard",
                type: "task",
                checklistLabel: "Open the provisioning wizard",
                goalAction: "edit-provisioning",
                nextStep: "step_cb_nav_credentials",
                guideMessage: "Click the 'Edit Google provisioning' button.",
                hint: {
                    target: "edit-provisioning",
                    message: "Click the 'Edit Google provisioning' button.",
                },
                autoShowHint: true,
            },
            // ── 3. Navigate to credentials step ──────────────────
            {
                id: "step_cb_nav_credentials",
                type: "task",
                checklistLabel: "Open the Credentials step",
                goalAction: "wizard-step-credentials",
                nextStep: "step_cb_sis_variables",
                guideMessage: "Click the 'Set login credentials' step.",
                hint: {
                    target: "wizard-step-credentials",
                    message: "Click 'Set login credentials' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 4. SIS variables differ by type ──────────────────
            {
                id: "step_cb_sis_variables",
                type: "checkpoint",
                checklistLabel: "Understand SIS variable differences",
                question: "Looking at the credential cards, are the same SIS variables available for all user types when building email formats?",
                choices: [
                    { label: "No — each user type has its own SIS variables plus shared ones like First Name and Last Name", nextStep: "step_cb_domain_check", correct: true },
                    { label: "Yes — every user type uses the same set of variables", nextStep: "step_cb_sis_wrong", unguidedNextStep: "step_cb_domain_check", correct: false },
                ],
                hint: {
                    target: "credential-card-students",
                    message: "Compare the student and teacher credential cards — do they list the same variables?",
                },
                autoShowHint: false,
            },
            // ── 4a. Wrong SIS answer ─────────────────────────────
            {
                id: "step_cb_sis_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "SIS variables (retry)",
                question: "Students have Student Number, teachers have Teacher Number, and staff have Department — each type has unique variables. The shared variables (First Name, Last Name) are available to all.",
                choices: [
                    { label: "Right — each type has unique variables plus shared name fields", nextStep: "step_cb_domain_check" },
                ],
            },
            // ── 5. Check shared domain ───────────────────────────
            {
                id: "step_cb_domain_check",
                type: "observe",
                checklistLabel: "Identify the email domain",
                question: "What email domain do all three user types share?",
                guideMessage: "Check the email format on any credential card — what comes after the @ sign?",
                correctAnswer: "cedarridgesd.org",
                matchMode: "includes",
                successStep: "step_cb_password_assess",
                hint: {
                    target: "email-format-students",
                    message: "Look at the email format — the domain after @ is shared across all cards.",
                },
                autoShowHint: false,
            },
            // ── 6. Assess password formats ───────────────────────
            {
                id: "step_cb_password_assess",
                type: "checkpoint",
                checklistLabel: "Understand the student password format",
                question: "Looking at the student password format, what SIS data does it combine?",
                choices: [
                    { label: "Student number + grade + school SIS ID — three variables concatenated", nextStep: "step_cb_teacher_password", correct: true },
                    { label: "Student's first name and birthday", nextStep: "step_cb_password_wrong", unguidedNextStep: "step_cb_teacher_password", correct: false },
                ],
                hint: {
                    target: "credential-card-students",
                    message: "Look at the PASSWORD field on the Student card — what variables do you see?",
                },
                autoShowHint: false,
            },
            // ── 6a. Wrong password answer ────────────────────────
            {
                id: "step_cb_password_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Student password (retry)",
                question: "The student password field shows variables like student_number, grade, and school SIS ID concatenated together — not names or birthdays.",
                choices: [
                    { label: "The password combines student number + grade + school SIS ID", nextStep: "step_cb_teacher_password" },
                ],
            },
            // ── 7. Teacher password computation ──────────────────
            {
                id: "step_cb_teacher_password",
                type: "observe",
                checklistLabel: "Compute a sample teacher password",
                question: "The teacher password format uses the teacher number plus '0420'. Our sample teacher Betty Bauch has teacher number T001. What would her password be?",
                guideMessage: "Substitute T001 into the template {{teacher.teacher_number}}0420.",
                correctAnswer: "t0010420",
                matchMode: "exact",
                successStep: "step_cb_fallback_concept",
                hint: {
                    message: "Teacher number T001 + fixed string 0420 = T0010420",
                },
                autoShowHint: false,
            },
            // ── 8. Fallback concept ──────────────────────────────
            {
                id: "step_cb_fallback_concept",
                type: "checkpoint",
                checklistLabel: "Understand fallback email formats",
                question: "There's an option to add a 'fallback' email format. What is a fallback format used for?",
                choices: [
                    { label: "It's used when the primary format produces a duplicate — if two users would get the same email, the fallback creates a unique alternative", nextStep: "step_cb_matching_concept", correct: true },
                    { label: "It's the email address used when users forget their password", nextStep: "step_cb_fallback_wrong", unguidedNextStep: "step_cb_matching_concept", correct: false },
                ],
                hint: {
                    message: "Think about what happens when two students have the same name — their emails would conflict.",
                },
                autoShowHint: false,
            },
            // ── 8a. Wrong fallback answer ────────────────────────
            {
                id: "step_cb_fallback_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Fallback formats (retry)",
                question: "Password reset is handled differently. A fallback email format kicks in when the primary format would create a duplicate email address — ensuring every user gets a unique email.",
                choices: [
                    { label: "Fallback is for duplicate email conflicts, not password resets", nextStep: "step_cb_matching_concept" },
                ],
            },
            // ── 9. Matching vs. creating ─────────────────────────
            {
                id: "step_cb_matching_concept",
                type: "checkpoint",
                checklistLabel: "Understand matching vs. creating",
                question: "The credentials step mentions 'matching' and 'creating' emails. What's the difference?",
                choices: [
                    { label: "Matching links existing Google accounts to Clever users by SIS email. Creating builds new email addresses for users who don't have a Google account yet.", nextStep: "step_cb_staff_compute", correct: true },
                    { label: "They're the same thing — both create new Google accounts", nextStep: "step_cb_matching_wrong", unguidedNextStep: "step_cb_staff_compute", correct: false },
                ],
                hint: {
                    message: "One is about finding existing accounts, the other is about making new ones.",
                },
                autoShowHint: false,
            },
            // ── 9a. Wrong matching answer ────────────────────────
            {
                id: "step_cb_matching_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Matching vs creating (retry)",
                question: "They serve different purposes: matching uses the SIS email to find and link existing Google accounts automatically, while creating builds brand new addresses for unmatched users.",
                choices: [
                    { label: "Matching finds existing accounts, creating makes new ones", nextStep: "step_cb_staff_compute" },
                ],
            },
            // ── 10. Staff email computation ──────────────────────
            {
                id: "step_cb_staff_compute",
                type: "observe",
                checklistLabel: "Compute a sample staff email",
                question: "Using the current format, what would staff member Oswaldo Pouros's email address be?",
                guideMessage: "The format is {{name.first}}{{name.last}}@cedarridgesd.org. Substitute the name.",
                correctAnswer: ["oswaldopouros@cedarridgesd.org", "oswaldo.pouros@cedarridgesd.org"],
                matchMode: "oneOf",
                successStep: "step_cb_resolution",
                hint: {
                    message: "First name + last name + @domain: oswaldopouros@cedarridgesd.org",
                },
                autoShowHint: false,
            },
            // ── 11. Resolution ───────────────────────────────────
            {
                id: "step_cb_resolution",
                type: "resolution",
                checklistLabel: "Report back to Sarah Chen",
                question: "Choose the best summary of the credential system to send to Sarah:",
                choices: [
                    { label: "All three user types (students, teachers, staff) share the cedarridgesd.org domain but have different SIS variables per type. Passwords use SIS data (student number+grade for students, teacher number for teachers). Fallback formats handle duplicate emails. Matching links existing Google accounts by SIS email, while creating builds new addresses.", nextStep: null, correct: true },
                    { label: "All user types use the same SIS variables and the same password format. There's no difference between matching and creating accounts.", nextStep: null, correct: false },
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
        description: "Navigate to the OU step and trace how students, teachers, and staff are organized into Google OUs.",
        customerId: "lisaWilson",
        moduleId: "mod_ou_management",
        ticketSubject: "Parent asking why their kid's account is in a weird folder",
        ticketPriority: "normal",
        ticketNumber: 1007,
        ticketMessage: "Got a parent on the phone asking why their kid's Google account is 'in a folder called Cedar Ridge Middle School.' I told them I'd find out. I did not find out. Can you figure out how these OU things work and trace where a specific student would end up? I also need to understand teacher and staff placement.",
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Navigate to IDM ──────────────────────────────────
            {
                id: "step_on_nav_idm",
                type: "task",
                checklistLabel: "Navigate to the IDM page",
                goalRoute: "idm",
                nextStep: "step_on_open_wizard",
                guideMessage: "Open the IDM page under User management in the sidebar.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management.",
                },
                autoShowHint: true,
            },
            // ── 2. Open the wizard ──────────────────────────────────
            {
                id: "step_on_open_wizard",
                type: "task",
                checklistLabel: "Open the provisioning wizard",
                goalAction: "edit-provisioning",
                nextStep: "step_on_nav_ous",
                guideMessage: "Click the 'Edit Google provisioning' button.",
                hint: {
                    target: "edit-provisioning",
                    message: "Click the 'Edit Google provisioning' button.",
                },
                autoShowHint: true,
            },
            // ── 3. Navigate to OUs step ─────────────────────────────
            {
                id: "step_on_nav_ous",
                type: "task",
                checklistLabel: "Open the Organize OUs step",
                goalAction: "wizard-step-ous",
                nextStep: "step_on_student_structure",
                guideMessage: "Click the 'Organize OUs' step in the wizard sidebar.",
                hint: {
                    target: "wizard-step-ous",
                    message: "Click 'Organize OUs' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 4. Understand student OU structure ──────────────────
            {
                id: "step_on_student_structure",
                type: "checkpoint",
                checklistLabel: "Understand the student OU path",
                question: "Looking at the student OU configuration, how are students organized into the Google directory?",
                choices: [
                    { label: "Students are placed into /Students/{{school_name}}/{{student.grade}} — organized by school, then by grade level", nextStep: "step_on_rogelio_path", correct: true },
                    { label: "Students are placed into a flat /Students OU with no sub-organization", nextStep: "step_on_student_wrong", unguidedNextStep: "step_on_rogelio_path", correct: false },
                ],
                hint: {
                    message: "Look at the student OU path — does it have variables (curly braces) indicating sub-organization?",
                },
                autoShowHint: false,
            },
            // ── 4a. Wrong student structure ─────────────────────────
            {
                id: "step_on_student_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Student OU path (retry)",
                question: "The student path has dynamic variables — {{school_name}} and {{student.grade}}. This creates a school → grade hierarchy.",
                choices: [
                    { label: "Students go to /Students/{{school_name}}/{{student.grade}}", nextStep: "step_on_rogelio_path" },
                ],
            },
            // ── 5. Trace Rogelio's path ─────────────────────────────
            {
                id: "step_on_rogelio_path",
                type: "observe",
                checklistLabel: "Trace a student's resolved OU path",
                question: "Rogelio Waelchi attends Cedar Ridge Middle School, 7th grade. Using the template, what would his resolved OU path be?",
                guideMessage: "Substitute school=Cedar Ridge Middle School and grade=7th Grade into /Students/{{school_name}}/{{student.grade}}.",
                correctAnswer: ["/students/treutelside middle school/7th grade", "/students/treutelside middle school/7"],
                matchMode: "oneOf",
                successStep: "step_on_teacher_path",
                hint: {
                    message: "Substitute the variables: /Students/Cedar Ridge Middle School/7th Grade",
                },
                autoShowHint: false,
            },
            // ── 6. Teacher OU assessment ────────────────────────────
            {
                id: "step_on_teacher_path",
                type: "checkpoint",
                checklistLabel: "Identify the teacher OU path",
                question: "Do teachers have dynamic sub-OUs like students, or a fixed path?",
                choices: [
                    { label: "Teachers have a fixed path — /Users/Staff/Teachers with no dynamic variables", nextStep: "step_on_staff_structure", correct: true },
                    { label: "Teachers are organized by subject area, like /Teachers/{{subject}}", nextStep: "step_on_teacher_wrong", unguidedNextStep: "step_on_staff_structure", correct: false },
                ],
                hint: {
                    message: "Check the teacher OU configuration — does it have variables or just a static path?",
                },
                autoShowHint: false,
            },
            // ── 6a. Wrong teacher path ──────────────────────────────
            {
                id: "step_on_teacher_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Teacher OU path (retry)",
                question: "The teacher OU configuration shows a static path with no variables — /Users/Staff/Teachers.",
                choices: [
                    { label: "Teachers go to /Users/Staff/Teachers — a fixed path", nextStep: "step_on_staff_structure" },
                ],
            },
            // ── 7. Staff OU structure ───────────────────────────────
            {
                id: "step_on_staff_structure",
                type: "checkpoint",
                checklistLabel: "Understand staff OU organization",
                question: "How are staff accounts organized into OUs?",
                choices: [
                    { label: "Staff use sub-OUs organized by department — /Users/Staff/{{staff.department}}", nextStep: "step_on_oswaldo_path", correct: true },
                    { label: "Staff all go into one flat OU with no sub-organization", nextStep: "step_on_staff_wrong", unguidedNextStep: "step_on_oswaldo_path", correct: false },
                ],
                hint: {
                    message: "Check the staff OU path — does it have a department variable?",
                },
                autoShowHint: false,
            },
            // ── 7a. Wrong staff structure ───────────────────────────
            {
                id: "step_on_staff_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Staff OU structure (retry)",
                question: "The staff OU path has a department variable: /Users/Staff/{{staff.department}}.",
                choices: [
                    { label: "Staff are organized by department using sub-OUs", nextStep: "step_on_oswaldo_path" },
                ],
            },
            // ── 8. Trace Oswaldo's path ─────────────────────────────
            {
                id: "step_on_oswaldo_path",
                type: "observe",
                checklistLabel: "Trace a staff member's OU path",
                question: "Librarian Oswaldo Pouros is in the Operations department. What would his OU path be?",
                guideMessage: "Substitute department=Operations into /Users/Staff/{{staff.department}}.",
                correctAnswer: "/users/staff/operations",
                matchMode: "includes",
                successStep: "step_on_resolution",
                hint: {
                    message: "Substitute the department: /Users/Staff/Operations",
                },
                autoShowHint: false,
            },
            // ── 9. Resolution ───────────────────────────────────────
            {
                id: "step_on_resolution",
                type: "resolution",
                checklistLabel: "Report back to Lisa Wilson",
                question: "Choose the best explanation for Lisa about why a student's account is in the 'Cedar Ridge Middle School' folder:",
                choices: [
                    { label: "Student accounts are organized by school then grade. The 'Cedar Ridge Middle School' folder is part of the path /Students/Cedar Ridge Middle School/{{grade}}. Teachers go to a fixed /Users/Staff/Teachers path, and staff are organized by department.", nextStep: null, correct: true },
                    { label: "Google randomly assigns accounts to folders. There's no pattern — the parent shouldn't worry about it.", nextStep: null, correct: false },
                ],
            },
        ],
    },

    // ── Scenario 4B: OU Configuration & Policies ────────────────────
    {
        id: "scenario_ou_configuration",
        title: "OU Configuration & Policies",
        description: "Review archive and ignored OU policies and document lifecycle management for a board presentation.",
        customerId: "marcusThompson",
        moduleId: "mod_ou_management",
        ticketSubject: "Board wants our 'account lifecycle management strategy'",
        ticketPriority: "high",
        ticketNumber: 1008,
        ticketMessage: "The board wants to know our 'account lifecycle management strategy.' Yes, I know that sounds made up. But I need to present on what happens when a teacher retires, accounts go dormant, etc. Can you pull the archive and ignored-user policies, including what action we currently use and what alternatives exist?",
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Navigate to IDM ──────────────────────────────────
            {
                id: "step_oc_nav_idm",
                type: "task",
                checklistLabel: "Navigate to the IDM page",
                goalRoute: "idm",
                nextStep: "step_oc_open_wizard",
                guideMessage: "Open the IDM page under User management in the sidebar.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management.",
                },
                autoShowHint: true,
            },
            // ── 2. Open the wizard ──────────────────────────────────
            {
                id: "step_oc_open_wizard",
                type: "task",
                checklistLabel: "Open the provisioning wizard",
                goalAction: "edit-provisioning",
                nextStep: "step_oc_nav_ous",
                guideMessage: "Click the 'Edit Google provisioning' button.",
                hint: {
                    target: "edit-provisioning",
                    message: "Click the 'Edit Google provisioning' button.",
                },
                autoShowHint: true,
            },
            // ── 3. Navigate to OUs step ─────────────────────────────
            {
                id: "step_oc_nav_ous",
                type: "task",
                checklistLabel: "Open the Organize OUs step",
                goalAction: "wizard-step-ous",
                nextStep: "step_oc_archive_action",
                guideMessage: "Click the 'Organize OUs' step in the wizard sidebar.",
                hint: {
                    target: "wizard-step-ous",
                    message: "Click 'Organize OUs' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 4. Identify archive action ──────────────────────────
            {
                id: "step_oc_archive_action",
                type: "observe",
                checklistLabel: "Identify the current archive action",
                question: "What archive action is currently configured for users who leave the district?",
                guideMessage: "Check the archive OU configuration for the archiveAction setting.",
                correctAnswer: "move-suspend",
                matchMode: "includes",
                successStep: "step_oc_archive_difference",
                hint: {
                    message: "Look at the archive section — what action is selected?",
                },
                autoShowHint: false,
            },
            // ── 5. Archive action differences ───────────────────────
            {
                id: "step_oc_archive_difference",
                type: "checkpoint",
                checklistLabel: "Explain archive action options",
                question: "There are three archive actions available. What's the difference between 'move-suspend' and 'move-suspend-archive'?",
                choices: [
                    { label: "Move-suspend moves the account and suspends it. Move-suspend-archive does the same but also triggers Google's archive feature, which releases the user's license.", nextStep: "step_oc_ignored_handling", correct: true },
                    { label: "They're the same thing — just different labels for the same action", nextStep: "step_oc_archive_wrong", unguidedNextStep: "step_oc_ignored_handling", correct: false },
                ],
                hint: {
                    message: "The third word 'archive' triggers an additional Google feature. What does it do?",
                },
                autoShowHint: false,
            },
            // ── 5a. Wrong archive difference ────────────────────────
            {
                id: "step_oc_archive_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Archive actions (retry)",
                question: "They serve different purposes: move-suspend-archive adds Google's archive step, which releases the license and preserves account data differently.",
                choices: [
                    { label: "Move-suspend-archive releases the license via Google's archive feature", nextStep: "step_oc_ignored_handling" },
                ],
            },
            // ── 6. Ignored user handling ─────────────────────────────
            {
                id: "step_oc_ignored_handling",
                type: "observe",
                checklistLabel: "Identify ignored user handling",
                question: "How are ignored users handled? What happens to their accounts?",
                guideMessage: "Check the ignored OU handling configuration.",
                correctAnswer: "auto-suspend",
                matchMode: "includes",
                successStep: "step_oc_archive_vs_ignored",
                hint: {
                    message: "Look at the ignored OU section — what action is set?",
                },
                autoShowHint: false,
            },
            // ── 7. Archive vs ignored distinction ───────────────────
            {
                id: "step_oc_archive_vs_ignored",
                type: "checkpoint",
                checklistLabel: "Distinguish archive from ignored users",
                question: "What's the fundamental difference between archive and ignored users? The board will need a clear distinction.",
                choices: [
                    { label: "Archive is for users who departed the district (no longer in SIS). Ignored users are still in the SIS but their Google accounts are managed manually outside IDM.", nextStep: "step_oc_teacher_path", correct: true },
                    { label: "Archive and ignored are the same — both are for inactive users", nextStep: "step_oc_archive_ignored_wrong", unguidedNextStep: "step_oc_teacher_path", correct: false },
                ],
                hint: {
                    message: "One category is about users who left entirely, the other is about users still in the system but managed differently.",
                },
                autoShowHint: false,
            },
            // ── 7a. Wrong distinction ───────────────────────────────
            {
                id: "step_oc_archive_ignored_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Archive vs ignored (retry)",
                question: "They serve different purposes: archive is for departed users no longer in SIS data, while ignored users are still in the SIS but managed manually.",
                choices: [
                    { label: "Archive = departed from SIS, Ignored = still in SIS but manually managed", nextStep: "step_oc_teacher_path" },
                ],
            },
            // ── 8. Teacher path assessment ──────────────────────────
            {
                id: "step_oc_teacher_path",
                type: "checkpoint",
                checklistLabel: "Confirm teacher OU path type",
                question: "For the presentation: do teachers have dynamic sub-OUs or a fixed path?",
                choices: [
                    { label: "Teachers have a fixed path — /Users/Staff/Teachers with no dynamic variables", nextStep: "step_oc_resolution", correct: true },
                    { label: "Teachers are organized by subject area into sub-OUs", nextStep: "step_oc_teacher_wrong", unguidedNextStep: "step_oc_resolution", correct: false },
                ],
                hint: {
                    message: "Check the teacher OU configuration — is there a variable in the path?",
                },
                autoShowHint: false,
            },
            // ── 8a. Wrong teacher answer ────────────────────────────
            {
                id: "step_oc_teacher_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Teacher path (retry)",
                question: "The teacher OU path is static: /Users/Staff/Teachers — no variables, no dynamic sub-OUs.",
                choices: [
                    { label: "Teachers go to a fixed /Users/Staff/Teachers path", nextStep: "step_oc_resolution" },
                ],
            },
            // ── 9. Resolution ───────────────────────────────────────
            {
                id: "step_oc_resolution",
                type: "resolution",
                checklistLabel: "Report back to Marcus Thompson",
                question: "Choose the best lifecycle summary for Marcus's board presentation:",
                choices: [
                    { label: "When a teacher retires, their account is moved to the archive OU and suspended (move-suspend policy). Two other archive options exist, including one that releases the Google license. Manually-managed accounts use the 'ignored' category and are auto-suspended. Archive = departed from SIS; Ignored = still in SIS but managed outside IDM.", nextStep: null, correct: true },
                    { label: "All departing users are deleted immediately. There's no archive or manual management option in the system.", nextStep: null, correct: false },
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
        description: "Navigate to the Groups step and assess the current configuration for a coworker who wants to set up email lists.",
        customerId: "principalJones",
        moduleId: "mod_groups",
        ticketSubject: "Can we email all 7th graders at once?",
        ticketPriority: "normal",
        ticketNumber: 1009,
        ticketMessage: "Quick question — is there a way to email all 7th graders at once without me manually typing 90 email addresses? Someone mentioned 'Google Groups' and it sounded too good to be true. Can you check the current configuration and tell me what's set up?",
        nextScenario: null,
        settings: {},

        steps: [
            // ── 1. Navigate to IDM ──────────────────────────────────
            {
                id: "step_gs_nav_idm",
                type: "task",
                checklistLabel: "Navigate to the IDM page",
                goalRoute: "idm",
                nextStep: "step_gs_open_wizard",
                guideMessage: "Open the IDM page under User management in the sidebar.",
                hint: {
                    target: "idm",
                    message: "Click 'IDM' in the sidebar under User management.",
                },
                autoShowHint: true,
            },
            // ── 2. Open the wizard ──────────────────────────────────
            {
                id: "step_gs_open_wizard",
                type: "task",
                checklistLabel: "Open the provisioning wizard",
                goalAction: "edit-provisioning",
                nextStep: "step_gs_nav_groups",
                guideMessage: "Click the 'Edit Google provisioning' button.",
                hint: {
                    target: "edit-provisioning",
                    message: "Click the 'Edit Google provisioning' button.",
                },
                autoShowHint: true,
            },
            // ── 3. Navigate to Groups step ──────────────────────────
            {
                id: "step_gs_nav_groups",
                type: "task",
                checklistLabel: "Open the Configure Groups step",
                goalAction: "wizard-step-groups",
                nextStep: "step_gs_purpose",
                guideMessage: "Click the 'Configure Groups' step in the wizard sidebar.",
                hint: {
                    target: "wizard-step-groups",
                    message: "Click 'Configure Groups' in the sidebar.",
                },
                autoShowHint: true,
            },
            // ── 4. Groups vs OUs distinction ────────────────────────
            {
                id: "step_gs_purpose",
                type: "observe",
                checklistLabel: "Distinguish Groups from OUs",
                question: "How are Google Groups different from OUs?",
                correctAnswer: "email",
                matchMode: "includes",
                successStep: "step_gs_current_rules",
                hint: {
                    message: "Think about email lists vs. folder structures — they serve different purposes.",
                },
                autoShowHint: false,
            },
            // ── 5. Check current rules ──────────────────────────────
            {
                id: "step_gs_current_rules",
                type: "observe",
                checklistLabel: "Check how many rules are configured",
                question: "How many group membership rules are currently configured across all user types?",
                guideMessage: "Check the rulesConfigured count for all three user types.",
                correctAnswer: ["0", "zero", "none"],
                matchMode: "oneOf",
                successStep: "step_gs_rules_concept",
                hint: {
                    message: "Look at the configured rules count — all three user types show 0.",
                },
                autoShowHint: false,
            },
            // ── 6. Membership rules concept ─────────────────────────
            {
                id: "step_gs_rules_concept",
                type: "observe",
                checklistLabel: "Understand how membership rules work",
                question: "With 0 rules configured, nothing is automated. How do membership rules work when they're set up?",
                correctAnswer: "automatically",
                matchMode: "includes",
                successStep: "step_gs_managed_vs_manual",
                hint: {
                    message: "IDM is all about automation from SIS data. Would rules be manual or automatic?",
                },
                autoShowHint: false,
            },
            // ── 7. Managed vs manual groups ─────────────────────────
            {
                id: "step_gs_managed_vs_manual",
                type: "checkpoint",
                checklistLabel: "Distinguish IDM-managed from manual groups",
                question: "What's the difference between IDM-managed groups and groups created manually in Google Admin?",
                choices: [
                    { label: "IDM-managed groups are automatically synced — members added/removed based on SIS data. Manual groups exist independently and IDM doesn't touch them.", nextStep: "step_gs_zero_impact", correct: true },
                    { label: "There's no difference — IDM manages all Google Groups automatically", nextStep: "step_gs_managed_wrong", unguidedNextStep: "step_gs_zero_impact", correct: false },
                ],
                hint: {
                    message: "Pre-existing Google Groups were created before IDM. Does IDM control those too?",
                },
                autoShowHint: false,
            },
            // ── 7a. Wrong managed answer ────────────────────────────
            {
                id: "step_gs_managed_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Managed vs manual (retry)",
                question: "Only groups created through IDM rules are automatically synced. Any groups made manually in Google Admin are left untouched — IDM doesn't know about them.",
                choices: [
                    { label: "IDM only manages groups it creates via rules — manual groups are independent", nextStep: "step_gs_zero_impact" },
                ],
            },
            // ── 8. What happens with 0 rules ────────────────────────
            {
                id: "step_gs_zero_impact",
                type: "checkpoint",
                checklistLabel: "Assess impact of 0 configured rules",
                question: "Since we have 0 rules, what happens with groups during each sync?",
                choices: [
                    { label: "Nothing — IDM completely skips group management. No groups are created or modified.", nextStep: "step_gs_resolution", correct: true },
                    { label: "IDM still syncs all existing Google Groups even with 0 rules", nextStep: "step_gs_zero_wrong", unguidedNextStep: "step_gs_resolution", correct: false },
                ],
                hint: {
                    message: "With no rules telling IDM what to do, what would it do?",
                },
                autoShowHint: false,
            },
            // ── 8a. Wrong zero rules answer ─────────────────────────
            {
                id: "step_gs_zero_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Zero rules impact (retry)",
                question: "With no rules, IDM has no instructions for group management. It skips the groups step entirely during sync — no groups created, no memberships changed.",
                choices: [
                    { label: "0 rules means IDM does nothing with groups during sync", nextStep: "step_gs_resolution" },
                ],
            },
            // ── 9. Resolution ───────────────────────────────────────
            {
                id: "step_gs_resolution",
                type: "resolution",
                checklistLabel: "Report back to Principal Jones",
                question: "Choose the best response for Principal Jones about setting up automated grade-level email lists:",
                choices: [
                    { label: "Good news — IDM can automate Google Group membership, but currently 0 rules are configured so nothing is active. To set up grade-level email lists (like 7th-grade-students@), we'd need to create membership rules using the SIS grade field. IDM will then automatically add/remove students during each sync.", nextStep: null, correct: true },
                    { label: "IDM doesn't support Google Groups. You'd need to manage email lists manually in Google Admin.", nextStep: null, correct: false },
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
        description: "Navigate to Summary and Preview steps, assess whether it's safe to provision.",
        customerId: "sarahChen",
        moduleId: "mod_review_provision",
        ticketSubject: "Pre-provisioning safety check",
        ticketPriority: "high",
        ticketNumber: 1010,
        nextScenario: null,
        settings: {},
        ticketMessage: "We're close to running our next provisioning cycle. Before anyone clicks any buttons, I want a second pair of eyes on the Summary and Preview. Last time someone provisioned without checking, three teachers got duplicate accounts. That was a fun week. Can you walk me through what they show and whether it's safe to provision?",

        steps: [
            // ── 1. Navigate to the Summary wizard step ───────────────
            {
                id: "step_rp_nav_summary",
                type: "task",
                checklistLabel: "Navigate to the Summary wizard step",
                guideMessage: "Open the Summary step (step 7) in the provisioning wizard.",
                goalRoute: "idm/provisioning/summary",
                hint: {
                    message: "Click Edit Provisioning on the IDM page, then click the Summary step in the wizard sidebar.",
                    target: "[data-instruction-target='wizard-step-summary']",
                },
                autoShowHint: false,
                nextStep: "step_rp_summary_purpose",
            },
            // ── 2. Assess Summary step purpose ────────────────────────
            {
                id: "step_rp_summary_purpose",
                type: "checkpoint",
                checklistLabel: "Determine the purpose of the Summary step",
                question: "You're now on the Summary step. What is this step for?",
                choices: [
                    { label: "A read-only review of every configuration choice across the wizard, with Edit buttons to jump back and make changes", nextStep: "step_rp_nav_preview", correct: true },
                    { label: "This is where you input all your final settings before provisioning", nextStep: "step_rp_summary_wrong", unguidedNextStep: "step_rp_nav_preview", correct: false },
                ],
                hint: {
                    message: "Notice there are no input fields — only a display of settings and Edit links.",
                },
                autoShowHint: false,
            },
            // ── 2a. Wrong summary purpose ────────────────────────────
            {
                id: "step_rp_summary_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Summary step purpose (retry)",
                question: "Each wizard step already has its own configuration inputs. The Summary step has no editable fields — it just displays what's already been set, with Edit buttons that link back.",
                choices: [
                    { label: "Got it — Summary is read-only, Edit buttons link back to the relevant step", nextStep: "step_rp_nav_preview" },
                ],
            },
            // ── 3. Navigate to the Preview step ──────────────────────
            {
                id: "step_rp_nav_preview",
                type: "task",
                checklistLabel: "Navigate to the Preview & Provision step",
                guideMessage: "Open the Preview and Provision step (step 8) in the wizard.",
                goalRoute: "idm/provisioning/preview",
                hint: {
                    message: "Click the Preview and Provision step in the wizard sidebar.",
                    target: "[data-instruction-target='wizard-step-preview']",
                },
                autoShowHint: false,
                nextStep: "step_rp_accounts_create",
            },
            // ── 4. Read accounts to create ────────────────────────────
            {
                id: "step_rp_accounts_create",
                type: "observe",
                checklistLabel: "Check how many accounts will be created",
                question: "Look at the Preview data. How many accounts will be created?",
                guideMessage: "Check the accountsToCreate value on the preview page.",
                correctAnswer: ["1", "one"],
                matchMode: "oneOf",
                successStep: "step_rp_matched",
                hint: {
                    message: "The Preview shows 1 account will be created.",
                },
                autoShowHint: false,
            },
            // ── 5. Matched accounts ──────────────────────────────────
            {
                id: "step_rp_matched",
                type: "observe",
                checklistLabel: "Check how many accounts were matched",
                question: "How many accounts were matched with existing Google accounts?",
                guideMessage: "Check the Matched row in the preview details.",
                correctAnswer: ["0", "zero", "none"],
                matchMode: "oneOf",
                successStep: "step_rp_match_vs_create",
                hint: {
                    message: "The Preview shows 0 matched accounts.",
                },
                autoShowHint: false,
            },
            // ── 6. Diagnostic: matched vs created ─────────────────────
            {
                id: "step_rp_match_vs_create",
                type: "checkpoint",
                checklistLabel: "Explain matched vs created accounts",
                question: "What's the difference between a 'Matched' account and a 'Created' account in this preview?",
                choices: [
                    { label: "Matched = IDM linked a Clever user to an existing Google account. Created = IDM will build a brand-new Google account.", nextStep: "step_rp_sync_issues", correct: true },
                    { label: "They're the same thing — both create new Google accounts", nextStep: "step_rp_match_wrong", unguidedNextStep: "step_rp_sync_issues", correct: false },
                ],
                hint: {
                    message: "The preview lists them separately because they're different operations — one links, the other builds.",
                },
                autoShowHint: false,
            },
            // ── 6a. Wrong matched vs created ──────────────────────────
            {
                id: "step_rp_match_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Matched vs created (retry)",
                question: "They're listed as separate rows because they're different operations. Matched links a Clever user to a Google account that already exists. Created builds a new Google account from scratch.",
                choices: [
                    { label: "Matched = link existing, Created = build new", nextStep: "step_rp_sync_issues" },
                ],
            },
            // ── 7. Sync issues ───────────────────────────────────────
            {
                id: "step_rp_sync_issues",
                type: "observe",
                checklistLabel: "Check sync issues count",
                question: "How many sync issues does the Preview show?",
                guideMessage: "Check the syncIssues value on the preview page.",
                correctAnswer: ["0", "zero", "none"],
                matchMode: "oneOf",
                successStep: "step_rp_last_run",
                hint: {
                    message: "The preview shows 0 sync issues.",
                },
                autoShowHint: false,
            },
            // ── 8. Last preview run ──────────────────────────────────
            {
                id: "step_rp_last_run",
                type: "observe",
                checklistLabel: "Check when the preview was last run",
                question: "When was the preview last run? Is the data recent enough to trust?",
                guideMessage: "Check the lastRun value on the preview page.",
                correctAnswer: "3 months ago",
                matchMode: "includes",
                successStep: "step_rp_conflicts",
                hint: {
                    message: "The preview shows it was last run 3 months ago.",
                },
                autoShowHint: false,
            },
            // ── 9. Conflicts meaning ─────────────────────────────────
            {
                id: "step_rp_conflicts",
                type: "checkpoint",
                checklistLabel: "Explain what a preview conflict means",
                question: "The preview has a 'Conflicts' row. What does a conflict mean in this context?",
                choices: [
                    { label: "A user's email is already taken by another Clever IDM user, blocking account creation or matching — a duplicate email issue", nextStep: "step_rp_safe_to_provision", correct: true },
                    { label: "Two different wizard settings disagree with each other", nextStep: "step_rp_conflicts_wrong", unguidedNextStep: "step_rp_safe_to_provision", correct: false },
                ],
                hint: {
                    message: "Conflicts are about user accounts, not wizard settings. Think about duplicate emails.",
                },
                autoShowHint: false,
            },
            // ── 9a. Wrong conflicts answer ───────────────────────────
            {
                id: "step_rp_conflicts_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Preview conflicts (retry)",
                question: "In the Preview context, conflicts are about user accounts — specifically, when a user's email would duplicate another Clever IDM user's email, preventing the operation.",
                choices: [
                    { label: "Conflicts = duplicate emails blocking account operations", nextStep: "step_rp_safe_to_provision" },
                ],
            },
            // ── 10. Resolution: is it safe? ──────────────────────────
            {
                id: "step_rp_safe_to_provision",
                type: "resolution",
                checklistLabel: "Report to Sarah whether it's safe to provision",
                question: "Based on everything you've seen — 1 create, 0 matched, 0 issues, 0 conflicts, but the preview is 3 months old — what should you tell Sarah?",
                choices: [
                    { label: "The preview looks clean (1 create, 0 issues, 0 conflicts), but the data is 3 months old. I'd recommend re-running the preview with fresh data before clicking Provision.", nextStep: null, correct: true },
                    { label: "Everything looks fine. Go ahead and provision immediately.", nextStep: null, correct: false },
                ],
            },
        ],
    },

    // ── Scenario 6B: End-to-End Sync Management ─────────────────────
    {
        id: "scenario_sync_management",
        title: "End-to-End Provisioning Flow",
        description: "Trace the full provisioning pipeline from Connect through Preview, including a Pause Sync assessment.",
        customerId: "lisaWilson",
        moduleId: "mod_review_provision",
        ticketSubject: "End-to-end provisioning walkthrough (+ where's the off switch?)",
        ticketPriority: "normal",
        ticketNumber: 1011,
        nextScenario: null,
        settings: {},
        ticketMessage: "I've heard bits and pieces about how provisioning works but I want the full picture — start to finish. Also, where's the emergency stop button? Asking for peace of mind.",

        steps: [
            // ── 1. Navigate to the Connect step ──────────────────────
            {
                id: "step_sm_nav_connect",
                type: "task",
                checklistLabel: "Navigate to the Connect step (step 1)",
                guideMessage: "Open the Connect step (step 1) in the provisioning wizard.",
                goalRoute: "idm/provisioning/connect",
                hint: {
                    message: "Click Edit Provisioning on the IDM page, then click the Connect step in the wizard sidebar.",
                    target: "[data-instruction-target='wizard-step-connect']",
                },
                autoShowHint: false,
                nextStep: "step_sm_connect_purpose",
            },
            // ── 2. What Connect does ─────────────────────────────────
            {
                id: "step_sm_connect_purpose",
                type: "observe",
                checklistLabel: "Identify the purpose of the Connect step",
                question: "You're on the first wizard step. What does the Connect step handle?",
                correctAnswer: "authenticat",
                matchMode: "includes",
                successStep: "step_sm_nav_summary",
                hint: {
                    message: "Step 1 is about connecting to Google — authentication and API access.",
                },
                autoShowHint: false,
            },
            // ── 3. Navigate to Summary ────────────────────────────────
            {
                id: "step_sm_nav_summary",
                type: "task",
                checklistLabel: "Navigate to the Summary step (step 7)",
                guideMessage: "Jump to the Summary step in the wizard sidebar.",
                goalRoute: "idm/provisioning/summary",
                hint: {
                    message: "Click the Summary step in the wizard sidebar.",
                    target: "[data-instruction-target='wizard-step-summary']",
                },
                autoShowHint: false,
                nextStep: "step_sm_summary_role",
            },
            // ── 4. Summary role ──────────────────────────────────────
            {
                id: "step_sm_summary_role",
                type: "checkpoint",
                checklistLabel: "Explain what Summary does in the pipeline",
                question: "You've jumped from step 1 to step 7. What role does Summary play in the pipeline?",
                choices: [
                    { label: "It's a read-only review of every configuration choice, with Edit buttons to jump back — the safety check before Preview", nextStep: "step_sm_nav_preview", correct: true },
                    { label: "It's where you enter your final configuration settings", nextStep: "step_sm_summary_wrong", unguidedNextStep: "step_sm_nav_preview", correct: false },
                ],
                hint: {
                    message: "Summary has no input fields — it's a review page with Edit links.",
                },
                autoShowHint: false,
            },
            // ── 4a. Wrong Summary answer ─────────────────────────────
            {
                id: "step_sm_summary_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Summary role (retry)",
                question: "Each step (2-6) has its own inputs. Summary (step 7) displays all those choices in one place with Edit buttons — it's read-only.",
                choices: [
                    { label: "Summary = read-only review with Edit buttons, no new inputs", nextStep: "step_sm_nav_preview" },
                ],
            },
            // ── 5. Navigate to Preview ────────────────────────────────
            {
                id: "step_sm_nav_preview",
                type: "task",
                checklistLabel: "Navigate to Preview & Provision (step 8)",
                guideMessage: "Open the Preview and Provision step (step 8) in the wizard.",
                goalRoute: "idm/provisioning/preview",
                hint: {
                    message: "Click the Preview and Provision step in the wizard sidebar.",
                    target: "[data-instruction-target='wizard-step-preview']",
                },
                autoShowHint: false,
                nextStep: "step_sm_archives_count",
            },
            // ── 6. Archives count ────────────────────────────────────
            {
                id: "step_sm_archives_count",
                type: "observe",
                checklistLabel: "Check accounts to archive",
                question: "How many accounts will be archived according to the preview?",
                guideMessage: "Check the accountsToArchive value on the preview page.",
                correctAnswer: ["0", "zero", "none"],
                matchMode: "oneOf",
                successStep: "step_sm_provision_meaning",
                hint: {
                    message: "The preview shows 0 accounts will be archived.",
                },
                autoShowHint: false,
            },
            // ── 7. What Provision does ────────────────────────────────
            {
                id: "step_sm_provision_meaning",
                type: "checkpoint",
                checklistLabel: "Explain what clicking Provision does",
                question: "You can see the Provision button on this page. What actually happens when you click it?",
                choices: [
                    { label: "It applies all configured changes to Google Workspace — creating, updating, and archiving accounts based on the preview data", nextStep: "step_sm_nav_idm", correct: true },
                    { label: "It just saves your settings and closes the wizard", nextStep: "step_sm_provision_wrong", unguidedNextStep: "step_sm_nav_idm", correct: false },
                ],
                hint: {
                    message: "Provision is the action step — it makes real changes in Google Workspace.",
                },
                autoShowHint: false,
            },
            // ── 7a. Wrong provision answer ────────────────────────────
            {
                id: "step_sm_provision_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Provision action (retry)",
                question: "'Provision' is the action that makes changes happen. It creates, updates, and archives Google accounts according to the preview data. In the simulator it shows a toast confirmation.",
                choices: [
                    { label: "Provision = apply all changes to Google Workspace", nextStep: "step_sm_nav_idm" },
                ],
            },
            // ── 8. Navigate back to IDM page ──────────────────────────
            {
                id: "step_sm_nav_idm",
                type: "task",
                checklistLabel: "Navigate back to the IDM page",
                guideMessage: "Go back to the main IDM page (Identity Management in the sidebar).",
                goalRoute: "identity-management",
                hint: {
                    message: "Click Identity Management in the left sidebar to return to the IDM overview.",
                },
                autoShowHint: false,
                nextStep: "step_sm_pause_sync",
            },
            // ── 9. Locate Pause Sync ──────────────────────────────────
            {
                id: "step_sm_pause_sync",
                type: "checkpoint",
                checklistLabel: "Locate and explain the Pause Sync button",
                question: "Lisa asked about stopping syncs in an emergency. You can see the Pause Sync button on the IDM page. When would you use it?",
                choices: [
                    { label: "When something goes wrong during a sync — like incorrect accounts being created or credentials being overwritten — Pause Sync stops all future syncs until you investigate and resume", nextStep: "step_sm_resolution", correct: true },
                    { label: "You use it to permanently disconnect Google Workspace from Clever", nextStep: "step_sm_pause_wrong", unguidedNextStep: "step_sm_resolution", correct: false },
                ],
                hint: {
                    message: "Pause is temporary, not permanent. Think emergency stop, not disconnect.",
                    target: "[data-instruction-target='pause-sync']",
                },
                autoShowHint: false,
            },
            // ── 9a. Wrong pause answer ────────────────────────────────
            {
                id: "step_sm_pause_wrong",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Pause Sync purpose (retry)",
                question: "Pause Sync is a temporary halt — it stops syncs until you investigate and resume. It doesn't disconnect the integration. You'd use it when something unexpected is happening during syncs.",
                choices: [
                    { label: "Pause = temporary emergency stop, Resume to restart syncs", nextStep: "step_sm_resolution" },
                ],
            },
            // ── 10. Resolution ───────────────────────────────────────
            {
                id: "step_sm_resolution",
                type: "resolution",
                checklistLabel: "Report to Lisa with the full pipeline summary",
                question: "Choose the best summary to give Lisa about the full provisioning pipeline:",
                choices: [
                    { label: "The 8-step wizard runs from Connect (Google auth) through Preview & Provision (go-live). Summary is your safety review, Preview shows impact numbers, and Provision applies the changes. If anything goes wrong, Pause Sync on the IDM page halts all syncs until you investigate.", nextStep: null, correct: true },
                    { label: "Just click through the 8 steps and hit Provision at the end. If syncs break, disconnect Google.", nextStep: null, correct: false },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  MODULE 7 — Troubleshooting
    // ═══════════════════════════════════════════════════════════════

    {
        id: "scenario_sync_failure",
        title: "Sync Failure Investigation",
        description: "Investigate a failed IDM sync and report the likely root cause.",
        customerId: "sarahChen",
        moduleId: "mod_troubleshooting",
        ticketSubject: "Students missing Google accounts — sync issue?",
        ticketPriority: "high",
        ticketNumber: 1012,
        ticketMessage: "Teachers are reporting that several new students don't have Google accounts. I checked the enrollment list — they're definitely in the SIS. Something went wrong with the sync. Can you investigate before this becomes a Thing?",
        nextScenario: null,
        settings: {
            dataOverrides: {
                idm: {
                    syncHistory: [
                        { destination: "Google", dateTime: "Feb 20, 2026; 04:45:53 a.m.", creates: 0, matches: 30, updates: 0, archives: 0, issues: 7, status: "Failed" },
                        { destination: "Google", dateTime: "Feb 19, 2026; 04:45:51 a.m.", creates: 2, matches: 38, updates: 1, archives: 0, issues: 1, status: "Success" },
                    ],
                    events: [
                        { date: "Feb 20, 2026; 04:45:53 a.m.", event: "Failed", destination: "Google Workspace", user: "System", sisId: "N/A", destinationUsername: "N/A", userType: "System", modifiedFields: [{ field: "Error", value: "Credential template produced duplicate usernames" }] },
                    ],
                },
            },
        },
        steps: [
            {
                id: "step_sf_nav_idm",
                type: "task",
                checklistLabel: "Open IDM",
                goalRoute: "idm",
                nextStep: "step_sf_check_sync",
                guideMessage: "Open IDM to inspect sync health.",
                autoShowHint: true,
            },
            {
                id: "step_sf_check_sync",
                type: "checkpoint",
                checklistLabel: "Assess latest sync outcome",
                question: "What does the most recent sync entry indicate?",
                choices: [
                    { label: "The latest sync failed and has elevated issues", nextStep: "step_sf_open_events", correct: true },
                    { label: "Everything looks healthy and successful", nextStep: "step_sf_wrong_sync", unguidedNextStep: "step_sf_open_events", correct: false },
                ],
            },
            {
                id: "step_sf_wrong_sync",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Assess latest sync outcome (retry)",
                question: "Re-check the newest row. Is the run successful or failed?",
                choices: [{ label: "Failed with issues", nextStep: "step_sf_open_events" }],
            },
            {
                id: "step_sf_open_events",
                type: "task",
                checklistLabel: "Open Events tab",
                goalAction: "idm-tab-events",
                nextStep: "step_sf_identify_error",
                guideMessage: "Open Events to inspect the failure reason.",
                autoShowHint: true,
            },
            {
                id: "step_sf_identify_error",
                type: "checkpoint",
                checklistLabel: "Identify root-cause theme",
                question: "Which root cause is most consistent with the failure event details?",
                choices: [
                    { label: "Credential format collision/duplicate username generation", nextStep: "step_sf_resolution", correct: true },
                    { label: "Google service outage only", nextStep: "step_sf_wrong_root", unguidedNextStep: "step_sf_resolution", correct: false },
                ],
            },
            {
                id: "step_sf_wrong_root",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Identify root-cause theme (retry)",
                question: "The event references duplicate usernames. Which area should be reviewed first?",
                choices: [{ label: "Credential format/template logic", nextStep: "step_sf_resolution" }],
            },
            {
                id: "step_sf_resolution",
                type: "resolution",
                checklistLabel: "Report findings",
                question: "Choose the best report-back summary:",
                choices: [
                    { label: "Latest sync failed with elevated issues. Event details indicate duplicate username collisions from credential format logic. We should review credential templates, fix collisions, and rerun sync.", nextStep: null, correct: true },
                    { label: "No action needed; sync is healthy and student accounts should appear automatically.", nextStep: null, correct: false },
                ],
            },
        ],
    },

    {
        id: "scenario_missing_teacher",
        title: "Missing Teacher Account",
        description: "Investigate why a newly hired teacher does not have a Google account.",
        customerId: "marcusThompson",
        moduleId: "mod_troubleshooting",
        ticketSubject: "Betty Bauch still can't log in",
        ticketPriority: "high",
        ticketNumber: 1013,
        ticketMessage: "We hired Betty Bauch last week and she still can't log into Google. She's been very patient about it, which somehow makes it worse. Can you find out what's blocking her account?",
        nextScenario: null,
        settings: {
            dataOverrides: {
                idm: {
                    events: [
                        { date: "Feb 20, 2026; 04:45:53 a.m.", event: "Failed", destination: "Google Workspace", user: "Betty Bauch", sisId: "teacher-4455", destinationUsername: "betty.bauch@cedarridgesd.org", userType: "Teacher", modifiedFields: [{ field: "Error", value: "Primary email already exists in Google" }] },
                    ],
                },
            },
        },
        steps: [
            {
                id: "step_mt_nav_idm",
                type: "task",
                checklistLabel: "Open IDM",
                goalRoute: "idm",
                nextStep: "step_mt_open_events",
                guideMessage: "Open IDM to inspect account events.",
                autoShowHint: true,
            },
            {
                id: "step_mt_open_events",
                type: "task",
                checklistLabel: "Open Events tab",
                goalAction: "idm-tab-events",
                nextStep: "step_mt_find_teacher",
                guideMessage: "Go to Events and find Betty Bauch.",
                autoShowHint: true,
            },
            {
                id: "step_mt_find_teacher",
                type: "observe",
                checklistLabel: "Confirm Betty's event status",
                question: "What status appears for Betty Bauch's recent event?",
                correctAnswer: "failed",
                matchMode: "includes",
                successStep: "step_mt_root_cause",
            },
            {
                id: "step_mt_root_cause",
                type: "checkpoint",
                checklistLabel: "Identify likely cause",
                question: "What is the most likely root cause for Betty's missing account?",
                choices: [
                    { label: "Email conflict — target address already exists", nextStep: "step_mt_resolution", correct: true },
                    { label: "OU placement missing prevents account creation every time", nextStep: "step_mt_wrong_root", unguidedNextStep: "step_mt_resolution", correct: false },
                ],
            },
            {
                id: "step_mt_wrong_root",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Identify likely cause (retry)",
                question: "Event details explicitly call out an already-existing primary email. Which issue should be addressed?",
                choices: [{ label: "Resolve duplicate/conflicting email", nextStep: "step_mt_resolution" }],
            },
            {
                id: "step_mt_resolution",
                type: "resolution",
                checklistLabel: "Report findings",
                question: "Choose the best response:",
                choices: [
                    { label: "Betty's creation event failed due to an existing primary email conflict. We should resolve the duplicate email/identity conflict, then rerun provisioning.", nextStep: null, correct: true },
                    { label: "No issues found in IDM. Ask Betty to wait another week.", nextStep: null, correct: false },
                ],
            },
        ],
    },

    {
        id: "scenario_stale_provisioning",
        title: "Stale Provisioning Check",
        description: "Validate whether provisioning appears stale and what to do next.",
        customerId: "lisaWilson",
        moduleId: "mod_troubleshooting",
        ticketSubject: "Is provisioning still running? Things look stale.",
        ticketPriority: "normal",
        ticketNumber: 1014,
        ticketMessage: "When's the last time provisioning actually ran? Because I'm looking at some accounts that seem... stale. Like, 'hasn't-synced-in-weeks' stale. Can you check?",
        nextScenario: null,
        settings: {
            dataOverrides: {
                idm: {
                    syncHistory: [
                        { destination: "Google", dateTime: "Feb 03, 2026; 04:45:27 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 0, status: "Success" },
                        { destination: "Google", dateTime: "Jan 27, 2026; 04:45:27 a.m.", creates: 1, matches: 39, updates: 0, archives: 0, issues: 0, status: "Success" },
                    ],
                },
            },
        },
        steps: [
            {
                id: "step_sp_nav_idm",
                type: "task",
                checklistLabel: "Open IDM",
                goalRoute: "idm",
                nextStep: "step_sp_open_sync",
                guideMessage: "Open IDM and inspect sync recency.",
                autoShowHint: true,
            },
            {
                id: "step_sp_open_sync",
                type: "task",
                checklistLabel: "Open Sync History tab",
                goalAction: "idm-tab-sync-history",
                nextStep: "step_sp_assess_recency",
                guideMessage: "Open Sync History to compare recent run dates.",
                autoShowHint: true,
            },
            {
                id: "step_sp_assess_recency",
                type: "checkpoint",
                checklistLabel: "Assess sync freshness",
                question: "Based on the latest run timestamps, what is the best assessment?",
                choices: [
                    { label: "Provisioning appears stale (runs are not recent/daily), so investigation is needed", nextStep: "step_sp_resolution", correct: true },
                    { label: "Provisioning is current and running daily", nextStep: "step_sp_wrong_recency", unguidedNextStep: "step_sp_resolution", correct: false },
                ],
            },
            {
                id: "step_sp_wrong_recency",
                type: "checkpoint",
                scored: false,
                checklistLabel: "Assess sync freshness (retry)",
                question: "The most recent run is significantly old. Is this normal for daily IDM operations?",
                choices: [{ label: "No — this is stale and needs follow-up", nextStep: "step_sp_resolution" }],
            },
            {
                id: "step_sp_resolution",
                type: "resolution",
                checklistLabel: "Report findings",
                question: "Choose the best summary for the Tech Director:",
                choices: [
                    { label: "Sync history appears stale and not on the expected cadence. We should verify pause/schedule/config health and resume normal run cadence.", nextStep: null, correct: true },
                    { label: "Everything is normal; no follow-up required.", nextStep: null, correct: false },
                ],
            },
        ],
    },
];
