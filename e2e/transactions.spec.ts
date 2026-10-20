import { test, expect } from 'playwright/test';
import { seedAuth, mockApi } from './helpers';
import { importedTransactions, issuers, transactions } from './fixtures';

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

test('processing a transaction split completes without crashing', async ({ page }) => {
    // The reconciliation step after a split re-fetches the transaction list and
    // diffs it against whatever is currently in the grid. If a row present in the
    // grid (e.g. "Groceries") is no longer in that refreshed list — because another
    // tab/device deleted it concurrently — the diff must not crash trying to read
    // `.balance` off the missing row.
    const editedMainTx = { ...transactions[0], amount: 1.00, balance: 951.00 };
    const splitTx = { ...transactions[0], id: 10, amount: 999.99, balance: 1950.00, remarks: 'Salary' };

    await mockApi(page, {
        'PUT /api/transaction': [editedMainTx],
        'POST /api/transaction': [splitTx],
    });

    let getCount = 0;
    await page.route('**/api/transaction/1', async (route) => {
        getCount += 1;
        const body = getCount === 1
            ? transactions
            : [editedMainTx, transactions[2], splitTx]; // "Groceries" (transactions[1]) is missing
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });

    await page.goto('/tx/1');

    await page.getByText('Salary').first().click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Split Transaction' }).click();
    await expect(page.getByRole('heading', { name: /Split/ })).toBeVisible();

    await page.getByRole('button', { name: 'Split Transaction' }).click();

    await expect(page.getByText(/split successfully/i)).toBeVisible();
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

test('confirming transaction delete shows success message', async ({ page }) => {
    await page.goto('/tx/1');

    const firstCheckbox = page.getByRole('checkbox').nth(1);
    await firstCheckbox.click();
    await page.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText(/1 transaction deleted/i)).toBeVisible();
});

test('importing a file shows parsed rows and submits selected transactions', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await mockApi(page, {
        'GET /api/account-issuer': issuers.map((i) => ({ ...i, canImport: true })),
        'POST /api/import': importedTransactions,
        'POST /api/transaction': importedTransactions,
    });

    await page.goto('/tx/1');
    await page.getByRole('button', { name: 'Import' }).click();

    const uploadRequest = page.waitForRequest((req) =>
        req.url().includes('/api/import') && req.method() === 'POST'
    );
    await page.locator('input[type=file]').setInputFiles({
        name: 'export.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('date,amount,remarks\n2024-03-01,-12.50,Coffee\n'),
    });
    await uploadRequest;

    await expect(page.getByRole('gridcell', { name: 'Coffee' })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Food: Cafe' })).toBeVisible();

    const submitRequest = page.waitForRequest((req) =>
        req.url().includes('/api/transaction') && req.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Import Transactions' }).click();
    await submitRequest;
    await expect(page.getByText('1 Transactions imported')).toBeVisible();
});

test('Edit with one selected row opens a pre-filled edit dialog', async ({ page }) => {
    await page.goto('/tx/1');
    await page.getByRole('gridcell', { name: 'Groceries' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Edit Transaction' })).toBeVisible();
    await expect(page.getByLabel('Remarks')).toHaveValue('Groceries');
});

test('Edit right after adding a transaction pre-fills the dialog', async ({ page }) => {
    const newTx = { ...transactions[0], id: 10, remarks: 'Bonus', balance: 1950.00, date: '2024-01-18T00:00:00Z' };
    await mockApi(page, { 'POST /api/transaction': [newTx] });

    await page.goto('/tx/1');
    await page.getByRole('button', { name: /add/i }).click();
    await page.getByRole('button', { name: 'Credit' }).click();
    await page.getByLabel('Amount').fill('1000');
    await page.getByLabel('Remarks').fill('Bonus');
    await page.getByLabel('Category').fill('Income');
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Edit Transaction' })).toBeVisible();
    await expect(page.getByLabel('Remarks')).toHaveValue('Bonus');
});

test('selecting all rows with the header checkbox shows Delete', async ({ page }) => {
    await page.goto('/tx/1');
    await page.getByRole('checkbox', { name: /select all/i }).check();

    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('This will permanently delete 3 transactions')).toBeVisible();
});

test('returning from the dashboard keeps the grid on the same page', async ({ page }) => {
    const many = Array.from({ length: 60 }, (_, i) => ({
        ...transactions[0], id: 100 + i, remarks: `Entry ${i}`,
        date: new Date(Date.UTC(2024, 0, 1 + i)).toISOString(),
    }));
    await mockApi(page, { 'GET /api/transaction/1': many });

    await page.goto('/tx/1');
    await expect(page.getByRole('gridcell', { name: 'Entry 59', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Go to first page' }).click();
    await expect(page.getByRole('gridcell', { name: 'Entry 0', exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Summary' })).toBeVisible();
    await page.getByRole('link', { name: 'Transactions' }).click();

    await expect(page.getByRole('gridcell', { name: 'Entry 0', exact: true })).toBeVisible();
});
