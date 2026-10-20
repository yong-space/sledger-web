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

// Rows with sub-categories, so tests can check the "Category: Sub" label survives grid updates
const labelled = [
    { ...transactions[0], subCategory: 'Salary' },
    { ...transactions[1], subCategory: 'Supermarket' },
    { ...transactions[2], subCategory: 'Electricity' },
];

const routeListSequence = async (page, responses) => {
    let calls = 0;
    await page.route('**/api/transaction/1', async (route) => {
        if (route.request().method() !== 'GET') {
            return route.fallback();
        }
        const body = responses[Math.min(calls++, responses.length - 1)];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
};

const selectRow = (page, remarks) =>
    page.getByRole('row').filter({ hasText: remarks }).getByRole('checkbox').check();

test('deleting a transaction removes it and refreshes balances', async ({ page }) => {
    await routeListSequence(page, [
        labelled,
        [ labelled[0], { ...labelled[2], balance: 900.00 } ],
    ]);

    await page.goto('/tx/1');
    await selectRow(page, 'Groceries');
    await page.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText(/1 transaction deleted/i)).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Groceries' })).toBeHidden();
    await expect(page.getByRole('button', { name: /delete/i })).toBeHidden();
    await expect(page.getByRole('gridcell', { name: '900.00' })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Utilities: Electricity' })).toBeVisible();
});

test('bulk editing remarks updates every selected row', async ({ page }) => {
    await mockApi(page, { 'PUT /api/transaction/bulk': {} });
    await routeListSequence(page, [ labelled ]);

    await page.goto('/tx/1');
    await selectRow(page, 'Groceries');
    await selectRow(page, 'Electricity');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Remarks').fill('Household');
    await page.getByRole('button', { name: 'Bulk Edit Transactions' }).click();

    await expect(page.getByText('Transactions edited')).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Household' })).toHaveCount(2);
    await expect(page.getByRole('gridcell', { name: 'Salary', exact: true })).toBeVisible();
});

test('merging transactions combines them and keeps category labels', async ({ page }) => {
    const merged = { ...labelled[1], amount: -150.00, balance: 850.00, remarks: 'Groceries Electricity' };
    await mockApi(page, { 'PUT /api/transaction': [ merged ] });
    await routeListSequence(page, [ labelled, [ labelled[0], merged ] ]);

    await page.goto('/tx/1');
    await selectRow(page, 'Groceries');
    await selectRow(page, 'Electricity');
    await page.getByRole('gridcell', { name: 'Groceries' }).click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Merge Transactions' }).click();

    await expect(page.getByText('Transactions merged')).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Groceries Electricity' })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Electricity', exact: true })).toBeHidden();
    await expect(page.getByRole('gridcell', { name: 'Food: Supermarket' })).toBeVisible();
});

test('splitting a transaction adds the new row and keeps category labels', async ({ page }) => {
    const editedSalary = { ...labelled[0], amount: 400.00, balance: 400.00 };
    const splitPart = { ...labelled[0], id: 10, amount: 600.00, balance: 1000.00 };
    await mockApi(page, {
        'PUT /api/transaction': [ editedSalary ],
        'POST /api/transaction': [ splitPart ],
    });
    await routeListSequence(page, [
        labelled,
        [ editedSalary, splitPart, { ...labelled[1], balance: 950.00 }, { ...labelled[2], balance: 850.00 } ],
    ]);

    await page.goto('/tx/1');
    await page.getByRole('gridcell', { name: 'Salary', exact: true }).click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Split Transaction' }).click();
    await page.getByRole('dialog').getByRole('textbox').first().fill('400');
    await page.getByRole('button', { name: 'Split Transaction' }).click();

    await expect(page.getByText(/split successfully/i)).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Salary', exact: true })).toHaveCount(2);
    await expect(page.getByRole('gridcell', { name: 'Income: Salary' })).toHaveCount(2);
    await expect(page.getByRole('gridcell', { name: 'Food: Supermarket' })).toBeVisible();
});

test('adding a transaction while on an earlier page shows the new row', async ({ page }) => {
    const many = Array.from({ length: 60 }, (_, i) => ({
        ...transactions[0], id: 100 + i, remarks: `Entry ${i}`,
        date: new Date(Date.UTC(2024, 0, 1 + i)).toISOString(),
    }));
    const newTx = { ...transactions[0], id: 500, remarks: 'Latest entry', date: new Date(Date.UTC(2024, 5, 1)).toISOString() };
    await mockApi(page, { 'POST /api/transaction': [ newTx ] });
    await routeListSequence(page, [ many ]);

    await page.goto('/tx/1');
    await page.getByRole('button', { name: 'Go to first page' }).click();
    await expect(page.getByRole('gridcell', { name: 'Entry 0', exact: true })).toBeVisible();

    await page.getByRole('button', { name: /add/i }).click();
    await page.getByRole('button', { name: 'Credit' }).click();
    await page.getByLabel('Amount').fill('10');
    await page.getByLabel('Remarks').fill('Latest entry');
    await page.getByLabel('Category').fill('Income');
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    await expect(page.getByRole('gridcell', { name: 'Latest entry' })).toBeVisible();
});
