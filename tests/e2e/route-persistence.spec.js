const { test, expect } = require("@playwright/test");

async function login(page) {
    await page.goto("/login");
    await page.getByLabel("Email Address").fill("principal@example.com");
    await page.getByLabel("Password").fill("password");

    await Promise.all([
        page.waitForURL("**/"),
        page.getByRole("button", { name: "Log in" }).click(),
    ]);
}

test.beforeEach(async ({ page }) => {
    await login(page);
});

test("refresh persists dashboard IDM route", async ({ page }) => {
    await page.goto("/dashboard/idm");

    await expect(page).toHaveURL(/\/dashboard\/idm$/);
    await expect(page.getByRole("heading", { name: "Clever IDM" })).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL(/\/dashboard\/idm$/);
    await expect(page.getByRole("heading", { name: "Clever IDM" })).toBeVisible();
});

test("refresh persists IDM provisioning step route", async ({ page }) => {
    await page.goto("/dashboard/idm");
    await page.getByRole("button", { name: "Edit Google provisioning" }).click();

    await expect(page).toHaveURL(/\/dashboard\/idm\/provisioning\/connect$/);

    await page.getByRole("button", { name: "Set login credentials" }).click();
    await expect(page).toHaveURL(/\/dashboard\/idm\/provisioning\/credentials$/);

    await page.reload();

    await expect(page).toHaveURL(/\/dashboard\/idm\/provisioning\/credentials$/);
    await expect(page.getByText("Set login credentials").first()).toBeVisible();
});

test("refresh persists portal route", async ({ page }) => {
    await page.goto("/dashboard/sis-sync");
    await page.getByRole("banner").getByRole("button", { name: "Portal" }).click();

    await expect(page).toHaveURL(/\/$/);

    await page.reload();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Your Applications" })).toBeVisible();
});

test("browser back and forward keeps portal/dashboard route history", async ({ page }) => {
    await page.goto("/dashboard/dashboard");
    await expect(page).toHaveURL(/\/dashboard\/dashboard$/);

    await page.getByRole("banner").getByRole("button", { name: "Portal" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard\/dashboard$/);

    await page.goForward();
    await expect(page).toHaveURL(/\/$/);
});

test("OU edit persists through page reload", async ({ page }) => {
    // Navigate to provisioning wizard OUs step
    await page.goto("/dashboard/idm/provisioning/ous");

    await expect(page.getByRole("heading", { name: "Organize OUs" })).toBeVisible();

    // Click Edit on Student OUs card
    const studentCard = page.locator("text=Student OUs").first();
    await expect(studentCard).toBeVisible();
    const editBtn = page.getByRole("button", { name: "Edit" }).first();
    await editBtn.click();

    // Should show Student OUs edit view
    await expect(page.getByRole("heading", { name: "Student OUs" })).toBeVisible();

    // Click on a different OU in the tree (e.g. "Devices")
    await page.getByText("Devices").click();

    // Click Next step to return to overview
    await page.getByRole("button", { name: "Next step" }).click();

    // Verify we're back on the overview
    await expect(page.getByRole("heading", { name: "Organize OUs" })).toBeVisible();

    // Verify the Student OU card now shows /Devices
    await expect(page.getByText("/Devices")).toBeVisible();

    // Reload the page
    await page.reload();

    // Verify the OU path persisted through reload
    await expect(page).toHaveURL(/\/dashboard\/idm\/provisioning\/ous$/);
    await expect(page.getByText("/Devices")).toBeVisible();
});
