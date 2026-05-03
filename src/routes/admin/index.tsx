import { createFileRoute } from "@tanstack/react-router";
import { t } from "@/i18n";

export const Route = createFileRoute("/admin/")({
  component: AdminIndexPage,
});

function AdminIndexPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">{t("admin.dashboard.title")}</h1>
      <p className="text-muted-foreground">{t("admin.dashboard.stub")}</p>
    </section>
  );
}
