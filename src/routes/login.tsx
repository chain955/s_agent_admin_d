import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";
import { t } from "@/i18n";

const searchSchema = z.object({
  from: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { from } = Route.useSearch();

  const target = sanitizeFrom(from);

  return (
    <main className="flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("login.title")}</CardTitle>
          <CardDescription>{t("login.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            onSuccess={() => {
              navigate({ to: target, replace: true });
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}

// Only allow same-origin relative paths to prevent open-redirect via `from`.
function sanitizeFrom(from: string | undefined): string {
  if (!from) return "/admin";
  if (!from.startsWith("/") || from.startsWith("//")) return "/admin";
  if (from === "/login" || from.startsWith("/login?") || from.startsWith("/login#")) {
    return "/admin";
  }
  return from;
}
