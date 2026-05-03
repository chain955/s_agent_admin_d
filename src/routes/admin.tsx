import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { t } from "@/i18n";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AppShell
      title={t("admin.title")}
      nav={[
        { to: "/admin", label: t("admin.nav.dashboard") },
        { to: "/admin", label: t("admin.nav.sessions") },
        { to: "/admin", label: t("admin.nav.config") },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
