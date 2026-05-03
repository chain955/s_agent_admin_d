import { http, HttpResponse } from "msw";

// Default handlers shared across tests. Feature-specific handlers live next
// to their tests and are passed to `server.use(...)` in `beforeEach`.
export const handlers = [
  http.get("/admin/api/dashboard/health", () => HttpResponse.json({ status: "ok" })),
];
