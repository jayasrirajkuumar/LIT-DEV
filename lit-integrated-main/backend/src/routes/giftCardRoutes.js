import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAzureAuth, attachDbUser } from "../middleware/authMiddleware.js";
import { validateBody, validateParams } from "../middleware/validateRequest.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { requestTimeout } from "../middleware/requestTimeout.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { withDevPublicFallback } from "../middleware/withDevPublicFallback.js";
import { GIFT_CARD_CONFIG_FALLBACK } from "../constants/devPublicFallbacks.js";
import { getConfig, postPreview, postRedeem } from "../controllers/giftCardController.js";
import {
  postInternalPurchase,
  postClaim,
  postDecline,
  getMySent,
  getMyReceived,
  getInternalCard,
} from "../controllers/internalGiftCardController.js";

const authed = [requireAzureAuth, attachDbUser];

const internalPurchaseSchema = z.object({
  amount: z.coerce.number().positive(),
  recipientId: z.string().uuid(),
  senderName: z.string().trim().max(255).optional(),
  message: z.string().trim().max(500).optional().nullable(),
  occasion: z.string().trim().max(64),
  theme: z.string().trim().max(64),
  couponCode: z.string().trim().max(64).optional().nullable(),
  paymentMethod: z.enum(["WALLET", "RAZORPAY", "MOCK"]).default("WALLET"),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
});

const claimDeclineSchema = z.object({
  giftCardId: z.string().uuid(),
});

const redeemBodySchema = z.object({
  giftCardCode: z.string().trim().min(10).max(24),
  pin: z.string().trim().min(4).max(8),
});

const previewBodySchema = z.object({
  amount: z.coerce.number().positive(),
  couponCode: z.string().trim().max(64).optional().nullable(),
});

const idParamSchema = z.object({ id: z.string().uuid() });

const router = Router();

router.get(
  "/config",
  withDevPublicFallback(GIFT_CARD_CONFIG_FALLBACK),
  requireDatabase,
  asyncHandler(getConfig),
);

router.post("/preview", requestTimeout(15_000), ...authed, requireDatabase, validateBody(previewBodySchema), asyncHandler(postPreview));
router.post(
  "/purchase",
  requestTimeout(30_000),
  ...authed,
  requireDatabase,
  validateBody(internalPurchaseSchema),
  asyncHandler(postInternalPurchase),
);
router.post("/claim", requestTimeout(20_000), ...authed, requireDatabase, validateBody(claimDeclineSchema), asyncHandler(postClaim));
router.post("/decline", requestTimeout(20_000), ...authed, requireDatabase, validateBody(claimDeclineSchema), asyncHandler(postDecline));
router.get("/my-sent", ...authed, requireDatabase, asyncHandler(getMySent));
router.get("/my-received", ...authed, requireDatabase, asyncHandler(getMyReceived));
router.post("/redeem", requestTimeout(15_000), ...authed, requireDatabase, authRateLimiter, validateBody(redeemBodySchema), asyncHandler(postRedeem));
router.get("/received/:id", ...authed, requireDatabase, validateParams(idParamSchema), asyncHandler(getInternalCard));
router.get("/claim/:id", ...authed, requireDatabase, validateParams(idParamSchema), asyncHandler(getInternalCard));
router.get("/:id", ...authed, requireDatabase, validateParams(idParamSchema), asyncHandler(getInternalCard));

export default router;
