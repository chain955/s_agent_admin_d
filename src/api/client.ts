import createClient from "openapi-fetch";
import type { paths } from "./schema.gen";

// Base URL is empty by default — same-origin in prod, dev proxy in dev.
// Auth middleware will be wired up in F2.
export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
});
