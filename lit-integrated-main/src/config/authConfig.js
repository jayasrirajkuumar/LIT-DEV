/**
 * Azure External ID authentication configuration for end-user sign-in.
 * Uses authorization code flow with PKCE (SPA) — consumed by AuthCallback.jsx.
 */

const PKCE_VERIFIER_KEY = "auth_code_verifier";
const PKCE_STATE_KEY = "auth_state";
const PKCE_NONCE_KEY = "auth_nonce";

export const AUTH_CONFIG = {
  tenantId:
    import.meta.env.VITE_AZURE_TENANT_ID || "8ba59a07-bd87-4b34-bc86-67840b193e6e",
  tenantDomain: "luxuryintasteauth.onmicrosoft.com",
  /** Public SPA client ID — must NOT be a confidential (web + secret) registration. */
  clientId:
    import.meta.env.VITE_AZURE_CLIENT_ID || "97f4abf5-12df-40c9-8324-0569f5647952",
  userFlow: import.meta.env.VITE_AZURE_USER_FLOW || "LIT-Web-App",
  ciamLoginSubdomain:
    import.meta.env.VITE_AZURE_CIAM_SUBDOMAIN || "luxuryintasteauth",
  redirectUriDev: "http://localhost:5173/auth/callback",
  redirectUriProd: "https://www.luxuryintaste.com/auth/callback",
};

export function logAuth(...args) {
  if (import.meta.env.DEV) {
    console.log("[LIT Auth]", ...args);
  }
}

export function logAuthError(...args) {
  console.error("[LIT Auth]", ...args);
}

export function getRedirectUri() {
  return import.meta.env.PROD
    ? AUTH_CONFIG.redirectUriProd
    : AUTH_CONFIG.redirectUriDev;
}

export function getAuthorizeEndpoint() {
  const { ciamLoginSubdomain, tenantId } = AUTH_CONFIG;
  return `https://${ciamLoginSubdomain}.ciamlogin.com/${tenantId}/oauth2/v2.0/authorize`;
}

export function getTokenEndpoint() {
  const { ciamLoginSubdomain, tenantId } = AUTH_CONFIG;
  return `https://${ciamLoginSubdomain}.ciamlogin.com/${tenantId}/oauth2/v2.0/token`;
}

function base64UrlEncode(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateCodeVerifier() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

async function generateCodeChallenge(codeVerifier) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier),
  );
  return base64UrlEncode(new Uint8Array(digest));
}

function createRandomValue() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `lit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch (err) {
    logAuthError("Failed to decode JWT:", err);
    return null;
  }
}

export function persistUserSession(idToken, decodedUser) {
  localStorage.setItem("id_token", idToken);
  localStorage.setItem("user_info", JSON.stringify(decodedUser));
  sessionStorage.setItem("user_info", JSON.stringify(decodedUser));
}

export function clearPkceSession() {
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(PKCE_STATE_KEY);
}

/**
 * Builds the Azure External ID authorize URL using authorization code + PKCE.
 * Stores PKCE verifier, state, and nonce in sessionStorage for the callback.
 * @returns {Promise<string>}
 */
export function getAdminConsentUrl() {
  const { ciamLoginSubdomain, tenantDomain, clientId } = AUTH_CONFIG;
  return `https://${ciamLoginSubdomain}.ciamlogin.com/${tenantDomain}/adminconsent?client_id=${clientId}`;
}

export async function buildLoginUrl() {
  const { clientId, userFlow, ciamLoginSubdomain } = AUTH_CONFIG;
  const redirectUri = getRedirectUri();

  if (!ciamLoginSubdomain) {
    const message =
      "Missing CIAM login subdomain. Set VITE_AZURE_CIAM_SUBDOMAIN in .env.local (e.g. luxuryintasteauth).";
    logAuthError(message);
    throw new Error(message);
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = createRandomValue();
  const nonce = createRandomValue();

  sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
  sessionStorage.setItem(PKCE_STATE_KEY, state);
  sessionStorage.setItem(PKCE_NONCE_KEY, nonce);

  const params = new URLSearchParams({
    p: userFlow,
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid profile email",
    response_type: "code",
    response_mode: "query",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    nonce,
    prompt: "login",
  });

  const loginUrl = `${getAuthorizeEndpoint()}?${params.toString()}`;
  logAuth("Built authorize URL", {
    redirectUri,
    userFlow,
    responseType: "code",
  });

  return loginUrl;
}

/**
 * Exchanges an authorization code for tokens at the Azure token endpoint.
 * @param {string} code
 * @returns {Promise<{ id_token?: string, access_token?: string, [key: string]: unknown }>}
 */
export async function exchangeCodeForTokens(code) {
  const { clientId } = AUTH_CONFIG;
  const redirectUri = getRedirectUri();
  const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);

  if (!codeVerifier) {
    throw new Error("Missing PKCE code verifier. Please start sign-in again.");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  logAuth("Exchanging authorization code for tokens", { redirectUri });

  const response = await fetch(getTokenEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const tokenResponse = await response.json();

  if (!response.ok) {
    logAuthError("Token exchange failed", tokenResponse);
    throw new Error(
      tokenResponse.error_description ||
        tokenResponse.error ||
        "Token exchange failed.",
    );
  }

  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(PKCE_STATE_KEY);
  logAuth("Token exchange succeeded");

  return tokenResponse;
}

export function validateIdTokenClaims(decodedToken) {
  const { clientId } = AUTH_CONFIG;
  const expectedNonce = sessionStorage.getItem(PKCE_NONCE_KEY);

  if (decodedToken.aud && decodedToken.aud !== clientId) {
    throw new Error("ID token audience does not match the application client ID.");
  }

  if (expectedNonce && decodedToken.nonce && decodedToken.nonce !== expectedNonce) {
    throw new Error("ID token nonce does not match the login request.");
  }

  if (decodedToken.exp && decodedToken.exp * 1000 <= Date.now()) {
    throw new Error("ID token has expired.");
  }

  sessionStorage.removeItem(PKCE_NONCE_KEY);
}

/** Validates ID tokens issued by the native authentication API (no PKCE nonce). */
export function validateNativeAuthIdTokenClaims(decodedToken) {
  const { clientId } = AUTH_CONFIG;

  if (decodedToken.aud && decodedToken.aud !== clientId) {
    throw new Error("ID token audience does not match the application client ID.");
  }

  if (decodedToken.exp && decodedToken.exp * 1000 <= Date.now()) {
    throw new Error("ID token has expired.");
  }
}
