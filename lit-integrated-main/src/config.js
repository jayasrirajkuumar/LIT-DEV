import { USER_API_BASE } from "./config/apiBase.js";

export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "/api" : "http://localhost:3001/api"),
  USER_API_BASE,
  ENDPOINTS: {
    SUBSCRIBE: "/api/newsletter/subscribe",
    CONFIRM: "/api/newsletter/confirm",
  },
  // Frontend URL for confirmation emails (only needed for deployed environments)
  // FRONTEND_URL: 'https://black-moss-014630a10.6.azurestaticapps.net'
};
