import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the context providers
import { InstructionalContext } from "../context/InstructionalContext";
import ScenarioContext from "../context/ScenarioContext";
import ChatPanel from "../components/chat/ChatPanel";

// Mock scrollIntoView since it's not implemented in JSDOM
Element.prototype.scrollIntoView = vi.fn();

describe("ChatPanel Component", () => {
    // Default mock data
    const mockScenario = {
        chat: {
            customerInfo: {
                name: "Principal Jones",
                avatar: "PJ",
                school: "Springfield Elementary",
                badge: "District Admin"
            }
        },
        description: "Test Scenario"
    };

    const mockHistory = [
        { id: 1, sender: "system", text: "Welcome!", timestamp: "10:00 AM", variant: "default" },
        { id: 2, sender: "customer", text: "I need help.", timestamp: "10:01 AM" }
    ];

    const mockHandleAction = vi.fn();

    // Helper to render component with providers
    const renderChatPanel = (overrideContext = {}) => {
        const defaultContext = {
            activeScenario: mockScenario,
            currentStep: { type: "input", actions: [] },
            history: mockHistory,
            handleAction: mockHandleAction,
            completedScenarios: new Set(),
            coachMarksEnabled: false,
            acceptTicket: vi.fn(),
            skipTicket: vi.fn(),
            toggleCoachMarks: vi.fn(),
            waitingForTicket: false,
            ...overrideContext
        };

        return render(
            <ScenarioContext.Provider value={{ scenario: mockScenario }}>
                <InstructionalContext.Provider value={defaultContext}>
                    <ChatPanel />
                </InstructionalContext.Provider>
            </ScenarioContext.Provider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders customer info correctly", () => {
        renderChatPanel();

        expect(screen.getByText("Principal Jones")).toBeInTheDocument();
        expect(screen.getByText("Springfield Elementary")).toBeInTheDocument();
        expect(screen.getByText("District Admin")).toBeInTheDocument();
    });

    it("renders chat history messages", () => {
        renderChatPanel();

        expect(screen.getByText("Welcome!")).toBeInTheDocument();
        expect(screen.getByText("I need help.")).toBeInTheDocument();
    });

    it("handles text input submission via button", () => {
        renderChatPanel();

        const input = screen.getByPlaceholderText("Type your response");
        const sendButton = screen.getByRole("button", { name: /send/i });

        // Simulate typing
        fireEvent.change(input, { target: { value: "Hello World" } });

        // Click send
        fireEvent.click(sendButton);

        expect(mockHandleAction).toHaveBeenCalledWith({
            type: "submitted_answer",
            text: "Hello World"
        });

        // Input should be cleared
        expect(input.value).toBe("");
    });

    it("handles text input submission via Enter key", () => {
        renderChatPanel();

        const input = screen.getByPlaceholderText("Type your response");

        fireEvent.change(input, { target: { value: "Enter Key Message" } });
        fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });

        expect(mockHandleAction).toHaveBeenCalledWith({
            type: "submitted_answer",
            text: "Enter Key Message"
        });
    });

    it("does not send empty messages", () => {
        renderChatPanel();

        const sendButton = screen.getByRole("button", { name: /send/i });

        // Button should be disabled when input is empty
        expect(sendButton).toBeDisabled();

        fireEvent.click(sendButton);
        expect(mockHandleAction).not.toHaveBeenCalled();
    });

    it("renders action buttons when currentStep has actions", () => {
        const actionStep = {
            type: "action",
            actions: [
                { label: "Option A", type: "choice", value: "A" },
                { label: "Option B", type: "choice", value: "B" }
            ]
        };

        renderChatPanel({ currentStep: actionStep });

        // Input area should be replaced by buttons
        expect(screen.queryByPlaceholderText("Type your response")).not.toBeInTheDocument();

        const btnA = screen.getByRole("button", { name: "Option A" });
        const btnB = screen.getByRole("button", { name: "Option B" });

        expect(btnA).toBeInTheDocument();
        expect(btnB).toBeInTheDocument();

        // Click action
        fireEvent.click(btnA);
        expect(mockHandleAction).toHaveBeenCalledWith(actionStep.actions[0]);
    });

    it("renders ticket notifications correctly", () => {
        const ticketHistory = [
            { id: 1, variant: "ticket", text: "User submitted ticket #123", timestamp: "10:00 AM" }
        ];

        renderChatPanel({ history: ticketHistory });

        expect(screen.getByText("New Ticket")).toBeInTheDocument();
        expect(screen.getByText("User submitted ticket #123")).toBeInTheDocument();
    });

    it("scrolls to bottom on new messages", () => {
        renderChatPanel();
        // Checked via mock call count in useEffect
        expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
});
