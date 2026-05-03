import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { t } from "@/i18n";

export function UserMenu() {
  const { login, logout } = useAuth();
  if (!login) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground" data-testid="user-menu-login">
        {login}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={logout}
        aria-label={t("auth.logout")}
      >
        <LogOut />
        <span className="sr-only sm:not-sr-only sm:ml-1">{t("auth.logout")}</span>
      </Button>
    </div>
  );
}
