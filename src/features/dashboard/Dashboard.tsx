import { useMemo, useState } from "react";
import { t } from "@/i18n";
import { DateRangePicker } from "./DateRangePicker";
import { HealthCards } from "./HealthCards";
import { StatsCharts } from "./StatsCharts";
import { defaultRange, isValidRange } from "./date-range";
import { useDashboardStats } from "./queries";

export function Dashboard() {
  // Range state is local to the dashboard route. URL-state lands with the
  // sessions log in F4 where it is observable to the reviewer.
  const initialRange = useMemo(() => defaultRange(), []);
  const [range, setRange] = useState(initialRange);
  const statsQuery = useDashboardStats(isValidRange(range) ? range : initialRange);

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("admin.dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("admin.dashboard.subtitle")}</p>
      </header>

      <HealthCards />

      <DateRangePicker value={range} onChange={setRange} />

      <StatsCharts query={statsQuery} />
    </div>
  );
}
