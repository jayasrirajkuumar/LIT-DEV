import { USER_API_BASE as API_BASE } from "../config/apiBase.js";

function getIdToken() {
  return localStorage.getItem("id_token");
}

function buildHeaders(requireAuth = true) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = getIdToken();
    if (!token) throw new Error("Authentication required.");
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "Request failed.");
  }
  return payload?.data ?? payload;
}

export async function submitContactForm(payload) {
  const response = await fetch(`${API_BASE}/support/contact`, {
    method: "POST",
    headers: buildHeaders(false),
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response);
  return {
    request: data.request,
    message: data.message,
  };
}

export async function createSupportRequest(payload) {
  const response = await fetch(`${API_BASE}/support/requests`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response);
  return data.request;
}

export default { submitContactForm, createSupportRequest };
