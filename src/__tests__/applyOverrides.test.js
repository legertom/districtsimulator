/**
 * Phase 5 — Unit tests for applyOverrides() merge semantics
 *
 * Semantics enforced:
 *   Arrays     → full replace (never merges elements)
 *   Objects    → shallow merge (1-level spread, nested values fully replaced)
 *   Primitives → replace
 *
 * NOTE on TC-O1/TC-O2: applyOverrides does ONE level of spreading.
 * Calling applyOverrides(base, {dashboard: {stats: {students:99}}}) spreads at the
 * dashboard level — so base.dashboard.stats is entirely replaced by {students:99}.
 * Sub-keys like teachers/staff are GONE unless you provide them in the variant.
 *
 * Prerequisite: src/context/DataVariantContext.jsx must export applyOverrides.
 */
import { describe, expect, it } from "vitest";
import { applyOverrides } from "@/context/DataVariantContext";

// ─── ARRAY REPLACE ──────────────────────────────────────────────────────────

describe("applyOverrides — array fields", () => {
  it("TC-A1: replaces an array entirely when the override supplies a new array", () => {
    const base    = { dashboard: { pinnedApplications: [{ name: "A" }, { name: "B" }] } };
    const variant = { dashboard: { pinnedApplications: [{ name: "X" }] } };
    const result  = applyOverrides(base, variant);
    expect(result.dashboard.pinnedApplications).toEqual([{ name: "X" }]);
    expect(result.dashboard.pinnedApplications).toHaveLength(1);
  });

  it("TC-A2: replaces an array with an empty array (clears it)", () => {
    const base    = { dashboard: { pinnedApplications: [{ name: "A" }] } };
    const variant = { dashboard: { pinnedApplications: [] } };
    const result  = applyOverrides(base, variant);
    expect(result.dashboard.pinnedApplications).toEqual([]);
  });

  it("TC-A3: does not merge array elements — base items are dropped", () => {
    const base    = { team: { members: [{ name: "Alice" }, { name: "Bob" }] } };
    const variant = { team: { members: [{ name: "Charlie" }] } };
    const result  = applyOverrides(base, variant);
    expect(result.team.members.some((m) => m.name === "Alice")).toBe(false);
    expect(result.team.members.some((m) => m.name === "Bob")).toBe(false);
    expect(result.team.members[0].name).toBe("Charlie");
  });

  it("TC-A4: leaves base array untouched when the domain key is absent from variant", () => {
    const base    = { dashboard: { pinnedApplications: [{ name: "A" }] } };
    const variant = {};
    const result  = applyOverrides(base, variant);
    expect(result.dashboard.pinnedApplications).toEqual([{ name: "A" }]);
  });
});

// ─── OBJECT SHALLOW MERGE (1-level) ─────────────────────────────────────────

describe("applyOverrides — object fields (1-level shallow merge)", () => {
  it("TC-O1: sibling keys at the spread level survive; sub-keys within the replaced value do not", () => {
    // applyOverrides({...base[key], ...variant[key]}) spreads at the dashboard level.
    // dashboard.sisSync is a sibling of dashboard.stats — it survives.
    // dashboard.stats.teachers is a child of dashboard.stats — it is dropped
    // because the entire stats value is replaced by variant's stats.
    const base = {
      dashboard: {
        stats:   { students: 20, teachers: 10, staff: 10 },
        sisSync: { status: "success" },
      },
    };
    const variant = { dashboard: { stats: { students: 99 } } };
    const result  = applyOverrides(base, variant);

    expect(result.dashboard.stats.students).toBe(99);            // variant value
    expect(result.dashboard.sisSync.status).toBe("success");     // sibling survives
    expect(result.dashboard.stats.teachers).toBeUndefined();     // sub-key gone (1-level)
  });

  it("TC-O2: nested object override replaces the nested value entirely (1-level, not deep)", () => {
    const base    = { dashboard: { sisSync: { status: "success", extra: "keep" } } };
    const variant = { dashboard: { sisSync: { status: "error" } } };
    const result  = applyOverrides(base, variant);
    expect(result.dashboard.sisSync.status).toBe("error");
    // 1-level spread: dashboard-level spreads, so sisSync is replaced wholesale
    expect(result.dashboard.sisSync.extra).toBeUndefined();
  });

  it("TC-O3: adds a new key from variant that did not exist in base", () => {
    const base    = { dashboard: { stats: { students: 20 } } };
    const variant = { dashboard: { stats: { students: 20, newFlag: true } } };
    const result  = applyOverrides(base, variant);
    expect(result.dashboard.stats.newFlag).toBe(true);
  });

  it("TC-O4: overriding one domain does not bleed into sibling domains", () => {
    const base    = {
      dashboard: { stats: { students: 20 } },
      team:      { members: [{ name: "Alice" }] },
    };
    const variant = { dashboard: { stats: { students: 50 } } };
    const result  = applyOverrides(base, variant);
    expect(result.team.members).toEqual([{ name: "Alice" }]);
    expect(result.dashboard.stats.students).toBe(50);
  });
});

// ─── PRIMITIVE REPLACE ──────────────────────────────────────────────────────

describe("applyOverrides — primitive fields", () => {
  it("TC-P1: replaces a string primitive", () => {
    const base    = { topNav: { searchPlaceholder: "Search..." } };
    const variant = { topNav: { searchPlaceholder: "Find resources..." } };
    const result  = applyOverrides(base, variant);
    expect(result.topNav.searchPlaceholder).toBe("Find resources...");
  });

  it("TC-P2: replaces a numeric primitive", () => {
    const base    = { dashboard: { awaitingAction: { count: 0 } } };
    const variant = { dashboard: { awaitingAction: { count: 7 } } };
    const result  = applyOverrides(base, variant);
    expect(result.dashboard.awaitingAction.count).toBe(7);
  });

  it("TC-P3: replaces a boolean primitive", () => {
    const base    = { portalSettings: { customizationEnabled: true } };
    const variant = { portalSettings: { customizationEnabled: false } };
    const result  = applyOverrides(base, variant);
    expect(result.portalSettings.customizationEnabled).toBe(false);
  });

  it("TC-P4: replacing a primitive with null is valid", () => {
    const base    = { topNav: { searchPlaceholder: "Search..." } };
    const variant = { topNav: { searchPlaceholder: null } };
    const result  = applyOverrides(base, variant);
    expect(result.topNav.searchPlaceholder).toBeNull();
  });
});

// ─── IMMUTABILITY ────────────────────────────────────────────────────────────

describe("applyOverrides — immutability", () => {
  it("TC-I1: does not mutate the base object", () => {
    const base   = { dashboard: { stats: { students: 20 } } };
    const frozen = JSON.parse(JSON.stringify(base));
    applyOverrides(base, { dashboard: { stats: { students: 99 } } });
    expect(base.dashboard.stats.students).toBe(20);
    expect(base).toEqual(frozen);
  });

  it("TC-I2: does not mutate the variant object", () => {
    const variant = { dashboard: { stats: { students: 99 } } };
    const frozen  = JSON.parse(JSON.stringify(variant));
    applyOverrides({ dashboard: { stats: { students: 20 } } }, variant);
    expect(variant).toEqual(frozen);
  });
});

// ─── EDGE CASES ──────────────────────────────────────────────────────────────

describe("applyOverrides — edge cases", () => {
  it("TC-E1: empty variant returns a copy of base", () => {
    const base   = { dashboard: { stats: { students: 20 } } };
    const result = applyOverrides(base, {});
    expect(result).toEqual(base);
    expect(result).not.toBe(base);
  });

  it("TC-E2: empty base with partial variant returns variant fields", () => {
    const result = applyOverrides({}, { dashboard: { stats: { students: 1 } } });
    expect(result.dashboard.stats.students).toBe(1);
  });
});
