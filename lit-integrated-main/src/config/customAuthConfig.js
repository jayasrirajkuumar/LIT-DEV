/**
 * MSAL Custom Auth (Native Authentication) configuration.
 *
 * Requires a PUBLIC client app registration in Azure External ID:
 * - Platform: Single-page application
 * - Allow public client flows: Yes
 * - Enable native authentication: Yes
 * - Do NOT configure a client secret for this app ID
 */
import { AUTH_CONFIG, getRedirectUri } from "./authConfig";

function getNativeAuthProxyUrl() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENTRA_NATIVE_PROXY === "false") {
    return undefined;
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/entra-native`;
}

/** @type {import("@azure/msal-browser/custom-auth").CustomAuthConfiguration} */
export const customAuthConfig = {
  customAuth: {
    challengeTypes: ["oob", "redirect"],
    authApiProxyUrl: getNativeAuthProxyUrl(),
  },
  auth: {
    clientId: AUTH_CONFIG.clientId,
    authority: `https://${AUTH_CONFIG.ciamLoginSubdomain}.ciamlogin.com`,
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: getRedirectUri(),
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
  },
};

export default customAuthConfig;
