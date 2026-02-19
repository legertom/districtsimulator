import { describe, expect, it } from "vitest";
import {
    DEFAULT_DASHBOARD_PAGE,
    DEFAULT_PROVISIONING_STEP,
    buildApplicationDetailsRoute,
    buildDashboardRoute,
    buildProvisioningRoute,
    isValidDashboardPage,
    isValidProvisioningStep,
    parseApplicationId,
    parseDashboardPage,
    parseProvisioningStep,
} from "@/lib/routing";

describe("dashboard route parsing", () => {
    it("accepts valid dashboard pages", () => {
        expect(isValidDashboardPage("idm")).toBe(true);
        expect(parseDashboardPage("idm")).toBe("idm");
    });

    it("normalizes unknown dashboard pages to the default", () => {
        expect(isValidDashboardPage("not-a-real-page")).toBe(false);
        expect(parseDashboardPage("not-a-real-page")).toBe(DEFAULT_DASHBOARD_PAGE);
    });

    it("builds dashboard URLs from valid and invalid values", () => {
        expect(buildDashboardRoute("sis-sync")).toBe("/dashboard/sis-sync");
        expect(buildDashboardRoute("totally-wrong")).toBe("/dashboard/dashboard");
    });
});

describe("provisioning step route parsing", () => {
    it("accepts slug steps", () => {
        expect(isValidProvisioningStep("credentials")).toBe(true);
        expect(parseProvisioningStep("credentials")).toBe("credentials");
    });

    it("maps integer step values to canonical slug steps", () => {
        expect(isValidProvisioningStep("4")).toBe(true);
        expect(parseProvisioningStep("4")).toBe("credentials");
    });

    it("normalizes invalid steps to the default step", () => {
        expect(isValidProvisioningStep("99")).toBe(false);
        expect(parseProvisioningStep("99")).toBe(DEFAULT_PROVISIONING_STEP);
    });

    it("always builds canonical provisioning URLs", () => {
        expect(buildProvisioningRoute("4")).toBe("/dashboard/idm/provisioning/credentials");
        expect(buildProvisioningRoute("preview")).toBe("/dashboard/idm/provisioning/preview");
    });
});

describe("application detail route parsing", () => {
    it("accepts positive integer app ids", () => {
        expect(parseApplicationId("7")).toBe(7);
        expect(parseApplicationId("0009")).toBe(9);
    });

    it("returns null for invalid app ids", () => {
        expect(parseApplicationId("0")).toBeNull();
        expect(parseApplicationId("-2")).toBeNull();
        expect(parseApplicationId("abc")).toBeNull();
        expect(parseApplicationId("9abc")).toBeNull();
    });

    it("builds canonical application detail URLs", () => {
        expect(buildApplicationDetailsRoute("5")).toBe("/dashboard/my-applications/5");
        expect(buildApplicationDetailsRoute("0008")).toBe("/dashboard/my-applications/8");
        expect(buildApplicationDetailsRoute("not-valid")).toBe("/dashboard/my-applications");
    });
});
