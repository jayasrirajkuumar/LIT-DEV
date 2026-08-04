import { USER_API_BASE as API_BASE } from "../config/apiBase.js";

function getIdToken() {
  return localStorage.getItem("id_token");
}

function buildHeaders() {
  const token = getIdToken();
  if (!token) throw new Error("Authentication required.");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      payload?.error?.message || payload?.message || `Request failed (${response.status})`,
    );
  }
  return payload?.data ?? payload;
}

export async function fetchOrders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);

  const qs = params.toString();
  const response = await fetch(`${API_BASE}/orders${qs ? `?${qs}` : ""}`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response);
  return data.orders ?? [];
}

export async function fetchOrderById(orderId) {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response);
  return data.order;
}

export async function cancelOrder(orderId, payload = {}) {
  const body =
    typeof payload === "string"
      ? { reason: payload }
      : payload;

  const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  const data = await parseApiResponse(response);
  return data.order;
}

export async function reorderItems(orderId) {
  const response = await fetch(`${API_BASE}/orders/${orderId}/reorder`, {
    method: "POST",
    headers: buildHeaders(),
  });
  return parseApiResponse(response);
}

export async function fetchAdminOrders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);

  const qs = params.toString();
  const response = await fetch(`${API_BASE}/admin/orders${qs ? `?${qs}` : ""}`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response);
  return data.orders ?? [];
}

export async function fetchAdminOrderById(orderId) {
  const response = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response);
  return data.order;
}

export async function fetchAdminOrderStats() {
  const response = await fetch(`${API_BASE}/admin/orders/stats`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response);
  return data.stats ?? {};
}

export async function updateAdminOrderStatus(orderId, payload) {
  const response = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response);
  return data.order;
}

export async function updateAdminOrderTracking(orderId, trackingNumber) {
  const response = await fetch(`${API_BASE}/admin/orders/${orderId}/tracking`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({ trackingNumber }),
  });
  const data = await parseApiResponse(response);
  return data.order;
}

export async function updateAdminOrderNotes(orderId, adminNotes) {
  const response = await fetch(`${API_BASE}/admin/orders/${orderId}/notes`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({ adminNotes }),
  });
  const data = await parseApiResponse(response);
  return data.order;
}

export async function exportAdminOrders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);

  const qs = params.toString();
  const response = await fetch(`${API_BASE}/admin/orders/export${qs ? `?${qs}` : ""}`, {
    headers: buildHeaders(),
  });
  if (!response.ok) throw new Error("Failed to export orders.");
  return response.text();
}

export default {
  fetchOrders,
  fetchOrderById,
  cancelOrder,
  reorderItems,
  fetchAdminOrders,
  fetchAdminOrderById,
  fetchAdminOrderStats,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
  updateAdminOrderNotes,
  exportAdminOrders,
};
