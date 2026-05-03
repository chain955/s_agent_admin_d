# Frontend stages — decomposition

The frontend is built in 10 stages. Each stage is the atomic unit of work and ends with one commit on `develop`. The numbering uses the `F` prefix (`F1`, `F2`, …) to keep frontend stages distinguishable from backend stages in shared notes and changelogs.

Every stage has the same shape, mirroring the backend's stage prompts:

```
### What the stage adds
<bullet list of concrete deliverables>

### What you verify
Run `pnpm accept-stage`. It must exit zero.
(plus any stage-specific checks; keep under three items)

### What the reviewer verifies
<list of in-browser flows the reviewer should click through against a running backend>
```

`pnpm accept-stage` runs: `typecheck`, `lint`, `test`, `build`. If any step fails, the stage is not done.

---

## Stage F1 — Project skeleton

**What the stage adds**
- Vite + React + TypeScript (`strict: true`), pnpm 9, Node 20 (`.nvmrc`, `engines`).
- TanStack Router with file-based routes, codegen wired into `pnpm dev`. Stubs for `/admin`, `/testchat`, `/login` (each renders a page title).
- `openapi.json` checked in at repo root; `openapi-typescript` generates `src/api/schema.gen.ts`; `openapi-fetch` client at `src/api/client.ts` (no auth yet).
- Vite dev proxy for `/admin/api`, `/testchat/api`, `/api`, `/health` → `http://localhost:8000` (configurable via `.env.development`).
- Tailwind v3 + shadcn/ui initialised. `Button`, `Input`, `Label`, `Card`, `Toaster` generated. `index.css` with tokens, light/dark theme variables.
- `<AppShell>` with sidebar + topbar primitives.
- Vitest + Testing Library + MSW set up; one smoke test asserts the root route renders.
- ESLint flat config, Prettier, lefthook pre-commit.
- `package.json` scripts: `dev`, `build`, `preview`, `lint`, `format`, `typecheck`, `test`, `gen:api`, `gen:api:remote`, `accept-stage`.
- `README.md` with setup and dev workflow.
- `CHANGELOG.md` initialised in Keep a Changelog format.

**What you verify**
- `pnpm accept-stage` exits zero.
- `pnpm dev` starts; visiting `/admin` and `/testchat` renders their stub pages without console errors.

**What the reviewer verifies**
- Same as you, in their browser.

---

## Stage F2 — Auth and the login screen

**What the stage adds**
- `/login` page: form with `login`, `password`, RHF + zod, submit button.
- Login validation calls `GET /admin/api/dashboard/health` with the candidate Basic header. 200 → save to `sessionStorage` and redirect. 401 → field-level error. Network error → toast.
- `<AuthProvider>` reads `sessionStorage` on mount, exposes `{ login, basic, logout() }`.
- `openapi-fetch` middleware injects `Authorization: Basic <basic>` on every request. On 401, clears auth and navigates to `/login` with `from=` param.
- Route guard in `__root.tsx` redirects unauthenticated visits to `/login`.
- `<UserMenu>` in topbar shows the current login + logout button.
- Theme toggle (light/dark) persisted to `localStorage`.
- Component test: login form validates and calls the API once.

**What you verify**
- `pnpm accept-stage` exits zero.

**What the reviewer verifies**
- With backend running and known credentials: log in, get redirected to `/admin`. Refresh — still logged in. Logout — back to `/login`. Wrong password — error.

---

## Stage F3 — Admin dashboard

**What the stage adds**
- `/admin` route renders four health cards (Postgres, Redis, LLM backend, Embeddings backend) populated from `GET /admin/api/dashboard/health`. Auto-refresh every 30s via TanStack Query.
- Stats charts populated from `GET /admin/api/dashboard/stats?from=&to=`:
  - sessions per day (bar),
  - average response duration per day (line),
  - branch distribution (stacked bar),
  - error count per day (bar).
- Date-range picker (default: last 14 days).
- Loading + empty + error states for every card and chart.
- Component tests with MSW: empty range, partial data, all-degraded health.

**What you verify**
- `pnpm accept-stage` exits zero.

**What the reviewer verifies**
- With seeded backend: dashboard shows non-empty stats; degrade one backend (stop Ollama) → corresponding card turns red within 30s.

---

## Stage F4 — Sessions log (list view)

**What the stage adds**
- `/admin/sessions` route: cursor-paginated table backed by `GET /admin/api/sessions`.
- Filters: user_id (text), date range (`started_from`/`started_to`), `has_errors` (toggle), message-count range, branch (multi-select).
- `<DataTable>` primitive: column-driven, cursor-pagination via `useCursorPagination` (wraps `useInfiniteQuery`), sticky header, loading skeleton, empty state.
- Click on a row navigates to `/admin/sessions/$sessionId`.
- URL state for filters and cursor (so reload keeps the view).
- Component test: filtering changes the request; "load more" appends.

**What you verify**
- `pnpm accept-stage` exits zero.

**What the reviewer verifies**
- List paginates; filters persist on reload; clicking a row opens the detail page.

---

## Stage F5 — Session detail with stages waterfall

**What the stage adds**
- `/admin/sessions/$sessionId`:
  - Top: session header (user, started_at, last_activity_at, closed_at, branch summary, summary text).
  - Middle: messages list (user / assistant turns).
  - Bottom (per assistant message): inline expand → Waterfall, LLM Calls, Tools, RAG.
- `<Waterfall>` component: horizontal bars per pipeline stage, time axis, hover tooltip with duration_ms.
- `<JsonViewer>` shared component (collapsible tree, copy, depth-based collapse, search). Used for LLM prompts/responses, tool args/results, RAG chunks.
- All four pane queries hit `GET /admin/api/sessions/{id}/messages/{msgId}/waterfall`.
- Empty state when a message has no logs (e.g. logs aged out).

**What you verify**
- `pnpm accept-stage` exits zero.
- Storybook-style component test for `<Waterfall>` with synthetic stage list.

**What the reviewer verifies**
- For a known seeded session: every pane renders; JSON viewer behaves; waterfall durations match the session's actual numbers.

---

## Stage F6 — Configuration: A, B, C (models, presets, thresholds)

**What the stage adds**
- `/admin/config` landing with tabs/sections.
- Section A — Models:
  - LLM model picker fed by `GET /admin/api/config/models/llm`.
  - Embeddings model picker fed by `GET /admin/api/config/models/embeddings`.
  - "Test" button per model → `POST .../test`, shows latency + status inline.
  - Save → `PUT /admin/api/config` with the relevant keys.
- Section B — Presets per pipeline stage:
  - List from `GET /admin/api/config/presets`. Detail editor per stage from `GET /admin/api/config/presets/{stage}`, save via `PUT`.
  - Fields: temperature, top_p, top_k, max_tokens, seed, guided_decoding, system_prompt_id (dropdown from `GET /admin/api/config/presets/system_prompts`), model_override (optional).
  - System prompt is a **dropdown only** — no free-text input.
- Section C — Thresholds: numeric inputs for the keys exposed by `GET /admin/api/config/thresholds`, save via `PUT`.
- All save flows display the **`<RestartBanner>`** when the response carries `requires_restart: true`.
- Forms: RHF + zod, server-side `error.details` map to field errors when present.
- Component tests for: zod validation, restart-banner triggering on save, model test inline result rendering.

**What you verify**
- `pnpm accept-stage` exits zero.

**What the reviewer verifies**
- Save a preset change → banner appears. Restart agent → fresh GET reflects the new value.

---

## Stage F7 — Configuration: D, E (RAG, FAQ)

**What the stage adds**
- Section D — RAG:
  - Collections card from `GET /admin/api/config/rag/collections`.
  - "Reindex" button → `POST .../reindex/{collection}`, opens a progress dialog that polls `GET .../reindex/{job_id}` every 1s until done/failed.
  - Chunks browser: cursor-paginated table from `GET .../chunks` with `q`, `category`, `collection` filters. Click → detail panel with full content + metadata.
- Section E — FAQ:
  - List + create + update + delete via the FAQ CRUD endpoints.
  - Test tool: input free-text question → `POST .../faq/test` → top-3 with similarity scores.
  - Form: `question_canonical`, `question_variants` (chip input), `answer` (textarea), `deeplink` (URL), `locale` (select).

**What you verify**
- `pnpm accept-stage` exits zero.

**What the reviewer verifies**
- Trigger a reindex against the seeded `general` collection — progress reaches done. Edit a FAQ entry — list refreshes.

---

## Stage F8 — Configuration: F, G, H (templates, alerts, safety)

**What the stage adds**
- Section F — Templates:
  - List from `GET /admin/api/config/templates`. Detail (read-only steps view + enabled toggle) via `GET .../templates/{id}` and `PUT`.
- Section G — Alerts:
  - Rules list from `GET .../alerts/rules` with toggle and per-rule param editor → `PUT .../rules/{id}`.
  - Webhook config (`GET`/`PUT .../alerts/webhook`) + "Test" button → `POST .../webhook/test`.
  - `alert_descriptions` CRUD per locale + "Render preview" tool → `POST .../descriptions/{id}/test`.
- Section H — Safety:
  - Categories list from `GET .../safety/categories` with toggle → `PUT .../safety/categories/{category}`.
  - Recent blocks panel from `GET /admin/api/safety/blocks` (read-only, paginated).
- All saves continue to honour the restart banner.

**What you verify**
- `pnpm accept-stage` exits zero.

**What the reviewer verifies**
- Toggle a rule → list reflects state. Test webhook with bad URL → banner with the inline error from the API.

---

## Stage F9 — Config history and restore

**What the stage adds**
- `/admin/config/history` route:
  - Cursor-paginated list from `GET /admin/api/config/history` with filters: `key`, `author`, date range.
  - Detail drawer: full diff (key-by-key, old → new) using `<JsonViewer>` in diff mode.
  - "Restore this version" button → `POST .../history/{id}/restore`, with a confirmation dialog that names the affected keys and warns about restart.
- The current `<RestartBanner>` reflects the restore action.
- Component test: confirmation dialog blocks the request until accepted.

**What you verify**
- `pnpm accept-stage` exits zero.

**What the reviewer verifies**
- Make a config change, then restore the previous version from history. Banner appears. Restart agent → values return.

---

## Stage F10 — Testchat

**What the stage adds**
- `/testchat` route:
  - User picker dropdown fed by `GET /testchat/api/users` (the four personas).
  - Sessions list for the selected user (`GET /testchat/api/sessions?user_id=`), cursor-paginated, with delete (`DELETE /testchat/api/sessions/{id}`, confirmation required).
  - Click a session → loads message history (`GET /testchat/api/sessions/{id}/messages`).
  - Composer: textarea + send + cancel buttons.
  - Send: `POST /testchat/api/send` with `{ user_id, message, session_id? }`. Reads SSE response via `src/api/sse.ts`.
- Streaming UI:
  - Tokens append to a single assistant bubble.
  - A "thinking" panel above shows stage and tool events with `display_name` chips and durations. Auto-collapses on `done`.
  - Cancel button: aborts the local SSE reader and calls `POST /testchat/api/cancel` with the session/message ids from response headers.
  - Errors render as a red banner inside the assistant bubble (using the locked error envelope).
- Persists: which user is selected (URL param), which session is open (URL param). Survive reload.
- Tests: SSE reader unit tests with synthetic streams (start/end stage, multiple tokens, error mid-stream, cancellation), composer component test (RHF validation, send disabled while streaming).

**What you verify**
- `pnpm accept-stage` exits zero.
- SSE reader unit tests cover at least: clean stream, cancelled stream, error event mid-stream, malformed line tolerated.

**What the reviewer verifies**
- Pick a persona, send a question that triggers the planner → see stages, tool calls (with display_name), and tokens in real time. Cancel mid-stream → SSE stops, partial bubble preserved with a "cancelled" tag. Delete a session — disappears from the list and from the backend.

---

## Stage discipline

- Stages do not depend on stages above them being polished. F2's smoke test stays green even after F10 ships.
- If a stage feels too big, that is a signal the stage was scoped wrong — flag it. Do not split the commit silently.
- A stage's "What the reviewer verifies" list is also the demo script for that stage. Keep it crisp.
