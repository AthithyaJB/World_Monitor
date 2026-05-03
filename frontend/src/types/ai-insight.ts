export interface AIInsight {
  id: string;
  type: "report" | "anomaly" | "prediction" | "query_response";
  query?: string;
  title: string;
  content: string;
  keywords: string[];
  region: string;
  confidence?: number;
  created_at: string;
}
