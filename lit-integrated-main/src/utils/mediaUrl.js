/**
 * Normalize locally uploaded image URLs for the Vite dev proxy.
 * Converts http://localhost:3001/uploads/... → /uploads/...
 */
export function normalizeMediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("/uploads/")) return trimmed;

  return trimmed.replace(/^https?:\/\/[^/]+(?=\/uploads\/)/i, "");
}
