import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/i18n";

export type ChartState =
  | { kind: "loading" }
  | { kind: "error"; message?: string }
  | { kind: "empty" }
  | { kind: "data" };

type Props = {
  title: string;
  testId: string;
  state: ChartState;
  children: ReactNode;
};

// Wraps each chart with a consistent header and explicit loading / empty /
// error states (FRONTEND_CLAUDE.md §5: "every page has explicit loading,
// empty, and error states").
export function ChartCard({ title, testId, state, children }: Props) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[260px]">
        {state.kind === "loading" ? (
          <Placeholder>{t("admin.dashboard.loading")}</Placeholder>
        ) : state.kind === "error" ? (
          <Placeholder tone="destructive">
            {state.message ?? t("admin.dashboard.error")}
          </Placeholder>
        ) : state.kind === "empty" ? (
          <Placeholder>{t("admin.dashboard.empty")}</Placeholder>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function Placeholder({ children, tone }: { children: ReactNode; tone?: "destructive" }) {
  return (
    <div
      role={tone === "destructive" ? "alert" : "status"}
      className={
        tone === "destructive"
          ? "flex h-[240px] items-center justify-center text-sm text-destructive"
          : "flex h-[240px] items-center justify-center text-sm text-muted-foreground"
      }
    >
      {children}
    </div>
  );
}
