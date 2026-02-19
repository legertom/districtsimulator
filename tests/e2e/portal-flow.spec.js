import { test, expect } from '@playwright/test';

test.describe('Portal and dashboard smoke flows', () => {
  test('credentials login lands on portal, can enter dashboard, and return', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email Address').fill('principal@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Log in' }).click();

    const portalHeaderDashboardButton = page.getByRole('button', { name: 'Admin Dashboard', exact: true });
    await expect(portalHeaderDashboardButton).toBeVisible();

    await portalHeaderDashboardButton.click();

    const topNavPortalButton = page.getByRole('banner').getByRole('button', { name: 'Portal' });
    await expect(topNavPortalButton).toBeVisible();

    await topNavPortalButton.click();

    await expect(page.getByRole('button', { name: 'Admin Dashboard', exact: true })).toBeVisible();
  });

  test('portal app launches into mapped dashboard page', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email Address').fill('principal@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Log in' }).click();

    const sisSyncTile = page.getByRole('button', { name: /SIS Sync/i });
    await expect(sisSyncTile).toBeVisible();
    await sisSyncTile.click();

    await expect(page.getByRole('heading', { name: 'Sync' })).toBeVisible();
  });
});
