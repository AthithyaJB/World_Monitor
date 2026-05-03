"use client";

import useSWR from "swr";
import { API_URL } from "@/lib/constants";

const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  } catch {
    clearTimeout(timeout);
    throw new Error("Backend unavailable");
  }
};

export function useTrendQuery<T = any>(
  endpoint: string,
  refreshInterval: number = 60000
) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    `${API_URL}${endpoint}`,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      errorRetryCount: 1,
      errorRetryInterval: 10000,
      shouldRetryOnError: false,
    }
  );

  return { data, error, isLoading, mutate };
}
