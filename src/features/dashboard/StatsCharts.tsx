import type { UseQueryResult } from "@tanstack/react-query";
import { t } from "@/i18n";
import type { StatsResponse } from "./types";
import { AvgResponseLineChart } from "./charts/AvgResponseLineChart";
import { BranchStackedBarChart } from "./charts/BranchStackedBarChart";
import { ChartCard, type ChartState } from "./charts/ChartCard";
import { ErrorsBarChart } from "./charts/ErrorsBarChart";
import { SessionsBarChart } from "./charts/SessionsBarChart";

type Props = {
  query: UseQueryResult<StatsResponse>;
};

// Renders the four stage-F3 charts as a 2-column grid. Each chart owns its
// loading/empty/error state via <ChartCard>.
export function StatsCharts({ query }: Props) {
  const data = query.data;
  const baseState: ChartState = query.isError
    ? { kind: "error" }
    : query.isPending
      ? { kind: "loading" }
      : data
        ? { kind: "data" }
        : { kind: "empty" };

  return (
    <section
      data-testid="dashboard-stats"
      aria-label={t("admin.dashboard.stats.section")}
      className="grid gap-4 lg:grid-cols-2"
    >
      <ChartCard
        title={t("admin.dashboard.stats.sessions")}
        testId="chart-sessions"
        state={chartStateFor(baseState, data?.sessions_per_day)}
      >
        <SessionsBarChart data={data?.sessions_per_day ?? []} />
      </ChartCard>

      <ChartCard
        title={t("admin.dashboard.stats.avgResponse")}
        testId="chart-avg-response"
        state={chartStateFor(baseState, data?.avg_response_time_ms_per_day)}
      >
        <AvgResponseLineChart data={data?.avg_response_time_ms_per_day ?? []} />
      </ChartCard>

      <ChartCard
        title={t("admin.dashboard.stats.branches")}
        testId="chart-branches"
        state={chartStateFor(baseState, data?.router_branch_share_per_day, (rows) =>
          rows.some((p) => Object.keys(p.by_branch ?? {}).length > 0),
        )}
      >
        <BranchStackedBarChart data={data?.router_branch_share_per_day ?? []} />
      </ChartCard>

      <ChartCard
        title={t("admin.dashboard.stats.errors")}
        testId="chart-errors"
        state={chartStateFor(baseState, data?.errors_per_day)}
      >
        <ErrorsBarChart data={data?.errors_per_day ?? []} />
      </ChartCard>
    </section>
  );
}

function chartStateFor<T>(
  base: ChartState,
  series: T[] | undefined,
  hasContent?: (series: T[]) => boolean,
): ChartState {
  if (base.kind !== "data") return base;
  if (!series || series.length === 0) return { kind: "empty" };
  if (hasContent && !hasContent(series)) return { kind: "empty" };
  return { kind: "data" };
}
