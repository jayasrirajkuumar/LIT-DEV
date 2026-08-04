import { io } from "socket.io-client";
import { USER_API_BASE as API_BASE } from "../config/apiBase.js";

const SOCKET_URL = import.meta.env.DEV ? window.location.origin : API_BASE.replace(/\/api$/, "");

let socket = null;

function getIdToken() {
  return localStorage.getItem("id_token");
}

function buildHeaders(requireAuth = true, contentType = "application/json") {
  const headers = { Accept: "application/json" };
  if (contentType) headers["Content-Type"] = contentType;
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

export function connectSupportSocket(handlers = {}) {
  const token = getIdToken();
  if (!token) return null;

  if (socket?.connected) {
    Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn));
    return socket;
  }

  socket = io(SOCKET_URL, {
    path: "/socket.io",
    auth: { token },
    transports: ["websocket", "polling"],
  });

  Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn));
  return socket;
}

export function disconnectSupportSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinSupportConversation(conversationId) {
  socket?.emit("support:conversation:join", { conversationId });
}

export function emitSupportTyping(conversationId, isTyping) {
  socket?.emit("support:typing", { conversationId, isTyping });
}

export async function fetchUserConversations() {
  const response = await fetch(`${API_BASE}/support/conversations`, {
    headers: buildHeaders(true),
  });
  const data = await parseApiResponse(response);
  return data.conversations ?? [];
}

export async function createConversation(payload) {
  const response = await fetch(`${API_BASE}/support/conversations`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response);
}

export async function fetchConversationMessages(conversationId) {
  const response = await fetch(`${API_BASE}/support/conversations/${conversationId}/messages`, {
    headers: buildHeaders(true),
  });
  const data = await parseApiResponse(response);
  return data.messages ?? [];
}

export async function sendConversationMessage(conversationId, payload) {
  const response = await fetch(`${API_BASE}/support/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response);
}

export async function markConversationRead(conversationId) {
  const response = await fetch(`${API_BASE}/support/conversations/${conversationId}/read`, {
    method: "PATCH",
    headers: buildHeaders(true),
  });
  return parseApiResponse(response);
}

export async function uploadSupportAttachment(file, { admin = false } = {}) {
  const formData = new FormData();
  formData.append("attachment", file);
  const base = admin ? `${API_BASE}/admin` : API_BASE;
  const path = admin ? "/support/uploads/attachment" : "/support/uploads/attachment";
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: buildHeaders(true, null),
    body: formData,
  });
  return parseApiResponse(response);
}

export default {
  connectSupportSocket,
  disconnectSupportSocket,
  joinSupportConversation,
  emitSupportTyping,
  fetchUserConversations,
  createConversation,
  fetchConversationMessages,
  sendConversationMessage,
  markConversationRead,
  uploadSupportAttachment,
};
