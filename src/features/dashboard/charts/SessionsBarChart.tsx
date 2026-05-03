import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyStatPoint } from "../types";
import { formatCount, formatDayLabel } from "./format";

type Props = { data: DailyStatPoint[] };

export function SessionsBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tickFormatter={formatDayLabel} fontSize={12} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip
          formatter={(value: number | string) => [formatCount(value), ""]}
          labelFormatter={formatDayLabel}
        />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
