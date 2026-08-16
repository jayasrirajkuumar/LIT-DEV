import { logPersistence, logPersistenceError } from "../utils/persistenceLogger";
import { USER_API_BASE as ADMIN_API_BASE } from "../config/apiBase.js";

function getIdToken() {
  return localStorage.getItem("id_token");
}

function buildHeaders(contentType = "application/json") {
  const token = getIdToken();
  if (!token) {
    throw new Error("Authentication required.");
  }

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
}

async function parseApiResponse(response, scope, label) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message =
      payload?.error?.message ||
      payload?.message ||
      `Request failed with status ${response.status}`;

    const fieldErrors = payload?.error?.details?.fieldErrors;
    if (fieldErrors && typeof fieldErrors === "object") {
      const detailMessages = Object.entries(fieldErrors).flatMap(([field, errors]) =>
        (Array.isArray(errors) ? errors : []).map((entry) => `${field}: ${entry}`),
      );
      if (detailMessages.length > 0) {
        message = detailMessages.join(" ");
      }
    }

    logPersistenceError(scope, `${label} failed`, { status: response.status, message });
    throw new Error(message);
  }

  logPersistence(scope, `${label} ok`, { status: response.status });
  return payload?.data ?? payload;
}

function buildQueryParams(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export async function fetchDashboardStats() {
  logPersistence("admin", "GET /admin/dashboard");
  const response = await fetch(`${ADMIN_API_BASE}/admin/dashboard`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", "GET /admin/dashboard");
}

export async function fetchAdminProducts(filters = {}) {
  const query = buildQueryParams(filters);
  const label = `/admin/products${query ? `?${query}` : ""}`;
  logPersistence("admin", `GET ${label}`);
  const response = await fetch(`${ADMIN_API_BASE}/admin/products${query ? `?${query}` : ""}`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", `GET ${label}`);
}

export async function fetchAdminProductById(productId) {
  logPersistence("admin", `GET /admin/products/${productId}`);
  const response = await fetch(`${ADMIN_API_BASE}/admin/products/${productId}`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "admin", `GET /admin/products/${productId}`);
  return data.product ?? data;
}

export async function fetchAdminCategories(filters = {}) {
  const query = buildQueryParams(filters);
  const label = `/admin/categories${query ? `?${query}` : ""}`;
  logPersistence("admin", `GET ${label}`);
  const response = await fetch(`${ADMIN_API_BASE}/admin/categories${query ? `?${query}` : ""}`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "admin", `GET ${label}`);
  if (Array.isArray(data)) return data;
  return data.categories ?? [];
}

export async function fetchAdminCustomers(filters = {}) {
  const query = buildQueryParams(filters);
  const label = `/admin/customers${query ? `?${query}` : ""}`;
  logPersistence("admin", `GET ${label}`);
  const response = await fetch(`${ADMIN_API_BASE}/admin/customers${query ? `?${query}` : ""}`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "admin", `GET ${label}`);
  if (Array.isArray(data)) return data;
  return data.customers ?? [];
}

export async function fetchAdminCustomerById(customerId) {
  logPersistence("admin", `GET /admin/customers/${customerId}`);
  const response = await fetch(`${ADMIN_API_BASE}/admin/customers/${customerId}`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", `GET /admin/customers/${customerId}`);
}

export async function updateAdminCustomerStatus(customerId, isActive) {
  logPersistence("admin", `PATCH /admin/customers/${customerId}`, { isActive });
  const response = await fetch(`${ADMIN_API_BASE}/admin/customers/${customerId}`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({ isActive }),
  });
  const data = await parseApiResponse(response, "admin", `PATCH /admin/customers/${customerId}`);
  return data.user ?? data;
}

export async function fetchAdminInventory(filters = {}) {
  const query = buildQueryParams(filters);
  const label = `/admin/inventory${query ? `?${query}` : ""}`;
  logPersistence("admin", `GET ${label}`);
  const response = await fetch(`${ADMIN_API_BASE}/admin/inventory${query ? `?${query}` : ""}`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "admin", `GET ${label}`);
  if (Array.isArray(data)) return data;
  return data.inventory ?? [];
}

export async function updateAdminInventory(productId, payload) {
  logPersistence("admin", `PATCH /admin/inventory/${productId}`, payload);
  const response = await fetch(`${ADMIN_API_BASE}/admin/inventory/${productId}`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/inventory/${productId}`);
}

export async function createAdminProduct(payload) {
  logPersistence("admin", "POST /admin/products", payload);
  const response = await fetch(`${ADMIN_API_BASE}/admin/products`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response, "admin", "POST /admin/products");
  return data.product ?? data;
}

export async function updateAdminProduct(productId, payload) {
  logPersistence("admin", `PATCH /admin/products/${productId}`, payload);
  const response = await fetch(`${ADMIN_API_BASE}/admin/products/${productId}`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response, "admin", `PATCH /admin/products/${productId}`);
  return data.product ?? data;
}

export async function deleteAdminProduct(productId) {
  logPersistence("admin", `DELETE /admin/products/${productId}`);
  const response = await fetch(`${ADMIN_API_BASE}/admin/products/${productId}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", `DELETE /admin/products/${productId}`);
}

export async function bulkAdminProducts(payload) {
  logPersistence("admin", "POST /admin/products/bulk", payload);
  const response = await fetch(`${ADMIN_API_BASE}/admin/products/bulk`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", "POST /admin/products/bulk");
}

export async function uploadAdminImage(file, onProgress) {
  const token = getIdToken();
  if (!token) throw new Error("Authentication required.");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("image", file);

    xhr.open("POST", `${ADMIN_API_BASE}/admin/uploads/image`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Accept", "application/json");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(payload.data ?? payload);
          return;
        }
        reject(new Error(payload?.error?.message || "Upload failed."));
      } catch {
        reject(new Error("Upload failed."));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed."));
    xhr.send(formData);
  });
}

export async function deleteAdminImage(url) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/uploads/image`, {
    method: "DELETE",
    headers: buildHeaders(),
    body: JSON.stringify({ url }),
  });
  return parseApiResponse(response, "admin", "DELETE /admin/uploads/image");
}

export async function fetchAuditLogs(params = {}) {
  const query = buildQueryParams(params);
  const response = await fetch(`${ADMIN_API_BASE}/admin/audit-log${query ? `?${query}` : ""}`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", "GET /admin/audit-log");
}

export async function fetchAdminNotifications(params = {}) {
  const query = buildQueryParams(params);
  const response = await fetch(`${ADMIN_API_BASE}/admin/notifications${query ? `?${query}` : ""}`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", "GET /admin/notifications");
}

export async function fetchNotificationCount() {
  const response = await fetch(`${ADMIN_API_BASE}/admin/notifications/count`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", "GET /admin/notifications/count");
}

export async function markNotificationRead(id) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/notifications/${id}/read`, {
    method: "PATCH",
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  const response = await fetch(`${ADMIN_API_BASE}/admin/notifications/read-all`, {
    method: "PATCH",
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", "PATCH /admin/notifications/read-all");
}

export async function deleteAdminNotification(id) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/notifications/${id}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", `DELETE /admin/notifications/${id}`);
}

export async function fetchStoreSettings() {
  const response = await fetch(`${ADMIN_API_BASE}/admin/settings`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "admin", "GET /admin/settings");
  return data.settings ?? data;
}

export async function updateStoreSettings(payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/settings`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response, "admin", "PATCH /admin/settings");
  return data.settings ?? data;
}

export async function fetchAdminSupportRequests(filters = {}) {
  const query = buildQueryParams(filters);
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/requests${query ? `?${query}` : ""}`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", "GET /admin/support/requests");
}

export async function fetchAdminSupportRequestById(id) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/requests/${id}`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "admin", `GET /admin/support/requests/${id}`);
  return data.request ?? data;
}

export async function postAdminSupportReply(id, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/requests/${id}/reply`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `POST /admin/support/requests/${id}/reply`);
}

export async function patchAdminSupportStatus(id, status) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/requests/${id}/status`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({ status }),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/support/requests/${id}/status`);
}

export async function patchAdminSupportAssign(id, assignedToId) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/requests/${id}/assign`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({ assignedToId }),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/support/requests/${id}/assign`);
}

export async function deleteAdminSupportRequest(id) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/requests/${id}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", `DELETE /admin/support/requests/${id}`);
}

export async function fetchAdminSupportAdmins() {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/admins`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "admin", "GET /admin/support/admins");
  return data.admins ?? data;
}

export async function fetchAdminSupportStats() {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/stats`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "admin", "GET /admin/support/stats");
  return data.support ?? data;
}

export async function fetchAdminSupportConversations(filters = {}) {
  const query = buildQueryParams(filters);
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/conversations${query ? `?${query}` : ""}`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", "GET /admin/support/conversations");
}

export async function fetchAdminSupportMessages(conversationId) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/conversations/${conversationId}/messages`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", `GET /admin/support/conversations/${conversationId}/messages`);
}

export async function postAdminSupportMessage(conversationId, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `POST /admin/support/conversations/${conversationId}/messages`);
}

export async function markAdminConversationRead(conversationId) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/conversations/${conversationId}/read`, {
    method: "PATCH",
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/support/conversations/${conversationId}/read`);
}

export async function uploadAdminSupportAttachment(file) {
  const formData = new FormData();
  formData.append("attachment", file);
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/uploads/attachment`, {
    method: "POST",
    headers: buildHeaders(null),
    body: formData,
  });
  return parseApiResponse(response, "admin", "POST /admin/support/uploads/attachment");
}

export async function fetchAdminSupportWorkspace(conversationId) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/conversations/${conversationId}/workspace`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "admin", `GET /admin/support/conversations/${conversationId}/workspace`);
  return data.workspace ?? data;
}

export async function postAdminSupportInternalNote(conversationId, note) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/conversations/${conversationId}/internal-notes`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ note }),
  });
  const data = await parseApiResponse(response, "admin", `POST /admin/support/conversations/${conversationId}/internal-notes`);
  return data.note ?? data;
}

export async function patchAdminSupportPriority(conversationId, priority) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/conversations/${conversationId}/priority`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({ priority }),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/support/conversations/${conversationId}/priority`);
}

export async function postAdminSupportEscalate(conversationId) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/conversations/${conversationId}/escalate`, {
    method: "POST",
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", `POST /admin/support/conversations/${conversationId}/escalate`);
}

export async function patchAdminWorkspaceAssign(conversationId, assignedToId) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/conversations/${conversationId}/workspace-assign`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({ assignedToId }),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/support/conversations/${conversationId}/workspace-assign`);
}

export async function patchAdminWorkspaceStatus(conversationId, status) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/conversations/${conversationId}/workspace-status`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({ status }),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/support/conversations/${conversationId}/workspace-status`);
}

export async function patchAdminWorkspaceShippingAddress(orderId, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/workspace/orders/${orderId}/shipping-address`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/support/workspace/orders/${orderId}/shipping-address`);
}

export async function postAdminWorkspaceCancelOrder(orderId, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/workspace/orders/${orderId}/cancel`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `POST /admin/support/workspace/orders/${orderId}/cancel`);
}

export async function postAdminWorkspaceRefund(orderId, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/workspace/orders/${orderId}/refund`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `POST /admin/support/workspace/orders/${orderId}/refund`);
}

export async function postAdminWorkspaceApproveReturn(orderId, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/workspace/orders/${orderId}/return/approve`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `POST /admin/support/workspace/orders/${orderId}/return/approve`);
}

export async function postAdminWorkspaceRejectReturn(orderId, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/workspace/orders/${orderId}/return/reject`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `POST /admin/support/workspace/orders/${orderId}/return/reject`);
}

export async function postAdminWorkspaceReship(orderId, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/workspace/orders/${orderId}/reship`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `POST /admin/support/workspace/orders/${orderId}/reship`);
}

export async function patchAdminConversationCustomerContact(conversationId, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/conversations/${conversationId}/customer-contact`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response, "admin", `PATCH /admin/support/conversations/${conversationId}/customer-contact`);
  return data.customer ?? data;
}

export async function patchAdminWorkspaceCustomerContact(userId, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/support/workspace/customers/${userId}/contact`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response, "admin", `PATCH /admin/support/workspace/customers/${userId}/contact`);
  return data.customer ?? data;
}

export async function fetchAdminWishlistCollections(filters = {}) {
  const query = buildQueryParams(filters);
  const response = await fetch(`${ADMIN_API_BASE}/admin/wishlists/collections${query ? `?${query}` : ""}`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "admin", "GET /admin/wishlists/collections");
  if (Array.isArray(data)) return { collections: data };
  return data;
}

export async function fetchAdminCarts(filters = {}) {
  const query = buildQueryParams(filters);
  const response = await fetch(`${ADMIN_API_BASE}/admin/carts${query ? `?${query}` : ""}`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", "GET /admin/carts");
}

export async function fetchAdminWishlistItems(filters = {}) {
  const query = buildQueryParams(filters);
  const response = await fetch(`${ADMIN_API_BASE}/admin/wishlist-items${query ? `?${query}` : ""}`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", "GET /admin/wishlist-items");
}

export async function fetchAdminMarketplaceConfig() {
  const response = await fetch(`${ADMIN_API_BASE}/admin/marketplace/config`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", "GET /admin/marketplace/config");
}

export async function patchAdminSortOption(id, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/marketplace/sort-options/${id}`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/marketplace/sort-options/${id}`);
}

export async function patchAdminFilterOption(id, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/marketplace/filter-options/${id}`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/marketplace/filter-options/${id}`);
}

export async function postAdminAnnouncement(payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/marketplace/announcements`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", "POST /admin/marketplace/announcements");
}

export async function patchAdminAnnouncement(id, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/marketplace/announcements/${id}`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/marketplace/announcements/${id}`);
}

export async function deleteAdminAnnouncement(id) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/marketplace/announcements/${id}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", `DELETE /admin/marketplace/announcements/${id}`);
}

export async function postAdminBrand(payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/marketplace/brands`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", "POST /admin/marketplace/brands");
}

export async function patchAdminBrand(id, payload) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/marketplace/brands/${id}`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "admin", `PATCH /admin/marketplace/brands/${id}`);
}

export async function deleteAdminBrand(id) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/marketplace/brands/${id}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  return parseApiResponse(response, "admin", `DELETE /admin/marketplace/brands/${id}`);
}

export async function downloadAdminExport(path, filters = {}, format = "csv") {
  const params = buildQueryParams({ ...filters, format });
  const token = getIdToken();
  if (!token) throw new Error("Authentication required.");

  const response = await fetch(`${ADMIN_API_BASE}${path}${params ? `?${params}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Export failed.");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${path.split("/").filter(Boolean).pop() || "export"}.${format === "xlsx" || format === "excel" ? "xlsx" : "csv"}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export default {
  fetchDashboardStats,
  fetchAdminProducts,
  fetchAdminProductById,
  fetchAdminCategories,
  fetchAdminCustomers,
  fetchAdminCustomerById,
  updateAdminCustomerStatus,
  fetchAdminInventory,
  updateAdminInventory,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  bulkAdminProducts,
  uploadAdminImage,
  deleteAdminImage,
  fetchAuditLogs,
  fetchAdminNotifications,
  fetchNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  fetchStoreSettings,
  updateStoreSettings,
  fetchAdminSupportRequests,
  fetchAdminSupportRequestById,
  postAdminSupportReply,
  patchAdminSupportStatus,
  patchAdminSupportAssign,
  deleteAdminSupportRequest,
  fetchAdminSupportAdmins,
  fetchAdminSupportStats,
  fetchAdminSupportConversations,
  fetchAdminSupportMessages,
  postAdminSupportMessage,
  markAdminConversationRead,
  uploadAdminSupportAttachment,
  fetchAdminWishlistCollections,
  fetchAdminWishlistItems,
  fetchAdminCarts,
  fetchAdminMarketplaceConfig,
  patchAdminSortOption,
  patchAdminFilterOption,
  postAdminAnnouncement,
  patchAdminAnnouncement,
  deleteAdminAnnouncement,
  postAdminBrand,
  patchAdminBrand,
  deleteAdminBrand,
  deleteAdminNotification,
  downloadAdminExport,
};
