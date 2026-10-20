import { test, expect } from 'playwright/test';
import { seedAuth, mockApi } from './helpers';
import { balanceHistory } from './fixtures';

test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApi(page);
});

test('hovering dash nav button opens submenu and item navigates', async ({ page }) => {
    await mockApi(page, { 'GET /api/dash/balance-history': balanceHistory });
    await page.goto('/dash/summary');
    await expect(page.getByRole('heading', { name: 'Summary' })).toBeVisible();

    await page.locator('#dash-button').hover();
    await expect(page.getByRole('menuitem', { name: 'Balance History' })).toBeVisible();

    // no aria-hidden applied to the app root while the menu is open
    expect(await page.locator('#root').getAttribute('aria-hidden')).toBeNull();

    await page.getByRole('menuitem', { name: 'Balance History' }).click();
    await expect(page).toHaveURL(/\/dash\/balance-history/);
    await expect(page.getByRole('menuitem', { name: 'Balance History' })).toBeHidden();
});

test('moving pointer from button into submenu keeps it open, leaving closes it', async ({ page }) => {
    await page.goto('/dash/summary');
    await page.locator('#settings-button').hover();
    const menu = page.getByRole('menuitem', { name: 'Templates' });
    await expect(menu).toBeVisible();

    await menu.hover();
    await expect(menu).toBeVisible();

    await page.getByRole('heading', { name: 'Summary' }).hover();
    await expect(menu).toBeHidden();
});

test('hovering profile button opens profile menu with logout', async ({ page }) => {
    await page.goto('/dash/summary');
    await page.locator('#avatar').hover();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
    expect(await page.locator('#root').getAttribute('aria-hidden')).toBeNull();
});
