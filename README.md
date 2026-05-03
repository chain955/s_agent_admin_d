# sport_agent_admin

Frontend for the Sport Agent project: admin panel and test-chat, in one Vite app under two route trees (`/admin` and `/testchat`).

The companion backend lives in the `s_agent` repository. This repo only ships the SPA. It has no backend code and no Docker for backend services.

> **Read [`FRONTEND_CLAUDE.md`](./FRONTEND_CLAUDE.md) before doing anything in this repo.** It is the architectural anchor and pins the stack, layout, and contracts. The stage-by-stage plan is in [`docs/stages.md`](./docs/stages.md).

## Requirements

- Node 20 LTS (see `.nvmrc`)
- pnpm 9+

## Setup

```bash
pnpm install
cp .env.example .env.development
pnpm gen:api          # regenerate src/api/schema.gen.ts from openapi.json
pnpm dev              # starts Vite at http://localhost:5173
```

The dev server proxies API calls to the backend. Set `VITE_BACKEND_URL` in `.env.development` (default: `http://localhost:8000`).

## Backend

The frontend assumes a running backend with admin Basic Auth credentials. Either:
- Run the backend locally via the `s_agent` repo (`make dev`), or
- Point `VITE_BACKEND_URL` at a remote backend you have credentials for.

The backend has **no CORS** configured; this is intentional. In dev, Vite's proxy makes the app same-origin. In prod, a reverse proxy serves the static build on the same origin as the agent.

## Updating the API contract

`openapi.json` at the repo root is the input to type generation. Regenerate it whenever the backend changes:

```bash
# from a running backend (uses VITE_BACKEND_URL)
pnpm gen:api:remote

# or copy the file from the backend repo by hand, then:
pnpm gen:api
```

`src/api/schema.gen.ts` is generated and gitignored. Never edit it by hand.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Vite dev server with HMR |
| `pnpm build` | Production build to `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest, single run |
| `pnpm test:watch` | Vitest, watch mode |
| `pnpm gen:api` | Regenerate types from the local `openapi.json` |
| `pnpm gen:api:remote` | Fetch `openapi.json` from `$VITE_BACKEND_URL` and regenerate types |
| `pnpm accept-stage` | The agent's gate: typecheck + lint + test + build |

## Workflow

- All work happens on `develop`. No feature branches.
- One commit per stage, conventional commits with `stage-FNN` scope.
- See [`FRONTEND_CLAUDE.md` §13](./FRONTEND_CLAUDE.md) for the full git rules and [`docs/stages.md`](./docs/stages.md) for the stage plan.
