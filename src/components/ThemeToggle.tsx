import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes resolves the active theme client-side to avoid hydration
  // mismatches; render a stable placeholder until mounted.
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";
  const label = mounted ? (isDark ? t("theme.toLight") : t("theme.toDark")) : t("theme.toggle");

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
    >
      {mounted && isDark ? <Moon /> : <Sun />}
    </Button>
  );
}
