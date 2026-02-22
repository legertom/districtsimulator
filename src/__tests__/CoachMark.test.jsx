import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import CoachMark from "@/components/guidance/CoachMark";
import { InstructionalContext } from "@/context/InstructionalContext";

function renderCoachMark(overrideContext = {}) {
  const value = {
    currentStep: {
      hint: {
        target: "target-el",
        message: "Hint message",
      },
    },
    showHint: true,
    coachMarksEnabled: true,
    ...overrideContext,
  };

  return render(
    <InstructionalContext.Provider value={value}>
      <CoachMark />
    </InstructionalContext.Provider>
  );
}

describe("CoachMark", () => {
  let originalElementFromPoint;

  beforeEach(() => {
    vi.useFakeTimers();

    // JSDOM doesn't always implement elementFromPoint; CoachMark relies on it.
    originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn(() => null);
  });

  afterEach(() => {
    document.elementFromPoint = originalElementFromPoint;
    vi.useRealTimers();
  });

  it("returns null when the target element is not found", async () => {
    const { container, unmount } = renderCoachMark();

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    // CoachMark should render nothing while it cannot find the target.
    expect(container).toBeEmptyDOMElement();

    // Ensure the retry timer gets cleaned up.
    unmount();
  });

  it("returns null when the target element is obscured by an overlay", async () => {
    const target = document.createElement("div");
    target.id = "target-el";
    target.getBoundingClientRect = () => ({
      top: 100,
      left: 200,
      width: 80,
      height: 40,
      right: 280,
      bottom: 140,
      x: 200,
      y: 100,
      toJSON: () => {},
    });
    document.body.appendChild(target);

    const overlay = document.createElement("div");
    document.body.appendChild(overlay);

    document.elementFromPoint = vi.fn(() => overlay);

    const { container, unmount } = renderCoachMark();

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(container).toBeEmptyDOMElement();

    unmount();
    target.remove();
    overlay.remove();
  });

  it("returns the correct position when the target element is visible and not obscured", async () => {
    const rect = {
      top: 100,
      left: 200,
      width: 80,
      height: 40,
      right: 280,
      bottom: 140,
      x: 200,
      y: 100,
      toJSON: () => {},
    };

    const target = document.createElement("div");
    target.id = "target-el";
    target.getBoundingClientRect = () => rect;
    document.body.appendChild(target);

    document.elementFromPoint = vi.fn(() => target);

    const { container, unmount } = renderCoachMark({
      currentStep: {
        hint: {
          target: "target-el",
          message: "Positioned hint",
        },
      },
    });

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    // Tooltip must exist (message is rendered inside it)
    const contentEl = screen.getByText("Positioned hint");
    const tooltipEl = contentEl.parentElement;
    expect(tooltipEl).not.toBeNull();

    const overlayContainerEl = tooltipEl.parentElement;
    expect(overlayContainerEl).not.toBeNull();

    const spotlightEl = overlayContainerEl.children[0];

    // Spotlight styles (rect expanded by 4px on each side)
    expect(spotlightEl.style.top).toBe(`${rect.top - 4}px`);
    expect(spotlightEl.style.left).toBe(`${rect.left - 4}px`);
    expect(spotlightEl.style.width).toBe(`${rect.width + 8}px`);
    expect(spotlightEl.style.height).toBe(`${rect.height + 8}px`);

    // Tooltip styles (viewport-aware positioning)
    const tooltipHeight = 80;
    const tooltipWidth = 280;
    let expectedTop = rect.top + rect.height / 2 - tooltipHeight / 2;
    let expectedLeft = rect.left + rect.width + 16;

    // Apply viewport-aware adjustments (same logic as CoachMark)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    if (expectedLeft + tooltipWidth > viewportWidth - 16) {
        expectedLeft = rect.left - tooltipWidth - 16;
    }
    if (expectedTop + tooltipHeight > viewportHeight - 16) {
        expectedTop = viewportHeight - tooltipHeight - 16;
    }
    if (expectedTop < 16) {
        expectedTop = 16;
    }

    expect(tooltipEl.style.top).toBe(`${expectedTop}px`);
    expect(tooltipEl.style.left).toBe(`${expectedLeft}px`);

    // Sanity: something rendered
    expect(container).not.toBeEmptyDOMElement();

    unmount();
    target.remove();
  });
});
