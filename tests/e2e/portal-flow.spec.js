const { test, expect } = require("@playwright/test");
const { loginAsAdmin } = require("./helpers/auth");

test.describe("Portal and dashboard smoke flows", () => {
    test("credentials login lands on portal, can enter dashboard, and return", async ({ page }) => {
        await loginAsAdmin(page);

        await expect(page.getByRole("heading", { name: "Resources" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Dashboard" })).toBeVisible();

        await page.getByRole("button", { name: "Dashboard" }).click();
        await expect(page).toHaveURL(/\/dashboard\/dashboard$/);
        await expect(page.getByRole("heading", { name: "Dashboard Home" })).toBeVisible();

        await page.locator('button[class*="portalLink"]').click();
        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole("heading", { name: "Resources" })).toBeVisible();
    });

    test("portal app launches into mapped dashboard page", async ({ page }) => {
        await loginAsAdmin(page);

        const appTile = page.getByRole("button", { name: /Waffle Wizard Academy/i });
        await expect(appTile).toBeVisible();
        await appTile.click();

        await expect(page).toHaveURL(/\/dashboard\/my-applications\/\d+$/);
        await expect(page.getByRole("heading", { name: "Waffle Wizard Academy", exact: true })).toBeVisible();
    });
});
