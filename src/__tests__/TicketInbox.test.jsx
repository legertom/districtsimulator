import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InstructionalContext } from "@/context/InstructionalContext";
import TicketInbox from "@/components/helpdesk/TicketInbox";

// ── Default context for wrapping ──
const defaultContext = {
    completedScenarios: new Set(),
    completedModules: new Set(),
    globalScore: 0,
    scores: {},
    resetAllProgress: vi.fn(),
    acceptTicket: vi.fn(),
};

function renderInbox(overrides = {}) {
    const ctx = { ...defaultContext, ...overrides };
    return render(
        <InstructionalContext.Provider value={ctx}>
            <TicketInbox />
        </InstructionalContext.Provider>
    );
}

describe("TicketInbox", () => {
    it("renders module headers from curriculum", () => {
        renderInbox();
        expect(screen.getByText("IDM Overview & Navigation")).toBeInTheDocument();
        expect(screen.getByText("Provisioning Wizard Basics")).toBeInTheDocument();
        expect(screen.getByText("Credential Configuration")).toBeInTheDocument();
        expect(screen.getByText("OU Organization")).toBeInTheDocument();
        expect(screen.getByText("Group Configuration")).toBeInTheDocument();
        expect(screen.getByText("Review & Provisioning")).toBeInTheDocument();
    });

    it("renders ticket cards for authored scenarios", () => {
        renderInbox();
        // Module 1 tickets
        expect(screen.getByText("Welcome! Can you check on our Google sync?")).toBeInTheDocument();
        expect(screen.getByText("Documenting IDM for the team wiki")).toBeInTheDocument();
        // Module 2 tickets
        expect(screen.getByText("Need our Google provisioning setup documented")).toBeInTheDocument();
        expect(screen.getByText("Board presentation prep — provisioning overview")).toBeInTheDocument();
        // Module 3 tickets
        expect(screen.getByText("Student email format change request")).toBeInTheDocument();
        expect(screen.getByText("Document our credential system before we touch anything")).toBeInTheDocument();
        // Module 4 tickets
        expect(screen.getByText("Parent asking why their kid's account is in a weird folder")).toBeInTheDocument();
        expect(screen.getByText("Board wants our 'account lifecycle management strategy'")).toBeInTheDocument();
        // Module 5 ticket
        expect(screen.getByText("Can we email all 7th graders at once?")).toBeInTheDocument();
        // Module 6 tickets
        expect(screen.getByText("Pre-provisioning safety check")).toBeInTheDocument();
        expect(screen.getByText(/End-to-end provisioning walkthrough/)).toBeInTheDocument();
    });

    it("downstream modules are locked when prerequisites are not completed", () => {
        // Module 2 requires mod_overview, Module 3 requires mod_provisioning_basics
        // Neither is completed in the default context → both modules show locked tickets
        renderInbox();
        const lockedLabels = screen.getAllByText("Complete previous modules to unlock");
        expect(lockedLabels.length).toBeGreaterThanOrEqual(1);
    });

    it("Module 3 unlocks when Modules 1-2 are completed", () => {
        renderInbox({
            completedScenarios: new Set([
                "scenario_idm_orientation", "scenario_idm_tab_exploration",
                "scenario_wizard_navigation", "scenario_wizard_concepts",
            ]),
            completedModules: new Set(["mod_overview", "mod_provisioning_basics"]),
        });
        // Module 3 tickets should render and be clickable (not locked)
        const ticket3a = screen.getByText("Student email format change request");
        expect(ticket3a.closest("[role='button']")).toBeInTheDocument();
        const ticket3b = screen.getByText("Document our credential system before we touch anything");
        expect(ticket3b.closest("[role='button']")).toBeInTheDocument();
    });

    it("completed ticket shows score", () => {
        renderInbox({
            completedScenarios: new Set(["scenario_idm_orientation"]),
            scores: {
                scenario_idm_orientation: {
                    guided: { correct: 3, total: 4, timeMs: 120000, startTime: 0 },
                    unguided: null,
                },
            },
        });
        expect(screen.getByText(/Guided:/)).toBeInTheDocument();
        expect(screen.getByText(/3\/4/)).toBeInTheDocument();
        expect(screen.getByText(/2m 00s/)).toBeInTheDocument();
    });

    it("displays score badge with globalScore", () => {
        renderInbox({ globalScore: 5 });
        expect(screen.getByText(/⭐ 5/)).toBeInTheDocument();
    });

    it("clicking open ticket shows mode picker", () => {
        renderInbox();
        // Use a Module 1 ticket (always unlocked, no prerequisites)
        const ticket = screen.getByText("Welcome! Can you check on our Google sync?");
        fireEvent.click(ticket.closest("[role='button']"));
        expect(screen.getByText("How would you like to proceed?")).toBeInTheDocument();
        expect(screen.getByText("Guided")).toBeInTheDocument();
        expect(screen.getByText("Unguided")).toBeInTheDocument();
    });

    it("full curriculum unlocks when all modules are completed", () => {
        renderInbox({
            completedScenarios: new Set([
                "scenario_idm_orientation", "scenario_idm_tab_exploration",
                "scenario_wizard_navigation", "scenario_wizard_concepts",
                "scenario_idm_credentials", "scenario_credential_building",
                "scenario_ou_navigation", "scenario_ou_configuration",
                "scenario_group_setup",
                "scenario_review_provision", "scenario_sync_management",
            ]),
            completedModules: new Set([
                "mod_overview", "mod_provisioning_basics", "mod_credentials",
                "mod_ou_management", "mod_groups", "mod_review_provision",
            ]),
        });
        // All 11 ticket subjects should be visible
        expect(screen.getByText("Welcome! Can you check on our Google sync?")).toBeInTheDocument();
        expect(screen.getByText(/End-to-end provisioning walkthrough/)).toBeInTheDocument();
        // No locked labels should appear
        expect(screen.queryByText("Complete previous modules to unlock")).not.toBeInTheDocument();
    });

    it("mode picker calls acceptTicket with correct args", () => {
        const mockAccept = vi.fn();
        renderInbox({ acceptTicket: mockAccept });

        // Use a Module 1 ticket (always unlocked)
        const ticket = screen.getByText("Welcome! Can you check on our Google sync?");
        fireEvent.click(ticket.closest("[role='button']"));

        // Click "Guided"
        fireEvent.click(screen.getByText("Guided"));
        expect(mockAccept).toHaveBeenCalledWith("scenario_idm_orientation", true);
    });
});
