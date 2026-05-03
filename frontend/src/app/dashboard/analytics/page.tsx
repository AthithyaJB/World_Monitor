"use client";

import { useState } from "react";
import TrendLineChart from "@/components/charts/TrendLineChart";
import CategoryBreakdown from "@/components/charts/CategoryBreakdown";
import SentimentGauge from "@/components/charts/SentimentGauge";
import { useTrendQuery } from "@/hooks/useTrendQuery";

// Demo data
const DEMO_TIMESERIES = Array.from({ length: 48 }, (_, i) => ({
  period_start: new Date(Date.now() - (48 - i) * 3600000).toISOString(),
  avg_score: 50 + Math.sin(i / 6) * 20 + Math.random() * 10,
  total_volume: Math.floor(500 + Math.random() * 1000),
  avg_sentiment: 0.3 + Math.sin(i / 8) * 0.3,
}));

const DEMO_CATEGORIES = [
  { category: "skincare", count: 342, avg_score: 78.5 },
  { category: "makeup", count: 187, avg_score: 72.3 },
  { category: "haircare", count: 98, avg_score: 65.8 },
  { category: "fragrance", count: 67, avg_score: 61.2 },
  { category: "wellness", count: 89, avg_score: 74.1 },
  { category: "nails", count: 34, avg_score: 58.9 },
];

const DEMO_SENTIMENT_SERIES = Array.from({ length: 14 }, (_, i) => ({
  period_start: new Date(Date.now() - (14 - i) * 86400000).toISOString(),
  avg_sentiment: 0.35 + Math.sin(i / 3) * 0.2 + Math.random() * 0.1,
  keyword: "overall",
  category: "all",
}));

const KEYWORDS_OPTIONS = [
  "retinol", "glass skin", "snail mucin", "peptides",
  "vitamin c serum", "niacinamide", "lip oil", "sunscreen",
];

export default function AnalyticsPage() {
  const [selectedKeyword, setSelectedKeyword] = useState("retinol");

  const tsQuery = useTrendQuery(
    `/analytics/timeseries?keyword=${selectedKeyword}&period=hourly&days=7`,
    120000
  );
  const catQuery = useTrendQuery("/analytics/categories", 300000);
  const sentQuery = useTrendQuery(
    `/analytics/sentiment?keyword=${selectedKeyword}&days=14`,
    300000
  );

  const timeseriesData = tsQuery.data?.data || DEMO_TIMESERIES;
  const categoryData = catQuery.data?.data || DEMO_CATEGORIES;
  const sentimentData = sentQuery.data?.data || DEMO_SENTIMENT_SERIES;

  const avgSentiment =
    sentimentData.reduce(
      (sum: number, d: any) => sum + (d.avg_sentiment || 0),
      0
    ) / (sentimentData.length || 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Trend Analytics</h2>
          <p className="mt-1 text-sm text-muted">
            Deep dive into trend patterns, sentiment, and category distribution
          </p>
        </div>

        {/* Keyword Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Keyword:</span>
          <select
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            {KEYWORDS_OPTIONS.map((kw) => (
              <option key={kw} value={kw}>
                {kw}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Time Series Chart */}
      <TrendLineChart
        data={timeseriesData}
        title={`Trend Score: "${selectedKeyword}" (Last 7 Days)`}
        dataKeys={["avg_score"]}
      />

      {/* Sentiment + Categories Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Sentiment Over Time */}
        <div className="col-span-1">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Overall Sentiment
            </h3>
            <div className="flex flex-col items-center gap-4">
              <SentimentGauge score={avgSentiment} size="lg" />
              <div className="grid w-full grid-cols-3 gap-2">
                <div className="rounded-lg bg-success/10 p-2 text-center">
                  <p className="text-lg font-bold text-success">62%</p>
                  <p className="text-[10px] text-muted">Positive</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-2 text-center">
                  <p className="text-lg font-bold text-warning">28%</p>
                  <p className="text-[10px] text-muted">Neutral</p>
                </div>
                <div className="rounded-lg bg-danger/10 p-2 text-center">
                  <p className="text-lg font-bold text-danger">10%</p>
                  <p className="text-[10px] text-muted">Negative</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="col-span-2">
          <CategoryBreakdown data={categoryData} />
        </div>
      </div>

      {/* Sentiment Time Series */}
      <TrendLineChart
        data={sentimentData}
        title={`Sentiment Trend: "${selectedKeyword}" (Last 14 Days)`}
        dataKeys={["avg_sentiment"]}
        colors={["#10b981"]}
      />
    </div>
  );
}
