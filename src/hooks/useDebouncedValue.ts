import { useEffect, useState } from "react";

// Returns the input value after it has been stable for `delay` ms. Used by
// text-typed filters (e.g. user_id, branch picker) so we do not fire a query
// on every keystroke.
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
