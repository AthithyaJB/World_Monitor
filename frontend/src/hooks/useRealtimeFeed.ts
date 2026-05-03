"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { SocialPost } from "@/types/social-post";

export function useRealtimeFeed(initialData: SocialPost[] = []) {
  const [posts, setPosts] = useState<SocialPost[]>(initialData);

  useEffect(() => {
    setPosts(initialData);
  }, [initialData]);

  useEffect(() => {
    const channel = getSupabase()
      .channel("feed-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "social_posts" },
        (payload) => {
          const newPost = payload.new as SocialPost;
          setPosts((prev) => [newPost, ...prev].slice(0, 200));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "social_posts" },
        (payload) => {
          const updated = payload.new as SocialPost;
          setPosts((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
        }
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(channel);
    };
  }, []);

  return posts;
}
