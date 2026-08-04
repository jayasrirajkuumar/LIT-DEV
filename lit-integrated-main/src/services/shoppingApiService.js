/**
 * Shopping API — Cart & Wishlist (Phase 4)
 */

import { logPersistence, logPersistenceError } from "../utils/persistenceLogger";
import { USER_API_BASE } from "../config/apiBase.js";

function getIdToken() {
  return localStorage.getItem("id_token");
}

function buildHeaders() {
  const token = getIdToken();
  if (!token) {
    throw new Error("Authentication required.");
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseApiResponse(response, scope, label) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      `Request failed with status ${response.status}`;
    logPersistenceError(scope, `${label} failed`, { status: response.status, message });
    const error = new Error(message);
    error.code = payload?.error?.code;
    error.status = response.status;
    throw error;
  }

  logPersistence(scope, `${label} ok`, { status: response.status });
  return payload?.data ?? payload;
}

export async function fetchCart() {
  logPersistence("cart", "GET /cart");
  const response = await fetch(`${USER_API_BASE}/cart`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "cart", "GET /cart");
  return data.cart;
}

export async function fetchCartCount() {
  logPersistence("cart", "GET /cart/count");
  const response = await fetch(`${USER_API_BASE}/cart/count`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "cart", "GET /cart/count");
  return data.count;
}

export async function addCartItem(productId, quantity = 1) {
  logPersistence("cart", "POST /cart/items", { productId, quantity });
  const response = await fetch(`${USER_API_BASE}/cart/items`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  const data = await parseApiResponse(response, "cart", "POST /cart/items");
  return data.cart;
}

export async function updateCartItem(productId, quantity) {
  logPersistence("cart", `PATCH /cart/items/${productId}`, { quantity });
  const response = await fetch(`${USER_API_BASE}/cart/items/${productId}`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({ quantity }),
  });
  const data = await parseApiResponse(response, "cart", `PATCH /cart/items/${productId}`);
  return data.cart;
}

export async function removeCartItem(productId) {
  logPersistence("cart", `DELETE /cart/items/${productId}`);
  const response = await fetch(`${USER_API_BASE}/cart/items/${productId}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "cart", `DELETE /cart/items/${productId}`);
  return data.cart;
}

export async function moveWishlistToCart(productId, quantity = 1) {
  logPersistence("cart", `POST /cart/move-from-wishlist/${productId}`, { quantity });
  const response = await fetch(`${USER_API_BASE}/cart/move-from-wishlist/${productId}`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ quantity }),
  });
  const data = await parseApiResponse(response, "cart", `POST /cart/move-from-wishlist/${productId}`);
  return data.cart;
}

export async function moveCartToWishlist(productId) {
  logPersistence("cart", `POST /cart/move-to-wishlist/${productId}`);
  const response = await fetch(`${USER_API_BASE}/cart/move-to-wishlist/${productId}`, {
    method: "POST",
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "cart", `POST /cart/move-to-wishlist/${productId}`);
  return data.cart;
}

export async function fetchWishlist() {
  logPersistence("wishlist", "GET /wishlist");
  const response = await fetch(`${USER_API_BASE}/wishlist`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "wishlist", "GET /wishlist");
  return data.wishlist;
}

export async function fetchWishlistCount() {
  logPersistence("wishlist", "GET /wishlist/count");
  const response = await fetch(`${USER_API_BASE}/wishlist/count`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "wishlist", "GET /wishlist/count");
  return data.count;
}

export async function toggleWishlistItem(productId, collectionId = null) {
  logPersistence("wishlist", `POST /wishlist/items/${productId}/toggle`);
  const response = await fetch(`${USER_API_BASE}/wishlist/items/${productId}/toggle`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(collectionId ? { collectionId } : {}),
  });
  return parseApiResponse(response, "wishlist", `POST /wishlist/items/${productId}/toggle`);
}

export async function fetchWishlistCollections() {
  const response = await fetch(`${USER_API_BASE}/wishlist/collections`, {
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "wishlist", "GET /wishlist/collections");
  return data.collections ?? [];
}

export async function createWishlistCollection(name) {
  const response = await fetch(`${USER_API_BASE}/wishlist/collections`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ name }),
  });
  const data = await parseApiResponse(response, "wishlist", "POST /wishlist/collections");
  return data.wishlist;
}

export async function addWishlistToCollection(productId, collectionId) {
  const response = await fetch(`${USER_API_BASE}/wishlist/items/${productId}`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ collectionId }),
  });
  const data = await parseApiResponse(response, "wishlist", `POST /wishlist/items/${productId}`);
  return data.wishlist;
}

export async function moveWishlistItemCollection(productId, targetCollectionId) {
  const response = await fetch(`${USER_API_BASE}/wishlist/items/${productId}/move`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ targetCollectionId }),
  });
  const data = await parseApiResponse(response, "wishlist", `POST /wishlist/items/${productId}/move`);
  return data.wishlist;
}

export async function copyWishlistItemCollection(productId, targetCollectionId) {
  const response = await fetch(`${USER_API_BASE}/wishlist/items/${productId}/copy`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ targetCollectionId }),
  });
  const data = await parseApiResponse(response, "wishlist", `POST /wishlist/items/${productId}/copy`);
  return data.wishlist;
}

export async function updateWishlistCollection(collectionId, payload) {
  const response = await fetch(`${USER_API_BASE}/wishlist/collections/${collectionId}`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response, "wishlist", `PATCH /wishlist/collections/${collectionId}`);
  return data.wishlist;
}

export async function deleteWishlistCollection(collectionId) {
  const response = await fetch(`${USER_API_BASE}/wishlist/collections/${collectionId}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "wishlist", `DELETE /wishlist/collections/${collectionId}`);
  return data.wishlist;
}

export async function setDefaultWishlistCollection(collectionId) {
  const response = await fetch(`${USER_API_BASE}/wishlist/collections/${collectionId}/default`, {
    method: "PATCH",
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "wishlist", `PATCH /wishlist/collections/${collectionId}/default`);
  return data.wishlist;
}

export async function removeWishlistItem(productId) {
  logPersistence("wishlist", `DELETE /wishlist/items/${productId}`);
  const response = await fetch(`${USER_API_BASE}/wishlist/items/${productId}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  const data = await parseApiResponse(response, "wishlist", `DELETE /wishlist/items/${productId}`);
  return data.wishlist;
}

export default {
  fetchCart,
  fetchCartCount,
  addCartItem,
  updateCartItem,
  removeCartItem,
  moveWishlistToCart,
  moveCartToWishlist,
  fetchWishlist,
  fetchWishlistCount,
  toggleWishlistItem,
  removeWishlistItem,
};
