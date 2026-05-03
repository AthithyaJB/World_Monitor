"use client";

import { useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

interface TopbarProps {
  onCategoryChange?: (category: string | null) => void;
  onRegionChange?: (region: string | null) => void;
  onSearch?: (query: string) => void;
}

export default function Topbar({
  onCategoryChange,
  onRegionChange,
  onSearch,
}: TopbarProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategoryClick = (catId: string) => {
    const newCat = activeCategory === catId ? null : catId;
    setActiveCategory(newCat);
    onCategoryChange?.(newCat);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search trends, products, keywords..."
          className="h-9 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
        />
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? "text-white"
                : "bg-card text-muted hover:bg-card-hover hover:text-foreground"
            }`}
            style={
              activeCategory === cat.id
                ? { backgroundColor: cat.color }
                : undefined
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Live Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
          <span className="text-xs text-muted">Live</span>
        </div>
        <button
          className="rounded-lg p-2 text-muted hover:bg-card hover:text-foreground transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
