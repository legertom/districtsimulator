const { expect } = require("@playwright/test");

/**
 * Shared login helper for E2E tests.
 * Assumes the hardcoded credentials pair remains `admin@clever.com` / `password`.
 *
 * @param {import('@playwright/test').Page} page - The Playwright page instance
 */
async function loginAsAdmin(page) {
    await page.goto("/login");

    // We use the known hardcoded credential pair matching `auth.js`
    await page.getByLabel("Email Address").fill("admin@clever.com");
    await page.getByLabel("Password").fill("password");

    await Promise.all([
        page.waitForURL("**/"), // or wait for dashboard depending on logic
        page.getByRole("button", { name: "Log in" }).click(),
    ]);
}

module.exports = { loginAsAdmin };
