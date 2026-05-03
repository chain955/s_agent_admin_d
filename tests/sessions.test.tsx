import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { components } from "@/api/schema.gen";
import { authStore } from "@/features/auth/store";
import { server } from "./msw/server";
import { renderApp } from "./helpers";

type SessionListResponse = components["schemas"]["AdminSessionListResponse"];

const SEEDED = { login: "admin", basic: "YWRtaW46c2VjcmV0" };

function makeSession(overrides: Partial<components["schemas"]["AdminSessionSummary"]>) {
  const base = {
    id: "00000000-0000-0000-0000-000000000001",
    user_id: "11111111-1111-1111-1111-111111111111",
    started_at: "2026-04-29T08:30:00.000Z",
    last_activity_at: "2026-04-29T09:00:00.000Z",
    closed_at: null,
    message_count: 6,
    error_count: 0,
    branches_used: ["faq"],
  } satisfies components["schemas"]["AdminSessionSummary"];
  return { ...base, ...overrides };
}

const PAGE_ONE: SessionListResponse = {
  items: [
    makeSession({
      id: "00000000-0000-0000-0000-0000000000aa",
      user_id: "user-a",
      message_count: 4,
      error_count: 0,
      branches_used: ["faq"],
    }),
    makeSession({
      id: "00000000-0000-0000-0000-0000000000bb",
      user_id: "user-b",
      message_count: 12,
      error_count: 2,
      branches_used: ["fact", "rag"],
    }),
  ],
  next_cursor: "cursor-page-2",
};

const PAGE_TWO: SessionListResponse = {
  items: [
    makeSession({
      id: "00000000-0000-0000-0000-0000000000cc",
      user_id: "user-c",
      message_count: 8,
      error_count: 0,
      branches_used: ["faq"],
    }),
  ],
  next_cursor: null,
};

const FILTERED_USER: SessionListResponse = {
  items: [
    makeSession({
      id: "00000000-0000-0000-0000-0000000000dd",
      user_id: "filtered-user-id",
      message_count: 1,
      error_count: 0,
      branches_used: ["faq"],
    }),
  ],
  next_cursor: null,
};

describe("admin sessions log", () => {
  beforeEach(() => {
    authStore.set(SEEDED);
  });
  afterEach(() => {
    authStore.set(null);
  });

  it("renders rows, paginates with load-more, and applies filters", async () => {
    const requests: URL[] = [];

    server.use(
      http.get("/admin/api/sessions", ({ request }) => {
        const url = new URL(request.url);
        requests.push(url);
        const cursor = url.searchParams.get("cursor");
        const userId = url.searchParams.get("user_id");
        if (userId === "filtered-user-id") {
          return HttpResponse.json(FILTERED_USER);
        }
        if (cursor === "cursor-page-2") {
          return HttpResponse.json(PAGE_TWO);
        }
        return HttpResponse.json(PAGE_ONE);
      }),
    );

    const user = userEvent.setup();
    renderApp("/admin/sessions");

    const table = await screen.findByTestId("sessions-table");
    await waitFor(() => {
      expect(within(table).getByText("user-a")).toBeInTheDocument();
      expect(within(table).getByText("user-b")).toBeInTheDocument();
    });

    // Load more appends the next page; the first-page rows stay.
    const loadMore = within(table).getByRole("button", { name: "Показать ещё" });
    await user.click(loadMore);

    await waitFor(() => {
      expect(within(table).getByText("user-c")).toBeInTheDocument();
    });
    expect(within(table).getByText("user-a")).toBeInTheDocument();
    // The pagination cursor was forwarded.
    expect(requests.some((url) => url.searchParams.get("cursor") === "cursor-page-2")).toBe(true);

    // Typing into the user_id filter triggers a refetch with the new param.
    const userIdInput = screen.getByLabelText("ID пользователя");
    await user.type(userIdInput, "filtered-user-id");

    await waitFor(() => {
      expect(requests.some((url) => url.searchParams.get("user_id") === "filtered-user-id")).toBe(
        true,
      );
    });
    await waitFor(() => {
      expect(within(table).getByText("filtered-user-id")).toBeInTheDocument();
    });
    expect(within(table).queryByText("user-a")).toBeNull();
  });

  it("renders an empty placeholder when the API returns no rows", async () => {
    server.use(
      http.get("/admin/api/sessions", () =>
        HttpResponse.json({ items: [], next_cursor: null } satisfies SessionListResponse),
      ),
    );

    renderApp("/admin/sessions");

    const table = await screen.findByTestId("sessions-table");
    await waitFor(() =>
      expect(within(table).getByText("Нет сессий по заданным фильтрам.")).toBeInTheDocument(),
    );
    expect(within(table).queryByRole("button", { name: "Показать ещё" })).toBeNull();
  });

  it("navigates to the session detail when a row is clicked", async () => {
    server.use(http.get("/admin/api/sessions", () => HttpResponse.json(PAGE_ONE)));

    const user = userEvent.setup();
    renderApp("/admin/sessions");

    const table = await screen.findByTestId("sessions-table");
    const firstRow = await within(table).findByText("user-a");
    await user.click(firstRow);

    await screen.findByTestId("admin-session-detail-stub");
    expect(
      screen.getByText("00000000-0000-0000-0000-0000000000aa", { exact: false }),
    ).toBeInTheDocument();
  });
});
