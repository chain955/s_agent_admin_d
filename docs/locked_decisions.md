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
