import { Router } from "express";
import {
  getWishlistHandler,
  getWishlistCountHandler,
  getCollectionsHandler,
  postCollectionHandler,
  patchCollectionHandler,
  deleteCollectionHandler,
  patchDefaultCollectionHandler,
  postWishlistItem,
  deleteWishlistItem,
  postToggleWishlistItem,
  postMoveWishlistItem,
  postCopyWishlistItem,
  getProductCollectionsHandler,
  postWishlistToCart,
} from "../controllers/wishlistController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAzureAuth, attachDbUser } from "../middleware/authMiddleware.js";
import { validateParams, validateBody } from "../middleware/validateRequest.js";
import {
  productIdParamSchema,
  moveItemBodySchema,
  collectionIdParamSchema,
  createCollectionBodySchema,
  updateCollectionBodySchema,
  collectionItemBodySchema,
  moveCollectionItemBodySchema,
} from "../middleware/shoppingValidation.js";

const router = Router();

router.use(requireAzureAuth, attachDbUser);

router.get("/", asyncHandler(getWishlistHandler));
router.get("/count", asyncHandler(getWishlistCountHandler));
router.get("/collections", asyncHandler(getCollectionsHandler));
router.post(
  "/collections",
  validateBody(createCollectionBodySchema),
  asyncHandler(postCollectionHandler),
);
router.patch(
  "/collections/:id",
  validateParams(collectionIdParamSchema),
  validateBody(updateCollectionBodySchema),
  asyncHandler(patchCollectionHandler),
);
router.delete(
  "/collections/:id",
  validateParams(collectionIdParamSchema),
  asyncHandler(deleteCollectionHandler),
);
router.patch(
  "/collections/:id/default",
  validateParams(collectionIdParamSchema),
  asyncHandler(patchDefaultCollectionHandler),
);
router.get(
  "/products/:productId/collections",
  validateParams(productIdParamSchema),
  asyncHandler(getProductCollectionsHandler),
);
router.post(
  "/items/:productId",
  validateParams(productIdParamSchema),
  validateBody(collectionItemBodySchema),
  asyncHandler(postWishlistItem),
);
router.post(
  "/items/:productId/toggle",
  validateParams(productIdParamSchema),
  validateBody(collectionItemBodySchema),
  asyncHandler(postToggleWishlistItem),
);
router.post(
  "/items/:productId/move",
  validateParams(productIdParamSchema),
  validateBody(moveCollectionItemBodySchema),
  asyncHandler(postMoveWishlistItem),
);
router.post(
  "/items/:productId/copy",
  validateParams(productIdParamSchema),
  validateBody(moveCollectionItemBodySchema),
  asyncHandler(postCopyWishlistItem),
);
router.delete(
  "/items/:productId",
  validateParams(productIdParamSchema),
  asyncHandler(deleteWishlistItem),
);
router.post(
  "/move-to-cart/:productId",
  validateParams(productIdParamSchema),
  validateBody(moveItemBodySchema),
  asyncHandler(postWishlistToCart),
);

export default router;
