# How to use this starter

This folder is a **drop-in starter** for the `health-assistant-admin` frontend repo. It is not a working app yet — there is no `package.json`, no source, no Vite config. Those are produced by **Stage F1** in [`docs/stages.md`](./docs/stages.md).

## What it contains

| File / dir | Purpose |
|---|---|
| `FRONTEND_CLAUDE.md` | The architectural anchor. Pins the stack, the layout, and the contracts. **Read this first.** |
| `README.md` | The repo's public README (setup, scripts, workflow). Trimmed to what stage F1 will make true. |
| `CHANGELOG.md` | Keep-a-Changelog skeleton with the seed entries. |
| `openapi.json` | Live snapshot of the backend's OpenAPI schema (49 paths, 82 schemas). Input to `pnpm gen:api`. |
| `docs/stages.md` | Frontend stages F1 through F10. Each stage has acceptance criteria. |
| `docs/locked_decisions.md` | Per-stage locked decisions, appended as stages complete. |
| `.env.example` | Example env file. Copy to `.env.development` after stage F1. |
| `.gitignore` | Standard frontend ignores plus the two generated files. |
| `.nvmrc` | Node 20. |

## How to use it

1. **Create a new GitHub repo** named `health-assistant-admin` (private).
2. **Create a `develop` branch and check it out.**
3. **Copy the contents of this `frontend_starter/` folder into the repo root.** Do not nest it.
4. **Commit once** with the message `chore: project anchor and stage plan`. This commit is the seed; it is **not** a stage commit and it is **not** counted as F1.
5. **Open the repo in Claude Code** and start a fresh session. Claude will pick up `FRONTEND_CLAUDE.md` automatically.
6. **Hand Claude the stage F1 prompt** — it lives in `docs/stages.md` under "Stage F1 — Project skeleton". Claude implements it, runs `pnpm accept-stage`, commits.
7. From there, march through the stages in order. Each stage ends with one commit on `develop`.

## How to refresh `openapi.json` later

The snapshot in this starter is taken from the backend at the time of writing. The backend will keep evolving. Refresh by either:

- Running the backend and using `pnpm gen:api:remote` (script lands in F1), or
- Copying `docs/openapi.json` from the `s_agent` repo by hand and running `pnpm gen:api`.

After refresh, TypeScript will fail at every changed call site. Fix the call sites, not the types.

## What this starter does **not** include

- A `package.json` — Stage F1 generates it, pinning versions in one place.
- A Vite config, ESLint config, Prettier config, Tailwind config, shadcn config — same reason.
- Any source. The first source file lands in F1.

The starter is intentionally just the docs + the API snapshot + a few dotfiles. Everything else is Stage F1.
