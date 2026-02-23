import { test, expect } from 'playwright/test';
import { seedAuth, mockApi } from './helpers';

test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApi(page);
});

test('summary page shows title and account tables', async ({ page }) => {
    await page.goto('/dash/summary');

    await expect(page.getByRole('heading', { name: 'Summary' })).toBeVisible();
    await expect(page.getByText('Cash Accounts')).toBeVisible();
    await expect(page.getByText('Credit Accounts')).toBeVisible();
});

test('summary page shows account names from fixtures', async ({ page }) => {
    await page.goto('/dash/summary');

    await expect(page.getByText('Checking')).toBeVisible();
    await expect(page.getByText('Visa')).toBeVisible();
});

test('summary page shows Total Net Worth footer', async ({ page }) => {
    await page.goto('/dash/summary');

    await expect(page.getByText('Total Net Worth')).toBeVisible();
});

test('clicking account row navigates to transactions', async ({ page }) => {
    await page.goto('/dash/summary');

    await page.getByText('Checking').click();

    await expect(page).toHaveURL(/\/tx\/1/);
});

test('authenticated visit to / redirects to /dash', async ({ page }) => {
    await page.route('**/api/account-issuer', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.route('**/api/account', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    await page.goto('/');
    await expect(page).toHaveURL(/\/dash/);
});
