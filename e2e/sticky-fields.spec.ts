import { test, expect } from 'playwright/test';
import { seedAuth, mockApi } from './helpers';
import type { Page } from 'playwright/test';
import { issuers as baseIssuers, accounts as baseAccounts } from './fixtures';

const multiCurrencyAccount = {
    id: 3, name: 'Multi Currency Cash', type: 'Cash', issuerId: 1,
    balance: 500.00, visible: true, multiCurrency: true,
};

const accounts = [ ...baseAccounts, multiCurrencyAccount ];

const usdTx = {
    id: 20, accountId: 3, date: '2024-02-01T00:00:00Z',
    amount: -75.00, originalAmount: -50.00, currency: 'USD', balance: 425.00,
    remarks: 'Foreign spend', category: 'Shopping', company: '',
};

const sgdTx = {
    // No `currency` field at all: the backend's convention for the implicit
    // default currency on a multi-currency account.
    id: 21, accountId: 3, date: '2024-02-02T00:00:00Z',
    amount: -20.00, balance: 405.00,
    remarks: 'Local spend', category: 'Food', company: '',
};

test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApi(page, {
        'GET /api/account-issuer': baseIssuers,
        'GET /api/account': accounts,
        'GET /api/transaction/3': [ usdTx, sgdTx ],
    });
});

test('editing an SGD transaction resets the currency field to SGD after a previous USD edit', async ({ page }) => {
    await mockApi(page, {
        'GET /api/account-issuer': baseIssuers,
        'GET /api/account': accounts,
        'GET /api/transaction/3': [ usdTx, sgdTx ],
        'PUT /api/transaction': [ usdTx ],
    });

    await page.goto('/tx/3');

    await page.getByText('Foreign spend').first().dblclick();
    await expect(page.getByLabel('Currency')).toHaveValue('USD');

    const putRequest = page.waitForRequest((req) =>
        req.url().includes('/api/transaction') && req.method() === 'PUT'
    );
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await putRequest;
    await expect(page.getByText(/transaction edited/i)).toBeVisible();

    await page.getByText('Local spend').first().dblclick();
    await expect(page.getByLabel('Currency')).toHaveValue('SGD');
});

test('a currency change sticks for the next Add dialog even when cancelled', async ({ page }) => {
    const newTx = { ...usdTx, id: 22, remarks: 'New USD spend' };
    await mockApi(page, {
        'GET /api/account-issuer': baseIssuers,
        'GET /api/account': accounts,
        'GET /api/transaction/3': [ usdTx, sgdTx ],
        'POST /api/transaction': [ newTx ],
    });

    await page.goto('/tx/3');

    // Add and save a USD transaction so USD becomes the sticky default.
    await page.getByRole('button', { name: /add/i }).click();
    await page.getByLabel('Currency').click();
    await page.getByRole('option', { name: 'USD' }).click();
    await page.getByRole('button', { name: 'Credit' }).click();
    await page.locator('input[name="amount"]').fill('50');
    await page.getByLabel('Original Amount').fill('50');
    await page.getByLabel('Remarks').fill('New USD spend');
    await page.getByLabel('Category').fill('Shopping');

    const postRequest = page.waitForRequest((req) =>
        req.url().includes('/api/transaction') && req.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await postRequest;
    await expect(page.getByText(/transaction added/i)).toBeVisible();

    // Open a fresh Add dialog, switch the currency to EUR, then cancel without saving.
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByLabel('Currency')).toHaveValue('USD');
    await page.getByLabel('Currency').click();
    await page.getByRole('option', { name: 'EUR' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByLabel('Currency')).toHaveValue('EUR');
});

test('opening an existing transaction makes its currency the sticky default even without saving', async ({ page }) => {
    await page.goto('/tx/3');

    await page.getByText('Foreign spend').first().dblclick();
    await expect(page.getByLabel('Currency')).toHaveValue('USD');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByLabel('Currency')).toHaveValue('USD');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.getByText('Local spend').first().dblclick();
    await expect(page.getByLabel('Currency')).toHaveValue('SGD');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByLabel('Currency')).toHaveValue('SGD');
});

test('a typed (not picked) currency on a new transaction becomes the sticky default', async ({ page }) => {
    const newTx = { ...usdTx, id: 22, remarks: 'New USD spend' };
    await mockApi(page, {
        'GET /api/account-issuer': baseIssuers,
        'GET /api/account': accounts,
        'GET /api/transaction/3': [ usdTx, sgdTx ],
        'POST /api/transaction': [ newTx ],
    });

    await page.goto('/tx/3');

    await page.getByText('Local spend').first().dblclick();
    await expect(page.getByLabel('Currency')).toHaveValue('SGD');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.getByRole('button', { name: /add/i }).click();
    await page.getByLabel('Currency').fill('USD');
    await page.locator('input[name="amount"]').fill('75');
    await page.getByLabel('Original Amount').fill('50');
    await page.getByLabel('Remarks').fill('New USD spend');
    await page.getByLabel('Category').fill('Shopping');

    const postRequest = page.waitForRequest((req) =>
        req.url().includes('/api/transaction') && req.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await postRequest;
    await expect(page.getByText(/transaction added/i)).toBeVisible();

    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByLabel('Currency')).toHaveValue('USD');
});

const dateField = (page: Page) => page.getByRole('group', { name: 'Date' });

test('a date change sticks for the next Add dialog even when cancelled', async ({ page }) => {
    await page.goto('/tx/3');

    await page.getByText('Foreign spend').first().dblclick();
    await expect(dateField(page)).toContainText('2024-02-01');
    await page.locator('form button').nth(1).click(); // back one day
    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.getByRole('button', { name: /add/i }).click();
    await expect(dateField(page)).toContainText('2024-01-31');
});

test('a cleared date blocks submission instead of crashing', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await mockApi(page, {
        'GET /api/account-issuer': baseIssuers,
        'GET /api/account': accounts,
        'GET /api/transaction/2': [],
    });

    // Credit account, so the billing month effect also sees the cleared date
    await page.goto('/tx/2');
    await page.getByRole('button', { name: /add/i }).click();
    await page.getByRole('spinbutton', { name: 'Day' }).click();
    await page.keyboard.press('Backspace');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.getByRole('button', { name: /add/i }).click();
    await page.locator('input[name="amount"]').fill('5');
    await page.getByLabel('Remarks').fill('Snack');
    await page.getByLabel('Category').fill('Food');
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await expect(page.getByText('Enter a valid date')).toBeVisible();

    // The day arrows recover from an empty date
    await page.locator('form button').nth(3).click(); // forward one day (nth(2) is the calendar button)
    await expect(dateField(page)).not.toContainText('YYYY');
    expect(errors).toEqual([]);
});

test('the currency clear button resets the sticky currency to SGD', async ({ page }) => {
    await page.goto('/tx/3');

    await page.getByText('Foreign spend').first().dblclick();
    await expect(page.getByLabel('Currency')).toHaveValue('USD');
    await page.getByLabel('Currency').hover();
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByLabel('Currency')).toHaveValue('SGD');
    await expect(page.getByRole('button', { name: 'Clear' })).toHaveCount(0);
    await page.screenshot({ path: 'test-results/currency-clear.png' });
    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByLabel('Currency')).toHaveValue('SGD');
});
