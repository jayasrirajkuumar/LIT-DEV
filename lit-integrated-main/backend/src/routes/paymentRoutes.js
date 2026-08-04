import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAzureAuth, attachDbUser } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateRequest.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { requestTimeout } from "../middleware/requestTimeout.js";
import {
  postCreateOrder,
  postVerifyPayment,
  getPaymentsConfig,
} from "../controllers/paymentController.js";

const authed = [requireAzureAuth, attachDbUser];

const createOrderSchema = z.object({
  amount: z.coerce.number().positive(),
  purpose: z.string().trim().max(64).optional(),
  metadata: z.record(z.any()).optional(),
});

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

const router = Router();

router.get("/config", requireDatabase, asyncHandler(getPaymentsConfig));
router.post("/create-order", ...authed, requestTimeout(20_000), requireDatabase, validateBody(createOrderSchema), asyncHandler(postCreateOrder));
router.post("/verify", ...authed, requestTimeout(20_000), requireDatabase, validateBody(verifySchema), asyncHandler(postVerifyPayment));

export default router;
