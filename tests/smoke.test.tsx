import { render, screen, waitFor } from "@testing-library/react";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";

function renderAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("root smoke", () => {
  it("renders the admin dashboard at /admin", async () => {
    renderAt("/admin");
    await waitFor(() => expect(screen.getAllByText("Дашборд").length).toBeGreaterThan(0));
  });

  it("renders the testchat stub at /testchat", async () => {
    renderAt("/testchat");
    await waitFor(() => expect(screen.getAllByText("Тест-чат").length).toBeGreaterThan(0));
  });

  it("renders the login title at /login", async () => {
    renderAt("/login");
    await waitFor(() => expect(screen.getByText("Вход")).toBeInTheDocument());
  });
});
