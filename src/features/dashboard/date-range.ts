// Helpers for the dashboard date-range picker. Dates are exchanged with the
// backend as ISO `YYYY-MM-DD` strings (locked in `openapi.json`); the picker's
// state mirrors those strings to keep round-tripping simple.

import type { StatsRange } from "./api";

const DAYS_DEFAULT = 14;

export function isoDate(d: Date): string {
  // Use UTC slicing to avoid the off-by-one that local-time `toISOString`
  // produces near midnight in non-UTC zones. The picker is operator-facing so
  // a calendar-day granularity is enough.
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultRange(today: Date = new Date()): StatsRange {
  const to = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (DAYS_DEFAULT - 1));
  return { from: isoDate(from), to: isoDate(to) };
}

export function isValidRange(range: StatsRange): boolean {
  if (!range.from || !range.to) return false;
  return range.from <= range.to;
}
