import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RouterBranchSharePoint } from "../types";
import { formatCount, formatDayLabel } from "./format";

// Stable HSL palette (8 hues). Recharts doesn't accept CSS variables for
// `Bar.fill` so we keep the colours plain. Tones picked to be readable on
// both themes; saturation tuned for dark-mode legibility.
const PALETTE = [
  "hsl(214, 95%, 60%)",
  "hsl(160, 84%, 39%)",
  "hsl(28, 95%, 56%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 82%, 60%)",
  "hsl(180, 70%, 42%)",
  "hsl(48, 96%, 53%)",
  "hsl(0, 84%, 60%)",
];

type Props = { data: RouterBranchSharePoint[] };

type FlatRow = { date: string } & Record<string, number | string>;

export function BranchStackedBarChart({ data }: Props) {
  const { rows, branches } = useMemo(() => buildSeries(data), [data]);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tickFormatter={formatDayLabel} fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip
          formatter={(value: number | string, name: string) => [formatCount(value), name]}
          labelFormatter={formatDayLabel}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {branches.map((branch, index) => (
          <Bar
            key={branch}
            dataKey={branch}
            stackId="branches"
            fill={PALETTE[index % PALETTE.length]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function buildSeries(data: RouterBranchSharePoint[]): {
  rows: FlatRow[];
  branches: string[];
} {
  const set = new Set<string>();
  for (const point of data) {
    for (const branch of Object.keys(point.by_branch ?? {})) set.add(branch);
  }
  const branches = Array.from(set).sort();
  const rows = data.map<FlatRow>((point) => {
    const row: FlatRow = { date: point.date };
    for (const branch of branches) {
      row[branch] = Number(point.by_branch?.[branch] ?? 0);
    }
    return row;
  });
  return { rows, branches };
}
