/**
 * Phase 5 — Integration tests for DataVariantProvider and useDataVariant hook.
 *
 * Covers:
 *   - No-active-scenario fallback: resolvedData === defaultScenario
 *   - Active-scenario: setVariantScenario applies overlay correctly
 *   - clearVariantScenario resets to defaults
 *   - Hook throws when used outside provider
 *   - Hook exposes correct API surface
 *
 * Prerequisite: src/context/DataVariantContext.jsx must exist and export
 *   { DataVariantProvider, useDataVariant, applyOverrides }
 */
import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { DataVariantProvider, useDataVariant } from "@/context/DataVariantContext";
import { defaultScenario } from "@/data/defaults";

// Standard wrapper for renderHook
const wrapper = ({ children }) => <DataVariantProvider>{children}</DataVariantProvider>;

// ─── FALLBACK — no active scenario ──────────────────────────────────────────

describe("DataVariantContext — no-active-scenario fallback", () => {
  it("TC-F1: resolvedData equals defaultScenario when no variant is active", () => {
    const { result } = renderHook(() => useDataVariant(), { wrapper });
    expect(result.current.resolvedData).toEqual(defaultScenario);
  });

  it("TC-F2: activeVariant is null on initial mount", () => {
    const { result } = renderHook(() => useDataVariant(), { wrapper });
    expect(result.current.activeVariant).toBeNull();
  });

  it("TC-F3: resolvedData.dashboard.stats matches defaults when no variant is active", () => {
    const { result } = renderHook(() => useDataVariant(), { wrapper });
    expect(result.current.resolvedData.dashboard.stats).toEqual(
      defaultScenario.dashboard.stats
    );
  });

  it("TC-F4: resolvedData.dashboard.pinnedApplications matches default array when no variant is active", () => {
    const { result } = renderHook(() => useDataVariant(), { wrapper });
    expect(result.current.resolvedData.dashboard.pinnedApplications).toEqual(
      defaultScenario.dashboard.pinnedApplications
    );
  });
});

// ─── ACTIVE SCENARIO — variant applied ──────────────────────────────────────

describe("DataVariantContext — active scenario", () => {
  it("TC-V1: setVariantScenario sets activeVariant and updates resolvedData", () => {
    const { result } = renderHook(() => useDataVariant(), { wrapper });
    const variant = { dashboard: { stats: { students: 999 } } };

    act(() => { result.current.setVariantScenario(variant); });

    expect(result.current.activeVariant).toEqual(variant);
    expect(result.current.resolvedData.dashboard.stats.students).toBe(999);
  });

  it("TC-V2: array overlay replaces pinnedApplications entirely", () => {
    const { result } = renderHook(() => useDataVariant(), { wrapper });
    const errorApps = [
      { name: "Error App", icon: "EA", iconType: "sso", students: 0, teachers: 0 }
    ];

    act(() => {
      result.current.setVariantScenario({ dashboard: { pinnedApplications: errorApps } });
    });

    expect(result.current.resolvedData.dashboard.pinnedApplications).toHaveLength(1);
    expect(result.current.resolvedData.dashboard.pinnedApplications[0].name).toBe("Error App");
  });

  it("TC-V3: sibling domains are unchanged when only dashboard is overridden", () => {
    const { result } = renderHook(() => useDataVariant(), { wrapper });

    act(() => {
      result.current.setVariantScenario({ dashboard: { stats: { students: 5 } } });
    });

    expect(result.current.resolvedData.team.members).toEqual(
      defaultScenario.team.members
    );
  });
});

// ─── CLEAR VARIANT ───────────────────────────────────────────────────────────

describe("DataVariantContext — clearVariantScenario", () => {
  it("TC-C1: clearVariantScenario resets resolvedData to defaultScenario", () => {
    const { result } = renderHook(() => useDataVariant(), { wrapper });

    act(() => {
      result.current.setVariantScenario({ dashboard: { stats: { students: 42 } } });
    });
    act(() => {
      result.current.clearVariantScenario();
    });

    expect(result.current.resolvedData).toEqual(defaultScenario);
    expect(result.current.activeVariant).toBeNull();
  });

  it("TC-C2: calling clearVariantScenario with no active variant is a safe no-op", () => {
    const { result } = renderHook(() => useDataVariant(), { wrapper });

    expect(() => {
      act(() => { result.current.clearVariantScenario(); });
    }).not.toThrow();

    expect(result.current.activeVariant).toBeNull();
  });
});

// ─── HOOK CONTRACT ───────────────────────────────────────────────────────────

describe("DataVariantContext — hook contract", () => {
  it("TC-H1: useDataVariant throws when used outside DataVariantProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      renderHook(() => useDataVariant());
    }).toThrow(/DataVariantProvider/);
    spy.mockRestore();
  });

  it("TC-H2: hook exposes exactly { resolvedData, activeVariant, setVariantScenario, clearVariantScenario }", () => {
    const { result } = renderHook(() => useDataVariant(), { wrapper });
    const keys = Object.keys(result.current).sort();
    expect(keys).toEqual(
      ["activeVariant", "clearVariantScenario", "resolvedData", "setVariantScenario"].sort()
    );
  });
});
