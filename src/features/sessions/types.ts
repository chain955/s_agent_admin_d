import type { components } from "@/api/schema.gen";

export type AdminSessionSummary = components["schemas"]["AdminSessionSummary"];
export type AdminSessionListResponse = components["schemas"]["AdminSessionListResponse"];

// Filters surfaced by the F4 sessions log. Strings stay as the empty string
// when not set; this lets URL-state survive a reload without distinguishing
// `null` from `undefined` per param.
export type SessionsFilters = {
  user_id: string;
  started_from: string;
  started_to: string;
  has_errors: boolean;
  min_messages: string;
  max_messages: string;
  // Multi-select: branch values are joined with `,` for URL-state.
  branches: ReadonlyArray<string>;
};

export const EMPTY_FILTERS: SessionsFilters = {
  user_id: "",
  started_from: "",
  started_to: "",
  has_errors: false,
  min_messages: "",
  max_messages: "",
  branches: [],
};
