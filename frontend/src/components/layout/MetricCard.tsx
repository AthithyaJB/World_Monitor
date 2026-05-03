"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  subtitle,
  icon,
  color = "#6366f1",
}: MetricCardProps) {
  const TrendIcon =
    change == null || change === 0
      ? Minus
      : change > 0
      ? TrendingUp
      : TrendingDown;

  const changeColor =
    change == null || change === 0
      ? "text-muted"
      : change > 0
      ? "text-success"
      : "text-danger";

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-border hover:bg-card-hover">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          {title}
        </p>
        {icon && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        {change != null && (
          <div className={`flex items-center gap-0.5 pb-1 ${changeColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span className="text-xs font-medium">
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-muted">{subtitle}</p>
      )}
    </div>
  );
}
