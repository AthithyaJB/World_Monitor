export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const CATEGORIES = [
  { id: "skincare", label: "Skincare", color: "#6366f1" },
  { id: "makeup", label: "Makeup", color: "#ec4899" },
  { id: "haircare", label: "Haircare", color: "#f59e0b" },
  { id: "fragrance", label: "Fragrance", color: "#8b5cf6" },
  { id: "nails", label: "Nails", color: "#14b8a6" },
  { id: "wellness", label: "Wellness", color: "#10b981" },
];

export const SOURCES = [
  { id: "reddit", label: "Reddit", color: "#ff4500" },
  { id: "twitter", label: "X/Twitter", color: "#1da1f2" },
  { id: "tiktok", label: "TikTok", color: "#00f2ea" },
  { id: "google_trends", label: "Google Trends", color: "#4285f4" },
  { id: "ecommerce", label: "E-Commerce", color: "#ff9900" },
  { id: "news", label: "News", color: "#64748b" },
];

export const SCORE_COLORS = {
  high: "#10b981",
  medium: "#f59e0b",
  low: "#6366f1",
};

export const SENTIMENT_LABELS: Record<string, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

export function getSentimentLabel(score: number | undefined | null): string {
  if (score == null) return "Unknown";
  if (score > 0.2) return "Positive";
  if (score < -0.2) return "Negative";
  return "Neutral";
}

export function getSentimentColor(score: number | undefined | null): string {
  if (score == null) return "#64748b";
  if (score > 0.2) return "#10b981";
  if (score < -0.2) return "#ef4444";
  return "#f59e0b";
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
