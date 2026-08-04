import { AppError } from "../utils/AppError.js";
import config from "../config/env.js";
import { logger } from "../utils/logger.js";
import { isPrismaConnectionError } from "../database/connectionManager.js";

function normalizeError(error) {
  if (error instanceof AppError) {
    return error;
  }

  if (typeof error?.statusCode === "number") {
    return new AppError(error.message, error.statusCode, error.code ?? "REQUEST_ERROR", error.details);
  }

  if (error?.code === "P2002") {
    return new AppError("A unique constraint would be violated.", 409, "UNIQUE_CONSTRAINT");
  }

  if (isPrismaConnectionError(error)) {
    return new AppError(
      "Database is temporarily unavailable. Ensure VPN/network access to Azure PostgreSQL is active, then retry.",
      503,
      "DATABASE_UNAVAILABLE",
      config.isProduction ? undefined : { prismaCode: error.code, reason: error.message },
    );
  }

  if (error?.code?.startsWith?.("P")) {
    return new AppError(
      config.isProduction ? "Database operation failed." : error.message || "Database operation failed.",
      500,
      "DATABASE_ERROR",
    );
  }

  return new AppError(
    config.isProduction ? "Internal server error." : error?.message || "Internal server error.",
    500,
    "INTERNAL_ERROR",
  );
}

export function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found.",
    },
  });
}

export function errorHandler(error, _req, res, _next) {
  const appError = normalizeError(error);

  if (appError.statusCode >= 500) {
    logger.error(appError.message, {
      code: appError.code,
      details: appError.details,
      stack: error?.stack,
    });
  } else if (!config.isProduction) {
    logger.warn(appError.message, {
      code: appError.code,
      details: appError.details,
      stack: error?.stack,
    });
  }

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details && !config.isProduction ? { details: appError.details } : {}),
    },
  });
}
