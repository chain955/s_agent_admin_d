import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyStatPoint } from "../types";
import { formatDayLabel, formatMs } from "./format";

type Props = { data: DailyStatPoint[] };

export function AvgResponseLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tickFormatter={formatDayLabel} fontSize={12} />
        <YAxis tickFormatter={formatMs} fontSize={12} width={60} />
        <Tooltip
          formatter={(value: number | string) => [formatMs(value), ""]}
          labelFormatter={formatDayLabel}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
