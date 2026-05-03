import { http, HttpResponse } from "msw";
import type { components } from "@/api/schema.gen";

// Default handlers shared across tests. Feature-specific handlers live next
// to their tests and are passed to `server.use(...)` in `beforeEach`.

const DEFAULT_HEALTH: components["schemas"]["DashboardHealthResponse"] = {
  status: "ok",
  checks: {
    postgres: "ok",
    redis: "ok",
    llm: "ok",
    embeddings: "ok",
  },
  version: "test",
  models: {},
};

const DEFAULT_STATS: components["schemas"]["StatsResponse"] = {
  range: {},
  sessions_per_day: [],
  messages_per_day: [],
  avg_response_time_ms_per_day: [],
  errors_per_day: [],
  router_branch_share_per_day: [],
};

export const handlers = [
  http.get("/admin/api/dashboard/health", () => HttpResponse.json(DEFAULT_HEALTH)),
  http.get("/admin/api/dashboard/stats", () => HttpResponse.json(DEFAULT_STATS)),
];
