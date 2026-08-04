import { useCallback, useEffect, useState } from "react";

const cache = new Map();
const DEFAULT_STALE_MS = 60_000;

export function clearCatalogCache(prefix) {
  if (!prefix) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export function useCatalogQuery(key, fetcher, options = {}) {
  const { staleMs = DEFAULT_STALE_MS, enabled = true } = options;
  const [refetchToken, setRefetchToken] = useState(0);
  const [state, setState] = useState({
    data: null,
    loading: Boolean(enabled),
    error: null,
  });

  const refetch = useCallback(() => {
    cache.delete(key);
    setRefetchToken((value) => value + 1);
  }, [key]);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }

    let cancelled = false;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < staleMs) {
      setState({ data: cached.data, loading: false, error: null });
      return undefined;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcher()
      .then((data) => {
        if (cancelled) return;
        cache.set(key, { data, timestamp: Date.now() });
        setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [key, enabled, staleMs, refetchToken]);

  return { ...state, refetch };
}

export default useCatalogQuery;
