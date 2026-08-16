import { validateAzureIdToken } from "../config/azureAuth.js";
import { AppError } from "../utils/AppError.js";
import { userRepository } from "../repositories/userRepository.js";
import { withTimeout } from "../utils/withTimeout.js";
import { ensureDatabaseReady } from "../database/connectionManager.js";
function extractBearerToken(req) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
}

/**
 * Attaches validated Azure claims to req.auth when a valid Bearer token is present.
 */
export async function requireAzureAuth(req, _res, next) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new AppError("Authorization header with Bearer token is required.", 401, "TOKEN_MISSING");
    }

    req.auth = await validateAzureIdToken(token);
    req.idToken = token;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Resolves the authenticated DB user from Azure claims.
 * Requires requireAzureAuth to run first.
 */
export async function attachDbUser(req, _res, next) {
  try {
    if (!req.auth?.azureUserId) {
      throw new AppError("Authentication context is missing.", 401, "TOKEN_MISSING");
    }

    const ready = await ensureDatabaseReady();
    if (!ready) {
      throw new AppError(
        "Database is temporarily unavailable. Connect to Azure PostgreSQL and retry.",
        503,
        "DATABASE_UNAVAILABLE",
      );
    }

    const user = await withTimeout(      userRepository.findByAzureUserId(req.auth.azureUserId),
      10_000,
      "User lookup timed out. Database may be unreachable — check VPN/network and retry.",
      "DATABASE_TIMEOUT",
    );

    if (!user) {
      throw new AppError(
        "User account not found. Complete sign-in sync first.",
        404,
        "USER_NOT_FOUND",
      );
    }

    if (!user.isActive) {
      throw new AppError("User account is inactive.", 403, "USER_INACTIVE");
    }

    req.dbUser = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Requires an authenticated admin user.
 * Must run after requireAzureAuth and attachDbUser.
 */
export function requireAdmin(req, _res, next) {
  if (!req.dbUser) {
    next(new AppError("Authentication context is missing.", 401, "TOKEN_MISSING"));
    return;
  }

  if (req.dbUser.role !== "ADMIN") {
    next(new AppError("Admin access required.", 403, "FORBIDDEN"));
    return;
  }

  next();
}

export default requireAzureAuth;
