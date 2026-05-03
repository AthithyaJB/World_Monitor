"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import type { AIInsight } from "@/types/ai-insight";
import { formatTimeAgo } from "@/lib/constants";

interface TrendReportProps {
  reports: AIInsight[];
}

export default function TrendReport({ reports }: TrendReportProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">AI Reports</h3>
      {reports.length === 0 ? (
        <p className="text-xs text-muted">No reports generated yet.</p>
      ) : (
        reports.map((report) => (
          <div
            key={report.id}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedId(expandedId === report.id ? null : report.id)
              }
              className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-card-hover"
            >
              <FileText className="h-4 w-4 shrink-0 text-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {report.title}
                </p>
                <p className="text-[10px] text-muted">
                  {formatTimeAgo(report.created_at)}
                </p>
              </div>
              {expandedId === report.id ? (
                <ChevronUp className="h-4 w-4 text-muted" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted" />
              )}
            </button>
            {expandedId === report.id && (
              <div className="border-t border-border p-4">
                <div className="prose prose-sm prose-invert max-w-none">
                  {report.content.split("\n").map((line, i) => (
                    <p key={i} className="mb-1 text-sm text-foreground/80">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
