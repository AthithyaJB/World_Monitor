"use client";

import { useState } from "react";
import { FileText, AlertTriangle, Loader2 } from "lucide-react";
import ChatInterface from "@/components/command/ChatInterface";
import AnomalyAlert from "@/components/command/AnomalyAlert";
import TrendReport from "@/components/command/TrendReport";
import { useTrendQuery } from "@/hooks/useTrendQuery";
import { generateReport } from "@/lib/api";
import type { AIInsight } from "@/types/ai-insight";

const DEMO_ANOMALIES: AIInsight[] = [
  {
    id: "a1", type: "anomaly", title: "Spike: peptide serum", content: "Peptide serum mentions increased by 340% in the last 6 hours, primarily driven by a viral TikTok video showcasing before/after results.",
    keywords: ["peptides"], region: "US", confidence: 0.89, created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "a2", type: "anomaly", title: "Unusual: clean beauty sentiment drop", content: "Clean beauty sentiment dropped from 0.72 to 0.31 following controversy around greenwashing claims against a major brand.",
    keywords: ["clean beauty"], region: "global", confidence: 0.76, created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

const DEMO_REPORTS: AIInsight[] = [
  {
    id: "r1", type: "report", title: "Weekly Beauty Trends Report - Global", content: "## Executive Summary\n\nThis week saw significant movement in the skincare category, with peptide-based products leading the charge. K-beauty continues to dominate in Asia-Pacific markets while clean beauty maintains strong presence in European markets.\n\n## Key Trends\n- Peptide serums are the #1 rising trend globally\n- Glass skin technique remains a steady performer\n- LED masks seeing renewed interest\n\n## Predictions\n- Expect continued growth in peptide products through Q2\n- Lip oils will likely peak in the next 2-3 weeks",
    keywords: [], region: "global", confidence: undefined, created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function CommandPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const anomalyQuery = useTrendQuery<{ data: AIInsight[] }>("/ai/anomalies?limit=5", 120000);
  const anomalies = anomalyQuery.data?.data || DEMO_ANOMALIES;
  const reports = DEMO_REPORTS;

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await generateReport();
      // In production, this would refetch the reports list
    } catch {
      // Error handled silently
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Main Chat Area */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">AI Command Center</h2>
            <p className="mt-1 text-sm text-muted">
              Ask questions about beauty trends and get AI-powered intelligence
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-light disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Generate Report
          </button>
        </div>
        <div className="h-[calc(100%-4rem)]">
          <ChatInterface />
        </div>
      </div>

      {/* Sidebar: Anomalies + Reports */}
      <div className="w-80 space-y-6 overflow-y-auto">
        <AnomalyAlert anomalies={anomalies} />
        <TrendReport reports={reports} />
      </div>
    </div>
  );
}
