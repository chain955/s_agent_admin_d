import { useCursorPagination, type UseCursorPaginationResult } from "@/hooks/useCursorPagination";
import { fetchSessions, SESSIONS_PAGE_LIMIT } from "./api";
import type { AdminSessionSummary, SessionsFilters } from "./types";

// Stable cache key that matches the request shape. Empty values are dropped
// so the cache key for "no filters" is stable across renders.
function sessionsKey(filters: SessionsFilters) {
  return [
    "admin",
    "sessions",
    {
      user_id: filters.user_id || null,
      started_from: filters.started_from || null,
      started_to: filters.started_to || null,
      has_errors: filters.has_errors || null,
      min_messages: filters.min_messages || null,
      max_messages: filters.max_messages || null,
      branches: filters.branches.length > 0 ? [...filters.branches].sort() : null,
      limit: SESSIONS_PAGE_LIMIT,
    },
  ] as const;
}

export function useSessionsList(
  filters: SessionsFilters,
): UseCursorPaginationResult<AdminSessionSummary> {
  return useCursorPagination<AdminSessionSummary>({
    queryKey: sessionsKey(filters),
    fetchPage: ({ cursor, signal }) => fetchSessions({ filters, cursor, signal }),
  });
}
