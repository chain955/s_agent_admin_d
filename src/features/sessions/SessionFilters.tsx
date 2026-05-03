import { useEffect, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import type { SessionsFilters } from "./types";

type Props = {
  value: SessionsFilters;
  onChange: (next: SessionsFilters) => void;
  onReset: () => void;
};

// Filter bar for the sessions log. State is fully controlled; the parent
// owns URL-state for the filters (FRONTEND_CLAUDE.md §5: URL-state for
// paginated lists). The branch picker is a chip input so the operator can
// type free-form branch names — the backend accepts a comma-separated
// `branch=` query param.
export function SessionFilters({ value, onChange, onReset }: Props) {
  return (
    <section
      data-testid="sessions-filters"
      aria-label={t("admin.sessions.filters.label")}
      className="grid gap-3 rounded-md border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <FilterField id="sessions-filter-user" label={t("admin.sessions.filters.user_id")}>
        <Input
          id="sessions-filter-user"
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder={t("admin.sessions.filters.user_id.placeholder")}
          value={value.user_id}
          onChange={(event) => onChange({ ...value, user_id: event.target.value })}
        />
      </FilterField>

      <FilterField id="sessions-filter-from" label={t("admin.sessions.filters.started_from")}>
        <Input
          id="sessions-filter-from"
          type="date"
          value={value.started_from}
          max={value.started_to || undefined}
          onChange={(event) => onChange({ ...value, started_from: event.target.value })}
        />
      </FilterField>

      <FilterField id="sessions-filter-to" label={t("admin.sessions.filters.started_to")}>
        <Input
          id="sessions-filter-to"
          type="date"
          value={value.started_to}
          min={value.started_from || undefined}
          onChange={(event) => onChange({ ...value, started_to: event.target.value })}
        />
      </FilterField>

      <FilterField id="sessions-filter-min" label={t("admin.sessions.filters.min_messages")}>
        <Input
          id="sessions-filter-min"
          type="number"
          inputMode="numeric"
          min={0}
          value={value.min_messages}
          onChange={(event) => onChange({ ...value, min_messages: digitsOnly(event.target.value) })}
        />
      </FilterField>

      <FilterField id="sessions-filter-max" label={t("admin.sessions.filters.max_messages")}>
        <Input
          id="sessions-filter-max"
          type="number"
          inputMode="numeric"
          min={0}
          value={value.max_messages}
          onChange={(event) => onChange({ ...value, max_messages: digitsOnly(event.target.value) })}
        />
      </FilterField>

      <BranchPicker
        value={value.branches}
        onChange={(branches) => onChange({ ...value, branches })}
      />

      <div className="flex items-end gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            id="sessions-filter-has-errors"
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            checked={value.has_errors}
            onChange={(event) => onChange({ ...value, has_errors: event.target.checked })}
          />
          <span>{t("admin.sessions.filters.has_errors")}</span>
        </label>
      </div>

      <div className="flex items-end justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          {t("admin.sessions.filters.reset")}
        </Button>
      </div>
    </section>
  );
}

function FilterField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function BranchPicker({
  value,
  onChange,
}: {
  value: ReadonlyArray<string>;
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  // Reset the draft when the parent clears the chips externally (e.g. reset).
  useEffect(() => {
    if (value.length === 0) setDraft("");
  }, [value.length]);

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="space-y-1.5 sm:col-span-2">
      <Label htmlFor="sessions-filter-branch">{t("admin.sessions.filters.branch")}</Label>
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        )}
      >
        {value.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
          >
            {chip}
            <button
              type="button"
              aria-label={t("admin.sessions.filters.branch.remove")}
              className="rounded-sm text-muted-foreground hover:text-foreground"
              onClick={() => onChange(value.filter((other) => other !== chip))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id="sessions-filter-branch"
          type="text"
          autoComplete="off"
          className="min-w-[6rem] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          placeholder={t("admin.sessions.filters.branch.placeholder")}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
        />
      </div>
    </div>
  );
}

function digitsOnly(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}
