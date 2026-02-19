import { describe, expect, it } from "vitest";
import { defaultScenario } from "./index";
import { portalApps } from "./portalLobby";

describe("defaultScenario wiring", () => {
  it("exposes portal lobby app config", () => {
    expect(defaultScenario.portalLobby).toBeDefined();
    expect(defaultScenario.portalLobby.apps).toBe(portalApps);
  });

  it("keeps required top-level domains for app runtime", () => {
    expect(defaultScenario.sidebar?.navItems?.length).toBeGreaterThan(0);
    expect(defaultScenario.topNav?.userInfo).toBeDefined();
    expect(defaultScenario.chat?.customerInfo).toBeDefined();
  });
});
