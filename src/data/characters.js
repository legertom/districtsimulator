/**
 * Character definitions for the Cedar Ridge District Simulator.
 *
 * Characters are separated from scenarios so that multiple scenarios
 * can reference the same customer. The `id` key matches the
 * `customerId` field on each scenario object in scenarios.js.
 */

export const CHARACTERS = {
    // ── The user's boss ────────────────────────────────────────────
    boss: {
        id: "boss",
        firstName: "Alex",
        lastName: "Rivera",
        role: "Senior IT Administrator",
        school: null,
        avatar: "AR",
        avatarColor: "#2c3e50",
    },

    // ── Ticket customers ───────────────────────────────────────────
    principalJones: {
        id: "principalJones",
        firstName: "Principal",
        lastName: "Jones",
        role: "Principal",
        school: "Cedar Ridge Elementary",
        avatar: "PJ",
        avatarColor: "#e67e22",
    },

    sarahChen: {
        id: "sarahChen",
        firstName: "Sarah",
        lastName: "Chen",
        role: "IT Coordinator",
        school: "Cedar Ridge Middle School",
        avatar: "SC",
        avatarColor: "#27ae60",
    },

    marcusThompson: {
        id: "marcusThompson",
        firstName: "Marcus",
        lastName: "Thompson",
        role: "District Technology Director",
        school: null,
        avatar: "MT",
        avatarColor: "#8e44ad",
    },

    lisaWilson: {
        id: "lisaWilson",
        firstName: "Lisa",
        lastName: "Wilson",
        role: "School Secretary",
        school: "Cedar Ridge Elementary",
        avatar: "LW",
        avatarColor: "#c0392b",
    },
};

/**
 * Get a character's display name.
 * @param {string} characterId — key into CHARACTERS
 * @returns {string} e.g. "Principal Jones", "Sarah Chen"
 */
export function getCharacterDisplayName(characterId) {
    const char = CHARACTERS[characterId];
    if (!char) return "Unknown";
    return `${char.firstName} ${char.lastName}`;
}

/**
 * Build the customer info object that the ConversationView header needs,
 * resolving from a scenario's customerId.
 * Falls back to a generic "Support Customer" if no character is found.
 */
export function getCustomerInfo(customerId) {
    const char = CHARACTERS[customerId];
    if (!char) {
        return {
            name: "Support Customer",
            avatar: "?",
            avatarColor: "#6b7280",
            school: "",
            role: "",
        };
    }
    return {
        name: `${char.firstName} ${char.lastName}`,
        avatar: char.avatar,
        avatarColor: char.avatarColor,
        school: char.school || "",
        role: char.role,
    };
}
