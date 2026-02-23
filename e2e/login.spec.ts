import { test, expect } from 'playwright/test';
import { createFakeToken } from './helpers';

test('unauthenticated visit redirects to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
});

test('login page shows email, password fields and login button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /get an account/i })).toBeVisible();
});

test('successful login navigates to /dash', async ({ page }) => {
    const token = createFakeToken();

    await page.route('**/api/authenticate', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token }) })
    );
    await page.route('**/api/account-issuer', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.route('**/api/account', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page).toHaveURL(/\/dash/);
});

test('failed login shows error message', async ({ page }) => {
    await page.route('**/api/authenticate', (route) =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Invalid credentials' }),
        })
    );

    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpass1');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
});
