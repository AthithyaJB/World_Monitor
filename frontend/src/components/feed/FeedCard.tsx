"use client";

import { ExternalLink } from "lucide-react";
import { getSentimentLabel, getSentimentColor, formatTimeAgo } from "@/lib/constants";
import type { SocialPost } from "@/types/social-post";

const sourceIcons: Record<string, string> = {
  reddit: "R",
  twitter: "X",
  tiktok: "T",
  news: "N",
};

const sourceColors: Record<string, string> = {
  reddit: "#ff4500",
  twitter: "#1da1f2",
  tiktok: "#00f2ea",
  news: "#64748b",
};

interface FeedCardProps {
  post: SocialPost;
}

export default function FeedCard({ post }: FeedCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-all hover:bg-card-hover">
      <div className="flex items-start gap-3">
        {/* Source Icon */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: sourceColors[post.source] || "#64748b" }}
        >
          {sourceIcons[post.source] || "?"}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">
              {post.author || "Anonymous"}
            </span>
            <span className="text-xs text-muted">
              {post.posted_at ? formatTimeAgo(post.posted_at) : formatTimeAgo(post.collected_at)}
            </span>
            {post.sentiment != null && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${getSentimentColor(post.sentiment)}20`,
                  color: getSentimentColor(post.sentiment),
                }}
              >
                {getSentimentLabel(post.sentiment)}
              </span>
            )}
          </div>

          {/* Content */}
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/80 line-clamp-3">
            {post.content}
          </p>

          {/* Keywords & Engagement */}
          <div className="mt-2 flex items-center gap-2">
            {post.keywords.slice(0, 3).map((kw) => (
              <span
                key={kw}
                className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent-light"
              >
                {kw}
              </span>
            ))}
            {post.engagement > 0 && (
              <span className="ml-auto text-xs text-muted">
                {post.engagement.toLocaleString()} engagements
              </span>
            )}
            {post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
