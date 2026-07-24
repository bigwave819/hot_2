"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export function RevenueChart({ data, currency }: { data: { date: string; revenue: number }[]; currency: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No reservation activity in this period yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => format(new Date(d), "MMM d")}
          tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }}
          axisLine={{ stroke: "var(--color-line)" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
          tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          formatter={(value) => [`${currency} ${Number(value).toLocaleString()}`, "Revenue"]}
          labelFormatter={(label) => format(new Date(String(label)), "EEEE, MMM d")}
          contentStyle={{
            background: "var(--color-canvas-raised)",
            border: "1px solid var(--color-line)",
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-forest)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}