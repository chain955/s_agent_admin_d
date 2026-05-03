import { createFileRoute } from "@tanstack/react-router";
import { t } from "@/i18n";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="flex min-h-full items-center justify-center p-6">
      <h1 className="text-2xl font-semibold">{t("login.title")}</h1>
    </main>
  );
}
