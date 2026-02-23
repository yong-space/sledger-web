import type { Page } from 'playwright/test';
import { issuers, accounts, transactions } from './fixtures';

export function createFakeToken(overrides: Record<string, unknown> = {}): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({
        sub: 'test@example.com',
        name: 'Test User',
        admin: false,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
        ...overrides,
    })).toString('base64');
    return `${header}.${payload}.fakesignature`;
}

export async function seedAuth(page: Page): Promise<void> {
    const token = createFakeToken();
    await page.addInitScript((t) => localStorage.setItem('token', t), token);
}

type RouteBody = object | null;
type RouteOverrides = Record<string, RouteBody>;

export async function mockApi(page: Page, overrides: RouteOverrides = {}): Promise<void> {
    const defaults: RouteOverrides = {
        'GET /api/account-issuer': issuers,
        'GET /api/account': accounts,
        'GET /api/transaction/1': transactions,
        'GET /api/transaction/2': [],
        'GET /api/portfolio': null,
        'GET /api/suggest/categories': [],
        'GET /api/suggest/remarks': [],
        'GET /api/suggest/company': [],
    };

    const routes = { ...defaults, ...overrides };

    await page.route('**/api/**', async (route) => {
        const url = new URL(route.request().url());
        const method = route.request().method();
        const key = `${method} ${url.pathname}`;

        if (key in routes) {
            const body = routes[key];
            if (body === null) {
                await route.fulfill({ status: 403, body: '' });
            } else {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(body),
                });
            }
        } else {
            await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        }
    });
}
