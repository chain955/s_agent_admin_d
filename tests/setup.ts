import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./msw/server";

// jsdom does not implement scroll APIs; TanStack Router calls them on navigate.
vi.stubGlobal("scrollTo", vi.fn());

// jsdom does not implement matchMedia; next-themes reads it on mount.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Recharts' ResponsiveContainer relies on ResizeObserver; jsdom doesn't ship
// one. The mock keeps the chart from throwing during mount; we don't assert
// on rendered SVG geometry in component tests.
class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
