/**
 * Chat domain data
 * Extracted from: ChatPanel.jsx
 */

export const initialMessages = [
    {
        id: 1,
        sender: "customer",
        text: "Hi! I'm Principal Jones at Cedar Ridge Elementary. Welcome to the team! I heard you're the new Clever admin.",
        timestamp: "2:30 PM",
    },
    {
        id: 2,
        sender: "customer",
        text: "I need to add a new teacher to the system and I'm told you're the person to talk to now. Can you walk me through it?",
        timestamp: "2:31 PM",
    },
];

export const customerInfo = {
    name: "Principal Jones",
    avatar: "👩🏽‍💼",
    school: "Cedar Ridge Elementary",
    badge: "Principal"
};

export const scenarioContext = {
    icon: "📋",
    text: "Help Principal Jones add a new teacher to the district."
};
