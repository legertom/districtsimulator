const { test, expect } = require("@playwright/test");
const { loginAsAdmin } = require("./helpers/auth");

test.describe("Helpdesk and Inbox smoke flows", () => {
    test("can open a ticket from the inbox and view the conversation", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/dashboard/dashboard");

        const inboxHeader = page.getByText("Help Desk", { exact: true });
        await expect(inboxHeader).toBeVisible();

        const firstOpenTicket = page.getByRole("button", { name: /Open/i }).first();
        await expect(firstOpenTicket).toBeVisible();
        await firstOpenTicket.click();

        const guidedButton = page.getByRole("button", { name: /^💡 Guided/i });
        await expect(guidedButton).toBeVisible();
        await guidedButton.click();

        const backButton = page.locator('button[title="Return to inbox"]');
        await expect(backButton).toBeVisible();
        await backButton.click();

        await expect(inboxHeader).toBeVisible();
    });
});
