import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { t } from "@/i18n";
import { emptyFilters, filtersToSearch, searchToFilters } from "./filters";
import { SessionFilters } from "./SessionFilters";
import { useSessionsList } from "./queries";
import type { AdminSessionSummary, SessionsFilters } from "./types";

const DATE_TIME = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

const NUMBER = new Intl.NumberFormat("ru-RU");

// Filter values that should not fire a request on every keystroke.
function useDebouncedFilters(filters: SessionsFilters): SessionsFilters {
  const debouncedUser = useDebouncedValue(filters.user_id, 300);
  const debouncedMin = useDebouncedValue(filters.min_messages, 300);
  const debouncedMax = useDebouncedValue(filters.max_messages, 300);
  return useMemo(
    () => ({
      ...filters,
      user_id: debouncedUser,
      min_messages: debouncedMin,
      max_messages: debouncedMax,
    }),
    [filters, debouncedUser, debouncedMin, debouncedMax],
  );
}

export function SessionsLog() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/admin/sessions/" });

  // URL is the source of truth for filters: a reload preserves the view.
  const filtersFromUrl = useMemo(() => searchToFilters(search), [search]);
  const [filters, setFilters] = useState<SessionsFilters>(filtersFromUrl);

  // Keep local state in sync if the URL changes through navigation (e.g. the
  // user hits back). Compared by value because the hook returns a fresh
  // object on every render.
  useEffect(() => {
    setFilters((prev) => (areFiltersEqual(prev, filtersFromUrl) ? prev : filtersFromUrl));
  }, [filtersFromUrl]);

  const debouncedFilters = useDebouncedFilters(filters);

  // Persist debounced filters to the URL. `replace` keeps history clean.
  useEffect(() => {
    navigate({
      to: "/admin/sessions",
      search: filtersToSearch(debouncedFilters),
      replace: true,
    });
  }, [debouncedFilters, navigate]);

  const pagination = useSessionsList(debouncedFilters);
  const { items, query } = pagination;

  const onRowClick = useCallback(
    (row: AdminSessionSummary) => {
      navigate({ to: "/admin/sessions/$sessionId", params: { sessionId: row.id } });
    },
    [navigate],
  );

  const columns = useMemo<DataTableColumn<AdminSessionSummary>[]>(
    () => [
      {
        id: "id",
        header: t("admin.sessions.column.id"),
        cell: (row) => (
          <span className="font-mono text-xs text-muted-foreground">{row.id.slice(0, 8)}</span>
        ),
        className: "w-[10ch]",
      },
      {
        id: "user_id",
        header: t("admin.sessions.column.user_id"),
        cell: (row) => (
          <span className="font-mono text-xs text-muted-foreground">{row.user_id}</span>
        ),
      },
      {
        id: "started_at",
        header: t("admin.sessions.column.started_at"),
        cell: (row) => DATE_TIME.format(new Date(row.started_at)),
        className: "whitespace-nowrap",
      },
      {
        id: "last_activity_at",
        header: t("admin.sessions.column.last_activity_at"),
        cell: (row) => DATE_TIME.format(new Date(row.last_activity_at)),
        className: "whitespace-nowrap",
      },
      {
        id: "message_count",
        header: t("admin.sessions.column.message_count"),
        cell: (row) => NUMBER.format(row.message_count ?? 0),
        className: "text-right tabular-nums",
        headerClassName: "text-right",
      },
      {
        id: "error_count",
        header: t("admin.sessions.column.error_count"),
        cell: (row) => (
          <span
            data-tone={(row.error_count ?? 0) > 0 ? "down" : "ok"}
            className={
              (row.error_count ?? 0) > 0
                ? "tabular-nums text-destructive"
                : "tabular-nums text-muted-foreground"
            }
          >
            {NUMBER.format(row.error_count ?? 0)}
          </span>
        ),
        className: "text-right tabular-nums",
        headerClassName: "text-right",
      },
      {
        id: "branches_used",
        header: t("admin.sessions.column.branches"),
        cell: (row) => {
          const branches = row.branches_used ?? [];
          if (branches.length === 0) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="flex flex-wrap gap-1">
              {branches.map((branch) => (
                <span
                  key={branch}
                  className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs"
                >
                  {branch}
                </span>
              ))}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-4" data-testid="admin-sessions">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("admin.sessions.title")}</h1>
        <p className="text-muted-foreground">{t("admin.sessions.subtitle")}</p>
      </header>

      <SessionFilters
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters())}
      />

      {query.isError ? (
        <p role="alert" className="text-sm text-destructive" data-testid="sessions-error">
          {t("admin.sessions.error")}
        </p>
      ) : null}

      <DataTable
        testId="sessions-table"
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        onRowClick={onRowClick}
        isLoading={query.isPending || query.isFetching}
        isFetchingNextPage={query.isFetchingNextPage}
        hasNextPage={Boolean(query.hasNextPage)}
        onLoadMore={() => {
          if (!query.isFetchingNextPage && query.hasNextPage) query.fetchNextPage();
        }}
        emptyText={t("admin.sessions.empty")}
        loadMoreText={t("admin.sessions.loadMore")}
        loadingMoreText={t("admin.sessions.loadingMore")}
        loadingText={t("admin.sessions.loading")}
        caption={t("admin.sessions.title")}
      />
    </div>
  );
}

function areFiltersEqual(a: SessionsFilters, b: SessionsFilters): boolean {
  if (
    a.user_id !== b.user_id ||
    a.started_from !== b.started_from ||
    a.started_to !== b.started_to ||
    a.has_errors !== b.has_errors ||
    a.min_messages !== b.min_messages ||
    a.max_messages !== b.max_messages
  ) {
    return false;
  }
  if (a.branches.length !== b.branches.length) return false;
  for (let i = 0; i < a.branches.length; i += 1) {
    if (a.branches[i] !== b.branches[i]) return false;
  }
  return true;
}
