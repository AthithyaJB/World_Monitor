"use client";

import { AlertTriangle, TrendingUp, TrendingDown, Zap } from "lucide-react";
import type { AIInsight } from "@/types/ai-insight";
import { formatTimeAgo } from "@/lib/constants";

interface AnomalyAlertProps {
  anomalies: AIInsight[];
}

const typeIcons: Record<string, typeof AlertTriangle> = {
  spike: TrendingUp,
  drop: TrendingDown,
  unusual: Zap,
  anomaly: AlertTriangle,
};

const typeColors: Record<string, string> = {
  spike: "#10b981",
  drop: "#ef4444",
  unusual: "#f59e0b",
  anomaly: "#f59e0b",
};

export default function AnomalyAlert({ anomalies }: AnomalyAlertProps) {
  if (anomalies.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Recent Anomalies</h3>
      {anomalies.map((anomaly) => {
        const Icon = typeIcons[anomaly.type] || AlertTriangle;
        const color = typeColors[anomaly.type] || "#f59e0b";

        return (
          <div
            key={anomaly.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:bg-card-hover"
          >
            <div
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="h-3 w-3" style={{ color }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {anomaly.title}
              </p>
              <p className="mt-0.5 text-xs text-muted line-clamp-2">
                {anomaly.content}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {anomaly.confidence != null && (
                  <span className="text-[10px] text-muted">
                    Confidence: {(anomaly.confidence * 100).toFixed(0)}%
                  </span>
                )}
                <span className="text-[10px] text-muted">
                  {formatTimeAgo(anomaly.created_at)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
