import { Fragment, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Column-driven, cursor-paginated table primitive
// (FRONTEND_CLAUDE.md §5). Feature folders never roll their own table — they
// describe columns and pass them in. The container owns sticky header,
// loading skeleton, and empty state; the surrounding feature owns filters,
// the query, and "load more" semantics through `onLoadMore` + `hasNextPage`.

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  // Header alignment + cell alignment share the same className by default;
  // pass a separate `headerClassName` if they need to diverge.
  headerClassName?: string;
};

type Props<T> = {
  columns: ReadonlyArray<DataTableColumn<T>>;
  rows: ReadonlyArray<T>;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  emptyText: string;
  loadMoreText: string;
  loadingMoreText: string;
  loadingText: string;
  caption?: string;
  testId?: string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  emptyText,
  loadMoreText,
  loadingMoreText,
  loadingText,
  caption,
  testId,
}: Props<T>) {
  const showSkeleton = isLoading && rows.length === 0;
  const showEmpty = !isLoading && rows.length === 0;

  return (
    <div data-testid={testId} className="rounded-md border bg-card text-card-foreground">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full caption-bottom text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={cn(
                    "border-b px-3 py-2 text-left align-middle font-medium text-muted-foreground",
                    col.headerClassName ?? col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {showSkeleton
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="border-b last:border-b-0">
                    {columns.map((col) => (
                      <td key={col.id} className={cn("px-3 py-3", col.className)}>
                        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              : null}
            {!showSkeleton && !showEmpty
              ? rows.map((row) => (
                  <Fragment key={rowKey(row)}>
                    <tr
                      className={cn(
                        "border-b transition-colors last:border-b-0",
                        onRowClick
                          ? "cursor-pointer hover:bg-muted/40 focus-visible:bg-muted/40"
                          : null,
                      )}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      onKeyDown={
                        onRowClick
                          ? (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onRowClick(row);
                              }
                            }
                          : undefined
                      }
                      tabIndex={onRowClick ? 0 : undefined}
                      role={onRowClick ? "button" : undefined}
                    >
                      {columns.map((col) => (
                        <td key={col.id} className={cn("px-3 py-3 align-middle", col.className)}>
                          {col.cell(row)}
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                ))
              : null}
            {showEmpty ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-muted-foreground"
                >
                  {emptyText}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t px-3 py-2 text-sm text-muted-foreground">
        <span aria-live="polite">{isLoading && rows.length > 0 ? loadingText : null}</span>
        {hasNextPage && onLoadMore ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={Boolean(isFetchingNextPage)}
          >
            {isFetchingNextPage ? loadingMoreText : loadMoreText}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
