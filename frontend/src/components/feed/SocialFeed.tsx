"use client";

import { useState } from "react";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import FeedCard from "./FeedCard";
import type { SocialPost } from "@/types/social-post";
import { SOURCES } from "@/lib/constants";

interface SocialFeedProps {
  initialPosts: SocialPost[];
}

export default function SocialFeed({ initialPosts }: SocialFeedProps) {
  const posts = useRealtimeFeed(initialPosts);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  const filteredPosts = sourceFilter
    ? posts.filter((p) => p.source === sourceFilter)
    : posts;

  return (
    <div>
      {/* Source Filters */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setSourceFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
            sourceFilter === null
              ? "bg-accent text-white"
              : "bg-card text-muted hover:bg-card-hover"
          }`}
        >
          All
        </button>
        {SOURCES.filter(s => ["reddit", "twitter", "tiktok", "news"].includes(s.id)).map((src) => (
          <button
            key={src.id}
            onClick={() =>
              setSourceFilter(sourceFilter === src.id ? null : src.id)
            }
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              sourceFilter === src.id
                ? "text-white"
                : "bg-card text-muted hover:bg-card-hover"
            }`}
            style={
              sourceFilter === src.id
                ? { backgroundColor: src.color }
                : undefined
            }
          >
            {src.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted">
          {filteredPosts.length} posts
        </span>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <FeedCard key={post.id} post={post} />)
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
            <p className="text-sm text-muted">
              No posts yet. Data will appear once the ingestion pipeline runs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
