"use client";

import { useCallback, useEffect, useState } from "react";

export type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: boolean;
  refetch: () => void;
};

export function useFetch<T>(fetcher: () => Promise<T>): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      console.error("useFetch error:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}