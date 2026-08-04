import { AppError } from "../utils/AppError.js";
import { databaseState } from "../database/connectionState.js";
import { ensureDatabaseReady } from "../database/connectionManager.js";

export async function requireDatabase(_req, res, next) {
  try {
    const ready = await ensureDatabaseReady();
    if (!ready) {
      return res.status(503).json({
        success: false,
        error: {
          code: "DATABASE_UNAVAILABLE",
          message:
            "Database is temporarily unavailable. Ensure VPN/network access to Azure PostgreSQL is active, then retry.",
          reason: databaseState.lastError,
        },
      });
    }
    return next();
  } catch (error) {
    return next(
      new AppError(
        "Database health check failed.",
        503,
        "DATABASE_UNAVAILABLE",
        { reason: error.message },
      ),
    );
  }
}

export default requireDatabase;
