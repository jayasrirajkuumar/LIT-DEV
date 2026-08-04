import { USER_API_BASE as API_BASE } from "../config/apiBase.js";

function getIdToken() {
  return localStorage.getItem("id_token");
}

function buildHeaders(json = true) {
  const token = getIdToken();
  if (!token) throw new Error("Authentication required.");
  const headers = { Accept: "application/json", Authorization: `Bearer ${token}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error?.message || `Request failed (${response.status})`);
  }
  return payload?.data ?? payload;
}

export async function fetchWallet() {
  return apiFetch("/wallet", { headers: buildHeaders(false) });
}

export async function fetchWalletHistory(page = 1) {
  return apiFetch(`/wallet/history?page=${page}`, { headers: buildHeaders(false) });
}

export async function searchLitUsers(query) {
  return apiFetch(`/users/search?q=${encodeURIComponent(query)}`, { headers: buildHeaders(false) });
}

export async function fetchPaymentConfig() {
  return apiFetch("/payments/config", { headers: buildHeaders(false) });
}

export async function createPaymentOrder(amount, purpose = "gift_card") {
  return apiFetch("/payments/create-order", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ amount, purpose }),
  });
}

export async function verifyPayment(body) {
  return apiFetch("/payments/verify", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
}

export async function purchaseInternalGiftCard(body) {
  return apiFetch("/gift-cards/purchase", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
}

export async function claimGiftCard(giftCardId) {
  return apiFetch("/gift-cards/claim", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ giftCardId }),
  });
}

export async function declineGiftCard(giftCardId) {
  return apiFetch("/gift-cards/decline", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ giftCardId }),
  });
}

export async function fetchSentGiftCards() {
  return apiFetch("/gift-cards/my-sent", { headers: buildHeaders(false) });
}

export async function fetchReceivedGiftCards() {
  return apiFetch("/gift-cards/my-received", { headers: buildHeaders(false) });
}

export async function fetchGiftCardDetail(id) {
  return apiFetch(`/gift-cards/received/${id}`, { headers: buildHeaders(false) });
}

export async function fetchNotifications() {
  return apiFetch("/notifications", { headers: buildHeaders(false) });
}

export async function fetchNotificationCount() {
  return apiFetch("/notifications/unread-count", { headers: buildHeaders(false) });
}

export async function markNotificationRead(id) {
  return apiFetch(`/notifications/${id}/read`, {
    method: "PUT",
    headers: buildHeaders(false),
  });
}

export async function markAllNotificationsRead() {
  return apiFetch("/notifications/read-all", {
    method: "PUT",
    headers: buildHeaders(false),
  });
}

export async function deleteNotification(id) {
  return apiFetch(`/notifications/${id}`, {
    method: "DELETE",
    headers: buildHeaders(false),
  });
}

export default {
  fetchWallet,
  fetchWalletHistory,
  searchLitUsers,
  fetchPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  purchaseInternalGiftCard,
  claimGiftCard,
  declineGiftCard,
  fetchSentGiftCards,
  fetchReceivedGiftCards,
  fetchGiftCardDetail,
  fetchNotifications,
  fetchNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};
