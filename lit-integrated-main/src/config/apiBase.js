/**
 * Marketplace / user API base URL.
 *
 * Development: defaults to `/api`, proxied by Vite to http://localhost:3001
 * Production: set VITE_USER_API_BASE_URL or falls back to deployed API (production builds only)
 */
/** Production fallback — overridden in dev by `/api` (Vite proxy → localhost:3001) */
const DEPLOYED_USER_API_BASE =
  "https://lit-backend-azajexa8e2a9g4az.canadacentral-01.azurewebsites.net/api";

export const USER_API_BASE =
  import.meta.env.VITE_USER_API_BASE_URL ||
  (import.meta.env.DEV ? "/api" : DEPLOYED_USER_API_BASE);

export default USER_API_BASE;
