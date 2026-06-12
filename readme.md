# Sledger Web

Sledger is a personal finance ledger for tracking bank accounts, credit cards, CPF (retirement) balances, and investment portfolios. This repository is the web frontend — an installable PWA single-page app; the REST API backend lives in [sledger-backend](https://github.com/yong-space/sledger-backend).

## What it does

- **Dashboard** — net-worth summary, category spending insights, credit card bill tracking, and balance history charts
- **Transactions** — data-grid listing with add/edit/bulk/split dialogs, autocomplete suggestions, and FX fields for foreign-currency entries
- **Statement import** — drag-and-drop upload of bank statement exports (OCBC / UOB / Citi / Grab), with a review grid and template-based auto-categorisation before committing
- **Settings** — manage accounts (cash, credit card, CPF), transaction templates, and user profile
- **Admin** — user and account-issuer management for admin users
- **Auth** — JWT login/registration, plus WebAuthn biometric unlock for returning sessions

## Tech stack

| | |
|---|---|
| Framework | React 19 (SPA, mixed `.jsx`/`.tsx`), React Router 7 |
| UI | Material UI 7 (with MUI X Data Grid, Charts, Date Pickers), styled-components as the MUI styled engine |
| State | Jotai atoms (`src/core/state.ts`) |
| Build | Vite 8, Bun as package manager/runner |
| PWA | vite-plugin-pwa / Workbox — installable, auto-updating service worker |
| Testing | Playwright e2e (Chromium), fully API-mocked |

## Getting started

```bash
bun install        # or npm install
bun run dev        # Vite dev server — expects the backend at http://localhost:8080
bun run build      # production build to /dist
bun run test       # Playwright e2e tests (no backend needed — APIs are mocked)
bun run test -- --ui   # Playwright interactive UI
```

In production the API is assumed to be same-origin under `/api` (the service worker excludes `/api` from SPA navigation fallback).

## Architecture

```
src/core/          Bootstrap, routing, session/auth, API client, Jotai state, shared components
src/dashboard/     Summary, insights, credit card bills, balance history views
src/transactions/  Transaction grid, dialogs, statement import flow
src/settings/      Accounts, templates, profile
src/admin/         Admin-only user and issuer management
src/nav-bar/       Desktop and mobile navigation
src/public/        Unauthenticated login/register pages
e2e/               Playwright tests, fixtures, and API-mock helpers
```

Key points:

- **Entry flow** — `index.jsx` (theme, PWA, router) → `core/session.jsx` (JWT in localStorage; renders the authenticated `App` or the `Public` pages) → `core/app.jsx` (routes: `/dash`, `/tx`, `/settings`, `/admin`)
- **API client** — `core/api.jsx` wraps `fetch` with the JWT header, 401 → logout, network errors → `/no-connectivity`, and status-bar notifications; calls follow `api.methodName(payload, successCallback)`
- **Biometric unlock** — profile page registers a WebAuthn credential (`navigator.credentials.create`); on return visits with an expired grace period, the session is unlocked via a server-issued challenge instead of a password
- **Chunking** — Vite manually splits vendor chunks (`react`, `mui`, `muix`, `utils`) for faster loads

## Testing

Playwright e2e tests in `e2e/` mock every API call with `page.route()`, so no backend is required. `e2e/helpers.ts` provides `seedAuth()` (injects a fake JWT to skip login) and `mockApi()` (default happy-path mocks); shared fixture data lives in `e2e/fixtures.ts`.

## CI / Deployment

- **Branches & PRs** (`.github/workflows/ci.yml`) — install with Bun, run Playwright tests.
- **Main** (`.github/workflows/release.yml`) — tests, auto-semver tag, Vite build (version injected as `VITE_APP_VERSION`), Docker image (nginx serving `/dist` with SPA fallback routing) pushed to GHCR, then a rolling `kubectl set image` update on an on-prem Kubernetes cluster, keeping the two most recent images.
