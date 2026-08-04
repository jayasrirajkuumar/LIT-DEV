/**
 * LIT Catalog API — React service functions (Phase 3)
 * Public endpoints require no auth. Admin endpoints require Azure token + ADMIN role.
 */

import { USER_API_BASE } from "../config/apiBase.js";
import { EMPTY_PRODUCT_LIST, isCatalogDegradedError } from "../constants/marketplaceFallbackConfig.js";

function getIdToken() {
  return localStorage.getItem("id_token");
}

function buildHeaders(requireAuth = false) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = getIdToken();
    if (!token) {
      throw new Error("Authentication token is missing. Please sign in again.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const status = response.status;
    const message =
      payload?.error?.message ||
      payload?.message ||
      (status >= 500
        ? "Our servers are temporarily unavailable. Please try again."
        : status === 404
          ? "The requested item was not found."
          : `Request failed (${status})`);
    const error = new Error(message);
    error.code = payload?.error?.code;
    error.status = status;
    throw error;
  }

  return payload?.data ?? payload;
}

async function catalogFetch(url, options = {}, { allowDegraded = false } = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    if (allowDegraded) return { ...EMPTY_PRODUCT_LIST, degraded: true };
    const error = new Error(
      "Unable to reach the marketplace API. Check your connection and try again.",
    );
    error.code = "network_error";
    throw error;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (allowDegraded && (response.status === 503 || response.status >= 500)) {
      return { ...EMPTY_PRODUCT_LIST, degraded: true };
    }
    const status = response.status;
    const message =
      payload?.error?.message ||
      payload?.message ||
      (status >= 500
        ? "Our servers are temporarily unavailable. Please try again."
        : status === 404
          ? "The requested item was not found."
          : `Request failed (${status})`);
    const error = new Error(message);
    error.code = payload?.error?.code;
    error.status = status;
    throw error;
  }

  const data = payload?.data ?? payload;
  return allowDegraded ? { ...data, degraded: false } : data;
}

async function withCatalogFallback(fetcher, emptyValue = EMPTY_PRODUCT_LIST) {
  try {
    return await fetcher();
  } catch (error) {
    if (isCatalogDegradedError(error)) {
      if (Array.isArray(emptyValue) || emptyValue === null) return emptyValue;
      return { ...emptyValue, degraded: true };
    }
    throw error;
  }
}

// ─── Categories (public) ───────────────────────────────────────────────────

export async function getCategories() {
  return withCatalogFallback(async () => {
    const data = await catalogFetch(`${USER_API_BASE}/categories`, {
      headers: buildHeaders(),
    });
    return data.categories ?? [];
  }, []);
}

export async function getCategoryBySlug(slug) {
  return withCatalogFallback(async () => {
    const data = await catalogFetch(`${USER_API_BASE}/categories/${slug}`, {
      headers: buildHeaders(),
    });
    return data.category ?? null;
  }, null);
}

// ─── Products (public) ─────────────────────────────────────────────────────

export async function getProducts(params = {}) {
  return withCatalogFallback(() =>
    catalogFetch(`${USER_API_BASE}/products${buildQuery(params)}`, {
      headers: buildHeaders(),
    }),
  );
}

export async function getProductBySlug(slug) {
  const data = await catalogFetch(`${USER_API_BASE}/products/${slug}`, {
    headers: buildHeaders(),
  });
  return data.product;
}

export async function getProductsByCategory(slug, params = {}) {
  return withCatalogFallback(() =>
    catalogFetch(
      `${USER_API_BASE}/products/category/${slug}${buildQuery(params)}`,
      { headers: buildHeaders() },
    ),
  );
}

export async function searchProducts(params = {}) {
  return withCatalogFallback(() =>
    catalogFetch(`${USER_API_BASE}/products/search${buildQuery(params)}`, {
      headers: buildHeaders(),
    }),
  );
}

export async function getFeaturedProducts(limit = 12) {
  return withCatalogFallback(() =>
    catalogFetch(
      `${USER_API_BASE}/products/featured${buildQuery({ limit })}`,
      { headers: buildHeaders() },
    ),
  );
}

export async function getNewArrivalProducts(limit = 12) {
  return withCatalogFallback(() =>
    catalogFetch(
      `${USER_API_BASE}/products/new-arrivals${buildQuery({ limit })}`,
      { headers: buildHeaders() },
    ),
  );
}

// ─── Admin (protected) ───────────────────────────────────────────────────

export async function createCategory(category) {
  const response = await fetch(`${USER_API_BASE}/admin/categories`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(category),
  });
  const data = await parseApiResponse(response);
  return data.category;
}

export async function updateCategory(categoryId, updates) {
  const response = await fetch(`${USER_API_BASE}/admin/categories/${categoryId}`, {
    method: "PATCH",
    headers: buildHeaders(true),
    body: JSON.stringify(updates),
  });
  const data = await parseApiResponse(response);
  return data.category;
}

export async function deleteCategory(categoryId) {
  const response = await fetch(`${USER_API_BASE}/admin/categories/${categoryId}`, {
    method: "DELETE",
    headers: buildHeaders(true),
  });
  const data = await parseApiResponse(response);
  return data.category;
}

export async function createProduct(product) {
  const response = await fetch(`${USER_API_BASE}/admin/products`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(product),
  });
  const data = await parseApiResponse(response);
  return data.product;
}

export async function updateProduct(productId, updates) {
  const response = await fetch(`${USER_API_BASE}/admin/products/${productId}`, {
    method: "PATCH",
    headers: buildHeaders(true),
    body: JSON.stringify(updates),
  });
  const data = await parseApiResponse(response);
  return data.product;
}

export async function deleteProduct(productId) {
  const response = await fetch(`${USER_API_BASE}/admin/products/${productId}`, {
    method: "DELETE",
    headers: buildHeaders(true),
  });
  const data = await parseApiResponse(response);
  return data.product;
}

export default {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getProductBySlug,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  getNewArrivalProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
};
