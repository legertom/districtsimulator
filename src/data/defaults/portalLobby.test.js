import { describe, expect, it } from "vitest";
import { portalApps } from "./portalLobby";

const DASHBOARD_TARGETS = new Set([
  "dashboard",
  "my-applications",
  "add-applications",
  "lms-connect",
  "library-controls",
  "sis-sync",
  "custom-data",
  "data-browser",
  "idm",
  "license-manager",
  "admin-team",
  "access-logs",
  "sso-settings",
  "badges",
  "classroom-mfa",
  "portal-settings",
  "profile",
]);

describe("portalLobby defaults", () => {
  it("defines unique app ids", () => {
    const ids = portalApps.map((app) => app.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains both live and coming soon app modes", () => {
    const modes = new Set(portalApps.map((app) => app.launchMode));
    expect(modes.has("dashboard")).toBe(true);
    expect(modes.has("comingSoon")).toBe(true);
  });

  it("uses valid dashboard targets for live apps", () => {
    const liveApps = portalApps.filter((app) => app.launchMode === "dashboard");

    for (const app of liveApps) {
      expect(app.launchTarget).toBeTruthy();
      expect(DASHBOARD_TARGETS.has(app.launchTarget)).toBe(true);
    }
  });

  it("does not set launchTarget for coming soon apps", () => {
    const comingSoonApps = portalApps.filter((app) => app.launchMode === "comingSoon");

    for (const app of comingSoonApps) {
      expect(app.launchTarget).toBeNull();
    }
  });
});
