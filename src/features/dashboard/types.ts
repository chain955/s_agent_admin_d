import type { components } from "@/api/schema.gen";

export type DashboardHealth = components["schemas"]["DashboardHealthResponse"];
export type StatsResponse = components["schemas"]["StatsResponse"];
export type DailyStatPoint = components["schemas"]["DailyStatPoint"];
export type RouterBranchSharePoint = components["schemas"]["RouterBranchSharePoint"];

// Service identity used by the dashboard cards. The backend's `checks` map is
// loosely typed (`Record<string, string>`); we resolve each card to the first
// matching key from a candidate list so the UI stays robust if the backend
// renames a probe.
export type ServiceId = "postgres" | "redis" | "llm" | "embeddings";

// "ok" → green, "degraded" → yellow, anything else → red. The backend status
// vocabulary is open; see FRONTEND_CLAUDE.md §4.7 (cross-cutting decisions).
export type ServiceTone = "ok" | "degraded" | "down" | "unknown";
