import config from "../config/env.js";
import { ensureDatabaseReady } from "../database/connectionManager.js";

/**
 * In development, return fallback JSON when PostgreSQL is unreachable so the
 * frontend can render without flooding the console with 500/503 errors.
 */
export function withDevPublicFallback(fallbackData) {
  return async (_req, res, next) => {
    if (config.isProduction) return next();

    const ready = await ensureDatabaseReady();
    if (!ready) {
      return res.json({ success: true, data: fallbackData, degraded: true });
    }
    return next();
  };
}

export default withDevPublicFallback;
