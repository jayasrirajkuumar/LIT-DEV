import { USER_API_BASE as API_BASE } from "../config/apiBase.js";
import {
  FALLBACK_GIFT_CARD_CONFIG,
  calculateGiftCardPricing,
} from "../constants/giftCardFallbackConfig.js";

function getIdToken() {
  return localStorage.getItem("id_token");
}

function buildHeaders(json = true) {
  const token = getIdToken();
  if (!token) throw new Error("Authentication required.");
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

export function isGiftCardNetworkError(error) {
  const message = String(error?.message ?? "");
  return (
    error?.code === "NETWORK_ERROR" ||
    error?.name === "TypeError" ||
    message.includes("Failed to fetch") ||
    message.includes("NetworkError") ||
    message.includes("ERR_EMPTY_RESPONSE")
  );
}

function networkError() {
  const err = new Error(
    "Unable to reach the server. Start the backend (npm run dev in backend/) and ensure the database is connected.",
  );
  err.code = "NETWORK_ERROR";
  return err;
}

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fallback =
      response.status === 503
        ? "Database unavailable. Ensure VPN/network access to Azure PostgreSQL is active, restart the backend, and try again."
        : response.status === 504
          ? "Purchase timed out. Check your network/VPN to Azure PostgreSQL, restart the backend, and try again."
          : response.status >= 500
            ? "Server error during purchase. Restart the backend (npm run dev in backend/) and try again."
            : `Request failed (${response.status})`;
    throw new Error(payload?.error?.message || payload?.message || fallback);
  }
  return payload?.data ?? payload;
}

async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeoutMs = path.includes("/purchase") ? 45_000 : 20_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      const err = new Error("Request timed out. The server may be busy — restart the backend and try again.");
      err.code = "NETWORK_ERROR";
      throw err;
    }
    const err = new Error(
      "Unable to reach the server. Ensure the backend is running on port 3001 and the database is connected.",
    );
    err.code = "NETWORK_ERROR";
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
  return parseApiResponse(response);
}

export async function fetchGiftCardConfig() {
  try {
    const data = await apiFetch("/gift-cards/config");
    return { config: data.config ?? data, fromFallback: false };
  } catch (error) {
    if (isGiftCardNetworkError(error)) {
      return { config: FALLBACK_GIFT_CARD_CONFIG, fromFallback: true };
    }
    if (error.message?.includes("Database unavailable") || error.message?.includes("503") || error.message?.includes("temporarily unavailable")) {
      return { config: FALLBACK_GIFT_CARD_CONFIG, fromFallback: true, databaseOffline: true };
    }
    throw error;
  }
}

export async function previewGiftCardPurchase(body) {
  return apiFetch("/gift-cards/preview", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
}

export function previewGiftCardPurchaseLocal(body, config = FALLBACK_GIFT_CARD_CONFIG) {
  const amount = Number(body.amount);
  if (amount < config.minAmount || amount > config.maxAmount) {
    throw new Error(`Amount must be between ₹${config.minAmount} and ₹${config.maxAmount}.`);
  }
  return { pricing: calculateGiftCardPricing(amount, config), config };
}

export async function createGiftCard(body) {
  return apiFetch("/gift-cards/create", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
}

export async function payGiftCard(giftCardId, paymentProvider = "MOCK") {
  return apiFetch("/gift-cards/pay", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ giftCardId, paymentProvider }),
  });
}

export async function purchaseGiftCard(body, paymentProvider = "MOCK") {
  return apiFetch("/gift-cards/purchase", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ ...body, paymentProvider }),
  });
}

export async function redeemGiftCard(body) {
  return apiFetch("/gift-cards/redeem", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
}

export async function fetchMyGiftCards() {
  return apiFetch("/gift-cards/my", {
    headers: buildHeaders(false),
  });
}

export async function fetchAdminGiftCards(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", filters.page);
  const qs = params.toString();
  return apiFetch(`/admin/gift-cards${qs ? `?${qs}` : ""}`, {
    headers: buildHeaders(false),
  });
}

export async function fetchAdminGiftCardAnalytics() {
  return apiFetch("/admin/gift-cards/analytics", {
    headers: buildHeaders(false),
  });
}

export default {
  fetchGiftCardConfig,
  previewGiftCardPurchase,
  previewGiftCardPurchaseLocal,
  createGiftCard,
  payGiftCard,
  purchaseGiftCard,
  redeemGiftCard,
  fetchMyGiftCards,
  fetchAdminGiftCards,
  fetchAdminGiftCardAnalytics,
  isGiftCardNetworkError,
};
