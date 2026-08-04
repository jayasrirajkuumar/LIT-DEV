import { Router } from "express";
import {
  postCategory,
  patchCategory,
  removeCategory,
} from "../controllers/categoryController.js";
import {
  postProduct,
  patchProduct,
  removeProduct,
} from "../controllers/productController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAzureAuth, attachDbUser, requireAdmin } from "../middleware/authMiddleware.js";
import {
  validateBody,
  validateParams,
  createCategoryBodySchema,
  updateCategoryBodySchema,
  categoryIdParamSchema,
  createProductBodySchema,
  updateProductBodySchema,
  productIdParamSchema,
  validateQuery,
} from "../middleware/catalogValidation.js";
import {
  getDashboard,
  getInventory,
  patchInventory,
  getAdminProducts,
  getAdminProduct,
  getAdminCategories,
  getAdminCustomers,
  getAdminCustomer,
  patchAdminCustomer,
} from "../controllers/adminDashboardController.js";
import {
  getAdminOrdersHandler,
  getAdminOrderHandler,
  patchAdminOrderStatusHandler,
  patchAdminOrderTrackingHandler,
  patchAdminOrderNotesHandler,
  getAdminOrdersExportHandler,
  getAdminOrderStatsHandler,
} from "../controllers/adminOrderController.js";
import { uploadImage, deleteImage } from "../controllers/adminUploadController.js";
import { getAuditLogs } from "../controllers/adminAuditController.js";
import {
  getNotifications,
  getNotificationCount,
  patchNotificationRead,
  patchAllNotificationsRead,
  deleteNotificationHandler,
} from "../controllers/adminNotificationController.js";
import { getSettings, patchSettings } from "../controllers/adminSettingsController.js";
import {
  bulkProducts,
  exportProducts,
  exportCustomers,
  exportInventory,
  exportOrdersExcel,
} from "../controllers/adminOperationsController.js";
import {
  getAdminSupportRequests,
  getAdminSupportStats,
  getAdminSupportAdmins,
  getAdminSupportRequestById,
  postAdminSupportReply,
  patchAdminSupportStatus,
  patchAdminSupportAssign,
  deleteAdminSupportRequest,
} from "../controllers/adminSupportController.js";
import {
  getAdminConversations,
  getAdminConversationMessages,
  postAdminConversationMessage,
  patchAdminConversationRead,
  postAdminSupportAttachment,
  getAdminChatStats,
} from "../controllers/supportChatController.js";
import {
  getAdminSupportWorkspace,
  postAdminInternalNote,
  patchAdminConversationPriority,
  postAdminEscalateTicket,
  patchAdminWorkspaceAssign,
  patchAdminWorkspaceStatus,
  patchAdminWorkspaceShippingAddress,
  postAdminWorkspaceCancelOrder,
  postAdminWorkspaceRefund,
  postAdminWorkspaceApproveReturn,
  postAdminWorkspaceRejectReturn,
  postAdminWorkspaceReship,
  patchAdminConversationCustomerContact,
  patchAdminWorkspaceCustomerContact,
} from "../controllers/supportWorkspaceController.js";
import { requireSupportPermission } from "../middleware/supportPermissions.js";
import {
  getAdminGiftCardsHandler,
  getAdminGiftCardAnalyticsHandler,
  getAdminGiftCardHandler,
  postAdminGiftCardResend,
  deleteAdminGiftCardHandler,
  getAdminGiftCardTemplatesHandler,
  patchAdminGiftCardTemplateHandler,
} from "../controllers/adminGiftCardController.js";
import {
  getAdminWalletStats,
  getAdminWallets,
  postAdminWalletRefund,
} from "../controllers/adminWalletController.js";
import { supportAttachmentUpload } from "../middleware/supportUploadMiddleware.js";
import {
  getAdminMarketplaceConfig,
  postAnnouncement,
  patchAnnouncement,
  removeAnnouncement,
  postBrand,
  patchBrand,
  removeBrand,
  patchSortOption,
  patchFilterOption,
  getAdminCarts,
  getAdminWishlistItems,
} from "../controllers/marketplaceAdminController.js";
import { getAdminWishlistCollections } from "../controllers/adminWishlistController.js";
import { imageUpload } from "../middleware/uploadMiddleware.js";
import {
  orderIdParamSchema,
  orderListQuerySchema,
  adminUpdateStatusSchema,
  adminTrackingSchema,
  adminNotesSchema,
} from "../middleware/orderValidation.js";
import { z } from "zod";

const inventoryUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(0).optional(),
  reservedQuantity: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
});

const paginationQuerySchema = {
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().optional(),
  search: z.string().trim().max(255).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
};

const adminProductsQuerySchema = z.object({
  ...paginationQuerySchema,
  status: z.enum(["ACTIVE", "DRAFT", "OUT_OF_STOCK", "ARCHIVED"]).optional(),
  categoryId: z.string().uuid().optional(),
  brand: z.string().trim().max(255).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
  stockStatus: z.enum(["in", "low", "out"]).optional(),
});

const adminCategoriesQuerySchema = z.object({
  ...paginationQuerySchema,
  isActive: z.enum(["true", "false"]).optional(),
});

const adminCustomersQuerySchema = z.object({
  ...paginationQuerySchema,
  role: z.enum(["CUSTOMER", "SELLER", "ADMIN"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

const adminInventoryQuerySchema = z.object({
  ...paginationQuerySchema,
  status: z.enum(["ACTIVE", "DRAFT", "OUT_OF_STOCK", "ARCHIVED"]).optional(),
  categoryId: z.string().uuid().optional(),
  stockStatus: z.enum(["in", "low", "out"]).optional(),
});

const adminCustomerUpdateSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

const notificationIdParamSchema = z.object({
  id: z.string().uuid(),
});

const bulkProductBodySchema = z.object({
  productIds: z.array(z.string().uuid()).min(1).max(100),
  action: z.enum([
    "archive",
    "delete",
    "enable",
    "disable",
    "feature",
    "unfeature",
    "changeCategory",
  ]),
  categoryId: z.string().uuid().optional(),
});

const deleteImageBodySchema = z.object({
  url: z.string().url(),
});

const storeSettingsBodySchema = z.record(z.record(z.any()));

const router = Router();

router.use(requireAzureAuth, attachDbUser, requireAdmin);

router.get("/dashboard", asyncHandler(getDashboard));
router.get("/audit-log", asyncHandler(getAuditLogs));
router.get("/support/stats", asyncHandler(getAdminChatStats));
router.get("/support/conversations", asyncHandler(getAdminConversations));
router.get("/support/conversations/:id/workspace", validateParams(userIdParamSchema), asyncHandler(getAdminSupportWorkspace));
router.get("/support/conversations/:id/messages", validateParams(userIdParamSchema), asyncHandler(getAdminConversationMessages));
router.post("/support/conversations/:id/messages", validateParams(userIdParamSchema), asyncHandler(postAdminConversationMessage));
router.patch("/support/conversations/:id/read", validateParams(userIdParamSchema), asyncHandler(patchAdminConversationRead));
router.post("/support/conversations/:id/internal-notes", validateParams(userIdParamSchema), requireSupportPermission("notes"), asyncHandler(postAdminInternalNote));
router.patch("/support/conversations/:id/priority", validateParams(userIdParamSchema), requireSupportPermission("priority"), asyncHandler(patchAdminConversationPriority));
router.post("/support/conversations/:id/escalate", validateParams(userIdParamSchema), requireSupportPermission("escalate"), asyncHandler(postAdminEscalateTicket));
router.patch("/support/conversations/:id/workspace-assign", validateParams(userIdParamSchema), requireSupportPermission("assign"), asyncHandler(patchAdminWorkspaceAssign));
router.patch("/support/conversations/:id/workspace-status", validateParams(userIdParamSchema), requireSupportPermission("status"), asyncHandler(patchAdminWorkspaceStatus));
router.patch("/support/workspace/orders/:orderId/shipping-address", validateParams(orderIdParamSchema), requireSupportPermission("address"), asyncHandler(patchAdminWorkspaceShippingAddress));
router.post("/support/workspace/orders/:orderId/cancel", validateParams(orderIdParamSchema), requireSupportPermission("cancel"), asyncHandler(postAdminWorkspaceCancelOrder));
router.post("/support/workspace/orders/:orderId/refund", validateParams(orderIdParamSchema), requireSupportPermission("refund"), asyncHandler(postAdminWorkspaceRefund));
router.post("/support/workspace/orders/:orderId/return/approve", validateParams(orderIdParamSchema), requireSupportPermission("return"), asyncHandler(postAdminWorkspaceApproveReturn));
router.post("/support/workspace/orders/:orderId/return/reject", validateParams(orderIdParamSchema), requireSupportPermission("return"), asyncHandler(postAdminWorkspaceRejectReturn));
router.post("/support/workspace/orders/:orderId/reship", validateParams(orderIdParamSchema), requireSupportPermission("reship"), asyncHandler(postAdminWorkspaceReship));
router.patch("/support/conversations/:id/customer-contact", validateParams(userIdParamSchema), requireSupportPermission("customer_update"), asyncHandler(patchAdminConversationCustomerContact));
router.patch("/support/workspace/customers/:id/contact", validateParams(userIdParamSchema), requireSupportPermission("customer_update"), asyncHandler(patchAdminWorkspaceCustomerContact));
router.post("/support/uploads/attachment", supportAttachmentUpload.single("attachment"), asyncHandler(postAdminSupportAttachment));
router.get("/support/admins", asyncHandler(getAdminSupportAdmins));
router.get("/support/requests", asyncHandler(getAdminSupportRequests));
router.get("/support/requests/:id", validateParams(userIdParamSchema), asyncHandler(getAdminSupportRequestById));
router.post("/support/requests/:id/reply", validateParams(userIdParamSchema), asyncHandler(postAdminSupportReply));
router.patch("/support/requests/:id/status", validateParams(userIdParamSchema), asyncHandler(patchAdminSupportStatus));
router.patch("/support/requests/:id/assign", validateParams(userIdParamSchema), asyncHandler(patchAdminSupportAssign));
router.delete("/support/requests/:id", validateParams(userIdParamSchema), asyncHandler(deleteAdminSupportRequest));
router.get("/marketplace/config", asyncHandler(getAdminMarketplaceConfig));
router.post("/marketplace/announcements", asyncHandler(postAnnouncement));
router.patch("/marketplace/announcements/:id", validateParams(userIdParamSchema), asyncHandler(patchAnnouncement));
router.delete("/marketplace/announcements/:id", validateParams(userIdParamSchema), asyncHandler(removeAnnouncement));
router.post("/marketplace/brands", asyncHandler(postBrand));
router.patch("/marketplace/brands/:id", validateParams(userIdParamSchema), asyncHandler(patchBrand));
router.delete("/marketplace/brands/:id", validateParams(userIdParamSchema), asyncHandler(removeBrand));
router.patch("/marketplace/sort-options/:id", validateParams(userIdParamSchema), asyncHandler(patchSortOption));
router.patch("/marketplace/filter-options/:id", validateParams(userIdParamSchema), asyncHandler(patchFilterOption));
router.get("/carts", asyncHandler(getAdminCarts));
router.get("/wishlist-items", asyncHandler(getAdminWishlistItems));
router.get("/wishlists/collections", asyncHandler(getAdminWishlistCollections));

router.get("/notifications/count", asyncHandler(getNotificationCount));
router.get("/notifications", asyncHandler(getNotifications));
router.patch("/notifications/read-all", asyncHandler(patchAllNotificationsRead));
router.patch(
  "/notifications/:id/read",
  validateParams(notificationIdParamSchema),
  asyncHandler(patchNotificationRead),
);
router.delete(
  "/notifications/:id",
  validateParams(notificationIdParamSchema),
  asyncHandler(deleteNotificationHandler),
);

router.get("/settings", asyncHandler(getSettings));
router.patch("/settings", validateBody(storeSettingsBodySchema), asyncHandler(patchSettings));

router.post("/uploads/image", imageUpload.single("image"), asyncHandler(uploadImage));
router.delete("/uploads/image", validateBody(deleteImageBodySchema), asyncHandler(deleteImage));

router.get("/products/export", validateQuery(adminProductsQuerySchema), asyncHandler(exportProducts));
router.post("/products/bulk", validateBody(bulkProductBodySchema), asyncHandler(bulkProducts));
router.get("/products", validateQuery(adminProductsQuerySchema), asyncHandler(getAdminProducts));
router.get(
  "/products/:id",
  validateParams(productIdParamSchema),
  asyncHandler(getAdminProduct),
);

router.get("/categories", validateQuery(adminCategoriesQuerySchema), asyncHandler(getAdminCategories));
router.get(
  "/customers/export",
  validateQuery(adminCustomersQuerySchema),
  asyncHandler(exportCustomers),
);
router.get(
  "/customers",
  validateQuery(adminCustomersQuerySchema),
  asyncHandler(getAdminCustomers),
);
router.get(
  "/customers/:id",
  validateParams(userIdParamSchema),
  asyncHandler(getAdminCustomer),
);
router.patch(
  "/customers/:id",
  validateParams(userIdParamSchema),
  validateBody(adminCustomerUpdateSchema),
  asyncHandler(patchAdminCustomer),
);

router.get("/orders/stats", asyncHandler(getAdminOrderStatsHandler));
router.get("/orders/export", validateQuery(orderListQuerySchema), asyncHandler(getAdminOrdersExportHandler));
router.get(
  "/orders/export/excel",
  validateQuery(orderListQuerySchema),
  asyncHandler(exportOrdersExcel),
);
router.get("/orders", validateQuery(orderListQuerySchema), asyncHandler(getAdminOrdersHandler));
router.get("/orders/:id", validateParams(orderIdParamSchema), asyncHandler(getAdminOrderHandler));
router.patch(
  "/orders/:id/status",
  validateParams(orderIdParamSchema),
  validateBody(adminUpdateStatusSchema),
  asyncHandler(patchAdminOrderStatusHandler),
);
router.patch(
  "/orders/:id/tracking",
  validateParams(orderIdParamSchema),
  validateBody(adminTrackingSchema),
  asyncHandler(patchAdminOrderTrackingHandler),
);
router.patch(
  "/orders/:id/notes",
  validateParams(orderIdParamSchema),
  validateBody(adminNotesSchema),
  asyncHandler(patchAdminOrderNotesHandler),
);

router.get("/inventory/export", asyncHandler(exportInventory));
router.get("/inventory", validateQuery(adminInventoryQuerySchema), asyncHandler(getInventory));
router.patch(
  "/inventory/:id",
  validateParams(productIdParamSchema),
  validateBody(inventoryUpdateSchema),
  asyncHandler(patchInventory),
);

router.post("/categories", validateBody(createCategoryBodySchema), asyncHandler(postCategory));
router.patch(
  "/categories/:id",
  validateParams(categoryIdParamSchema),
  validateBody(updateCategoryBodySchema),
  asyncHandler(patchCategory),
);
router.delete(
  "/categories/:id",
  validateParams(categoryIdParamSchema),
  asyncHandler(removeCategory),
);

router.post("/products", validateBody(createProductBodySchema), asyncHandler(postProduct));
router.patch(
  "/products/:id",
  validateParams(productIdParamSchema),
  validateBody(updateProductBodySchema),
  asyncHandler(patchProduct),
);
router.delete(
  "/products/:id",
  validateParams(productIdParamSchema),
  asyncHandler(removeProduct),
);

router.get("/gift-cards/analytics", asyncHandler(getAdminGiftCardAnalyticsHandler));
router.get("/gift-cards/templates", asyncHandler(getAdminGiftCardTemplatesHandler));
router.patch("/gift-cards/templates/:id", validateParams(userIdParamSchema), asyncHandler(patchAdminGiftCardTemplateHandler));
router.get("/gift-cards", asyncHandler(getAdminGiftCardsHandler));
router.get("/gift-cards/:id", validateParams(userIdParamSchema), asyncHandler(getAdminGiftCardHandler));
router.post("/gift-cards/:id/resend", validateParams(userIdParamSchema), asyncHandler(postAdminGiftCardResend));
router.delete("/gift-cards/:id", validateParams(userIdParamSchema), asyncHandler(deleteAdminGiftCardHandler));

router.get("/wallets/analytics", asyncHandler(getAdminWalletStats));
router.get("/wallets", asyncHandler(getAdminWallets));

export default router;
