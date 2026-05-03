// Chart-only formatting helpers. Pure, no React, no fetch (FRONTEND_CLAUDE.md
// §3 layer rules — even though these live next to feature components rather
// than in `/src/lib`, they have no React dependency).

const NUMBER_FMT = new Intl.NumberFormat("ru-RU");
const SECONDS_FMT = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCount(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  return NUMBER_FMT.format(n);
}

export function formatMs(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  // Keep the locale's decimal separator (comma in ru-RU) consistent with
  // every other number on the dashboard. FRONTEND_CLAUDE.md §5 forbids raw
  // `.toFixed`, so we always go through `Intl.NumberFormat`.
  if (n >= 1000) return `${SECONDS_FMT.format(n / 1000)} с`;
  return `${NUMBER_FMT.format(Math.round(n))} мс`;
}

// "2026-05-03" → "03 мая". Used as the X-axis tick label so 14 days fit
// horizontally without wrapping. Stays in ru locale per i18n MVP.
const SHORT_DATE_FMT = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
});

export function formatDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return SHORT_DATE_FMT.format(new Date(Date.UTC(y, m - 1, d)));
}
