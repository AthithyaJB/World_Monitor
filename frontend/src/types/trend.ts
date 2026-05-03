export interface Trend {
  id: string;
  keyword: string;
  category: string;
  subcategory?: string;
  region: string;
  source: string;
  score: number;
  volume: number;
  sentiment?: number;
  collected_at: string;
}

export interface TrendMapPoint {
  region: string;
  avg_score: number;
  total_volume: number;
  top_keywords: string[];
}

export interface TopTrend {
  keyword: string;
  category: string;
  score: number;
  volume: number;
  change: number;
  sentiment?: number;
}

export interface TimeSeriesPoint {
  period_start: string;
  avg_score: number;
  total_volume: number;
  avg_sentiment?: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  avg_score: number;
}
