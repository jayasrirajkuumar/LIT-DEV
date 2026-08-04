import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAzureAuth, attachDbUser } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateRequest.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { requestTimeout } from "../middleware/requestTimeout.js";
import {
  getMyWallet,
  getMyWalletHistory,
  postWalletPay,
  postWalletAddMoney,
} from "../controllers/walletController.js";

const authed = [requireAzureAuth, attachDbUser];

const payBodySchema = z.object({
  amount: z.coerce.number().positive(),
  description: z.string().trim().max(255).optional(),
  referenceType: z.string().trim().max(64).optional(),
  referenceId: z.string().trim().max(128).optional(),
});

const addMoneyBodySchema = z.object({
  amount: z.coerce.number().positive(),
  description: z.string().trim().max(255).optional(),
});

const router = Router();

router.get("/", ...authed, requireDatabase, asyncHandler(getMyWallet));
router.get("/history", ...authed, requireDatabase, asyncHandler(getMyWalletHistory));
router.post("/pay", ...authed, requestTimeout(20_000), requireDatabase, validateBody(payBodySchema), asyncHandler(postWalletPay));
router.post("/use", ...authed, requestTimeout(20_000), requireDatabase, validateBody(payBodySchema), asyncHandler(postWalletPay));
router.post("/add-money", ...authed, requestTimeout(20_000), requireDatabase, validateBody(addMoneyBodySchema), asyncHandler(postWalletAddMoney));
router.post("/add", ...authed, requestTimeout(20_000), requireDatabase, validateBody(addMoneyBodySchema), asyncHandler(postWalletAddMoney));

export default router;
