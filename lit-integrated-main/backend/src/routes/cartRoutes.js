import { Router } from "express";
import {
  getCartHandler,
  getCartCountHandler,
  postCartItem,
  patchCartItem,
  deleteCartItem,
  postMoveWishlistToCart,
  postMoveCartToWishlist,
} from "../controllers/cartController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAzureAuth, attachDbUser } from "../middleware/authMiddleware.js";
import { validateBody, validateParams } from "../middleware/validateRequest.js";
import {
  addCartItemBodySchema,
  updateCartItemBodySchema,
  productIdParamSchema,
  moveItemBodySchema,
} from "../middleware/shoppingValidation.js";

const router = Router();

router.use(requireAzureAuth, attachDbUser);

router.get("/", asyncHandler(getCartHandler));
router.get("/count", asyncHandler(getCartCountHandler));
router.post("/items", validateBody(addCartItemBodySchema), asyncHandler(postCartItem));
router.patch(
  "/items/:productId",
  validateParams(productIdParamSchema),
  validateBody(updateCartItemBodySchema),
  asyncHandler(patchCartItem),
);
router.delete(
  "/items/:productId",
  validateParams(productIdParamSchema),
  asyncHandler(deleteCartItem),
);
router.post(
  "/move-from-wishlist/:productId",
  validateParams(productIdParamSchema),
  validateBody(moveItemBodySchema),
  asyncHandler(postMoveWishlistToCart),
);
router.post(
  "/move-to-wishlist/:productId",
  validateParams(productIdParamSchema),
  asyncHandler(postMoveCartToWishlist),
);

export default router;
