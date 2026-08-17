import { test, expect } from 'playwright/test';
import { seedAuth, mockApi } from './helpers';
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

test('cancelling a currency change does not corrupt the sticky default for the next Add dialog', async ({ page }) => {
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

    // Open a fresh Add dialog, poke the currency dropdown to EUR, then cancel
    // without saving.
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByLabel('Currency')).toHaveValue('USD');
    await page.getByLabel('Currency').click();
    await page.getByRole('option', { name: 'EUR' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();

    // The abandoned EUR selection must not have overwritten the sticky value.
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByLabel('Currency')).toHaveValue('USD');
});
