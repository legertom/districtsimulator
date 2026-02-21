import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InstructionalContext } from "@/context/InstructionalContext";
import InvestigationView from "@/components/helpdesk/InvestigationView";

// ── Mock scenario with new format (ticketMessage + choices/question) ──
const mockScenario = {
    id: "scenario_test_investigation",
    title: "Test Investigation",
    description: "A test scenario for InvestigationView",
    customerId: "principalJones",
    ticketMessage: "Hi! Can you check if the Google sync is working and let me know?",
    ticketNumber: 9001,
    ticketSubject: "Check Google sync status",
    ticketPriority: "normal",
    moduleId: "mod_overview",
    settings: {},
    steps: [
        {
            id: "step_nav",
            type: "task",
            checklistLabel: "Navigate to the IDM page",
            goalRoute: "idm",
            guideMessage: "Open the IDM page from the sidebar.",
            hint: { target: "idm", message: "Click IDM in the sidebar." },
            autoShowHint: true,
            nextStep: "step_check",
        },
        {
            id: "step_check",
            type: "checkpoint",
            checklistLabel: "Assess integration health",
            question: "Is the Google integration healthy?",
            choices: [
                { label: "Active with 1 issue", nextStep: "step_input", correct: true },
                { label: "Broken", nextStep: "step_wrong", correct: false },
            ],
        },
        {
            id: "step_wrong",
            type: "message",
            checklistLabel: "Correction",
            text: "Look more carefully at the status badge.",
            actions: [
                { label: "OK, let me check again", nextStep: "step_check" },
            ],
        },
        {
            id: "step_input",
            type: "observe",
            checklistLabel: "Find the sync timestamp",
            question: "When was the last sync?",
            correctAnswer: "02/16/2026",
            matchMode: "includes",
            successStep: "step_resolve",
            hint: { target: "sync-timestamp", message: "Check below the provider card." },
            autoShowHint: false,
        },
        {
            id: "step_resolve",
            type: "resolution",
            checklistLabel: "Report back to Principal Jones",
            question: "Choose the best summary:",
            choices: [
                { label: "IDM is active. Last sync 4 hours ago. 1 minor issue.", nextStep: null, correct: true },
                { label: "IDM is broken. Call support.", nextStep: null, correct: false },
            ],
        },
    ],
};

// ── Default context ──
const defaultContext = {
    activeScenario: mockScenario,
    currentStep: mockScenario.steps[0], // task step
    normalizedCurrentStep: {
        ...mockScenario.steps[0],
        question: null,
        choices: null,
        checklistLabel: "Navigate to the IDM page",
    },
    coachMarksEnabled: true,
    showHint: false,
    handleAction: vi.fn(),
    skipTicket: vi.fn(),
    returnToInbox: vi.fn(),
    toggleCoachMarks: vi.fn(),
    toggleHint: vi.fn(),
    replayScenario: vi.fn(),
    scenarioJustCompleted: null,
    scores: {},
    visitedStepIds: new Set(["step_nav"]),
};

function renderInvestigation(overrides = {}) {
    const ctx = { ...defaultContext, ...overrides };
    return render(
        <InstructionalContext.Provider value={ctx}>
            <InvestigationView />
        </InstructionalContext.Provider>
    );
}

describe("InvestigationView", () => {
    it("renders the ticket card with coworker message", () => {
        renderInvestigation();
        expect(screen.getByText(/Can you check if the Google sync is working/)).toBeInTheDocument();
        expect(screen.getByText("Principal Jones")).toBeInTheDocument();
        expect(screen.getByText("#9001")).toBeInTheDocument();
    });

    it("renders checklist labels for all steps", () => {
        renderInvestigation();
        expect(screen.getByText("Navigate to the IDM page")).toBeInTheDocument();
        expect(screen.getByText("Assess integration health")).toBeInTheDocument();
        expect(screen.getByText("Find the sync timestamp")).toBeInTheDocument();
    });

    it("shows navigation prompt for goal (task) step", () => {
        renderInvestigation();
        expect(screen.getByText("Open the IDM page from the sidebar.")).toBeInTheDocument();
    });

    it("renders choice buttons for checkpoint step", () => {
        renderInvestigation({
            currentStep: mockScenario.steps[1], // checkpoint
            visitedStepIds: new Set(["step_nav", "step_check"]),
        });
        expect(screen.getByText("Is the Google integration healthy?")).toBeInTheDocument();
        expect(screen.getByText("Active with 1 issue")).toBeInTheDocument();
        expect(screen.getByText("Broken")).toBeInTheDocument();
    });

    it("calls handleAction when a choice button is clicked", () => {
        const mockAction = vi.fn();
        renderInvestigation({
            currentStep: mockScenario.steps[1],
            visitedStepIds: new Set(["step_nav", "step_check"]),
            handleAction: mockAction,
        });
        fireEvent.click(screen.getByText("Active with 1 issue"));
        expect(mockAction).toHaveBeenCalledWith(
            expect.objectContaining({ label: "Active with 1 issue", correct: true })
        );
    });

    it("renders input field for observe/freetext step", () => {
        renderInvestigation({
            currentStep: mockScenario.steps[3], // observe step
            visitedStepIds: new Set(["step_nav", "step_check", "step_input"]),
        });
        expect(screen.getByText("When was the last sync?")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Type your answer")).toBeInTheDocument();
    });

    it("handles text input submission", () => {
        const mockAction = vi.fn();
        renderInvestigation({
            currentStep: mockScenario.steps[3],
            visitedStepIds: new Set(["step_nav", "step_check", "step_input"]),
            handleAction: mockAction,
        });
        const textarea = screen.getByPlaceholderText("Type your answer");
        fireEvent.change(textarea, { target: { value: "02/16/2026" } });
        fireEvent.click(screen.getByText("Submit"));
        expect(mockAction).toHaveBeenCalledWith({
            type: "submitted_answer",
            text: "02/16/2026",
        });
    });

    it("renders resolution step with report-back badge", () => {
        renderInvestigation({
            currentStep: mockScenario.steps[4], // resolution
            visitedStepIds: new Set(["step_nav", "step_check", "step_input", "step_resolve"]),
        });
        expect(screen.getByText(/Report back to Principal Jones/)).toBeInTheDocument();
        expect(screen.getByText("Choose the best summary:")).toBeInTheDocument();
        expect(screen.getByText(/IDM is active/)).toBeInTheDocument();
        expect(screen.getByText(/IDM is broken/)).toBeInTheDocument();
    });

    it("shows completion card when scenario is just completed", () => {
        renderInvestigation({
            currentStep: null,
            visitedStepIds: new Set(["step_nav", "step_check", "step_input", "step_resolve"]),
            scenarioJustCompleted: {
                scenarioId: "scenario_test_investigation",
                scores: { correct: 3, total: 4, timeMs: 180000 },
            },
        });
        expect(screen.getByText(/Excellent Work with Guidance!/)).toBeInTheDocument();
        expect(screen.getByText("3/4")).toBeInTheDocument();
        expect(screen.getByText("3m 00s")).toBeInTheDocument();
        expect(screen.getByText(/Replay/)).toBeInTheDocument();
        expect(screen.getByText("Return to Inbox")).toBeInTheDocument();
    });

    it("shows skip button during active investigation", () => {
        renderInvestigation();
        expect(screen.getByText("Skip this ticket")).toBeInTheDocument();
    });

    it("shows back button that calls returnToInbox", () => {
        renderInvestigation();
        const backButton = screen.getByTitle("Return to inbox");
        fireEvent.click(backButton);
        expect(defaultContext.returnToInbox).toHaveBeenCalled();
    });

    it("shows hint toggle when coach marks are enabled and step has hint", () => {
        renderInvestigation();
        expect(screen.getByText("Show Hint")).toBeInTheDocument();
    });

    it("marks only visited steps as completed, not all steps before current index", () => {
        // User went step_nav → step_input (skipping step_check and step_wrong).
        // The engine's visitedStepIds only contains the steps actually visited.
        // The old index-based logic would mark ALL steps 0-2 as completed.
        // The new visited-set logic only marks actually-visited steps.
        const { container } = renderInvestigation({
            currentStep: mockScenario.steps[3], // step_input (observe)
            visitedStepIds: new Set(["step_nav", "step_input"]),
        });
        const listItems = container.querySelectorAll("[role='listitem']");

        // step_nav (0) — visited → completed
        expect(listItems[0].className).toMatch(/step_completed/);

        // step_check (1) — NOT visited → future
        expect(listItems[1].className).toMatch(/step_future/);

        // step_wrong (2) — NOT visited → future
        expect(listItems[2].className).toMatch(/step_future/);

        // step_input (3) — current
        expect(listItems[3].getAttribute("aria-current")).toBe("step");
        expect(listItems[3].className).toMatch(/step_current/);

        // step_resolve (4) — future
        expect(listItems[4].className).toMatch(/step_future/);
    });
});
