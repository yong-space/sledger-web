import { test, expect } from 'playwright/test';
import { seedAuth, mockApi } from './helpers';

test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApi(page);
});

test('accounts page shows title and account rows', async ({ page }) => {
    await page.goto('/settings/accounts');

    await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible();
    await expect(page.getByText('Checking')).toBeVisible();
    await expect(page.getByText('Visa')).toBeVisible();
});

test('accounts page shows Add button when no row is selected', async ({ page }) => {
    await page.goto('/settings/accounts');

    await expect(page.getByRole('button', { name: /add/i })).toBeVisible();
});

test('Add button opens the add account dialog', async ({ page }) => {
    await page.goto('/settings/accounts');

    await page.getByRole('button', { name: /add/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
});

test('selecting a row shows Edit and Delete buttons', async ({ page }) => {
    await page.goto('/settings/accounts');

    await page.getByText('Checking').click();

    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
});

test('Edit button opens the edit account dialog', async ({ page }) => {
    await page.goto('/settings/accounts');

    await page.getByText('Checking').click();
    await page.getByRole('button', { name: /edit/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
});
