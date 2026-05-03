import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import { authStore } from "@/features/auth/store";

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const auth = authStore.get();
    const onLogin = location.pathname === "/login";
    if (!auth && !onLogin) {
      throw redirect({
        to: "/login",
        search: { from: location.href },
      });
    }
    if (auth && onLogin) {
      throw redirect({ to: "/admin" });
    }
  },
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}
