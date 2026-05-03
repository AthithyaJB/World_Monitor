"use client";

import { useState, useEffect } from "react";
import { Activity, TrendingUp, MessageSquare, Sparkles } from "lucide-react";
import MetricCard from "@/components/layout/MetricCard";
import GlobalTrendMap from "@/components/map/GlobalTrendMap";
import SparklineCard from "@/components/charts/SparklineCard";
import { useTrendQuery } from "@/hooks/useTrendQuery";
import { useRealtimeTrends } from "@/hooks/useRealtimeTrends";
import { formatNumber } from "@/lib/constants";
import type { TrendMapPoint, TopTrend } from "@/types/trend";
import type { AIInsight } from "@/types/ai-insight";

// Demo data for when API is not connected
const DEMO_MAP_DATA: TrendMapPoint[] = [
  { region: "US", avg_score: 85, total_volume: 15420, top_keywords: ["retinol", "glass skin", "vitamin c serum", "peptides", "sunscreen"] },
  { region: "KR", avg_score: 92, total_volume: 12800, top_keywords: ["snail mucin", "k-beauty", "glass skin", "ceramides", "niacinamide"] },
  { region: "JP", avg_score: 78, total_volume: 8900, top_keywords: ["j-beauty", "sunscreen", "cleanser", "moisturizer", "rice water"] },
  { region: "GB", avg_score: 72, total_volume: 6500, top_keywords: ["retinol", "hyaluronic acid", "niacinamide", "SPF", "vitamin c"] },
  { region: "FR", avg_score: 70, total_volume: 5800, top_keywords: ["clean beauty", "fragrance", "micellar water", "serum", "anti-aging"] },
  { region: "IN", avg_score: 68, total_volume: 9200, top_keywords: ["vitamin c", "sunscreen", "niacinamide", "aloe vera", "turmeric"] },
  { region: "BR", avg_score: 65, total_volume: 4300, top_keywords: ["hair oil", "lip oil", "sunscreen", "collagen", "keratin"] },
  { region: "AU", avg_score: 71, total_volume: 3200, top_keywords: ["sunscreen", "zinc oxide", "vitamin c", "retinol", "AHA BHA"] },
  { region: "DE", avg_score: 62, total_volume: 4100, top_keywords: ["clean beauty", "ceramides", "sunscreen", "niacinamide", "retinol"] },
  { region: "CN", avg_score: 80, total_volume: 11000, top_keywords: ["glass skin", "collagen", "snail mucin", "vitamin c", "hyaluronic acid"] },
  { region: "TH", avg_score: 67, total_volume: 3800, top_keywords: ["sunscreen", "whitening", "snail mucin", "aloe", "niacinamide"] },
  { region: "CA", avg_score: 69, total_volume: 3500, top_keywords: ["retinol", "vitamin c", "hyaluronic acid", "clean beauty", "SPF"] },
];

const DEMO_TOP_TRENDS: TopTrend[] = [
  { keyword: "peptide serum", category: "skincare", score: 94, volume: 28500, change: 45.2, sentiment: 0.72 },
  { keyword: "glass skin", category: "skincare", score: 91, volume: 22100, change: 12.8, sentiment: 0.85 },
  { keyword: "lip oil", category: "makeup", score: 88, volume: 19800, change: 67.3, sentiment: 0.68 },
  { keyword: "snail mucin", category: "skincare", score: 86, volume: 17600, change: 8.4, sentiment: 0.79 },
  { keyword: "skin cycling", category: "skincare", score: 83, volume: 15200, change: -5.1, sentiment: 0.61 },
  { keyword: "retinol", category: "skincare", score: 81, volume: 31000, change: 3.2, sentiment: 0.55 },
  { keyword: "LED mask", category: "wellness", score: 79, volume: 8400, change: 89.1, sentiment: 0.74 },
  { keyword: "hair oil", category: "haircare", score: 76, volume: 12300, change: 22.7, sentiment: 0.66 },
  { keyword: "clean beauty", category: "skincare", score: 74, volume: 9800, change: -2.3, sentiment: 0.58 },
  { keyword: "gua sha", category: "wellness", score: 71, volume: 7200, change: -12.5, sentiment: 0.62 },
];

export default function OverviewPage() {
  const mapQuery = useTrendQuery<{ data: TrendMapPoint[] }>("/trends/map", 120000);
  const topQuery = useTrendQuery<{ data: TopTrend[] }>("/trends/top?limit=10", 60000);
  const anomalyQuery = useTrendQuery<{ data: AIInsight[] }>("/ai/anomalies?limit=3", 120000);

  const mapData = useRealtimeTrends(mapQuery.data?.data || DEMO_MAP_DATA);
  const topTrends = topQuery.data?.data || DEMO_TOP_TRENDS;
  const anomalies = anomalyQuery.data?.data || [];

  // Computed metrics
  const totalTrends = topTrends.length;
  const avgSentiment = topTrends.reduce((sum, t) => sum + (t.sentiment || 0), 0) / (totalTrends || 1);
  const totalVolume = topTrends.reduce((sum, t) => sum + t.volume, 0);
  const topCategory = topTrends.length > 0 ? topTrends[0].category : "skincare";

  return (
    <div className="space-y-6">
      {/* Anomaly Banner */}
      {anomalies.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-warning" />
            <p className="text-sm font-medium text-warning">
              {anomalies.length} anomal{anomalies.length === 1 ? "y" : "ies"} detected
            </p>
          </div>
          <p className="mt-1 text-xs text-muted">
            {anomalies[0]?.title} — {anomalies[0]?.content?.slice(0, 100)}...
          </p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Active Trends"
          value={totalTrends}
          change={12.5}
          subtitle="Last 24 hours"
          icon={<Activity className="h-4 w-4" />}
          color="#6366f1"
        />
        <MetricCard
          title="Top Category"
          value={topCategory.charAt(0).toUpperCase() + topCategory.slice(1)}
          subtitle="Highest trend volume"
          icon={<TrendingUp className="h-4 w-4" />}
          color="#ec4899"
        />
        <MetricCard
          title="Avg Sentiment"
          value={avgSentiment.toFixed(2)}
          change={5.3}
          subtitle="Across all sources"
          icon={<MessageSquare className="h-4 w-4" />}
          color="#10b981"
        />
        <MetricCard
          title="Total Mentions"
          value={formatNumber(totalVolume)}
          change={18.7}
          subtitle="Combined volume"
          icon={<Sparkles className="h-4 w-4" />}
          color="#f59e0b"
        />
      </div>

      {/* Map + Top Trends */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <GlobalTrendMap data={mapData} />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Top Trending</h3>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "440px" }}>
            {topTrends.map((trend) => (
              <SparklineCard
                key={trend.keyword}
                keyword={trend.keyword}
                score={trend.score}
                change={trend.change}
                category={trend.category}
                volume={trend.volume}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
