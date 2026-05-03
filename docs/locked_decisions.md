# Locked decisions — sport_agent_admin

This file holds the concrete values, conventions, and identifiers fixed by each completed frontend stage. `FRONTEND_CLAUDE.md` holds only the stable rules that every stage must respect; this file is the running record of what each stage decided.

When a stage prompt asks you to read specific locked decisions, open this file and read the relevant subsection.

When you complete a stage, append a new section with the form `### Stage F<N>`. Skipped numbers stay skipped — do not renumber.

---

## Format

Each entry is a flat bullet list of decisions that future stages need to know. Keep entries terse and concrete; this is reference material, not narrative.

```
### Stage F<N> — <short title>

- <decision>
- <decision>
- <decision>
```

---

<!--
Stages will be appended below as they complete.
-->

### Stage F1 — project skeleton

- Node `20.x` LTS pinned via `.nvmrc` and `engines`. pnpm `9.15.1` pinned via `packageManager`.
- TanStack Router file-based routing uses the **sibling-layout** convention: a layout for `/admin/*` lives at `src/routes/admin.tsx` (not `src/routes/admin/__layout.tsx`). `FRONTEND_CLAUDE.md` §3 sketches `__layout.tsx`; this is illustrative — the actual on-disk layout uses TanStack's standard convention.
- Generated files: `src/routeTree.gen.ts` (TanStack Router CLI / Vite plugin) and `src/api/schema.gen.ts` (`openapi-typescript`). Both are gitignored. The `gen` script (`pnpm gen:routes && pnpm gen:api`) runs automatically before `dev`, `build`, `typecheck`, and `test`.
- ESLint 9 flat config in `eslint.config.js` (uses `typescript-eslint` meta-package).
- Prettier config in `.prettierrc`; `prettier-plugin-tailwindcss` enabled. `.prettierignore` excludes generated files and `pnpm-lock.yaml`.
- Lefthook config in `lefthook.yml` runs `eslint --fix`, `prettier --write` on staged files, plus `pnpm typecheck` on TS changes.
- Toaster: shadcn `sonner` wrapper at `src/components/ui/sonner.tsx`. Theme is read from `next-themes` (theme provider lands in F2 along with the toggle).
- Vitest config lives inline in `vite.config.ts` (`test` block) — same Vite environment for tests and dev, JSDOM environment, MSW setup in `tests/setup.ts`.
- MSW server is `tests/msw/server.ts`; default handlers in `tests/msw/handlers.ts`. `onUnhandledRequest: "error"` to catch missing mocks early.
- i18n: `src/i18n/ru.ts` is a flat dictionary keyed by dotted strings; `src/i18n/index.ts` exposes a typed `t(key)` and `useT()` hook. ru-only on MVP.
- Test smoke covers `/admin`, `/testchat`, `/login` route render.
- `accept-stage` runs `typecheck && lint && test && build`; each named script has `pre*` hooks that regenerate routeTree + schema.gen first.
- `gen:api:remote` is implemented as `node scripts/fetch-openapi.mjs && pnpm gen:api`. The script reads `VITE_BACKEND_URL` from `.env.development` or env, defaulting to `http://localhost:8000`.

### Stage F2 — auth and the login screen

- `sessionStorage` key for stored credentials: `ha-admin-auth`. Value shape: `{ login: string, basic: string }` where `basic = base64(utf-8(<login>:<password>))`. Encoding goes through `TextEncoder` so non-ASCII passwords are not corrupted by `btoa`'s latin-1 limit.
- The auth source of truth at runtime is the module-level `authStore` in `src/features/auth/store.ts`. It is a tiny pub/sub wrapping `sessionStorage`. Both the React tree (`AuthProvider`) and the `openapi-fetch` middleware read/write through it; this keeps the API client free of React-specific imports.
- The API client middleware in `src/api/client.ts` adds `Authorization: Basic <basic>` to every outgoing request when an auth value is present, and on a `401` response clears the auth store and calls `notifyUnauthorized()`.
- Router coupling for the 401 redirect lives in `src/api/auth-events.ts`: `setOnUnauthorized(handler)` / `notifyUnauthorized()`. `App.tsx` registers a handler in a `useEffect` that captures the router and navigates to `/login` with `from=<current href>` (replace), skipping the redirect if the user is already on `/login`.
- Login validation uses raw `fetch` (not the typed `openapi-fetch` client) so the candidate `Authorization` header can be sent without going through the auth middleware. This is the single sanctioned `fetch` call outside `src/api/client.ts`; all other API consumers use the typed client.
- The login route declares `validateSearch: z.object({ from: z.string().optional() })`. After a successful login, the form navigates to `sanitizeFrom(from)`, which only allows same-origin relative paths (`/...`) and rejects `//...` (protocol-relative) and any value pointing back to `/login`.
- Route guard lives in `src/routes/__root.tsx`. `beforeLoad` reads `authStore.get()` and: (a) redirects to `/login?from=<current href>` if unauthenticated and not already on `/login`; (b) redirects to `/admin` if authenticated and on `/login`.
- Theme provider: `next-themes` `ThemeProvider` at the App root with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`, and `storageKey="ha-admin-theme"`. `<ThemeToggle>` flips between `light` and `dark` (system is the default but the toggle is binary; system can be re-selected by clearing the storage key).
- `<UserMenu>` is rendered by `<AppShell>` next to `<ThemeToggle>` in the topbar; it shows the current login and a logout button. Logout calls `authStore.set(null)`, which fires the auth store listeners; the next `beforeLoad` sees no auth and redirects to `/login`.
- i18n keys: `auth.login`, `auth.password`, `auth.submit`, `auth.submitting`, `auth.logout`, `auth.error.required`, `auth.error.invalid`, `auth.error.network`, `auth.error.generic`, `login.subtitle`, `theme.toggle`, `theme.toDark`, `theme.toLight`. `RuKey` is the union of dictionary keys.
- Test wiring: `tests/helpers.tsx` exposes `renderApp(initial)` that mounts the full provider tree (`ThemeProvider` → `AuthProvider` → `QueryClientProvider` → `RouterProvider`) against an in-memory history. Tests seed/reset `authStore` directly. `tests/setup.ts` shims `window.matchMedia` for jsdom so `next-themes` does not throw on mount.

### Stage F3 — admin dashboard

- `/admin` index route (`src/routes/admin/index.tsx`) renders `<Dashboard>` from `src/features/dashboard/Dashboard.tsx`. The dashboard composes three regions: health cards, date-range picker, stats charts.
- Dashboard data layer:
  - `src/features/dashboard/api.ts` wraps `api.GET("/admin/api/dashboard/health")` and `api.GET("/admin/api/dashboard/stats")` and throws on error/empty response.
  - `src/features/dashboard/queries.ts` exposes `useDashboardHealth()` (TanStack Query, `refetchInterval = 30_000` ms, foreground-only) and `useDashboardStats({ from, to })` (`enabled: Boolean(from && to)`, `placeholderData: (prev) => prev` to keep the previous range visible while the next one loads).
- Health resolver (`src/features/dashboard/services.ts`): `resolveCheck(health, service)` matches `checks` keys case-insensitively against a per-service candidate list — `postgres|postgresql|db|database`, `redis|cache`, `llm|llm_backend|ollama|vllm`, `embeddings|embeddings_backend|embedding`. `toneOf(value)` maps backend status strings to one of `"ok" | "degraded" | "down" | "unknown"`. Anything non-empty that doesn't match a known token defaults to `degraded` (fail-closed visual).
- `<HealthCards>` (`src/features/dashboard/HealthCards.tsx`) renders four `<HealthCard>`s in a `1 / 2 / 4`-column responsive grid. Each card has a `data-tone` attribute on its dot for testability and three explicit states: loading (text only), error (red dot + `admin.dashboard.error`), data (dot + tone label).
- Stats charts (`src/features/dashboard/charts/`): one component per chart, all wrapped in a shared `<ChartCard>` that owns the loading / empty / error placeholder layout (260 px min height). Charts are pure: they take a series array and render a Recharts component with `isAnimationActive=false` to keep tests deterministic.
  - `SessionsBarChart` — bar, `count` over `date`.
  - `AvgResponseLineChart` — line, `count` (ms) over `date`, Y-axis formatted with `formatMs`.
  - `BranchStackedBarChart` — stacked bar; flattens `RouterBranchSharePoint.by_branch` into one column per branch, sorted alphabetically. Palette is a hard-coded 8-hue HSL list (Recharts does not accept CSS variables for `Bar.fill`).
  - `ErrorsBarChart` — bar, `count` over `date`, `destructive` fill.
- Number/date formatting in `src/features/dashboard/charts/format.ts` uses `Intl.NumberFormat("ru-RU")` and `Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short" })`. Millisecond → second conversion is the only place `.toFixed` is permitted (used for the avg-response chart's seconds label).
- Date-range picker (`<DateRangePicker>`): two native `<input type="date">` controls (shadcn `<Calendar>`/`<Popover>` not yet installed; native date inputs are accessible enough for an admin-only screen). Default range is the last 14 calendar days computed in UTC via `defaultRange()` (`src/features/dashboard/date-range.ts`). `isValidRange()` rejects `from > to`; invalid ranges show an inline `role="alert"` error and the stats query falls back to the default range.
- `<DateRangePicker>` exchanges `from` / `to` as ISO `YYYY-MM-DD` strings (matches the OpenAPI schema). UTC slicing avoids local-time off-by-one near midnight in non-UTC zones.
- `src/api/client.ts` defaults `baseUrl` to `window.location.origin` when `VITE_API_BASE_URL` is unset/empty — `openapi-fetch`'s `new Request(url)` rejects relative URLs in jsdom because the global `URL` parser has no base. The escape-hatch env var still wins when set.
- `src/api/client.ts` also forwards every call through `globalThis.fetch` lazily (`fetch: (...args) => globalThis.fetch(...args)`). `openapi-fetch` captures `globalThis.fetch` at `createClient` time; in Vitest the MSW interceptor patches the network _after_ the module is loaded, so the captured reference would bypass MSW entirely. The wrapper resolves the patched fetch at call time.
- `tests/setup.ts` stubs `ResizeObserver` (Recharts' `ResponsiveContainer` requires it). Default MSW handlers (`tests/msw/handlers.ts`) now serve a healthy `/dashboard/health` and an empty `/dashboard/stats` payload so the smoke test for `/admin` no longer issues unhandled requests.
- Dashboard component tests (`tests/dashboard.test.tsx`) cover the three required scenarios: empty range (every chart shows `admin.dashboard.empty`), partial data (`sessions_per_day` + `avg_response_time_ms_per_day` populated; `router_branch_share_per_day` and `errors_per_day` empty), all-degraded health (every health-card dot resolves to `tone="down"`).
- `tests/login.test.tsx`'s "calls health endpoint once" assertion was relaxed to `length >= 1` — the real `/admin` route now mounts after the post-login redirect and fires its own health query, so the shared request log no longer ends at one entry.
- i18n: new `admin.dashboard.*` keys in `src/i18n/ru.ts` for the dashboard title/subtitle, health labels, range labels, and the loading / empty / error placeholders.

### Stage F4 — sessions log (list view)

- `/admin/sessions` route at `src/routes/admin/sessions/index.tsx`; the row-click destination at `src/routes/admin/sessions/$sessionId.tsx` is a stub that prints the path id and a "back" link, with the real session detail landing in F5.
- Cursor-keyset pagination contract from FRONTEND_CLAUDE.md §4.3 is owned by `useCursorPagination` (`src/hooks/useCursorPagination.ts`). Hook signature: `{ queryKey, fetchPage, enabled?, initialCursor?, keepPreviousData? }` → `{ items, query }` where `query` is the underlying TanStack `useInfiniteQuery` result. `getNextPageParam` is `(last) => last.next_cursor ?? undefined` so a `null` from the API stops pagination cleanly. `CursorPage<T>['next_cursor']` is `string | null | undefined` because the OpenAPI schema marks the field as optional in addition to nullable.
- `SESSIONS_PAGE_LIMIT = 50` in `src/features/sessions/api.ts` (matches the OpenAPI default; the cap is 200). `fetchSessions` is the only place that maps `SessionsFilters` onto query-string values: `started_from` / `started_to` are widened to `YYYY-MM-DDT00:00:00.000Z` / `YYYY-MM-DDT23:59:59.999Z` because the backend types them as `date-time` even though the picker hands a calendar day. Empty filter values drop out of the query (the openapi-fetch types accept `undefined`).
- `SessionsFilters` (`src/features/sessions/types.ts`) is the in-memory shape. Strings stay as `""` when unset; `branches` is `ReadonlyArray<string>` (multi-select). `EMPTY_FILTERS` is the canonical reset.
- URL state: `sessionsSearchSchema` (zod) accepts `user_id`, `started_from`, `started_to`, `has_errors`, `min_messages`, `max_messages`, and `branch` (string or string[]). `has_errors` accepts both `boolean` and the literal strings `"true"` / `"false"` and transforms to a boolean — TanStack Router stringifies it back to `?has_errors=true` on serialize. `branch` is encoded as a comma-separated string in the URL (joined via `filtersToSearch`, split via `parseBranches` on read). `filtersToSearch` returns the post-validation shape (`SessionsSearchInput`) so calls into `navigate({ search })` typecheck against the route.
- Debounced filters: `useDebouncedValue<T>(value, delay = 300)` in `src/hooks/useDebouncedValue.ts`. `SessionsLog` debounces `user_id`, `min_messages`, and `max_messages` (300 ms) before pushing to the URL or firing a request. Date inputs and the boolean / branch chip controls are not debounced because they only mutate on commit events.
- Shared `<DataTable>` primitive at `src/components/DataTable.tsx` is the only non-feature-specific table primitive (FRONTEND_CLAUDE.md §5). Props: `columns: DataTableColumn<T>[]`, `rows`, `rowKey`, `onRowClick?`, `isLoading?`, `isFetchingNextPage?`, `hasNextPage?`, `onLoadMore?`, plus localized strings for `emptyText`, `loadMoreText`, `loadingMoreText`, `loadingText`, and an optional `caption`. Sticky header (`top-0` + `bg-muted/50 backdrop-blur`), 5-row pulse skeleton, accessible row activation (`tabIndex=0`, `role="button"`, Enter/Space). The "Show more" footer is inert when `hasNextPage` is falsy.
- `SessionsLog` (`src/features/sessions/SessionsLog.tsx`) is the only consumer of the URL-state ↔ filters glue. It mirrors URL → local state on mount and on URL changes (`areFiltersEqual` short-circuits referentially-new but value-equal updates), and pushes `replace: true` so filter typing does not pollute history. Numeric filters use `digitsOnly` to strip non-digits as the user types.
- `<AppShell>` gained an optional per-item `exact` flag on its `nav` prop. Without it, the dashboard link stays highlighted under nested admin routes; the dashboard link is now `exact: true`.
- Date / number rendering in the table goes through module-level `Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" })` and `Intl.NumberFormat("ru-RU")` (FRONTEND_CLAUDE.md §5).
- Tests (`tests/sessions.test.tsx`) cover: the three required scenarios (filters change the request and rendered rows; "load more" forwards the cursor and appends the next page; row click resolves to `/admin/sessions/$sessionId`), plus an empty-payload assertion. The MSW handler captures every URL the suite issues and asserts on `cursor` / `user_id` query params from the captured list.
- i18n: new `admin.nav.sessions`, `admin.sessions.*`, and `admin.sessionDetail.*` keys in `src/i18n/ru.ts`.
