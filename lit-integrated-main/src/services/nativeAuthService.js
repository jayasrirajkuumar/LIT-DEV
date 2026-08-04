import {
  AUTH_CONFIG,
  decodeJwt,
  logAuth,
  logAuthError,
  validateNativeAuthIdTokenClaims,
  persistUserSession,
} from "../config/authConfig";
import { upsertUserFromClaims } from "./userService";
import { sanitizeAuthError } from "../utils/authErrorMessages";
import { normalizeAuthEmail } from "../auth/session";

const CHALLENGE_TYPE = "oob redirect";
const NATIVE_CAPABILITIES = "registration_required mfa_required";
const SCOPES = "openid profile email";

/** Flow-start endpoints accept challenge_type / capabilities per Microsoft native auth API. */
const FLOW_INIT_PATHS = new Set([
  "/oauth2/v2.0/initiate",
  "/oauth2/v2.0/challenge",
  "/signup/v1.0/start",
  "/signup/v1.0/challenge",
]);

const SENSITIVE_KEYS = new Set([
  "continuation_token",
  "oob",
  "password",
  "id_token",
  "access_token",
  "refresh_token",
]);

function getNativeAuthBaseUrl() {
  const subdomain = AUTH_CONFIG.ciamLoginSubdomain;
  return import.meta.env.DEV && import.meta.env.VITE_ENTRA_NATIVE_PROXY !== "false"
    ? "/entra-native"
    : `https://${subdomain}.ciamlogin.com/${AUTH_CONFIG.tenantDomain}`;
}

function maskSecret(value, visible = 4) {
  const text = String(value ?? "");
  if (!text) return "";
  if (text.length <= visible * 2) return "***";
  return `${text.slice(0, visible)}…${text.slice(-visible)}`;
}

function sanitizePayloadForLog(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (SENSITIVE_KEYS.has(key)) {
        return [key, maskSecret(value)];
      }
      return [key, value];
    }),
  );
}

function sanitizeResponseForLog(data = {}) {
  const copy = { ...data };
  for (const key of SENSITIVE_KEYS) {
    if (copy[key]) copy[key] = maskSecret(copy[key]);
  }
  return copy;
}

function logNativeAuthExchange(step, { path, requestPayload, status, responseData, error }) {
  const url = `${getNativeAuthBaseUrl()}${path}`;
  const payload = {
    step,
    url,
    request: sanitizePayloadForLog(requestPayload),
    status: status ?? null,
    response: responseData ? sanitizeResponseForLog(responseData) : null,
    error: error
      ? {
          message: error.message,
          code: error.code,
          suberror: error.suberror,
          status: error.status,
        }
      : null,
  };

  if (error) {
    logAuthError(`Native auth ${step}`, payload);
  } else {
    logAuth(`Native auth ${step}`, payload);
  }
}

function normalizeOtp(otp) {
  return String(otp ?? "").replace(/\D/g, "");
}

function createNativeAuthError(data, status, fallbackMessage = "Authentication request failed.") {
  const error = new Error(data.error_description || data.error || fallbackMessage);
  error.code = data.error;
  error.suberror = data.suberror;
  error.status = status;
  error.errorCodes = data.error_codes;
  error.correlationId = data.correlation_id;
  error.traceId = data.trace_id;
  error.raw = data;
  return error;
}

function assertContinuationToken(token, message = "Your verification session expired. Please request a new code.") {
  if (!token || typeof token !== "string" || !token.trim()) {
    const error = new Error(message);
    error.code = "missing_session";
    throw error;
  }
  return token.trim();
}

function assertOtpCode(code, expectedLength) {
  if (!code) {
    const error = new Error("Please enter the verification code from your email.");
    error.code = "missing_otp";
    throw error;
  }

  if (expectedLength && code.length !== expectedLength) {
    const error = new Error(`Please enter the full ${expectedLength}-digit verification code.`);
    error.code = "invalid_otp_length";
    throw error;
  }
}

async function postNativeAuth(path, params = {}, step = "request") {
  const payload = {
    client_id: AUTH_CONFIG.clientId,
    ...params,
  };

  if (FLOW_INIT_PATHS.has(path)) {
    payload.challenge_type = CHALLENGE_TYPE;
    payload.capabilities = NATIVE_CAPABILITIES;
  }

  const body = new URLSearchParams(payload);

  let response;
  let data = {};

  try {
    response = await fetch(`${getNativeAuthBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    data = await response.json().catch(() => ({}));
  } catch (networkError) {
    logNativeAuthExchange(step, {
      path,
      requestPayload: payload,
      error: networkError,
    });
    const error = new Error("Network error while contacting authentication service.");
    error.code = "network_error";
    throw error;
  }

  if (!response.ok) {
    const error = createNativeAuthError(data, response.status);
    if (data.suberror === "mfa_required") {
      error.code = "mfa_required";
    }
    if (
      data.suberror === "consent_required" ||
      data.error_codes?.includes?.(65001) ||
      /AADSTS65001/i.test(data.error_description ?? "")
    ) {
      error.code = "consent_required";
    }
    logNativeAuthExchange(step, {
      path,
      requestPayload: payload,
      status: response.status,
      responseData: data,
      error,
    });
    throw error;
  }

  if (data.challenge_type === "redirect") {
    const error = createNativeAuthError(
      {
        ...data,
        error: data.error || "redirect_required",
        error_description:
          data.error_description ||
          "Email OTP is not available in the custom sign-in screen. Enable Native Authentication on your Azure SPA app registration.",
      },
      response.status,
    );
    error.code = "redirect_required";
    logNativeAuthExchange(step, {
      path,
      requestPayload: payload,
      status: response.status,
      responseData: data,
      error,
    });
    throw error;
  }

  logNativeAuthExchange(step, {
    path,
    requestPayload: payload,
    status: response.status,
    responseData: data,
  });

  return data;
}

function mapOtpChallenge(data, email) {
  const continuationToken = data.continuation_token;
  if (!continuationToken) {
    const error = new Error("Authentication service did not return a verification session.");
    error.code = "missing_continuation_token";
    throw error;
  }

  return {
    continuationToken,
    codeLength: data.code_length || 8,
    maskedTarget: data.challenge_target_label?.trim() || email || null,
    challengeType: data.challenge_type || null,
    issuedAt: Date.now(),
    tokenFingerprint: continuationToken.slice(0, 12),
  };
}

const inFlightOtpStarts = new Map();

async function runSingleFlight(key, task) {
  if (inFlightOtpStarts.has(key)) {
    return inFlightOtpStarts.get(key);
  }

  const promise = task().finally(() => {
    inFlightOtpStarts.delete(key);
  });
  inFlightOtpStarts.set(key, promise);
  return promise;
}

export async function startSignInOtp(email) {
  const normalizedEmail = normalizeAuthEmail(email);
  return runSingleFlight(`signin:${normalizedEmail}`, async () => {
    const initiate = await postNativeAuth(
      "/oauth2/v2.0/initiate",
      { username: normalizedEmail },
      "sign-in-start",
    );

    const challenge = await postNativeAuth(
      "/oauth2/v2.0/challenge",
      { continuation_token: initiate.continuation_token },
      "sign-in-challenge",
    );

    if (challenge.continuation_token === initiate.continuation_token) {
      logAuthError("Sign-in challenge returned the same continuation token as initiate", {
        email: normalizedEmail,
      });
    }

    if (challenge.challenge_type && challenge.challenge_type !== "oob") {
      const error = new Error(
        `This account uses ${challenge.challenge_type} sign-in. Email OTP cannot complete verification.`,
      );
      error.code = "unsupported_challenge_type";
      error.challengeType = challenge.challenge_type;
      throw error;
    }

    return mapOtpChallenge(challenge, normalizedEmail);
  });
}

export async function startSignUpOtp(email, profile = null) {
  const normalizedEmail = normalizeAuthEmail(email);
  return runSingleFlight(`signup:${normalizedEmail}`, async () => {
    const startParams = { username: normalizedEmail };
    if (profile?.displayName) {
      startParams.attributes = JSON.stringify({ displayName: profile.displayName });
    }

    const start = await postNativeAuth("/signup/v1.0/start", startParams, "sign-up-start");

    const challenge = await postNativeAuth(
      "/signup/v1.0/challenge",
      { continuation_token: start.continuation_token },
      "sign-up-challenge",
    );

    return mapOtpChallenge(challenge, normalizedEmail);
  });
}

export async function resendSignInOtp(continuationToken) {
  const token = assertContinuationToken(continuationToken);

  const challenge = await postNativeAuth(
    "/oauth2/v2.0/challenge",
    { continuation_token: token },
    "sign-in-resend",
  );

  return mapOtpChallenge(challenge, null);
}

export async function resendSignUpOtp(continuationToken) {
  const token = assertContinuationToken(continuationToken);

  const challenge = await postNativeAuth(
    "/signup/v1.0/challenge",
    { continuation_token: token },
    "sign-up-resend",
  );

  return mapOtpChallenge(challenge, null);
}

async function exchangeNativeAuthToken(params, step) {
  return postNativeAuth("/oauth2/v2.0/token", { ...params, scope: SCOPES }, step);
}

export async function verifySignInOtp(continuationToken, otp, expectedLength = 8) {
  const token = assertContinuationToken(continuationToken);
  const code = normalizeOtp(otp);
  assertOtpCode(code, expectedLength);

  logAuth("Sign-in verify payload", {
    tokenFingerprint: token.slice(0, 12),
    otpLength: code.length,
    expectedLength,
  });

  const tokens = await exchangeNativeAuthToken(
    {
      continuation_token: token,
      grant_type: "oob",
      oob: code,
    },
    "sign-in-verify",
  );

  return tokens;
}

export async function verifySignUpOtp(continuationToken, otp, email, expectedLength = 8, profile = null) {
  const token = assertContinuationToken(continuationToken);
  const code = normalizeOtp(otp);
  assertOtpCode(code, expectedLength);

  let signupToken;

  try {
    const continued = await postNativeAuth(
      "/signup/v1.0/continue",
      {
        continuation_token: token,
        grant_type: "oob",
        oob: code,
      },
      "sign-up-continue",
    );
    signupToken = continued.continuation_token;
  } catch (error) {
    if (error.code !== "attributes_required" || !error.raw?.continuation_token) {
      throw error;
    }

    const attributePayload = {};
    if (profile?.displayName) {
      attributePayload.displayName = profile.displayName;
    }

    if (!Object.keys(attributePayload).length) {
      throw error;
    }

    const attributesResult = await postNativeAuth(
      "/signup/v1.0/continue",
      {
        continuation_token: error.raw.continuation_token,
        grant_type: "attributes",
        attributes: JSON.stringify(attributePayload),
      },
      "sign-up-attributes",
    );

    signupToken = attributesResult.continuation_token;
  }

  if (!signupToken) {
    const error = new Error("Verification succeeded but no session token was returned. Please try again.");
    error.code = "missing_continuation_token";
    throw error;
  }

  const tokens = await exchangeNativeAuthToken(
    {
      continuation_token: signupToken,
      grant_type: "continuation_token",
      username: email,
    },
    "sign-up-token",
  );

  return tokens;
}

export async function completeSessionFromTokens(tokenResponse) {
  const idToken = tokenResponse?.id_token;
  if (!idToken) {
    throw new Error("Authentication succeeded but no ID token was returned.");
  }

  const decodedUser = decodeJwt(idToken);
  if (!decodedUser) {
    throw new Error("Unable to decode the ID token.");
  }

  validateNativeAuthIdTokenClaims(decodedUser);
  persistUserSession(idToken, decodedUser);
  await upsertUserFromClaims(decodedUser, idToken);
  window.dispatchEvent(new Event("lit-auth-change"));
  logAuth("Native authentication session established");
}

export function mapNativeAuthError(error, step = "auth", session = null) {
  return sanitizeAuthError(error, step, session);
}
