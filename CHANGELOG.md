# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
