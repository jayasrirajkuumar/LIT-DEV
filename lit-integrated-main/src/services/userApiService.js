/**
 * LIT User Management API — Phase 2
 * React service functions for profile and address endpoints.
 * Uses the Azure ID token stored after sign-in.
 */

import { logPersistence, logPersistenceError } from "../utils/persistenceLogger";
import { USER_API_BASE } from "../config/apiBase.js";

function getIdToken() {
  return localStorage.getItem("id_token");
}

function buildAuthHeaders(extraHeaders = {}) {
  const token = getIdToken();

  if (!token) {
    throw new Error("Authentication token is missing. Please sign in again.");
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
}

async function parseApiResponse(response, scope) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      (response.status >= 500
        ? "Server is temporarily unavailable. Restart the backend and try again."
        : `Request failed with status ${response.status}`);
    logPersistenceError(scope, message, { status: response.status, code: payload?.error?.code });
    const error = new Error(message);
    error.code = payload?.error?.code;
    error.status = response.status;
    error.details = payload?.error?.details;
    throw error;
  }

  logPersistence(scope, "response ok", { status: response.status });
  return payload?.data ?? payload;
}

async function apiFetch(path, options, scope) {
  let response;
  try {
    response = await fetch(`${USER_API_BASE}${path}`, options);
  } catch {
    const error = new Error("Unable to reach the server. Ensure the backend is running on port 3001.");
    error.code = "NETWORK_ERROR";
    error.status = 503;
    logPersistenceError(scope, error.message);
    throw error;
  }
  return parseApiResponse(response, scope);
}

/**
 * GET /api/users/me
 */
export async function getProfile() {
  logPersistence("profile", "GET /users/me");
  const data = await apiFetch("/users/me", {
    method: "GET",
    headers: buildAuthHeaders(),
  }, "profile");
  return data.user;
}

export async function updateProfile(profile) {
  logPersistence("profile", "PATCH /users/me", profile);
  const data = await apiFetch("/users/me", {
    method: "PATCH",
    headers: buildAuthHeaders(),
    body: JSON.stringify(profile),
  }, "profile");
  return data.user;
}

export async function getAddresses() {
  logPersistence("addresses", "GET /addresses");
  const response = await fetch(`${USER_API_BASE}/addresses`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  const data = await parseApiResponse(response, "addresses");
  return data.addresses;
}

/**
 * GET /api/addresses/:id
 */
export async function getAddressById(addressId) {
  const response = await fetch(`${USER_API_BASE}/addresses/${addressId}`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  const data = await parseApiResponse(response, "addresses");
  return data.address;
}

export async function createAddress(address) {
  logPersistence("addresses", "POST /addresses", address);
  const response = await fetch(`${USER_API_BASE}/addresses`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(address),
  });

  const data = await parseApiResponse(response, "addresses");
  return data.address;
}

export async function updateAddress(addressId, updates) {
  logPersistence("addresses", `PATCH /addresses/${addressId}`, updates);
  const response = await fetch(`${USER_API_BASE}/addresses/${addressId}`, {
    method: "PATCH",
    headers: buildAuthHeaders(),
    body: JSON.stringify(updates),
  });

  const data = await parseApiResponse(response, "addresses");
  return data.address;
}

export async function deleteAddress(addressId) {
  logPersistence("addresses", `DELETE /addresses/${addressId}`);
  const response = await fetch(`${USER_API_BASE}/addresses/${addressId}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  const data = await parseApiResponse(response, "addresses");
  return data.address;
}

export default {
  getProfile,
  updateProfile,
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
