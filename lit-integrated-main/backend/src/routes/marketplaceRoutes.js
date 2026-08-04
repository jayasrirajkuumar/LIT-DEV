import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { withDevPublicFallback } from "../middleware/withDevPublicFallback.js";
import { MARKETPLACE_CONFIG_FALLBACK } from "../constants/devPublicFallbacks.js";
import { getMarketplaceConfig } from "../controllers/marketplaceController.js";

const router = Router();

router.get(
  "/config",
  withDevPublicFallback(MARKETPLACE_CONFIG_FALLBACK),
  requireDatabase,
  asyncHandler(getMarketplaceConfig),
);

export default router;
