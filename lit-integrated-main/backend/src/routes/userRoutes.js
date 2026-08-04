import { Router } from "express";
import { getMyProfile, updateMyProfile } from "../controllers/userController.js";
import { getUserSearch } from "../controllers/internalGiftCardController.js";
import { getUserCoupons } from "../controllers/marketplaceAdminController.js";
import {
  getMyNotifications,
  getMyNotificationCount,
  patchMyNotificationRead,
} from "../controllers/userNotificationController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAzureAuth, attachDbUser } from "../middleware/authMiddleware.js";
import { validateBody, updateProfileBodySchema, validateParams } from "../middleware/validateRequest.js";
import { z } from "zod";

const notificationIdParamSchema = z.object({
  id: z.string().uuid(),
});

const router = Router();

router.use(requireAzureAuth, attachDbUser);

router.get("/me", asyncHandler(getMyProfile));
router.get("/search", asyncHandler(getUserSearch));
router.get("/me/coupons", asyncHandler(getUserCoupons));
router.get("/me/notifications", asyncHandler(getMyNotifications));
router.get("/me/notifications/count", asyncHandler(getMyNotificationCount));
router.patch("/me/notifications/:id/read", validateParams(notificationIdParamSchema), asyncHandler(patchMyNotificationRead));
router.patch("/me", validateBody(updateProfileBodySchema), asyncHandler(updateMyProfile));

export default router;
