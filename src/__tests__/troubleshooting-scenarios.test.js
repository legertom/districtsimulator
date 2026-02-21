import { describe, it, expect } from "vitest";
import { scenarios } from "@/data/scenarios";
import { COURSES } from "@/data/curriculum";

describe("Phase 6 troubleshooting scenarios", () => {
  const ids = [
    "scenario_sync_failure",
    "scenario_missing_teacher",
    "scenario_stale_provisioning",
  ];

  it("adds troubleshooting module with expected scenario IDs", () => {
    const course = COURSES.find((c) => c.id === "course_idm_fundamentals");
    const mod = course?.modules.find((m) => m.id === "mod_troubleshooting");
    expect(mod).toBeTruthy();
    expect(mod.prerequisites).toContain("mod_review_provision");
    expect(mod.scenarioIds).toEqual(ids);
  });

  it("troubleshooting scenarios exist and use module id", () => {
    ids.forEach((id) => {
      const s = scenarios.find((x) => x.id === id);
      expect(s).toBeTruthy();
      expect(s.moduleId).toBe("mod_troubleshooting");
      expect(typeof s.ticketMessage).toBe("string");
      expect(Array.isArray(s.steps)).toBe(true);
      expect(s.steps.length).toBeGreaterThan(0);
    });
  });

  it("each troubleshooting scenario includes idm data overrides", () => {
    ids.forEach((id) => {
      const s = scenarios.find((x) => x.id === id);
      const idmOverrides = s?.settings?.dataOverrides?.idm;
      expect(idmOverrides).toBeTruthy();
      expect(
        Array.isArray(idmOverrides.syncHistory) || Array.isArray(idmOverrides.events)
      ).toBe(true);
    });
  });
});
