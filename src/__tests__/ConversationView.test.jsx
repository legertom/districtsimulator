import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InstructionalContext } from "@/context/InstructionalContext";
import ConversationView from "@/components/helpdesk/ConversationView";

// ── Mock messages ──
const mockMessages = [
    {
        id: 1,
        sender: "customer",
        text: "Hi, I need help with my email format.",
        timestamp: "10:00 AM",
    },
    {
        id: 2,
        sender: "agent",
        text: "Sure, let me look into that.",
        timestamp: "10:01 AM",
    },
    {
        id: 3,
        sender: "system",
        text: "Navigated to IDM page.",
        timestamp: "10:02 AM",
        variant: "success",
    },
];

// ── Default context ──
const defaultContext = {
    activeScenario: {
        id: "scenario_idm_credentials",
        customerId: "principalJones",
        description: "Help change the student email format",
    },
    currentStep: { type: "input", actions: [] },
    conversationHistory: mockMessages,
    coachMarksEnabled: false,
    handleAction: vi.fn(),
    skipTicket: vi.fn(),
    returnToInbox: vi.fn(),
    toggleCoachMarks: vi.fn(),
    replayScenario: vi.fn(),
    scenarioJustCompleted: null,
};

function renderConversation(overrides = {}) {
    const ctx = { ...defaultContext, ...overrides };
    return render(
        <InstructionalContext.Provider value={ctx}>
            <ConversationView />
        </InstructionalContext.Provider>
    );
}

describe("ConversationView", () => {
    it("renders customer info from characters.js", () => {
        renderConversation();
        // principalJones → "Principal Jones", school "Lincoln Heights Elementary"
        expect(screen.getByText("Principal Jones")).toBeInTheDocument();
        expect(screen.getByText("Lincoln Heights Elementary")).toBeInTheDocument();
    });

    it("renders conversation messages", () => {
        renderConversation();
        expect(screen.getByText("Hi, I need help with my email format.")).toBeInTheDocument();
        expect(screen.getByText("Sure, let me look into that.")).toBeInTheDocument();
        expect(screen.getByText("Navigated to IDM page.")).toBeInTheDocument();
    });

    it("handles text input submission via button", () => {
        const mockAction = vi.fn();
        renderConversation({ handleAction: mockAction });

        const textarea = screen.getByPlaceholderText("Type your response");
        fireEvent.change(textarea, { target: { value: "rwaelchi@maytonlyceum.com" } });

        const sendBtn = screen.getByText("Send");
        fireEvent.click(sendBtn);

        expect(mockAction).toHaveBeenCalledWith({
            type: "submitted_answer",
            text: "rwaelchi@maytonlyceum.com",
        });
    });

    it("handles text input submission via Enter key", () => {
        const mockAction = vi.fn();
        renderConversation({ handleAction: mockAction });

        const textarea = screen.getByPlaceholderText("Type your response");
        fireEvent.change(textarea, { target: { value: "test answer" } });
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

        expect(mockAction).toHaveBeenCalledWith({
            type: "submitted_answer",
            text: "test answer",
        });
    });

    it("does not send empty messages", () => {
        const mockAction = vi.fn();
        renderConversation({ handleAction: mockAction });

        const sendBtn = screen.getByText("Send");
        fireEvent.click(sendBtn);

        expect(mockAction).not.toHaveBeenCalled();
    });

    it("renders action buttons when currentStep has actions", () => {
        renderConversation({
            currentStep: {
                type: "message",
                actions: [
                    { label: "Absolutely! Let me pull up the IDM page.", nextStep: "step_nav_idm" },
                    { label: "Sure — do you know where the credential settings are?", nextStep: "step_customer_unsure" },
                ],
            },
        });

        expect(screen.getByText(/Absolutely/)).toBeInTheDocument();
        expect(screen.getByText(/Sure — do you know/)).toBeInTheDocument();
    });

    it("shows skip button during active step", () => {
        renderConversation();
        expect(screen.getByText("Skip this ticket")).toBeInTheDocument();
    });

    it("shows completion card when scenarioJustCompleted is set (Fix 2)", () => {
        renderConversation({
            currentStep: null,
            activeScenario: null,
            scenarioJustCompleted: {
                scenarioId: "scenario_idm_credentials",
                scores: { correct: 4, total: 5, timeMs: 135000 },
            },
        });

        expect(screen.getByText("Ticket Resolved")).toBeInTheDocument();
        expect(screen.getByText("4/5")).toBeInTheDocument();
        expect(screen.getByText("2m 15s")).toBeInTheDocument();
        expect(screen.getByText("↺ Replay")).toBeInTheDocument();
        expect(screen.getByText("Return to Inbox")).toBeInTheDocument();
    });
});
