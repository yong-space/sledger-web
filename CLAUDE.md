# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build (outputs to /dist)
npm test          # Run Playwright e2e tests (all)
npm test -- e2e/login.spec.ts   # Run a single test file
npm test -- --ui                # Open Playwright interactive UI
```

There is no lint script. The dev server expects a backend API running at `http://localhost:8080`. In production, the API is assumed to be same-origin.

## Tests

Playwright e2e tests live in `e2e/`. They mock all API calls via `page.route()` — no backend needed.

- `e2e/helpers.ts` — `createFakeToken()`, `seedAuth(page)` (injects a JWT into localStorage to skip login), `mockApi(page, overrides)` (sets up default happy-path API mocks)
- `e2e/fixtures.ts` — shared fixture data (issuers, accounts, transactions)
- Issuer fixtures must include a `types` field (e.g. `['Cash', 'Credit', 'Retirement']`) — the accounts form filters issuers by `i.types.indexOf(type)`

The `playwright` package is installed (not `@playwright/test`); import from `playwright/test`, and use `import type` for type-only imports like `Page`.

The dev server expects a backend API running at `http://localhost:8080`. In production, the API is assumed to be same-origin.

## Architecture

Sledger Web is a personal finance ledger SPA built with React 19, Vite, and Material UI.

**Entry point flow:**
1. `src/index.jsx` — bootstraps MUI dark theme, styled-components, PWA service worker, and wraps the app in `BrowserRouter` → `Session`
2. `src/core/session.jsx` — reads JWT from localStorage, handles auth state; renders `App` (authenticated) or `Public` (unauthenticated)
3. `src/core/app.jsx` — fetches initial accounts/issuers data, defines top-level routes: `/dash/*`, `/tx/*`, `/settings/*`, `/admin/*`

**State management** — Jotai atoms defined in `src/core/state.ts`. All atoms are exported from a single `state` object. Components consume state via `state.useState(state.someAtom)`.

**API layer** — `src/core/api.jsx` exports a `api()` hook used inside components. It wraps `fetch` with JWT auth headers, error handling (401 → logout, network error → `/no-connectivity`), and status notifications. All API calls follow the pattern `api.methodName(payload, successCallback)`.

**Styling** — Uses styled-components as the MUI styled engine (aliased via `vite.config.js`). Components use both `styled()` from styled-components and MUI's `sx` prop.

**File mix** — Core infrastructure and newer components use `.tsx`; older UI components use `.jsx`. Both coexist freely.

## Key Directories

- `src/core/` — app bootstrap, routing, session, API client, global Jotai state, shared components
- `src/dashboard/` — Summary, Insights, Credit Card Bills, Balance History views
- `src/transactions/` — Transaction list/grid, add/edit/bulk/split dialogs, import flow
- `src/settings/` — Account management, user profile, transaction templates
- `src/nav-bar/` — Desktop and mobile navigation components
- `src/public/` — Unauthenticated login/register pages
- `src/admin/` — Admin-only user and issuer management
- `src/util/` — Currency formatters, CPF codes

## Account Types

Three account types with distinct behavior: `Cash`, `CreditCard`, and `Retirement` (CPF — Singapore-specific). Account type affects which fields are shown in forms and which dashboard views are relevant.

## Build & Deployment

Production build is containerized via Docker with nginx serving the SPA. The `nginx/` directory contains the nginx config for SPA routing (all paths fall back to `index.html`). Vite manually splits chunks into `mui`, `muix`, `react`, and `utils` for optimized loading.
