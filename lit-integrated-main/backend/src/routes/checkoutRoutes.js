import { Router } from "express";
import {
  getCheckout,
  postCheckout,
  postOrder,
  getOrders,
  getOrderHistory,
  getOrderById,
  patchCancelOrder,
  postReorder,
} from "../controllers/checkoutController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAzureAuth, attachDbUser } from "../middleware/authMiddleware.js";
import { validateBody, validateParams, validateQuery } from "../middleware/catalogValidation.js";
import {
  checkoutPreviewQuerySchema,
  checkoutBodySchema,
  createOrderBodySchema,
  orderIdParamSchema,
  orderListQuerySchema,
  cancelOrderBodySchema,
} from "../middleware/orderValidation.js";

const router = Router();

router.use(requireAzureAuth, attachDbUser);

router.get("/checkout", validateQuery(checkoutPreviewQuerySchema), asyncHandler(getCheckout));
router.post("/checkout", validateBody(checkoutBodySchema), asyncHandler(postCheckout));
router.post("/orders", validateBody(createOrderBodySchema), asyncHandler(postOrder));
router.get("/orders", validateQuery(orderListQuerySchema), asyncHandler(getOrders));
router.get("/orders/history", validateQuery(orderListQuerySchema), asyncHandler(getOrderHistory));
router.get(
  "/orders/:id",
  validateParams(orderIdParamSchema),
  asyncHandler(getOrderById),
);
router.patch(
  "/orders/:id/cancel",
  validateParams(orderIdParamSchema),
  validateBody(cancelOrderBodySchema),
  asyncHandler(patchCancelOrder),
);
router.post(
  "/orders/:id/reorder",
  validateParams(orderIdParamSchema),
  asyncHandler(postReorder),
);

export default router;
