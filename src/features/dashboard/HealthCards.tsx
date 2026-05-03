import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";
import { useDashboardHealth } from "./queries";
import { resolveCheck } from "./services";
import type { ServiceId, ServiceTone } from "./types";

const SERVICES: ReadonlyArray<{ id: ServiceId; titleKey: keyof typeof I18N_TITLES }> = [
  { id: "postgres", titleKey: "postgres" },
  { id: "redis", titleKey: "redis" },
  { id: "llm", titleKey: "llm" },
  { id: "embeddings", titleKey: "embeddings" },
];

const I18N_TITLES = {
  postgres: "admin.dashboard.health.postgres",
  redis: "admin.dashboard.health.redis",
  llm: "admin.dashboard.health.llm",
  embeddings: "admin.dashboard.health.embeddings",
} as const;

export function HealthCards() {
  const query = useDashboardHealth();

  return (
    <section
      data-testid="dashboard-health"
      aria-label={t("admin.dashboard.health.section")}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {SERVICES.map((svc) => (
        <HealthCard
          key={svc.id}
          title={t(I18N_TITLES[svc.titleKey])}
          state={
            query.isError
              ? { kind: "error" }
              : query.isPending
                ? { kind: "loading" }
                : { kind: "data", check: resolveCheck(query.data, svc.id) }
          }
        />
      ))}
    </section>
  );
}

type CardState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "data"; check: { value: string; tone: ServiceTone } };

function HealthCard({ title, state }: { title: string; state: CardState }) {
  return (
    <Card data-testid={`health-card-${slug(title)}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        {state.kind === "loading" ? (
          <span className="text-sm text-muted-foreground">{t("admin.dashboard.loading")}</span>
        ) : state.kind === "error" ? (
          <>
            <Dot tone="down" />
            <span className="text-sm text-destructive">{t("admin.dashboard.error")}</span>
          </>
        ) : (
          <>
            <Dot tone={state.check.tone} />
            <span className="text-sm">{toneLabel(state.check)}</span>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Dot({ tone }: { tone: ServiceTone }) {
  const className = cn(
    "inline-block h-2.5 w-2.5 rounded-full",
    tone === "ok" && "bg-emerald-500",
    tone === "degraded" && "bg-amber-500",
    tone === "down" && "bg-destructive",
    tone === "unknown" && "bg-muted-foreground",
  );
  return <span aria-hidden="true" data-tone={tone} className={className} />;
}

function toneLabel(check: { value: string; tone: ServiceTone }): string {
  if (check.tone === "ok") return t("admin.dashboard.health.ok");
  if (check.tone === "degraded") return check.value || t("admin.dashboard.health.degraded");
  if (check.tone === "down") return check.value || t("admin.dashboard.health.down");
  return t("admin.dashboard.health.unknown");
}

function slug(title: string): string {
  // Unicode-aware so Cyrillic titles ("Эмбеддинги", "LLM-бэкенд") survive the
  // collapse — the ASCII-only regex would either truncate or fully erase them.
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}
