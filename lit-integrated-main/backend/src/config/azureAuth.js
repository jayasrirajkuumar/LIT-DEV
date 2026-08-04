import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import config from "./env.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

let jwks;

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(config.azure.jwksUri));
  }
  return jwks;
}

function issuerMatchesTenant(iss, tenantId) {
  if (!iss || !tenantId) return false;

  const normalized = String(iss).replace(/\/$/, "");
  return (
    normalized.includes(".ciamlogin.com/") &&
    normalized.includes(`/${tenantId}/`)
  );
}

function audienceMatches(aud, clientId) {
  if (!clientId) return false;
  if (Array.isArray(aud)) {
    return aud.includes(clientId);
  }
  return aud === clientId;
}

/**
 * Validates an Azure External ID ID token and returns normalized claims.
 */
export async function validateAzureIdToken(idToken) {
  if (!idToken) {
    throw new AppError("Authorization token is required.", 401, "TOKEN_MISSING");
  }

  try {
    const { payload } = await jwtVerify(idToken, getJwks(), {
      audience: config.azure.clientId,
    });

    if (!issuerMatchesTenant(payload.iss, config.azure.tenantId)) {
      throw new AppError("Token issuer does not match configured tenant.", 401, "INVALID_TOKEN", {
        tokenIss: payload.iss,
        expectedTenantId: config.azure.tenantId,
      });
    }

    if (!audienceMatches(payload.aud, config.azure.clientId)) {
      throw new AppError("Token audience does not match configured client ID.", 401, "INVALID_TOKEN", {
        tokenAud: payload.aud,
        expectedClientId: config.azure.clientId,
      });
    }

    logger.debug("Azure JWT verified", {
      iss: payload.iss,
      aud: payload.aud,
      sub: payload.sub,
    });

    const azureUserId = payload.sub;
    const email = extractEmail(payload);
    const displayName = extractDisplayName(payload);
    const profilePicture = extractProfilePicture(payload);

    if (!azureUserId) {
      throw new AppError("Token is missing subject (sub) claim.", 401, "INVALID_TOKEN");
    }

    if (!email) {
      throw new AppError(
        "Token is missing a usable email claim.",
        401,
        "EMAIL_CLAIM_MISSING",
      );
    }

    return {
      azureUserId,
      email: email.toLowerCase(),
      displayName,
      profilePicture,
      rawClaims: payload,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    let tokenIss;
    try {
      tokenIss = decodeJwt(idToken)?.iss;
    } catch {
      tokenIss = undefined;
    }

    logger.warn("Azure token validation failed", {
      reason: error.message,
      tokenIss,
      expectedTenantId: config.azure.tenantId,
      expectedClientId: config.azure.clientId,
    });

    throw new AppError("Invalid or expired Azure token.", 401, "INVALID_TOKEN", {
      reason: error.message,
      tokenIss,
    });
  }
}

function extractEmail(payload) {
  if (typeof payload.email === "string" && payload.email.includes("@")) {
    return payload.email;
  }

  if (
    typeof payload.preferred_username === "string" &&
    payload.preferred_username.includes("@")
  ) {
    return payload.preferred_username;
  }

  if (Array.isArray(payload.emails) && payload.emails.length > 0) {
    return payload.emails[0];
  }

  return null;
}

function extractDisplayName(payload) {
  if (typeof payload.name === "string" && payload.name.trim()) {
    return payload.name.trim();
  }

  const given = typeof payload.given_name === "string" ? payload.given_name.trim() : "";
  const family = typeof payload.family_name === "string" ? payload.family_name.trim() : "";
  const combined = [given, family].filter(Boolean).join(" ").trim();

  if (combined) {
    return combined;
  }

  if (typeof payload.preferred_username === "string") {
    return payload.preferred_username.split("@")[0];
  }

  return null;
}

function extractProfilePicture(payload) {
  if (typeof payload.picture === "string" && payload.picture.trim()) {
    return payload.picture.trim();
  }

  return null;
}

export default {
  validateAzureIdToken,
};
