/**
 * Phase 5 — E2E smoke tests for dashboard state variations.
 *
 * These are lightweight path-checks verifying that DataVariantProvider
 * wiring doesn't break any existing dashboard routes.
 *
 * Run: npm run e2e -- --grep "Phase 5"
 */
const { test, expect } = require("@playwright/test");
const { loginAsAdmin } = require("./helpers/auth");

test.describe("Phase 5 — dashboard state variant smoke", () => {
  // TC-E2E1: Dashboard renders with default data
  test("TC-E2E1: dashboard home renders default stats without crash", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/dashboard/dashboard");

    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
    // Default dashboard.stats.students = 20 (src/data/defaults/dashboard.js)
    await expect(page.getByText("20")).toBeVisible();
  });

  // TC-E2E2: IDM page renders cleanly after variant migration
  test("TC-E2E2: IDM page renders without uncaught JS errors after variant migration", async ({ page }) => {
    const jsErrors = [];
    page.on("pageerror", (err) => jsErrors.push(err.message));

    await loginAsAdmin(page);
    await page.goto("/dashboard/idm");

    await expect(
      page.getByRole("heading", { name: /Identity Management|IDM/i })
    ).toBeVisible();

    const fatalErrors = jsErrors.filter(
      (e) => !e.includes("ResizeObserver") && !e.includes("Script error")
    );
    expect(fatalErrors).toHaveLength(0);
  });

  // TC-E2E3: No error boundary triggered on dashboard routes
  test("TC-E2E3: no error boundary triggered on dashboard home route", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/dashboard/dashboard");

    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
    await expect(page.getByText(/application error/i)).not.toBeVisible();
  });

  // TC-E2E4: Navigate away and back — default state preserved
  test("TC-E2E4: navigating away from dashboard and returning preserves default state", async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto("/dashboard/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();

    await page.goto("/dashboard/idm");
    await expect(
      page.getByRole("heading", { name: /Identity Management|IDM/i })
    ).toBeVisible();

    await page.goto("/dashboard/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();
    await expect(page.getByText("20")).toBeVisible();
  });
});
