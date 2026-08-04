import rateLimit from "express-rate-limit";
import config from "../config/env.js";

function isLocalRequest(req) {
  const ip = req.ip || "";
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
}

export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !config.isProduction && isLocalRequest(req),
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again later.",
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !config.isProduction && isLocalRequest(req),
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts. Please try again later.",
    },
  },
});

export const supportRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.supportRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !config.isProduction && isLocalRequest(req),
  message: {
    success: false,
    error: {
      code: "SUPPORT_RATE_LIMIT_EXCEEDED",
      message: "Too many support submissions. Please try again later.",
    },
  },
});
