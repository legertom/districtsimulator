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
        expect(screen.getByText("Where do I find the Google sync settings?")).toBeInTheDocument();
        expect(screen.getByText("I need to check our recent sync logs")).toBeInTheDocument();
        // Module 2 tickets
        expect(screen.getByText("How do I set up Google provisioning?")).toBeInTheDocument();
        expect(screen.getByText("Explain the provisioning steps before we change anything")).toBeInTheDocument();
        // Module 3 tickets
        expect(screen.getByText("Change student email format to first initial + last name")).toBeInTheDocument();
        expect(screen.getByText("Need to understand credential formats before making changes")).toBeInTheDocument();
        // Module 4 tickets
        expect(screen.getByText("I need help understanding how our Google OUs are organized")).toBeInTheDocument();
        expect(screen.getByText("Need to review archive and ignored OU policies for board presentation")).toBeInTheDocument();
        // Module 5 ticket
        expect(screen.getByText("What are Google Groups in the provisioning wizard?")).toBeInTheDocument();
        // Module 6 tickets
        expect(screen.getByText("Need to review provisioning setup before we go live")).toBeInTheDocument();
        expect(screen.getByText("Walk me through the entire provisioning process from start to finish")).toBeInTheDocument();
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
        const ticket3a = screen.getByText("Change student email format to first initial + last name");
        expect(ticket3a.closest("[role='button']")).toBeInTheDocument();
        const ticket3b = screen.getByText("Need to understand credential formats before making changes");
        expect(ticket3b.closest("[role='button']")).toBeInTheDocument();
    });

    it("completed ticket shows score", () => {
        renderInbox({
            completedScenarios: new Set(["scenario_idm_orientation"]),
            scores: {
                scenario_idm_orientation: { correct: 3, total: 4, timeMs: 120000, startTime: 0 }
            },
        });
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
        const ticket = screen.getByText("Where do I find the Google sync settings?");
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
        expect(screen.getByText("Where do I find the Google sync settings?")).toBeInTheDocument();
        expect(screen.getByText("Walk me through the entire provisioning process from start to finish")).toBeInTheDocument();
        // No locked labels should appear
        expect(screen.queryByText("Complete previous modules to unlock")).not.toBeInTheDocument();
    });

    it("mode picker calls acceptTicket with correct args", () => {
        const mockAccept = vi.fn();
        renderInbox({ acceptTicket: mockAccept });

        // Use a Module 1 ticket (always unlocked)
        const ticket = screen.getByText("Where do I find the Google sync settings?");
        fireEvent.click(ticket.closest("[role='button']"));

        // Click "Guided"
        fireEvent.click(screen.getByText("Guided"));
        expect(mockAccept).toHaveBeenCalledWith("scenario_idm_orientation", true);
    });
});
