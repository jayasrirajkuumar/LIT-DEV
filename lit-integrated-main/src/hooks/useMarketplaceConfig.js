import { useEffect, useState } from "react";
import { fetchMarketplaceConfig } from "../services/marketplaceApiService";
import { normalizeSortKey } from "../utils/catalogSort";

let cachedConfig = null;
let inflight = null;

function useMarketplaceConfig() {
  const [config, setConfig] = useState(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedConfig) return;

    if (!inflight) {
      inflight = fetchMarketplaceConfig()
        .then((data) => {
          cachedConfig = data;
          return data;
        })
        .finally(() => {
          inflight = null;
        });
    }

    inflight
      .then((data) => {
        setConfig(data);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return {
    config,
    sortOptions: (config?.sortOptions ?? []).map((option) => ({
      ...option,
      key: normalizeSortKey(option.key),
    })),
    filterOptions: config?.filterOptions ?? [],
    loading,
    error,
  };
}

export { useMarketplaceConfig };
export default useMarketplaceConfig;
