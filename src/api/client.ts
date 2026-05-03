import createClient, { type Middleware } from "openapi-fetch";
import { authStore } from "@/features/auth/store";
import type { paths } from "./schema.gen";
import { notifyUnauthorized } from "./auth-events";

// Base URL is the current origin by default — same-origin in prod, dev proxy
// in dev. `VITE_API_BASE_URL` remains the documented escape hatch
// (FRONTEND_CLAUDE.md §4.1). The origin fallback is required because
// `openapi-fetch` builds requests with `new Request(url)`, which rejects
// relative URLs in environments where the global URL parser has no base
// (e.g. jsdom in component tests). The fallback also kicks in when the env
// var is set to an empty string (the documented same-origin default).
const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const defaultBaseUrl = typeof window === "undefined" ? "" : window.location.origin;
const resolvedBaseUrl = envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : defaultBaseUrl;

export const api = createClient<paths>({
  baseUrl: resolvedBaseUrl,
  // openapi-fetch captures `globalThis.fetch` at `createClient` call time. In
  // Vitest the MSW interceptor patches the network *after* this module is
  // loaded, so the captured reference would never go through MSW. Forwarding
  // through `globalThis.fetch` lazily makes the patched fetch take effect.
  fetch: (...args) => globalThis.fetch(...args),
});

const authMiddleware: Middleware = {
  onRequest({ request }) {
    const auth = authStore.get();
    if (auth) request.headers.set("Authorization", `Basic ${auth.basic}`);
    return request;
  },
  onResponse({ response }) {
    if (response.status === 401) {
      authStore.set(null);
      notifyUnauthorized();
    }
    return response;
  },
};

api.use(authMiddleware);
