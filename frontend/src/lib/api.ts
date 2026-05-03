import { API_URL } from "./constants";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Trends
export const getTrends = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchAPI<{ data: any[]; meta: any }>(`/trends${qs}`);
};

export const getTrendMap = () =>
  fetchAPI<{ data: any[] }>("/trends/map");

export const getTopTrends = (limit = 20) =>
  fetchAPI<{ data: any[] }>(`/trends/top?limit=${limit}`);

// Products
export const getProductRankings = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchAPI<{ data: any[]; meta: any }>(`/products/rankings${qs}`);
};

// Feed
export const getRecentFeed = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchAPI<{ data: any[]; meta: any }>(`/feed/recent${qs}`);
};

// Analytics
export const getTimeSeries = (keyword: string, region = "global", period = "hourly", days = 7) =>
  fetchAPI<{ data: any[] }>(`/analytics/timeseries?keyword=${keyword}&region=${region}&period=${period}&days=${days}`);

export const getSentimentOverTime = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchAPI<{ data: any[] }>(`/analytics/sentiment${qs}`);
};

export const getCategoryBreakdown = () =>
  fetchAPI<{ data: any[] }>("/analytics/categories");

// AI
export const queryAI = (query: string, region?: string, category?: string) =>
  fetchAPI<{ data: any }>("/ai/query", {
    method: "POST",
    body: JSON.stringify({ query, region, category }),
  });

export const generateReport = (keyword?: string, region?: string) => {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  if (region) params.set("region", region);
  return fetchAPI<{ data: any }>(`/ai/report?${params}`);
};

export const getAnomalies = (limit = 10) =>
  fetchAPI<{ data: any[] }>(`/ai/anomalies?limit=${limit}`);
