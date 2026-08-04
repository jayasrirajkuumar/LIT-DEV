import { Router } from "express";
import {
  getCategories,
  getCategory,
} from "../controllers/categoryController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { withDevPublicFallback } from "../middleware/withDevPublicFallback.js";
import { CATEGORIES_FALLBACK } from "../constants/devPublicFallbacks.js";
import { validateParams, categorySlugParamSchema } from "../middleware/catalogValidation.js";

const router = Router();

router.get("/", withDevPublicFallback(CATEGORIES_FALLBACK), requireDatabase, asyncHandler(getCategories));
router.get(
  "/:slug",
  requireDatabase,
  validateParams(categorySlugParamSchema),
  asyncHandler(getCategory),
);

export default router;
