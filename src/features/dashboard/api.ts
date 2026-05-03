import { api } from "@/api/client";
import type { DashboardHealth, StatsResponse } from "./types";

// Thin typed wrappers around the openapi-fetch client. Hooks should never
// assemble URLs by hand (FRONTEND_CLAUDE.md §3, §4.1).

export async function fetchHealth(signal?: AbortSignal): Promise<DashboardHealth> {
  const { data, error } = await api.GET("/admin/api/dashboard/health", { signal });
  if (error || !data) {
    throw error ?? new Error("dashboard.error.health");
  }
  return data;
}

export type StatsRange = { from: string; to: string };

export async function fetchStats(range: StatsRange, signal?: AbortSignal): Promise<StatsResponse> {
  const { data, error } = await api.GET("/admin/api/dashboard/stats", {
    params: { query: { from: range.from, to: range.to } },
    signal,
  });
  if (error || !data) {
    throw error ?? new Error("dashboard.error.stats");
  }
  return data;
}
