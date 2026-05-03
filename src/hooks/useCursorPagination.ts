import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";

// Cursor-keyset pagination is locked across the API
// (FRONTEND_CLAUDE.md §4.3): every list endpoint returns
// `{ items: T[], next_cursor: string | null }`. This hook is the canonical
// glue for that contract on top of TanStack Query's `useInfiniteQuery`.

// `next_cursor` accepts `undefined` so server payloads that omit the field
// (the OpenAPI schema marks it `string | null | undefined`) round-trip
// without callers having to coerce.
export type CursorPage<T> = {
  items: T[];
  next_cursor?: string | null;
};

type FetchPage<T> = (args: {
  cursor: string | null;
  signal?: AbortSignal;
}) => Promise<CursorPage<T>>;

type Options<T> = {
  queryKey: QueryKey;
  fetchPage: FetchPage<T>;
  enabled?: boolean;
  initialCursor?: string | null;
  // `keepPreviousData`-style behaviour while filters change (FRONTEND_CLAUDE.md
  // §5: paginated lists keep the prior data on screen during refetch).
  keepPreviousData?: boolean;
};

export type UseCursorPaginationResult<T> = {
  items: T[];
  query: UseInfiniteQueryResult<InfiniteData<CursorPage<T>, string | null>, Error>;
};

export function useCursorPagination<T>(options: Options<T>): UseCursorPaginationResult<T> {
  const {
    queryKey,
    fetchPage,
    enabled = true,
    initialCursor = null,
    keepPreviousData = true,
  } = options;

  const query = useInfiniteQuery<
    CursorPage<T>,
    Error,
    InfiniteData<CursorPage<T>, string | null>,
    QueryKey,
    string | null
  >({
    queryKey,
    queryFn: ({ pageParam, signal }) => fetchPage({ cursor: pageParam ?? null, signal }),
    initialPageParam: initialCursor,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    enabled,
    placeholderData: keepPreviousData ? (previous) => previous : undefined,
  });

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  return { items, query };
}
