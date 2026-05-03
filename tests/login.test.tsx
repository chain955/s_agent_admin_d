import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authStore } from "@/features/auth/store";
import { server } from "./msw/server";
import { renderApp } from "./helpers";

describe("login form", () => {
  beforeEach(() => {
    authStore.set(null);
  });
  afterEach(() => {
    authStore.set(null);
    vi.restoreAllMocks();
  });

  it("shows validation errors and does not call the API on empty submit", async () => {
    const handler = vi.fn(() => HttpResponse.json({ status: "ok" }));
    server.use(http.get("/admin/api/dashboard/health", handler));

    const user = userEvent.setup();
    renderApp("/login");

    await user.click(await screen.findByRole("button", { name: "Войти" }));

    const errors = await screen.findAllByRole("alert");
    expect(errors.length).toBeGreaterThanOrEqual(2);
    expect(handler).not.toHaveBeenCalled();
    expect(authStore.get()).toBeNull();
  });

  it("calls the health endpoint once with a Basic header and stores credentials", async () => {
    const requests: string[] = [];
    server.use(
      http.get("/admin/api/dashboard/health", ({ request }) => {
        requests.push(request.headers.get("authorization") ?? "");
        return HttpResponse.json({ status: "ok" });
      }),
    );

    const user = userEvent.setup();
    renderApp("/login");

    await user.type(await screen.findByLabelText("Логин"), "admin");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]).toBe(`Basic ${btoa("admin:secret")}`);
    await waitFor(() => expect(authStore.get()?.login).toBe("admin"));
    expect(authStore.get()?.basic).toBe(btoa("admin:secret"));
  });

  it("shows a field error on 401 without storing credentials", async () => {
    server.use(
      http.get("/admin/api/dashboard/health", () => new HttpResponse(null, { status: 401 })),
    );

    const user = userEvent.setup();
    renderApp("/login");

    await user.type(await screen.findByLabelText("Логин"), "admin");
    await user.type(screen.getByLabelText("Пароль"), "wrong");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(await screen.findByText("Неверный логин или пароль.")).toBeInTheDocument();
    expect(authStore.get()).toBeNull();
  });
});
