import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import addressRoutes from "./addressRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";
import cartRoutes from "./cartRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import supportRoutes from "./supportRoutes.js";
import marketplaceRoutes from "./marketplaceRoutes.js";
import adminRoutes from "./adminRoutes.js";
import checkoutRoutes from "./checkoutRoutes.js";
import giftCardRoutes from "./giftCardRoutes.js";
import walletRoutes from "./walletRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import { prisma } from "../database/prismaClient.js";
import { databaseState } from "../database/connectionState.js";
import { pingDatabase, reconnectDatabase } from "../database/connectionManager.js";
import { syncUser } from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { validateBody, syncUserBodySchema } from "../middleware/validateRequest.js";

const router = Router();

router.get("/health", async (_req, res) => {
  try {
    await pingDatabase(prisma);
    return res.json({
      status: "ok",
      database: "connected",
      host: databaseState.host,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    void reconnectDatabase();
    return res.status(503).json({
      status: "degraded",
      database: "disconnected",
      reason: error?.message ?? databaseState.lastError ?? "Database ping failed",
      host: databaseState.host,
      timestamp: new Date().toISOString(),
    });
  }
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/addresses", addressRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/support", supportRoutes);
router.use("/gift-cards", giftCardRoutes);
router.use("/wallet", walletRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/marketplace", marketplaceRoutes);
router.use("/", checkoutRoutes);
router.use("/admin", adminRoutes);

/** @deprecated Legacy path — forwards to auth sync handler */
router.post(
  "/users/login",
  authRateLimiter,
  validateBody(syncUserBodySchema),
  asyncHandler(syncUser),
);

export default router;
