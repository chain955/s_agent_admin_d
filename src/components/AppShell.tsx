import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; exact?: boolean };

type Props = {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
};

export function AppShell({ title, nav, children }: Props) {
  return (
    <div className="grid h-full grid-cols-[16rem_1fr] grid-rows-[3.5rem_1fr]">
      <header className="col-span-2 flex items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{t("app.brand")}</span>
          <span className="text-sm text-muted-foreground">/ {title}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>
      <aside className="row-start-2 border-r bg-muted/30 p-3">
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                "[&.active]:bg-accent [&.active]:text-accent-foreground",
              )}
              activeProps={{ className: "active" }}
              activeOptions={item.exact ? { exact: true } : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="row-start-2 overflow-auto p-6">{children}</main>
    </div>
  );
}
