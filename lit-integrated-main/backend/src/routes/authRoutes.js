import { Router } from "express";
import { syncUser } from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { validateBody, syncUserBodySchema } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/sync-user",
  authRateLimiter,
  validateBody(syncUserBodySchema),
  asyncHandler(syncUser),
);

/** @deprecated Use POST /api/auth/sync-user */
router.post(
  "/login",
  authRateLimiter,
  validateBody(syncUserBodySchema),
  asyncHandler(syncUser),
);

export default router;
