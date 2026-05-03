import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { authStore } from "@/features/auth/store";
import { renderApp } from "./helpers";

const SEEDED = { login: "admin", basic: "YWRtaW46c2VjcmV0" };

describe("root smoke", () => {
  beforeEach(() => {
    authStore.set(SEEDED);
  });
  afterEach(() => {
    authStore.set(null);
  });

  it("renders the admin dashboard at /admin", async () => {
    renderApp("/admin");
    await waitFor(() => expect(screen.getAllByText("Дашборд").length).toBeGreaterThan(0));
  });

  it("renders the testchat stub at /testchat", async () => {
    renderApp("/testchat");
    await waitFor(() => expect(screen.getAllByText("Тест-чат").length).toBeGreaterThan(0));
  });

  it("renders the login title at /login when unauthenticated", async () => {
    authStore.set(null);
    renderApp("/login");
    await waitFor(() => expect(screen.getByText("Вход")).toBeInTheDocument());
  });
});
