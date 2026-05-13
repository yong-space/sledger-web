import { test, expect } from 'playwright/test';
import { seedAuth, mockApi } from './helpers';
import { templates } from './fixtures';

test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApi(page, { 'GET /api/template': templates });
});

test('templates page shows title and action buttons', async ({ page }) => {
    await page.goto('/settings/templates');

    await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
    await expect(page.getByRole('button', { name: /add/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
});

test('templates page shows rows from fixture data', async ({ page }) => {
    await page.goto('/settings/templates');

    await expect(page.getByText('NTUC')).toBeVisible();
    await expect(page.getByText('SP GROUP')).toBeVisible();
});

test('Delete button is disabled when no row is selected', async ({ page }) => {
    await page.goto('/settings/templates');

    await expect(page.getByRole('button', { name: /delete/i })).toBeDisabled();
});

test('selecting a row enables the Delete button', async ({ page }) => {
    await page.goto('/settings/templates');

    await page.getByText('NTUC').click();

    await expect(page.getByRole('button', { name: /delete/i })).toBeEnabled();
});

test('Delete button shows confirmation dialog', async ({ page }) => {
    await page.goto('/settings/templates');

    await page.getByText('NTUC').click();
    await page.getByRole('button', { name: /delete/i }).click();

    await expect(page.getByText('Confirm delete template?')).toBeVisible();
});

test('Add button appends a new empty row to the grid', async ({ page }) => {
    await page.goto('/settings/templates');
    await expect(page.getByText('NTUC')).toBeVisible();

    const before = await page.getByRole('row').count();
    await page.getByRole('button', { name: /add/i }).click();

    await expect(page.getByRole('row')).toHaveCount(before + 1);
});
