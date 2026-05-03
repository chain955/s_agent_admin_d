import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/i18n";
import type { StatsRange } from "./api";
import { isValidRange } from "./date-range";

type Props = {
  value: StatsRange;
  onChange: (next: StatsRange) => void;
};

// Operator UI: two `<input type="date">`s. shadcn Calendar/Popover are not
// installed yet (lands in F4+ if needed); native pickers are accessible and
// keyboard-friendly enough for a stage-3 admin dashboard.
export function DateRangePicker({ value, onChange }: Props) {
  const invalid = !isValidRange(value);
  return (
    <div
      data-testid="dashboard-date-range"
      className="flex flex-wrap items-end gap-3"
      role="group"
      aria-label={t("admin.dashboard.range.label")}
    >
      <div className="space-y-1.5">
        <Label htmlFor="dashboard-date-from">{t("admin.dashboard.range.from")}</Label>
        <Input
          id="dashboard-date-from"
          type="date"
          value={value.from}
          max={value.to}
          onChange={(event) => onChange({ ...value, from: event.target.value })}
          className="w-44"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dashboard-date-to">{t("admin.dashboard.range.to")}</Label>
        <Input
          id="dashboard-date-to"
          type="date"
          value={value.to}
          min={value.from}
          onChange={(event) => onChange({ ...value, to: event.target.value })}
          className="w-44"
        />
      </div>
      {invalid ? (
        <p className="text-sm text-destructive" role="alert">
          {t("admin.dashboard.range.invalid")}
        </p>
      ) : null}
    </div>
  );
}
