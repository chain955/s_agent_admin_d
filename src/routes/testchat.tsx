import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { t } from "@/i18n";

export const Route = createFileRoute("/testchat")({
  component: TestchatLayout,
});

function TestchatLayout() {
  return (
    <AppShell
      title={t("testchat.title")}
      nav={[{ to: "/testchat", label: t("testchat.nav.chat") }]}
    >
      <Outlet />
    </AppShell>
  );
}
