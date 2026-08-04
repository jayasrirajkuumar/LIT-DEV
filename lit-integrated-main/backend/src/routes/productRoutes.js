import { Router } from "express";
import {
  getProducts,
  searchProductsHandler,
  getFeatured,
  getNewArrivalsHandler,
  getProductsByCategory,
  getProduct,
} from "../controllers/productController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { withDevPublicFallback } from "../middleware/withDevPublicFallback.js";
import { PRODUCT_LIST_FALLBACK } from "../constants/devPublicFallbacks.js";
import {
  validateParams,
  validateQuery,
  productSlugParamSchema,
  categorySlugParamSchema,
  productListQuerySchema,
  productSearchQuerySchema,
  listLimitQuerySchema,
} from "../middleware/catalogValidation.js";

const router = Router();

router.get("/", withDevPublicFallback(PRODUCT_LIST_FALLBACK), requireDatabase, validateQuery(productListQuerySchema), asyncHandler(getProducts));
router.get("/featured", withDevPublicFallback(PRODUCT_LIST_FALLBACK), requireDatabase, validateQuery(listLimitQuerySchema), asyncHandler(getFeatured));
router.get(
  "/new-arrivals",
  withDevPublicFallback(PRODUCT_LIST_FALLBACK),
  requireDatabase,
  validateQuery(listLimitQuerySchema),
  asyncHandler(getNewArrivalsHandler),
);
router.get("/search", withDevPublicFallback(PRODUCT_LIST_FALLBACK), requireDatabase, validateQuery(productSearchQuerySchema), asyncHandler(searchProductsHandler));
router.get(
  "/category/:slug",
  requireDatabase,
  validateParams(categorySlugParamSchema),
  validateQuery(productListQuerySchema),
  asyncHandler(getProductsByCategory),
);
router.get(
  "/:slug",
  requireDatabase,
  validateParams(productSlugParamSchema),
  asyncHandler(getProduct),
);

export default router;
