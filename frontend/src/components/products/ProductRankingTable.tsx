"use client";

import { TrendingUp, TrendingDown, Minus, Star, ExternalLink } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductRankingTableProps {
  products: Product[];
}

export default function ProductRankingTable({ products }: ProductRankingTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-card">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
              Product
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
              Category
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted">
              Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted">
              Rating
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted">
              Trend Score
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted">
              Change
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const ChangeIcon =
              product.rank_change === 0
                ? Minus
                : product.rank_change > 0
                ? TrendingUp
                : TrendingDown;
            const changeColor =
              product.rank_change === 0
                ? "text-muted"
                : product.rank_change > 0
                ? "text-success"
                : "text-danger";

            return (
              <tr
                key={product.id}
                className="border-b border-border transition-colors hover:bg-card-hover"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-bold text-foreground">
                    #{product.rank || index + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {product.name}
                      </p>
                      {product.brand && (
                        <p className="text-xs text-muted">{product.brand}</p>
                      )}
                    </div>
                    {product.source_url && (
                      <a
                        href={product.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent-light capitalize">
                    {product.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-foreground">
                  {product.price
                    ? `${product.currency === "USD" ? "$" : product.currency}${product.price.toFixed(2)}`
                    : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="h-3 w-3 text-warning" fill="currentColor" />
                    <span className="text-sm text-foreground">
                      {product.rating?.toFixed(1) || "-"}
                    </span>
                    <span className="text-xs text-muted">
                      ({product.review_count.toLocaleString()})
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{
                        width: `${Math.min(product.trend_score, 100)}%`,
                        maxWidth: "60px",
                      }}
                    />
                    <span className="ml-2 text-sm font-medium text-foreground">
                      {product.trend_score.toFixed(0)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className={`flex items-center justify-end gap-1 ${changeColor}`}>
                    <ChangeIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {Math.abs(product.rank_change)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-muted">
            No product data yet. Run the e-commerce collector to populate rankings.
          </p>
        </div>
      )}
    </div>
  );
}
