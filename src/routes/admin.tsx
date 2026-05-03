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
        { to: "/admin", label: t("admin.nav.dashboard"), exact: true },
        { to: "/admin/sessions", label: t("admin.nav.sessions") },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
