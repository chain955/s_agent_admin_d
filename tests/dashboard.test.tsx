import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { components } from "@/api/schema.gen";
import { authStore } from "@/features/auth/store";
import { server } from "./msw/server";
import { renderApp } from "./helpers";

type DashboardHealth = components["schemas"]["DashboardHealthResponse"];
type StatsResponse = components["schemas"]["StatsResponse"];

const SEEDED = { login: "admin", basic: "YWRtaW46c2VjcmV0" };

const HEALTHY: DashboardHealth = {
  status: "ok",
  checks: { postgres: "ok", redis: "ok", llm: "ok", embeddings: "ok" },
  version: "test",
  models: {},
};

const ALL_DEGRADED: DashboardHealth = {
  status: "degraded",
  checks: {
    postgres: "down",
    redis: "down",
    llm: "down",
    embeddings: "down",
  },
  version: "test",
  models: {},
};

const EMPTY_STATS: StatsResponse = {
  range: {},
  sessions_per_day: [],
  messages_per_day: [],
  avg_response_time_ms_per_day: [],
  errors_per_day: [],
  router_branch_share_per_day: [],
};

const PARTIAL_STATS: StatsResponse = {
  range: {},
  sessions_per_day: [
    { date: "2026-04-29", count: 12 },
    { date: "2026-04-30", count: 18 },
    { date: "2026-05-01", count: 9 },
  ],
  messages_per_day: [],
  avg_response_time_ms_per_day: [
    { date: "2026-04-29", count: 1200 },
    { date: "2026-04-30", count: 950 },
    { date: "2026-05-01", count: 1430 },
  ],
  errors_per_day: [],
  router_branch_share_per_day: [],
};

function dotsIn(section: HTMLElement): HTMLElement[] {
  return Array.from(section.querySelectorAll<HTMLElement>("[data-tone]"));
}

describe("admin dashboard", () => {
  beforeEach(() => {
    authStore.set(SEEDED);
  });
  afterEach(() => {
    authStore.set(null);
  });

  it("renders empty-state placeholders for every chart when the range has no data", async () => {
    server.use(
      http.get("/admin/api/dashboard/health", () => HttpResponse.json(HEALTHY)),
      http.get("/admin/api/dashboard/stats", () => HttpResponse.json(EMPTY_STATS)),
    );

    renderApp("/admin");

    for (const testid of [
      "chart-sessions",
      "chart-avg-response",
      "chart-branches",
      "chart-errors",
    ]) {
      const card = await screen.findByTestId(testid);
      await waitFor(() =>
        expect(within(card).getByText("Нет данных за выбранный период.")).toBeInTheDocument(),
      );
    }
  });

  it("renders charts for series that have data and empty placeholders for the rest", async () => {
    server.use(
      http.get("/admin/api/dashboard/health", () => HttpResponse.json(HEALTHY)),
      http.get("/admin/api/dashboard/stats", () => HttpResponse.json(PARTIAL_STATS)),
    );

    renderApp("/admin");

    // Wait until the stats query has resolved by watching the empty placeholders
    // disappear from the cards that have data.
    const sessions = await screen.findByTestId("chart-sessions");
    await waitFor(() => expect(within(sessions).queryByText("Загрузка…")).toBeNull());
    expect(within(sessions).queryByText("Нет данных за выбранный период.")).toBeNull();

    const avg = screen.getByTestId("chart-avg-response");
    expect(within(avg).queryByText("Нет данных за выбранный период.")).toBeNull();

    // Branch share and errors had empty arrays in the partial payload → empty.
    const branches = screen.getByTestId("chart-branches");
    expect(within(branches).getByText("Нет данных за выбранный период.")).toBeInTheDocument();

    const errors = screen.getByTestId("chart-errors");
    expect(within(errors).getByText("Нет данных за выбранный период.")).toBeInTheDocument();
  });

  it("paints every health card red when all backends are down", async () => {
    server.use(
      http.get("/admin/api/dashboard/health", () => HttpResponse.json(ALL_DEGRADED)),
      http.get("/admin/api/dashboard/stats", () => HttpResponse.json(EMPTY_STATS)),
    );

    renderApp("/admin");

    const section = await screen.findByTestId("dashboard-health");
    await waitFor(() => {
      const dots = dotsIn(section);
      expect(dots).toHaveLength(4);
      for (const dot of dots) {
        expect(dot.dataset.tone).toBe("down");
      }
    });
  });
});
