import { api } from "@/api/client";
import type { AdminSessionListResponse, SessionsFilters } from "./types";

// Page size for the cursor-paginated sessions list. The backend caps `limit`
// at 200 (openapi.json) and defaults to 50; we keep the default so users
// see a familiar number of rows while keeping the request small.
export const SESSIONS_PAGE_LIMIT = 50;

export type FetchSessionsArgs = {
  filters: SessionsFilters;
  cursor: string | null;
  limit?: number;
  signal?: AbortSignal;
};

// Hooks call this through `useCursorPagination` (FRONTEND_CLAUDE.md §4.3);
// callers pass parsed filters and never assemble URLs by hand.
export async function fetchSessions(args: FetchSessionsArgs): Promise<AdminSessionListResponse> {
  const { filters, cursor, limit = SESSIONS_PAGE_LIMIT, signal } = args;
  const { data, error } = await api.GET("/admin/api/sessions", {
    params: { query: buildQuery(filters, cursor, limit) },
    signal,
  });
  if (error || !data) {
    throw error ?? new Error("admin.sessions.error");
  }
  return data;
}

function buildQuery(filters: SessionsFilters, cursor: string | null, limit: number) {
  const branch = filters.branches.length > 0 ? filters.branches.join(",") : undefined;
  return {
    user_id: filters.user_id ? filters.user_id : undefined,
    started_from: filters.started_from ? toIsoStart(filters.started_from) : undefined,
    started_to: filters.started_to ? toIsoEnd(filters.started_to) : undefined,
    has_errors: filters.has_errors ? true : undefined,
    min_messages: parseInteger(filters.min_messages),
    max_messages: parseInteger(filters.max_messages),
    branch,
    cursor: cursor ?? undefined,
    limit,
  };
}

function parseInteger(raw: string): number | undefined {
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

// `started_from` / `started_to` are typed as `date-time` in the API but the
// picker hands us a `YYYY-MM-DD` calendar day. Send `from` as midnight UTC
// and `to` as the end of the day so an inclusive day range matches user
// intent.
function toIsoStart(day: string): string {
  return `${day}T00:00:00.000Z`;
}

function toIsoEnd(day: string): string {
  return `${day}T23:59:59.999Z`;
}
