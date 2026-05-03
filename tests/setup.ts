import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./msw/server";

// jsdom does not implement scroll APIs; TanStack Router calls them on navigate.
vi.stubGlobal("scrollTo", vi.fn());
Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
