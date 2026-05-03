import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/i18n";
import { authStore } from "./store";
import { buildBasicCredential } from "./encode";

const HEALTH_PATH = "/admin/api/dashboard/health";

const schema = z.object({
  login: z.string().trim().min(1, "auth.error.required"),
  password: z.string().min(1, "auth.error.required"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onSuccess: (login: string) => void;
};

export function LoginForm({ onSuccess }: Props) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { login: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = handleSubmit(async ({ login, password }) => {
    setSubmitting(true);
    const basic = buildBasicCredential(login, password);
    try {
      // The login validation is the only call we make outside the typed API
      // client: it has to send a candidate header rather than the stored one.
      const response = await fetch(`${baseUrl}${HEALTH_PATH}`, {
        method: "GET",
        headers: { Authorization: `Basic ${basic}` },
      });
      if (response.status === 200) {
        authStore.set({ login, basic });
        onSuccess(login);
        return;
      }
      if (response.status === 401) {
        setError("password", { type: "auth", message: t("auth.error.invalid") });
        return;
      }
      toast.error(t("auth.error.generic"));
    } catch {
      toast.error(t("auth.error.network"));
    } finally {
      setSubmitting(false);
    }
  });

  const loginErr = errors.login?.message;
  const passwordErr = errors.password?.message;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="login">{t("auth.login")}</Label>
        <Input
          id="login"
          autoComplete="username"
          autoFocus
          aria-invalid={loginErr ? true : undefined}
          {...register("login")}
        />
        {loginErr ? (
          <p className="text-sm text-destructive" role="alert">
            {translateError(loginErr)}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={passwordErr ? true : undefined}
          {...register("password")}
        />
        {passwordErr ? (
          <p className="text-sm text-destructive" role="alert">
            {translateError(passwordErr)}
          </p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? t("auth.submitting") : t("auth.submit")}
      </Button>
    </form>
  );
}

function translateError(message: string): string {
  if (message === "auth.error.required") return t("auth.error.required");
  return message;
}
