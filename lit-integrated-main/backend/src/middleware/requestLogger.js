import config from "../config/env.js";
import { logger } from "../utils/logger.js";

export function requestLogger(req, res, next) {
  if (config.isProduction || !req.path.startsWith("/api")) {
    next();
    return;
  }

  const started = Date.now();

  logger.debug("API request", {
    method: req.method,
    path: req.originalUrl,
  });

  res.on("finish", () => {
    logger.debug("API response", {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - started,
    });
  });

  next();
}

export default requestLogger;
