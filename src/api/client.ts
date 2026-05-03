import createClient, { type Middleware } from "openapi-fetch";
import { authStore } from "@/features/auth/store";
import type { paths } from "./schema.gen";
import { notifyUnauthorized } from "./auth-events";

// Base URL is empty by default — same-origin in prod, dev proxy in dev.
export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
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
