"use client";

import { useState } from "react";
import ProductRankingTable from "@/components/products/ProductRankingTable";
import { useTrendQuery } from "@/hooks/useTrendQuery";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types/product";

const DEMO_PRODUCTS: Product[] = [
  { id: "1", name: "CeraVe Retinol Serum", brand: "CeraVe", category: "skincare", ingredients: ["retinol", "ceramides", "niacinamide"], source: "ecommerce", price: 19.99, currency: "USD", rating: 4.5, review_count: 12840, trend_score: 95, rank: 1, rank_change: 2, region: "US", image_url: "", source_url: "" },
  { id: "2", name: "COSRX Snail Mucin Essence", brand: "COSRX", category: "skincare", ingredients: ["snail secretion filtrate", "sodium hyaluronate"], source: "ecommerce", price: 24.99, currency: "USD", rating: 4.7, review_count: 45200, trend_score: 92, rank: 2, rank_change: 0, region: "US", image_url: "", source_url: "" },
  { id: "3", name: "Dior Lip Oil", brand: "Dior", category: "makeup", ingredients: ["cherry oil", "jojoba oil"], source: "ecommerce", price: 40.00, currency: "USD", rating: 4.4, review_count: 8900, trend_score: 88, rank: 3, rank_change: 5, region: "US", image_url: "", source_url: "" },
  { id: "4", name: "The Ordinary Niacinamide 10%", brand: "The Ordinary", category: "skincare", ingredients: ["niacinamide", "zinc PCA"], source: "ecommerce", price: 6.50, currency: "USD", rating: 4.3, review_count: 67800, trend_score: 85, rank: 4, rank_change: -1, region: "US", image_url: "", source_url: "" },
  { id: "5", name: "Supergoop Unseen Sunscreen", brand: "Supergoop", category: "skincare", ingredients: ["avobenzone", "homosalate"], source: "ecommerce", price: 38.00, currency: "USD", rating: 4.6, review_count: 15600, trend_score: 83, rank: 5, rank_change: 1, region: "US", image_url: "", source_url: "" },
  { id: "6", name: "Olaplex No.3 Hair Perfector", brand: "Olaplex", category: "haircare", ingredients: ["bis-aminopropyl diglycol dimaleate"], source: "ecommerce", price: 30.00, currency: "USD", rating: 4.4, review_count: 32100, trend_score: 80, rank: 6, rank_change: -2, region: "US", image_url: "", source_url: "" },
  { id: "7", name: "Drunk Elephant Protini", brand: "Drunk Elephant", category: "skincare", ingredients: ["peptides", "amino acids"], source: "ecommerce", price: 68.00, currency: "USD", rating: 4.2, review_count: 5400, trend_score: 78, rank: 7, rank_change: 3, region: "US", image_url: "", source_url: "" },
  { id: "8", name: "CurrentBody LED Mask", brand: "CurrentBody", category: "wellness", ingredients: [], source: "ecommerce", price: 380.00, currency: "USD", rating: 4.1, review_count: 2300, trend_score: 76, rank: 8, rank_change: 8, region: "US", image_url: "", source_url: "" },
  { id: "9", name: "Rare Beauty Soft Pinch Blush", brand: "Rare Beauty", category: "makeup", ingredients: [], source: "ecommerce", price: 23.00, currency: "USD", rating: 4.6, review_count: 19200, trend_score: 74, rank: 9, rank_change: 0, region: "US", image_url: "", source_url: "" },
  { id: "10", name: "Moroccanoil Treatment", brand: "Moroccanoil", category: "haircare", ingredients: ["argan oil", "vitamin E"], source: "ecommerce", price: 48.00, currency: "USD", rating: 4.5, review_count: 28700, trend_score: 71, rank: 10, rank_change: -3, region: "US", image_url: "", source_url: "" },
];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const params: Record<string, string> = { limit: "50" };
  if (activeCategory) params.category = activeCategory;

  const { data } = useTrendQuery(
    `/products/rankings?${new URLSearchParams(params)}`,
    120000
  );

  const products = data?.data || DEMO_PRODUCTS;
  const filtered = activeCategory
    ? products.filter((p: Product) => p.category === activeCategory)
    : products;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Product Rankings</h2>
        <p className="mt-1 text-sm text-muted">
          Trending beauty products ranked by trend score, sourced from e-commerce platforms
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            activeCategory === null
              ? "bg-accent text-white"
              : "bg-card text-muted hover:bg-card-hover"
          }`}
        >
          All ({products.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = products.filter((p: Product) => p.category === cat.id).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? "text-white"
                  : "bg-card text-muted hover:bg-card-hover"
              }`}
              style={
                activeCategory === cat.id
                  ? { backgroundColor: cat.color }
                  : undefined
              }
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      <ProductRankingTable products={filtered} />
    </div>
  );
}
