import { USER_API_BASE as API_BASE } from "../config/apiBase.js";
import { FALLBACK_MARKETPLACE_CONFIG, isCatalogDegradedError } from "../constants/marketplaceFallbackConfig.js";

async function marketplaceFetch(url, { allowDegraded = false } = {}) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    if (allowDegraded) return { data: FALLBACK_MARKETPLACE_CONFIG, degraded: true };
    throw new Error("Unable to reach the marketplace API. Check your connection and try again.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (allowDegraded && (response.status === 503 || response.status >= 500)) {
      return { data: FALLBACK_MARKETPLACE_CONFIG, degraded: true };
    }
    throw new Error(
      payload?.error?.message ||
        (response.status >= 500
          ? "Our servers are temporarily unavailable. Please try again."
          : "Failed to load marketplace config."),
    );
  }
  return { data: payload?.data ?? payload, degraded: false };
}

export async function fetchMarketplaceConfig() {
  const { data, degraded } = await marketplaceFetch(`${API_BASE}/marketplace/config`, {
    allowDegraded: true,
  });
  return { ...data, degraded };
}

function getAuthHeaders() {
  const token = localStorage.getItem("id_token");
  if (!token) throw new Error("Authentication required.");
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchUserCoupons() {
  const response = await fetch(`${API_BASE}/users/me/coupons`, {
    headers: getAuthHeaders(),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || "Failed to load coupons.");
  return payload?.data?.coupons ?? payload?.coupons ?? [];
}

export default { fetchMarketplaceConfig, fetchUserCoupons };
