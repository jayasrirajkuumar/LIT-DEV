import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAzureAuth, attachDbUser } from "../middleware/authMiddleware.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import {
  getMyNotifications,
  getMyNotificationCount,
  patchMyNotificationRead,
  putMyNotificationRead,
  putAllNotificationsRead,
  deleteMyNotification,
} from "../controllers/userNotificationController.js";
import { validateParams } from "../middleware/validateRequest.js";
import { z } from "zod";

const notificationIdParamSchema = z.object({ id: z.string().uuid() });
const authed = [requireAzureAuth, attachDbUser];
const router = Router();

router.use(...authed, requireDatabase);
router.get("/", asyncHandler(getMyNotifications));
router.get("/count", asyncHandler(getMyNotificationCount));
router.get("/unread-count", asyncHandler(getMyNotificationCount));
router.put("/read-all", asyncHandler(putAllNotificationsRead));
router.patch("/:id/read", validateParams(notificationIdParamSchema), asyncHandler(patchMyNotificationRead));
router.put("/:id/read", validateParams(notificationIdParamSchema), asyncHandler(putMyNotificationRead));
router.delete("/:id", validateParams(notificationIdParamSchema), asyncHandler(deleteMyNotification));

export default router;
