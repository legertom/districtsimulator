# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development commands

- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Run production server locally (after build): `npm start`
- Lint the project: `npm run lint`

Testing

- There is currently no `test` script defined in `package.json` and no test framework configured. If you add tests, document how to run the full suite and a single test here.

## Architecture overview

This is a Next.js App Router project (under `src/app`) that simulates the Clever Dashboard experience for training Customer Support agents interacting with "Principal Jones".

### App shell and layout

- `src/app/layout.js` defines the root HTML structure and wraps the entire app in `InstructionalProvider` from `src/context/InstructionalContext.js`, with a global `CoachMark` overlay from `src/components/guidance/CoachMark.jsx`.
- `src/app/page.js` is the main dashboard simulator shell. It:
  - Maintains `activeNav` in local state.
  - Renders the left-hand `Sidebar` (`src/components/layout/Sidebar.jsx`) and top `TopNav` (`src/components/layout/TopNav.jsx`). Both control navigation by calling `onNavChange` with a nav ID.
  - Maps nav IDs to page components via the `pageComponents` map and renders the corresponding page in the main content area.
  - Always renders the right-hand `ChatPanel` (`src/components/chat/ChatPanel.jsx`) as the instructional conversation surface.

### Pages and navigation

- Feature pages live under `src/components/pages/` and correspond to specific dashboard sections (e.g. `DashboardHome.jsx`, `MyApplications.jsx`, `SISSync.jsx`, `CustomData.jsx`, `IDM.jsx`, `LicenseManager.jsx`, `AdminTeam.jsx`, `AccessLogs.jsx`, `SSOSettings.jsx`, `Badges.jsx`, `ClassroomMFA.jsx`, `PortalSettings.jsx`, `DataBrowser.jsx`, `Profile.jsx`). Styles are colocated as `.module.css` files.
- `src/components/dashboard/pages/PlaceholderPage.jsx` is used as a generic fallback when a nav ID does not have a dedicated page component.
- The sidebar and top nav define the available nav IDs; behavior changes or new sections should generally be implemented by:
  1. Adding/adjusting entries in the nav components.
  2. Creating/updating the corresponding page component under `src/components/pages/`.
  3. Updating the `pageComponents` map in `src/app/page.js`.

### UI building blocks

- `src/components/ui/` contains reusable UI primitives: icons, data table, dropdown menu, tabs, info banner, status badge, copyable input, etc. Prefer using/updating these primitives before introducing new one-off components.
- `src/components/layout/` contains layout primitives: `Sidebar`, `TopNav`, and layout-specific styling.
- `src/components/guidance/` contains instructional overlays and guidance UI (`GuidancePanel`, `CoachMark`). These components visualize the current step, hints, and scenario guidance driven by context state.

### Instructional engine and scenarios

- `src/context/InstructionalContext.js` implements the instructional engine as a React context (`InstructionalProvider` + `useInstructional` hook). It is responsible for:
  - Tracking the active scenario (`activeScenarioId`), current step (`currentStepId`), chat `history`, hint visibility (`showHint`), and learner `score`.
  - Computing derived state: `activeScenario` and `currentStep` from `src/data/scenarios.js`.
  - Automatically seeding the chat history with the initial step message when a scenario starts.
  - Handling user actions from the chat UI via `handleAction`, including:
    - Adding user messages to history.
    - Validating submitted answers (`submitted_answer` actions) against `currentStep.correctAnswer`.
    - Updating `score` and advancing to success or feedback steps.
  - Driving progression through steps with `advanceStep`, showing hints based on `autoShowHint`, and appending completion messages when a scenario ends.
  - Exposing helper functions `checkNavigationGoal` and `checkActionGoal` so that navigation events (e.g., changing pages via sidebar/top nav) can satisfy task goals defined in scenario steps.
- `src/data/scenarios.js` defines the instructional content and flow as data:
  - Each scenario has an `id`, `title`, `description`, and ordered `steps`.
  - Steps can be of different `type`s (e.g., `message`, `task`, `input`) and can include:
    - Chat text and sender (`customer` or system).
    - `actions` for button-based replies with `label` and `nextStep`.
    - Task goals (`goalRoute`, `goalAction`) that are checked against navigation or other actions.
    - Hints (`hint` objects) and `autoShowHint` flags for guidance overlays.
    - Answer validation (`correctAnswer`, `successStep`) for input-type steps.

### How pieces fit together

- The **Dashboard shell** (layout + page + pages + layout components) provides the visual simulation of the Clever Dashboard.
- The **Instructional engine** (InstructionalContext + scenarios data + guidance components + chat panel) provides the training logic and feedback loop on top of that shell.
- Navigation events (sidebar/top nav) and chat interactions are funneled into `InstructionalContext` functions, which evaluate them against scenario definitions and update:
  - Chat history shown in `ChatPanel`.
  - Guidance overlays and hints.
  - Scenario progression and learner score.

When making changes to training behavior, prefer updating `src/data/scenarios.js` and the context logic before hardcoding behavior in UI components. When adding new training flows, model them as new scenarios and let the UI consume them via the existing context hooks.
