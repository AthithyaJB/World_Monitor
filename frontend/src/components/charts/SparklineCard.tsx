"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineCardProps {
  keyword: string;
  score: number;
  change: number;
  category: string;
  volume: number;
  data?: Array<{ value: number }>;
}

export default function SparklineCard({
  keyword,
  score,
  change,
  category,
  volume,
  data,
}: SparklineCardProps) {
  const sparkData = data || Array.from({ length: 12 }, (_, i) => ({
    value: score * (0.7 + Math.random() * 0.6),
  }));

  const changeColor = change > 0 ? "text-success" : change < 0 ? "text-danger" : "text-muted";
  const changeIcon = change > 0 ? "+" : "";

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-all hover:bg-card-hover">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{keyword}</p>
        <p className="text-xs text-muted capitalize">{category}</p>
      </div>
      <div className="w-20 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={change >= 0 ? "#10b981" : "#ef4444"}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-right min-w-[60px]">
        <p className="text-sm font-bold text-foreground">{score.toFixed(0)}</p>
        <p className={`text-xs font-medium ${changeColor}`}>
          {changeIcon}{change.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
