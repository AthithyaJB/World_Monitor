export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  ingredients: string[];
  image_url?: string;
  source: string;
  source_url?: string;
  price?: number;
  currency: string;
  rating?: number;
  review_count: number;
  trend_score: number;
  rank?: number;
  rank_change: number;
  region: string;
}
