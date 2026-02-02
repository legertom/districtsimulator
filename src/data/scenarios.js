export const scenarios = [
    {
        id: "scenario_find_district_id",
        title: "Finding District ID",
        description: "Help Principal Jones find the District ID.",
        steps: [

            {
                id: "step_welcome",
                type: "message",
                text: "Hi! I need to find our District ID for a support ticket. Do you know where it is?",
                sender: "customer",
                actions: [
                    { label: "One moment, I'll find it.", nextStep: "step_nav_data_browser" },
                    { label: "Check the 'Support tools' tab.", nextStep: "step_wrong_support" }
                ]
            },
            {
                id: "step_wrong_support",
                type: "message",
                text: "I looked in Support tools, but I don't see a District ID listed there.",
                sender: "customer",
                actions: [
                    { label: "My apologies. It should be in the Data Browser.", nextStep: "step_nav_data_browser" },
                    { label: "Let me look again.", nextStep: "step_nav_data_browser" }
                ]
            },
            {
                id: "step_nav_data_browser",
                type: "task",
                text: "Thanks, I'll be here.", // Acknowledge the user's action
                sender: "customer",
                goalRoute: "data-browser",
                guideMessage: "Navigate to the 'Data browser' page",
                hint: {
                    target: "data-browser",
                    message: "Navigate to the 'Data browser' page."
                },
                autoShowHint: true
            },
            {
                id: "step_locate_id",
                type: "input",
                text: null, // Jones is silent, waiting for answer.
                sender: "customer",
                guideMessage: "Enter the District ID to continue", // Meta instruction
                correctAnswer: "68759062d10d9a9ab79dbe04",
                successStep: "step_success",
                hint: {
                    target: "district-id-val",
                    message: "It's near the top of the page, labeled 'DISTRICT ID'."
                },
                autoShowHint: true
            },
            {
                id: "step_success",
                type: "message",
                text: "That's exactly right! Thank you for finding that.",
                sender: "customer",
                actions: [
                    { label: "Happy to help!", nextStep: null },
                    { label: "You're welcome, Principal Jones.", nextStep: null }
                ]
            }
        ]
    }
];
