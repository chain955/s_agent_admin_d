import { z } from "zod";
import { EMPTY_FILTERS, type SessionsFilters } from "./types";

// Zod schema mirrors `validateSearch` on the route. Every field is optional
// so a clean URL omits empty filters and `useSearch()` returns coherent
// strings/booleans/arrays for the React tree.
export const sessionsSearchSchema = z.object({
  user_id: z.string().optional(),
  started_from: z.string().optional(),
  started_to: z.string().optional(),
  has_errors: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => (typeof value === "string" ? value === "true" : value)),
  min_messages: z.string().optional(),
  max_messages: z.string().optional(),
  // Branches are encoded as a comma-separated string in the URL; arriving as
  // an array (e.g. from the typed router) is also accepted.
  branch: z.union([z.string(), z.array(z.string())]).optional(),
});

export type SessionsSearch = z.infer<typeof sessionsSearchSchema>;

export function searchToFilters(search: SessionsSearch): SessionsFilters {
  const branches = parseBranches(search.branch);
  return {
    user_id: search.user_id ?? "",
    started_from: search.started_from ?? "",
    started_to: search.started_to ?? "",
    has_errors: Boolean(search.has_errors),
    min_messages: search.min_messages ?? "",
    max_messages: search.max_messages ?? "",
    branches,
  };
}

// Inverse of `searchToFilters`: empties drop out of the URL so the bar stays
// tidy when filters are unset. The router stringifies `undefined` away.
export type SessionsSearchInput = {
  user_id?: string;
  started_from?: string;
  started_to?: string;
  has_errors?: boolean;
  min_messages?: string;
  max_messages?: string;
  branch?: string;
};

export function filtersToSearch(filters: SessionsFilters): SessionsSearchInput {
  return {
    user_id: filters.user_id || undefined,
    started_from: filters.started_from || undefined,
    started_to: filters.started_to || undefined,
    has_errors: filters.has_errors ? true : undefined,
    min_messages: filters.min_messages || undefined,
    max_messages: filters.max_messages || undefined,
    branch: filters.branches.length > 0 ? filters.branches.join(",") : undefined,
  };
}

function parseBranches(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function emptyFilters(): SessionsFilters {
  return { ...EMPTY_FILTERS, branches: [] };
}
