import { AppError } from "../utils/AppError.js";

const PERMISSIONS = {
  SUPPORT_AGENT: new Set([
    "reply",
    "status",
    "assign",
    "notes",
    "view",
    "priority",
    "escalate",
    "close",
    "reopen",
  ]),
  SUPPORT_MANAGER: new Set([
    "reply",
    "status",
    "assign",
    "notes",
    "view",
    "priority",
    "escalate",
    "close",
    "reopen",
    "refund",
    "cancel",
    "address",
    "return",
    "replacement",
    "reship",
    "customer_update",
  ]),
  SUPER_ADMIN: new Set(["*"]),
};

export function getSupportTier(user) {
  if (user?.supportTier && PERMISSIONS[user.supportTier]) {
    return user.supportTier;
  }
  if (user?.role === "ADMIN") return "SUPER_ADMIN";
  return null;
}

export function hasSupportPermission(user, permission) {
  const tier = getSupportTier(user);
  if (!tier) return false;
  const allowed = PERMISSIONS[tier];
  return allowed.has("*") || allowed.has(permission);
}

export function requireSupportPermission(permission) {
  return (req, _res, next) => {
    if (!req.dbUser) {
      next(new AppError("Authentication context is missing.", 401, "TOKEN_MISSING"));
      return;
    }

    if (!hasSupportPermission(req.dbUser, permission)) {
      next(
        new AppError(
          `Your support role does not allow this action (${permission}).`,
          403,
          "FORBIDDEN",
        ),
      );
      return;
    }

    next();
  };
}

export default { getSupportTier, hasSupportPermission, requireSupportPermission };
