import { createFileRoute } from "@tanstack/react-router";
import { t } from "@/i18n";

export const Route = createFileRoute("/testchat/")({
  component: TestchatIndexPage,
});

function TestchatIndexPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">{t("testchat.page.title")}</h1>
      <p className="text-muted-foreground">{t("testchat.page.stub")}</p>
    </section>
  );
}
