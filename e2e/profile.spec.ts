import { test, expect } from 'playwright/test';
import { seedAuth, mockApi } from './helpers';

test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApi(page);
});

test('profile page shows title and form fields', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: /update/i })).toBeVisible();
});

test('profile page pre-fills name and email from JWT token', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByLabel('Name')).toHaveValue('Test User');
    await expect(page.getByLabel('Email')).toHaveValue('test@example.com');
});

test('submitting with mismatched new passwords shows error', async ({ page }) => {
    await page.goto('/profile');

    await page.getByLabel('Current Password').fill('oldpass1');
    await page.getByLabel('New Password', { exact: true }).fill('newpass1');
    await page.getByLabel('Repeat New Password').fill('newpass2');
    await page.getByRole('button', { name: /update/i }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
});
