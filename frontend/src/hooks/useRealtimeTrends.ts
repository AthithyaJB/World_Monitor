"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { TrendMapPoint } from "@/types/trend";

export function useRealtimeTrends(initialData: TrendMapPoint[] = []) {
  const [data, setData] = useState<TrendMapPoint[]>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    const channel = getSupabase()
      .channel("trends-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "trends" },
        (payload) => {
          const newTrend = payload.new as any;
          setData((prev) => {
            const existing = prev.find((p) => p.region === newTrend.region);
            if (existing) {
              return prev.map((p) =>
                p.region === newTrend.region
                  ? {
                      ...p,
                      avg_score: (p.avg_score + newTrend.score) / 2,
                      total_volume: p.total_volume + (newTrend.volume || 0),
                      top_keywords: [
                        newTrend.keyword,
                        ...p.top_keywords.filter((k) => k !== newTrend.keyword),
                      ].slice(0, 5),
                    }
                  : p
              );
            }
            return [
              ...prev,
              {
                region: newTrend.region,
                avg_score: newTrend.score,
                total_volume: newTrend.volume || 0,
                top_keywords: [newTrend.keyword],
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(channel);
    };
  }, []);

  return data;
}
