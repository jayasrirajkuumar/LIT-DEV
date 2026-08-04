import { prisma } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { getOrderCancelEligibility } from "../utils/orderCancelHelpers.js";
import { isInStock, availableQuantity } from "../utils/inventoryHelpers.js";
import { calculateOrderTotals, generateOrderNumber } from "../utils/orderHelpers.js";
import { toPublicOrder } from "../utils/orderMappers.js";
import { cartRepository } from "../repositories/cartRepository.js";
import { addressRepository } from "../repositories/addressRepository.js";
import { orderRepository } from "../repositories/orderRepository.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { getPaymentProvider } from "./payments/paymentProviderFactory.js";
import { notificationService } from "./notificationService.js";
import { userRepository } from "../repositories/userRepository.js";
import { logger } from "../utils/logger.js";
import { productRepository } from "../repositories/productRepository.js";
import { auditLogService } from "./auditLogService.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";

const DELIVERY_OPTIONS = [
  { id: "STANDARD", label: "Standard Delivery", charge: 99, estimate: "5–7 business days" },
  { id: "EXPRESS", label: "Express Delivery", charge: 199, estimate: "2–3 business days" },
];

function buildShippingSnapshot(address) {
  return {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };
}

function validateLineItemsStock(lineItems) {
  if (!lineItems?.length) {
    throw new AppError("Your cart is empty.", 400, "CART_EMPTY");
  }

  for (const item of lineItems) {
    const inventory = item.product?.inventory;
    if (!inventory || !isInStock(inventory, item.quantity)) {
      throw new AppError(
        `Insufficient stock for ${item.product.name}. Available: ${availableQuantity(inventory)}`,
        409,
        "INSUFFICIENT_STOCK",
      );
    }
  }
}

async function resolveCheckoutLineItems(userId, payload = {}) {
  const checkoutMode = payload.checkoutMode ?? "cart";

  if (checkoutMode === "buy_now") {
    const productId = payload.buyNow?.productId;
    const quantity = payload.buyNow?.quantity ?? 1;

    if (!productId) {
      throw new AppError("Product is required for Buy Now checkout.", 400, "VALIDATION_ERROR");
    }

    const product = await productRepository.findById(productId);
    if (!product || product.status === "ARCHIVED") {
      throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
    }

    const lineItems = [{ productId: product.id, product, quantity }];
    validateLineItemsStock(lineItems);
    return { lineItems, checkoutMode: "buy_now" };
  }

  const cart = await cartRepository.findByUserId(userId);
  validateCartStock(cart);
  const lineItems = cart.items.map((item) => ({
    productId: item.productId,
    product: item.product,
    quantity: item.quantity,
  }));

  return { lineItems, checkoutMode: "cart", cart };
}

function validateCartStock(cart) {
  if (!cart?.items?.length) {
    throw new AppError("Your cart is empty.", 400, "CART_EMPTY");
  }

  for (const item of cart.items) {
    const inventory = item.product?.inventory;
    if (!inventory || !isInStock(inventory, item.quantity)) {
      throw new AppError(
        `Insufficient stock for ${item.product.name}. Available: ${availableQuantity(inventory)}`,
        409,
        "INSUFFICIENT_STOCK",
      );
    }
  }
}

export async function getCheckoutPreview(userId, payload = {}) {
  const { lineItems, checkoutMode, cart } = await resolveCheckoutLineItems(userId, payload);

  const addresses = await addressRepository.findAllByUserId(userId);
  const deliveryMethod = payload.deliveryMethod ?? "STANDARD";
  const discount = payload.couponCode ? 0 : 0;

  const itemsSubtotal = lineItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const totals = calculateOrderTotals({ itemsSubtotal, deliveryMethod, discount });

  const previewCart =
    checkoutMode === "buy_now"
      ? {
          id: null,
          userId,
          items: lineItems.map((item) => ({
            id: `buy-now-${item.productId}`,
            productId: item.productId,
            quantity: item.quantity,
            product: item.product,
          })),
          itemCount: lineItems.length,
        }
      : cart;

  return {
    cart: previewCart,
    checkoutMode,
    buyNow: checkoutMode === "buy_now" ? payload.buyNow : null,
    addresses,
    deliveryOptions: DELIVERY_OPTIONS,
    selectedAddressId: payload.addressId ?? addresses.find((a) => a.isDefault)?.id ?? null,
    deliveryMethod,
    couponCode: payload.couponCode ?? null,
    giftMessage: payload.giftMessage ?? null,
    orderNotes: payload.orderNotes ?? null,
    totals,
    paymentProviders: ["MOCK", "RAZORPAY"],
  };
}

export async function resolveShippingAddress(userId, payload) {
  if (payload.shippingAddress) {
    return buildShippingSnapshot(payload.shippingAddress);
  }

  if (payload.addressId) {
    const address = await addressRepository.findByIdForUser(payload.addressId, userId);
    if (!address) {
      throw new AppError("Selected address not found.", 404, "ADDRESS_NOT_FOUND");
    }
    return buildShippingSnapshot(address);
  }

  throw new AppError("A shipping address is required.", 400, "ADDRESS_REQUIRED");
}

export async function createOrder(userId, payload) {
  const { lineItems, checkoutMode } = await resolveCheckoutLineItems(userId, payload);

  const shippingSnapshot = await resolveShippingAddress(userId, payload);
  const deliveryMethod = payload.deliveryMethod ?? "STANDARD";
  const paymentProviderName = payload.paymentProvider ?? "MOCK";
  const paymentMethod = payload.paymentMethod ?? "mock_card";

  const itemsSubtotal = lineItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const totals = calculateOrderTotals({
    itemsSubtotal,
    deliveryMethod,
    discount: 0,
  });

  const user = await userRepository.findById(userId);
  const provider = getPaymentProvider(paymentProviderName);

  const order = await prisma.$transaction(async (tx) => {
    for (const item of lineItems) {
      const inventory = await tx.productInventory.findUnique({
        where: { productId: item.productId },
      });

      if (!inventory || !isInStock(inventory, item.quantity)) {
        throw new AppError(
          `Insufficient stock for ${item.product.name}.`,
          409,
          "INSUFFICIENT_STOCK",
        );
      }

      await tx.productInventory.update({
        where: { productId: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    const orderNumber = generateOrderNumber();
    const created = await tx.order.create({
      data: {
        userId,
        orderNumber,
        subtotal: totals.subtotal,
        shippingCharge: totals.shippingCharge,
        tax: totals.tax,
        discount: totals.discount,
        grandTotal: totals.grandTotal,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        paymentMethod,
        currency: "INR",
        deliveryMethod,
        deliveryEstimate: totals.deliveryEstimate,
        couponCode: payload.couponCode ?? null,
        giftMessage: payload.giftMessage ?? null,
        orderNotes: payload.orderNotes ?? null,
        items: {
          create: lineItems.map((item) => ({
            productId: item.productId,
            productNameSnapshot: item.product.name,
            skuSnapshot: item.product.sku,
            priceSnapshot: item.product.price,
            quantity: item.quantity,
            subtotal: Number(item.product.price) * item.quantity,
          })),
        },
        shippingAddress: {
          create: shippingSnapshot,
        },
        statusHistory: {
          create: {
            status: "PENDING",
            note: checkoutMode === "buy_now" ? "Buy Now order placed" : "Order placed",
            changedBy: userId,
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
              },
            },
          },
        },
        shippingAddress: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
        paymentIntents: { include: { transactions: true } },
      },
    });

    const providerIntent = await provider.createIntent({
      amount: totals.grandTotal,
      currency: "INR",
      orderId: created.id,
      orderNumber,
    });

    const paymentIntent = await tx.paymentIntent.create({
      data: {
        orderId: created.id,
        userId,
        provider: paymentProviderName,
        amount: totals.grandTotal,
        currency: "INR",
        status: "PENDING",
        providerRef: providerIntent.providerRef,
        metadata: providerIntent.metadata ?? {},
      },
    });

    const captureResult = await provider.capturePayment({
      paymentIntentId: paymentIntent.id,
      amount: totals.grandTotal,
      currency: "INR",
      orderNumber,
    });

    await tx.paymentTransaction.create({
      data: {
        paymentIntentId: paymentIntent.id,
        provider: paymentProviderName,
        status: captureResult.status,
        amount: totals.grandTotal,
        currency: "INR",
        providerTxnId: captureResult.providerTxnId,
        rawResponse: captureResult.rawResponse ?? {},
      },
    });

    await tx.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: { status: "CAPTURED", providerRef: captureResult.providerTxnId },
    });

    const confirmed = await tx.order.update({
      where: { id: created.id },
      data: {
        paymentStatus: "CAPTURED",
        orderStatus: "CONFIRMED",
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
              },
            },
          },
        },
        shippingAddress: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
        paymentIntents: { include: { transactions: { orderBy: { createdAt: "desc" } } } },
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: created.id,
        status: "CONFIRMED",
        note: "Payment captured",
        changedBy: userId,
      },
    });

    if (checkoutMode !== "buy_now") {
      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }
    }

    return confirmed;
  });

  await notificationService.orderPlaced({
    userId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    email: user?.email,
  });

  await notificationService.paymentSuccess({
    userId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: order.grandTotal.toString(),
    email: user?.email,
  });

  const { adminNotificationService } = await import("./adminNotificationService.js");
  try {
    await adminNotificationService.notifyNewOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.grandTotal.toString(),
    });
  } catch (err) {
    logger.warn("Admin notification skipped after order placement", {
      orderId: order.id,
      message: err.message,
    });
  }

  return toPublicOrder(order);
}

export async function listUserOrders(userId, filters = {}) {
  return orderRepository.listByUserId(userId, filters);
}

export async function getUserOrder(userId, orderId) {
  const order = await orderRepository.findByIdForUser(orderId, userId);
  if (!order) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }
  return order;
}

export async function cancelUserOrder(userId, orderId, payload = {}) {
  const reasonCode = payload.reasonCode ?? (payload.reason ? "OTHER" : "CHANGED_MIND");
  const reasonText =
    payload.reasonText?.trim() ||
    (payload.reason && reasonCode === "OTHER" ? payload.reason : null) ||
    null;

  if (reasonCode === "OTHER" && !reasonText) {
    throw new AppError("Please provide a cancellation reason.", 400, "VALIDATION_ERROR");
  }

  const existing = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });

  if (!existing) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }

  const { canCancel, cancelWindowExpired } = getOrderCancelEligibility(existing);
  if (!canCancel) {
    if (cancelWindowExpired) {
      throw new AppError(
        "Cancellation window has expired.",
        409,
        "CANCEL_WINDOW_EXPIRED",
      );
    }
    throw new AppError("This order cannot be cancelled.", 409, "ORDER_NOT_CANCELLABLE");
  }

  const cancellable = ["PENDING", "CONFIRMED", "PROCESSING"];
  if (!cancellable.includes(existing.orderStatus)) {
    throw new AppError("This order cannot be cancelled.", 409, "ORDER_NOT_CANCELLABLE");
  }

  const order = await prisma.$transaction(async (tx) => {
    for (const item of existing.items) {
      await tx.productInventory.update({
        where: { productId: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "CANCELLED",
        paymentStatus: existing.paymentStatus === "CAPTURED" ? "REFUNDED" : "CANCELLED",
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
              },
            },
          },
        },
        shippingAddress: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
        paymentIntents: { include: { transactions: true } },
        cancellationReason: true,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "CANCELLED",
        note: reasonText || reasonCode.replace(/_/g, " ").toLowerCase(),
        changedBy: userId,
      },
    });

    await tx.orderCancellationReason.create({
      data: {
        orderId,
        reasonCode,
        reasonText,
      },
    });

    return updated;
  });

  const { adminNotificationService } = await import("./adminNotificationService.js");
  try {
    await adminNotificationService.notifyCancelledOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    logger.warn("Admin cancellation notification skipped", { message: err.message });
  }

  try {
    await auditLogService.record({
      adminUserId: null,
      action: AUDIT_ACTIONS.ORDER_UPDATED,
      entityType: "order",
      entityId: orderId,
      metadata: { status: "CANCELLED", reasonCode, reasonText, cancelledBy: userId },
    });
  } catch (err) {
    logger.warn("Audit log skipped for cancellation", { message: err.message });
  }

  return toPublicOrder(order);
}

export async function reorder(userId, orderId) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });

  if (!order) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }

  for (const item of order.items) {
    await cartRepository.addItem(userId, item.productId, item.quantity);
  }

  return cartRepository.findByUserId(userId);
}

export default {
  getCheckoutPreview,
  createOrder,
  listUserOrders,
  getUserOrder,
  cancelUserOrder,
  reorder,
};
