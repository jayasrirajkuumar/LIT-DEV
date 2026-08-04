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

export async function fetchCheckoutPreview(params = {}) {
  const query = new URLSearchParams();
  if (params.deliveryMethod) query.set("deliveryMethod", params.deliveryMethod);
  if (params.addressId) query.set("addressId", params.addressId);
  if (params.couponCode) query.set("couponCode", params.couponCode);
  if (params.checkoutMode) query.set("checkoutMode", params.checkoutMode);
  if (params.productId) query.set("productId", params.productId);
  if (params.quantity) query.set("quantity", String(params.quantity));

  const qs = query.toString();
  const response = await fetch(`${API_BASE}/checkout${qs ? `?${qs}` : ""}`, {
    headers: buildHeaders(),
  });
  return parseApiResponse(response);
}

export async function previewCheckout(payload) {
  const response = await fetch(`${API_BASE}/checkout`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response);
}

export async function placeOrder(payload) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response);
  return data.order;
}

export default { fetchCheckoutPreview, previewCheckout, placeOrder };
