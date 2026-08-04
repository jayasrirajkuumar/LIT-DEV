import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAzureAuth, attachDbUser } from "../middleware/authMiddleware.js";
import { validateBody, validateParams } from "../middleware/validateRequest.js";
import { supportRateLimiter } from "../middleware/rateLimiter.js";
import { supportAttachmentUpload } from "../middleware/supportUploadMiddleware.js";
import {
  postContactSupport,
  postSupportRequest,
  getSupportRequests,
} from "../controllers/supportController.js";
import {
  getUserConversations,
  postUserConversation,
  getUserConversationMessages,
  postUserConversationMessage,
  patchUserConversationRead,
  postUserSupportAttachment,
} from "../controllers/supportChatController.js";

const authed = [requireAzureAuth, attachDbUser];

const contactSupportBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255),
  email: z.string().trim().email("A valid email is required.").max(320),
  subject: z.string().trim().min(1, "Subject is required.").max(255).optional(),
  category: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().min(1, "Message is required.").max(5000),
});

const supportRequestBodySchema = z.object({
  orderId: z.string().uuid().optional().nullable(),
  type: z.enum(["GENERAL", "ORDER", "RETURN", "SHIPPING", "PAYMENT", "CHAT"]).default("GENERAL"),
  subject: z.string().trim().max(255).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().min(1).max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

const conversationBodySchema = z.object({
  orderId: z.string().uuid().optional().nullable(),
  subject: z.string().trim().max(255).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().min(1).max(5000),
  type: z.enum(["GENERAL", "ORDER", "RETURN", "SHIPPING", "PAYMENT", "CHAT"]).default("CHAT"),
});

const messageBodySchema = z
  .object({
    message: z.string().trim().max(5000).optional().default(""),
    attachmentUrl: z.string().url().optional().nullable(),
    attachmentType: z.enum(["image", "pdf", "file"]).optional().nullable(),
  })
  .refine((data) => data.message.trim().length > 0 || data.attachmentUrl, {
    message: "Message or attachment is required.",
  });

const conversationIdParamSchema = z.object({
  id: z.string().uuid(),
});

const router = Router();

router.post(
  "/contact",
  supportRateLimiter,
  validateBody(contactSupportBodySchema),
  asyncHandler(postContactSupport),
);

router.get("/conversations", ...authed, asyncHandler(getUserConversations));
router.post(
  "/conversations",
  ...authed,
  validateBody(conversationBodySchema),
  asyncHandler(postUserConversation),
);
router.get(
  "/conversations/:id/messages",
  ...authed,
  validateParams(conversationIdParamSchema),
  asyncHandler(getUserConversationMessages),
);
router.post(
  "/conversations/:id/messages",
  ...authed,
  validateParams(conversationIdParamSchema),
  validateBody(messageBodySchema),
  asyncHandler(postUserConversationMessage),
);
router.patch(
  "/conversations/:id/read",
  ...authed,
  validateParams(conversationIdParamSchema),
  asyncHandler(patchUserConversationRead),
);
router.post(
  "/uploads/attachment",
  ...authed,
  supportAttachmentUpload.single("attachment"),
  asyncHandler(postUserSupportAttachment),
);

router.post("/requests", ...authed, validateBody(supportRequestBodySchema), asyncHandler(postSupportRequest));
router.get("/requests", ...authed, asyncHandler(getSupportRequests));

export default router;
