# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Stage F3** — admin dashboard.
  - `/admin` route now renders four health cards (Postgres, Redis, LLM backend, Embeddings backend) populated from `GET /admin/api/dashboard/health` via TanStack Query. The query auto-refreshes every 30 s; each card has explicit loading, error, and `unknown` states. Card tone (ok / degraded / down / unknown) is derived from `checks` values via `resolveCheck` + `toneOf` (`src/features/dashboard/services.ts`), which matches keys case-insensitively against a per-service candidate list (`postgres|postgresql|db|database`, `redis|cache`, `llm|llm_backend|ollama|vllm`, `embeddings|embeddings_backend|embedding`).
  - Stats charts populated from `GET /admin/api/dashboard/stats?from=&to=` and rendered with Recharts: sessions per day (bar), average response duration per day (line, formatted as `мс`/`с`), router branch share per day (stacked bar), errors per day (bar). Each chart wrapped in a shared `<ChartCard>` providing loading / empty / error placeholders.
  - Date-range picker (`<DateRangePicker>`) using two native `<input type="date">` controls. Default range is the last 14 days computed in UTC; invalid ranges (`from > to`) surface an inline error and are not sent to the backend.
  - Number formatting goes through `Intl.NumberFormat("ru-RU")` and `Intl.DateTimeFormat("ru-RU")` (`src/features/dashboard/charts/format.ts`); no `.toFixed` outside of millisecond → second conversion.
  - Tests (`tests/dashboard.test.tsx`) cover the three required scenarios with MSW handlers: empty range (every chart shows the empty placeholder), partial data (sessions + avg-response render, branches + errors stay empty), all-degraded health (every health-card dot resolves to `tone="down"`).
  - `src/api/client.ts` now defaults `baseUrl` to `window.location.origin` when `VITE_API_BASE_URL` is unset/empty so that `openapi-fetch`'s `new Request(url)` works in jsdom (relative URLs are rejected by the global `URL` parser without a base). The client also forwards through `globalThis.fetch` lazily so the MSW interceptor — installed after module load in tests — actually patches the network for openapi-fetch calls.
  - `tests/setup.ts` stubs `ResizeObserver` (Recharts' `ResponsiveContainer` requires it) and the default MSW handlers (`tests/msw/handlers.ts`) now serve healthy `/dashboard/health` and an empty `/dashboard/stats` payload so the smoke test for `/admin` no longer issues unhandled requests.
  - i18n: new `admin.dashboard.*` keys in `src/i18n/ru.ts` (titles, health labels, range labels, loading / empty / error messages).
- **Stage F2** — auth and the login screen.
  - `/login` page renders a card-based form with `login`/`password` fields, RHF + zod validation (`auth.error.required`, `auth.error.invalid`), and a single submit button.
  - Login validation calls `GET /admin/api/dashboard/health` once with the candidate `Authorization: Basic` header. 200 → credentials persist to `sessionStorage` under `ha-admin-auth` and the user is redirected; 401 → field-level error on the password field; network/other failure → toast.
  - `<AuthProvider>` (`src/features/auth/auth-context.tsx`) reads the stored credentials on mount via the module-level `authStore` and exposes `{ login, basic, signIn, logout }` through `useAuth`.
  - `openapi-fetch` middleware in `src/api/client.ts` injects `Authorization: Basic <basic>` on every request and, on 401, clears the auth store and triggers a redirect to `/login` with `from=` set to the current href via the decoupled `notifyUnauthorized()` callback registered by `App.tsx`.
  - Route guard in `src/routes/__root.tsx` redirects unauthenticated visits to `/login` and authenticated `/login` visits to `/admin`. The login route's `validateSearch` accepts an optional `from`; after successful login the form navigates to a sanitised `from` (relative same-origin paths only) or `/admin`.
  - Topbar gains `<UserMenu>` (current login + logout button) and `<ThemeToggle>` (light/dark, persisted to `localStorage` via `next-themes` under `ha-admin-theme`).
  - i18n: new `auth.*`, `login.subtitle`, `theme.*` keys in `src/i18n/ru.ts`.
  - Tests: component test for the login form (validation errors, single API call with the candidate Basic header, 401 → field error). Smoke tests seed `authStore` so authenticated routes still render under the new guard. `tests/setup.ts` mocks `window.matchMedia` for `next-themes`.
- **Stage F1** — project skeleton.
  - Vite 5 + React 18 + TypeScript (`strict: true`), pnpm 9, Node 20 (`.nvmrc`, `engines`).
  - TanStack Router v1 with file-based routes; route-tree codegen wired into `pnpm dev`/`pnpm build`/`pnpm test`/`pnpm typecheck` via the `gen` script.
  - Stub routes for `/admin`, `/testchat`, `/login`, each rendering a page title from `src/i18n/ru.ts`.
  - `openapi-typescript` generates `src/api/schema.gen.ts` from the checked-in `openapi.json`; `openapi-fetch` client at `src/api/client.ts` (auth middleware lands in F2).
  - Vite dev proxy for `/admin/api`, `/testchat/api`, `/api`, `/health` to `VITE_BACKEND_URL` (default `http://localhost:8000`).
  - Tailwind CSS v3 + shadcn/ui initialised. `Button`, `Input`, `Label`, `Card`, `Toaster` (sonner-based) generated. Tokens with light/dark theme variables in `index.css`.
  - `<AppShell>` with sidebar + topbar primitives.
  - Vitest + Testing Library + MSW set up. Smoke tests render `/admin`, `/testchat`, `/login`.
  - ESLint 9 flat config, Prettier, lefthook pre-commit (lint --fix, format, typecheck).
  - `package.json` scripts: `dev`, `build`, `preview`, `lint`, `format`, `typecheck`, `test`, `test:watch`, `gen:api`, `gen:api:remote`, `accept-stage`.
  - `README.md` already covered setup; this stage makes its instructions executable.
- `FRONTEND_CLAUDE.md` — architectural anchor and stack lock.
- `docs/stages.md` — frontend stage decomposition (F1 through F10).
- `openapi.json` — snapshot of the backend's OpenAPI schema (49 paths, 82 schemas).
- `docs/locked_decisions.md` — placeholder for stage-local locked decisions, mirroring the backend convention.
- `README.md` — setup, scripts, and workflow.
