"use client";

import { useTrendQuery } from "@/hooks/useTrendQuery";
import SocialFeed from "@/components/feed/SocialFeed";
import type { SocialPost } from "@/types/social-post";

const DEMO_POSTS: SocialPost[] = [
  {
    id: "1", source: "reddit", author: "skincare_lover42", content: "Just tried the new CeraVe retinol serum and WOW. My skin texture has improved so much in just 2 weeks. The formulation with ceramides really helps with the irritation that other retinols cause.",
    url: "https://reddit.com/r/SkincareAddiction", hashtags: [], keywords: ["retinol", "ceramides", "skincare"],
    sentiment: 0.85, engagement: 1240, region: "US", posted_at: new Date(Date.now() - 300000).toISOString(), collected_at: new Date().toISOString(),
  },
  {
    id: "2", source: "twitter", author: "@beautyguru", content: "The glass skin trend is NOT dying. Korean beauty brands are releasing even more hydrating toners and essences this spring. Expect to see a lot more dewy looks on the runway.",
    url: "https://twitter.com", hashtags: ["glassskin", "kbeauty"], keywords: ["glass skin", "k-beauty"],
    sentiment: 0.72, engagement: 3420, region: "global", posted_at: new Date(Date.now() - 900000).toISOString(), collected_at: new Date().toISOString(),
  },
  {
    id: "3", source: "tiktok", author: "skinbyali", content: "POV: you discover snail mucin and your skin has never been this hydrated. I've been using the COSRX snail essence for 3 months and the results are insane. Before and after in the video!",
    hashtags: ["snailmucin", "skincare", "cosrx"], keywords: ["snail mucin", "skincare"],
    sentiment: 0.91, engagement: 45600, region: "US", posted_at: new Date(Date.now() - 1800000).toISOString(), collected_at: new Date().toISOString(),
  },
  {
    id: "4", source: "reddit", author: "makeupjunkie", content: "PSA: The new lip oil trend is actually amazing for people with dry lips. I switched from traditional lipstick to lip oils and the difference in comfort is unreal. Plus they look gorgeous.",
    url: "https://reddit.com/r/MakeupAddiction", hashtags: [], keywords: ["lip oil", "makeup"],
    sentiment: 0.78, engagement: 890, region: "US", posted_at: new Date(Date.now() - 3600000).toISOString(), collected_at: new Date().toISOString(),
  },
  {
    id: "5", source: "news", author: "Allure Magazine", content: "The Rise of Peptide Serums: Why dermatologists say this ingredient is the next retinol. Peptide-based products have seen a 340% increase in searches this quarter.",
    url: "https://allure.com", hashtags: [], keywords: ["peptides", "skincare", "anti-aging"],
    sentiment: 0.65, engagement: 2100, region: "global", posted_at: new Date(Date.now() - 7200000).toISOString(), collected_at: new Date().toISOString(),
  },
  {
    id: "6", source: "twitter", author: "@dermdoctor", content: "Stop using lemon juice on your face! I'm seeing more patients with chemical burns from DIY skincare trends on TikTok. Please stick to formulated products with proper pH levels.",
    hashtags: ["skincare", "dermatology"], keywords: ["skincare"],
    sentiment: -0.45, engagement: 12800, region: "US", posted_at: new Date(Date.now() - 5400000).toISOString(), collected_at: new Date().toISOString(),
  },
  {
    id: "7", source: "tiktok", author: "glowwithme", content: "LED mask review after 30 days of consistent use! Red light therapy really does help with fine lines. Here are my before and after results with measurements.",
    hashtags: ["LEDmask", "antiaging", "skincare"], keywords: ["LED mask", "anti-aging", "wellness"],
    sentiment: 0.82, engagement: 28900, region: "GB", posted_at: new Date(Date.now() - 10800000).toISOString(), collected_at: new Date().toISOString(),
  },
  {
    id: "8", source: "reddit", author: "asianbeautyexpert", content: "Comprehensive review of 10 Japanese sunscreens tested this summer. Biore UV Aqua Rich still reigns supreme but the new Anessa formula is a close second. Full breakdown inside.",
    url: "https://reddit.com/r/AsianBeauty", hashtags: [], keywords: ["sunscreen", "j-beauty"],
    sentiment: 0.70, engagement: 2340, region: "JP", posted_at: new Date(Date.now() - 14400000).toISOString(), collected_at: new Date().toISOString(),
  },
];

export default function FeedPage() {
  const { data } = useTrendQuery<{ data: SocialPost[] }>("/feed/recent?limit=50", 30000);
  const posts = data?.data || DEMO_POSTS;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Real-time Social Feed</h2>
        <p className="mt-1 text-sm text-muted">
          Live beauty trend discussions from Reddit, X/Twitter, TikTok, and news sources
        </p>
      </div>
      <SocialFeed initialPosts={posts} />
    </div>
  );
}
