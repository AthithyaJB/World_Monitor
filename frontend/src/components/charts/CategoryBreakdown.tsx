"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CATEGORIES } from "@/lib/constants";

interface CategoryBreakdownProps {
  data: Array<{ category: string; count: number; avg_score: number }>;
  title?: string;
}

export default function CategoryBreakdown({
  data,
  title = "Category Distribution",
}: CategoryBreakdownProps) {
  const colorMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    colorMap[cat.id] = cat.color;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="count"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.category}
                fill={colorMap[entry.category] || "#64748b"}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "12px",
            }}
            formatter={(value, name) => [
              `${value} trends`,
              String(name),
            ]}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs text-muted capitalize">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
