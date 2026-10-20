import { test, expect } from 'playwright/test';
import { seedAuth, mockApi } from './helpers';
import { balanceHistory, creditCardBills, insights } from './fixtures';

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

test('credit card bills page shows title and account selector', async ({ page }) => {
    await mockApi(page, { 'GET /api/dash/credit-card-bills/2': creditCardBills });

    await page.goto('/dash/credit-card-bills/2');

    await expect(page.getByRole('heading', { name: 'Credit Card Bills' })).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
});

test('balance history page shows title', async ({ page }) => {
    await mockApi(page, { 'GET /api/dash/balance-history': null });

    await page.goto('/dash/balance-history');

    await expect(page.getByRole('heading', { name: 'Balance History' })).toBeVisible();
});

test('balance history page renders the chart', async ({ page }) => {
    await mockApi(page, { 'GET /api/dash/balance-history': balanceHistory });

    await page.goto('/dash/balance-history');

    await expect(page.getByText('Jan 24')).toBeVisible();
    await expect(page.getByText('Feb 24')).toBeVisible();
});

test('insights average tab shows category summary grid', async ({ page }) => {
    await mockApi(page, { 'GET /api/dash/insights': insights });

    await page.goto('/dash/insights');

    await expect(page.getByRole('heading', { name: 'Past Year Insights' })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Food' })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Income' })).toBeVisible();
});

test('insights monthly tab renders the chart', async ({ page }) => {
    await mockApi(page, { 'GET /api/dash/insights': insights });

    await page.goto('/dash/insights/monthly');

    await expect(page.getByRole('tab', { name: 'Monthly' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Jan', { exact: true })).toBeVisible();
    await expect(page.getByText('Feb', { exact: true })).toBeVisible();
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
