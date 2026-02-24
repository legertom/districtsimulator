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
        // Module 1 is the only unlocked module in default state — it renders
        expect(screen.getByText("IDM Setup")).toBeInTheDocument();
        // Locked modules are completely hidden
        expect(screen.queryByText("Provisioning Wizard Basics")).not.toBeInTheDocument();
        expect(screen.queryByText("Credential Configuration")).not.toBeInTheDocument();
        expect(screen.queryByText("OU Organization")).not.toBeInTheDocument();
        expect(screen.queryByText("Group Configuration")).not.toBeInTheDocument();
        expect(screen.queryByText("Review & Provisioning")).not.toBeInTheDocument();
    });

    it("renders ticket cards for authored scenarios", () => {
        renderInbox();
        // Only Module 1 tickets render (modules 2-6 are locked/hidden)
        expect(screen.getByText("Your first task: set up IDM")).toBeInTheDocument();
        expect(screen.getByText("Explore the IDM tabs")).toBeInTheDocument();
    });

    it("downstream modules are locked when prerequisites are not completed", () => {
        // Module 2 requires mod_overview, Module 3 requires mod_provisioning_basics
        // Neither is completed in the default context → locked modules are completely hidden
        renderInbox();
        expect(screen.queryByText("Provisioning Wizard Basics")).not.toBeInTheDocument();
        expect(screen.queryByText("Credential Configuration")).not.toBeInTheDocument();
        expect(screen.queryByText("OU Organization")).not.toBeInTheDocument();
        expect(screen.queryByText("Group Configuration")).not.toBeInTheDocument();
        expect(screen.queryByText("Review & Provisioning")).not.toBeInTheDocument();
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
        const ticket = screen.getByText("Your first task: set up IDM");
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
        // All completed modules render as compact rows
        expect(screen.getByText("IDM Setup")).toBeInTheDocument();
        expect(screen.getByText("Provisioning Wizard Basics")).toBeInTheDocument();
        expect(screen.getByText("Credential Configuration")).toBeInTheDocument();
        expect(screen.getByText("OU Organization")).toBeInTheDocument();
        expect(screen.getByText("Group Configuration")).toBeInTheDocument();
        expect(screen.getByText("Review & Provisioning")).toBeInTheDocument();
        // No locked labels should appear
        expect(screen.queryByText("Complete previous modules to unlock")).not.toBeInTheDocument();
    });

    it("mode picker calls acceptTicket with correct args", () => {
        const mockAccept = vi.fn();
        renderInbox({ acceptTicket: mockAccept });

        // Use a Module 1 ticket (always unlocked)
        const ticket = screen.getByText("Your first task: set up IDM");
        fireEvent.click(ticket.closest("[role='button']"));

        // Click "Guided"
        fireEvent.click(screen.getByText("Guided"));
        expect(mockAccept).toHaveBeenCalledWith("scenario_idm_orientation", true);
    });
});
