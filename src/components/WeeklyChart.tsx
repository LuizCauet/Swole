"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface WeeklyChartProps {
  data: { day: string; value: number }[];
  color: string;
  label: string;
  goal: number;
  unit: string;
}

export default function WeeklyChart({
  data,
  color,
  label,
  goal,
  unit,
}: WeeklyChartProps) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-xs text-muted">
          Goal: {goal}
          {unit}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#737373" }}
          />
          <YAxis hide domain={[0, Math.max(goal * 1.2, 1)]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161616",
              border: "1px solid #262626",
              borderRadius: "0.75rem",
              fontSize: "12px",
              color: "#f5f5f5",
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            formatter={(value) => [`${value}${unit}`, label]}
            labelFormatter={(label) => String(label)}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
