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
