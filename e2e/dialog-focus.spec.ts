import { test, expect } from 'playwright/test';
import type { Page } from 'playwright/test';
import { seedAuth, mockApi } from './helpers';

// Chrome logs "Blocked aria-hidden on an element because its descendant
// retained focus" both when aria-hidden is applied to #root while an element
// inside it has focus, and when focus later moves into the aria-hidden tree.
// src/core/dialog.jsx handles both; these tests assert the ordering stays
// correct throughout a dialog's open/close lifecycle.
const instrument = async (page: Page) => {
    await page.evaluate(() => {
        (window as any).violations = [];
        const root = document.getElementById('root')!;
        const orig = root.setAttribute.bind(root);
        root.setAttribute = (name: string, value: string) => {
            if (name === 'aria-hidden' && value === 'true' && root.contains(document.activeElement)) {
                (window as any).violations.push(
                    `aria-hidden set while focus inside #root on ${(document.activeElement as HTMLElement)?.className}`
                );
            }
            return orig(name, value);
        };
        document.addEventListener('focusin', () => {
            if (root.getAttribute('aria-hidden') === 'true' && root.contains(document.activeElement)) {
                (window as any).violations.push(
                    `focus moved into aria-hidden #root on ${(document.activeElement as HTMLElement)?.className}`
                );
            }
        }, true);
    });
};

test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApi(page);
    await page.goto('/tx/1');
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();
    await instrument(page);
});

test('double-click edit dialog does not aria-hide the focused grid cell', async ({ page }) => {
    await page.getByText('Salary').first().dblclick();
    await expect(page.getByRole('heading', { name: 'Edit Transaction' })).toBeVisible();

    expect(await page.evaluate(() => (window as any).violations)).toEqual([]);
    // the dialog still receives focus once open
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
});

test('add dialog does not aria-hide the focused Add button', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('heading', { name: 'Add Transaction' })).toBeVisible();

    expect(await page.evaluate(() => (window as any).violations)).toEqual([]);
});

test('right-click context menu does not aria-hide the focused grid cell', async ({ page }) => {
    await page.getByText('Salary').first().click({ button: 'right' });
    await expect(page.getByRole('menuitem', { name: 'Split Transaction' })).toBeVisible();

    expect(await page.evaluate(() => (window as any).violations)).toEqual([]);

    // clicking away closes it
    await page.getByRole('heading', { name: 'Transactions' }).click();
    await expect(page.getByRole('menuitem', { name: 'Split Transaction' })).toBeHidden();

    // menu items still work: Split opens the split dialog
    await page.getByText('Salary').first().click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Split Transaction' }).click();
    await expect(page.getByRole('heading', { name: /Split/ })).toBeVisible();

    expect(await page.evaluate(() => (window as any).violations)).toEqual([]);
});

test('opening the account selector does not aria-hide its focused trigger', async ({ page }) => {
    await page.getByLabel('Account').click();
    await expect(page.getByRole('listbox')).toBeVisible();

    expect(await page.evaluate(() => (window as any).violations)).toEqual([]);
});

test('saving the edit dialog does not focus the grid while #root is still aria-hidden', async ({ page }) => {
    await page.getByText('Salary').first().dblclick();
    await expect(page.getByRole('heading', { name: 'Edit Transaction' })).toBeVisible();

    await page.getByRole('button', { name: /save|edit transaction/i }).click();
    await expect(page.getByRole('heading', { name: 'Edit Transaction' })).toBeHidden();
    await page.waitForTimeout(600);

    const violations = await page.evaluate(() => (window as any).violations);
    console.log('SAVE VIOLATIONS', JSON.stringify(violations));
    expect(violations).toEqual([]);
});

test('closing the edit dialog does not focus the grid while #root is still aria-hidden', async ({ page }) => {
    await page.getByText('Salary').first().dblclick();
    await expect(page.getByRole('heading', { name: 'Edit Transaction' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Edit Transaction' })).toBeHidden();
    // wait out the exit transition, during which aria-hidden may linger
    await page.waitForTimeout(600);

    expect(await page.evaluate(() => (window as any).violations)).toEqual([]);
    expect(await page.evaluate(() => document.getElementById('root')?.getAttribute('aria-hidden'))).toBeNull();
});
