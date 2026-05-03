"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendLineChartProps {
  data: Array<{
    period_start: string;
    avg_score: number;
    total_volume?: number;
    keyword?: string;
  }>;
  title?: string;
  dataKeys?: string[];
  colors?: string[];
}

export default function TrendLineChart({
  data,
  title = "Trend Over Time",
  dataKeys = ["avg_score"],
  colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981"],
}: TrendLineChartProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="period_start"
            tickFormatter={formatDate}
            stroke="#64748b"
            fontSize={11}
          />
          <YAxis stroke="#64748b" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "12px",
            }}
            labelFormatter={(label) => formatDate(String(label))}
          />
          <Legend />
          {dataKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
