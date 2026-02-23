import { test, expect } from 'playwright/test';
import { seedAuth, mockApi } from './helpers';
import { transactions } from './fixtures';

test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApi(page);
});

test('transactions page shows title and account selector', async ({ page }) => {
    await page.goto('/tx/1');

    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
});

test('transactions grid shows rows from fixture data', async ({ page }) => {
    await page.goto('/tx/1');

    await expect(page.getByText('Salary')).toBeVisible();
    await expect(page.getByText('Groceries')).toBeVisible();
    await expect(page.getByText('Electricity')).toBeVisible();
});

test('Add button opens the add transaction dialog', async ({ page }) => {
    await page.goto('/tx/1');

    await page.getByRole('button', { name: /add/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Add Transaction').first()).toBeVisible();
});

test('add transaction dialog has Credit/Debit toggle and amount field', async ({ page }) => {
    await page.goto('/tx/1');
    await page.getByRole('button', { name: /add/i }).click();

    await expect(page.getByRole('button', { name: 'Credit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Debit' })).toBeVisible();
    await expect(page.getByLabel('Amount')).toBeVisible();
    await expect(page.getByLabel('Remarks')).toBeVisible();
});

test('submitting add transaction dialog calls POST and shows success', async ({ page }) => {
    const newTx = { ...transactions[0], id: 10, remarks: 'Test payment', balance: 900.00 };

    await mockApi(page, {
        'POST /api/transaction': [newTx],
        'GET /api/transaction/1': [...transactions, newTx],
    });

    await page.goto('/tx/1');
    await page.getByRole('button', { name: /add/i }).click();

    const postRequest = page.waitForRequest((req) =>
        req.url().includes('/api/transaction') && req.method() === 'POST'
    );

    await page.getByRole('button', { name: 'Credit' }).click();
    await page.getByLabel('Amount').fill('100');
    await page.getByLabel('Remarks').fill('Test payment');
    await page.getByLabel('Category').fill('Food');
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    await postRequest;
    await expect(page.getByText(/transaction added/i)).toBeVisible();
});

test('selecting a row shows Delete button', async ({ page }) => {
    await page.goto('/tx/1');

    // Click the checkbox of the first row to select it
    const firstCheckbox = page.getByRole('checkbox').nth(1);
    await firstCheckbox.click();

    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
});

test('delete button shows confirmation dialog', async ({ page }) => {
    await page.goto('/tx/1');

    const firstCheckbox = page.getByRole('checkbox').nth(1);
    await firstCheckbox.click();

    await page.getByRole('button', { name: /delete/i }).click();

    await expect(page.getByText('Confirm Deletion')).toBeVisible();
});
