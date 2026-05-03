import { useQuery } from "@tanstack/react-query";
import { fetchHealth, fetchStats, type StatsRange } from "./api";

// Stage F3 spec: health auto-refreshes every 30s. TanStack Query owns server
// state (FRONTEND_CLAUDE.md §2).
export const HEALTH_REFRESH_MS = 30_000;

export function useDashboardHealth() {
  return useQuery({
    queryKey: ["dashboard", "health"],
    queryFn: ({ signal }) => fetchHealth(signal),
    refetchInterval: HEALTH_REFRESH_MS,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}

export function useDashboardStats(range: StatsRange) {
  return useQuery({
    queryKey: ["dashboard", "stats", range.from, range.to],
    queryFn: ({ signal }) => fetchStats(range, signal),
    enabled: Boolean(range.from && range.to),
    placeholderData: (previous) => previous,
  });
}
