import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/auth-context";
import { setOnUnauthorized } from "@/api/auth-events";
import "@/api/client";
import { authStore } from "@/features/auth/store";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  useEffect(() => {
    setOnUnauthorized(() => {
      authStore.set(null);
      const { pathname, href } = router.state.location;
      if (pathname === "/login") return;
      router.navigate({ to: "/login", search: { from: href }, replace: true });
    });
    // unsubscribe by replacing with a no-op when the App unmounts
    return () => setOnUnauthorized(() => {});
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="ha-admin-theme"
    >
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
