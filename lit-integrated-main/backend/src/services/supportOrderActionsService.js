import { prisma } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { toPublicOrder } from "../utils/orderMappers.js";
import { updateAdminOrderStatus, updateAdminOrderTracking } from "./adminOrderService.js";
import { createUserNotification } from "./customerNotificationService.js";
import { logSupportActivity } from "./supportActivityService.js";
import { auditLogService } from "./auditLogService.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";

const DELIVERED_STATUSES = new Set(["DELIVERED", "RETURNED", "REFUNDED"]);
const SHIPPED_STATUSES = new Set(["SHIPPED", "OUT_FOR_DELIVERY", ...DELIVERED_STATUSES]);

function loyaltyTierFromSpend(total) {
  const amount = Number(total) || 0;
  if (amount >= 100000) return "Platinum";
  if (amount >= 50000) return "Gold";
  if (amount >= 20000) return "Silver";
  return "Bronze";
}

export async function updateOrderShippingFromSupport({
  orderId,
  conversationId,
  adminUserId,
  payload,
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shippingAddress: true, user: true },
  });

  if (!order) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }

  const warnings = [];
  if (DELIVERED_STATUSES.has(order.orderStatus)) {
    throw new AppError("Cannot edit shipping address on a delivered order.", 409, "ORDER_DELIVERED");
  }
  if (SHIPPED_STATUSES.has(order.orderStatus)) {
    warnings.push("Order has already shipped. Address change may not reach the courier.");
  }

  const addressData = {
    fullName: payload.fullName?.trim(),
    phone: payload.phone?.trim(),
    addressLine1: payload.addressLine1?.trim(),
    addressLine2: payload.addressLine2?.trim() || null,
    city: payload.city?.trim(),
    state: payload.state?.trim(),
    country: payload.country?.trim(),
    postalCode: payload.postalCode?.trim(),
  };

  await prisma.orderShippingAddress.upsert({
    where: { orderId },
    create: { orderId, ...addressData },
    update: addressData,
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: order.orderStatus,
      note: "Shipping address updated from support workspace",
      changedBy: adminUserId,
    },
  });

  const refreshed = await prisma.order.findUnique({
    where: { id: orderId },
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
      user: { select: { id: true, email: true, displayName: true, phoneNumber: true } },
    },
  });

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "ADDRESS_UPDATED",
    message: `Shipping address updated for order ${order.orderNumber}`,
    metadata: { orderId, orderNumber: order.orderNumber },
  });

  await createUserNotification({
    userId: order.userId,
    type: "ADDRESS_UPDATED",
    title: "Shipping address updated",
    message: `Your shipping address for order ${order.orderNumber} has been updated.`,
    entityType: "order",
    entityId: order.id,
  });

  await auditLogService.record({
    adminUserId,
    action: AUDIT_ACTIONS.ORDER_UPDATED,
    entityType: "order",
    entityId: orderId,
    metadata: { action: "shipping_address_updated", conversationId },
  });

  return { order: toPublicOrder(refreshed, { includeAdmin: true }), warnings };
}

const CANCEL_REASON_MAP = {
  CUSTOMER_REQUEST: "CHANGED_MIND",
  DUPLICATE_ORDER: "ORDERED_BY_MISTAKE",
  PAYMENT_FAILED: "PAYMENT_ISSUE",
  OUT_OF_STOCK: "OTHER",
  FRAUD_DETECTION: "OTHER",
  OTHER: "OTHER",
};

export async function cancelOrderFromSupport({
  orderId,
  conversationId,
  adminUserId,
  reasonCode,
  reasonText,
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });

  if (!order) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }

  const cancellable = ["PENDING", "CONFIRMED", "PROCESSING", "PACKED"];
  if (!cancellable.includes(order.orderStatus)) {
    throw new AppError(`Order in ${order.orderStatus} cannot be cancelled.`, 409, "ORDER_NOT_CANCELLABLE");
  }

  const mappedReason = CANCEL_REASON_MAP[reasonCode] || "OTHER";

  const updated = await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.productInventory.update({
        where: { productId: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    const result = await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "CANCELLED",
        paymentStatus: order.paymentStatus === "CAPTURED" ? "REFUNDED" : "CANCELLED",
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
        user: { select: { id: true, email: true, displayName: true, phoneNumber: true } },
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "CANCELLED",
        note: reasonText || reasonCode,
        changedBy: adminUserId,
      },
    });

    await tx.orderCancellationReason.upsert({
      where: { orderId },
      create: { orderId, reasonCode: mappedReason, reasonText: reasonText || reasonCode },
      update: { reasonCode: mappedReason, reasonText: reasonText || reasonCode },
    });

    return result;
  });

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "ORDER_CANCELLED",
    message: `Order ${order.orderNumber} cancelled (${reasonCode})`,
    metadata: { orderId, reasonCode },
  });

  await createUserNotification({
    userId: order.userId,
    type: "ORDER_CANCELLED",
    title: "Order cancelled",
    message: `Your order ${order.orderNumber} has been cancelled.`,
    entityType: "order",
    entityId: order.id,
  });

  await auditLogService.record({
    adminUserId,
    action: AUDIT_ACTIONS.ORDER_UPDATED,
    entityType: "order",
    entityId: orderId,
    metadata: { status: "CANCELLED", reasonCode, conversationId },
  });

  return toPublicOrder(updated, { includeAdmin: true });
}

export async function initiateRefundFromSupport({
  orderId,
  conversationId,
  adminUserId,
  refundType = "FULL",
  amount,
  reason,
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { paymentIntents: { include: { transactions: true } }, user: true },
  });

  if (!order) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }

  const orderTotal = Number(order.grandTotal);
  const refundAmount = refundType === "PARTIAL" ? Number(amount) : orderTotal;

  if (!refundAmount || refundAmount <= 0 || refundAmount > orderTotal) {
    throw new AppError("Invalid refund amount.", 400, "VALIDATION_ERROR");
  }

  let updated;
  if (order.orderStatus === "DELIVERED") {
    updated = await updateAdminOrderStatus(orderId, adminUserId, {
      status: "RETURNED",
      note: reason || "Return initiated from support",
    });
    updated = await updateAdminOrderStatus(orderId, adminUserId, {
      status: "REFUNDED",
      note: `${refundType} refund of ${refundAmount}`,
    });
  } else if (order.orderStatus === "RETURNED") {
    updated = await updateAdminOrderStatus(orderId, adminUserId, {
      status: "REFUNDED",
      note: `${refundType} refund of ${refundAmount}`,
    });
  } else if (["CANCELLED"].includes(order.orderStatus)) {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "REFUNDED" },
    });
    updated = await prisma.order.findUnique({
      where: { id: orderId },
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
        user: { select: { id: true, email: true, displayName: true, phoneNumber: true } },
      },
    });
    updated = toPublicOrder(updated, { includeAdmin: true });
  } else {
    throw new AppError(
      `Refund not available for order status ${order.orderStatus}.`,
      409,
      "REFUND_NOT_AVAILABLE",
    );
  }

  const intent = order.paymentIntents?.[0];
  if (intent) {
    await prisma.paymentTransaction.create({
      data: {
        paymentIntentId: intent.id,
        provider: intent.provider,
        status: "REFUNDED",
        amount: refundAmount,
        currency: intent.currency,
        providerTxnId: `refund-${Date.now()}`,
        rawResponse: { reason, refundType, initiatedBy: adminUserId },
      },
    });
  }

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "REFUND_INITIATED",
    message: `${refundType} refund of ₹${refundAmount} for order ${order.orderNumber}`,
    metadata: { orderId, refundType, refundAmount, reason },
  });

  await createUserNotification({
    userId: order.userId,
    type: "REFUND_INITIATED",
    title: "Refund initiated",
    message: `A ${refundType.toLowerCase()} refund has been initiated for order ${order.orderNumber}.`,
    entityType: "order",
    entityId: order.id,
  });

  return { order: updated, refundAmount, refundType };
}

export async function approveReturnFromSupport({ orderId, conversationId, adminUserId, note }) {
  const updated = await updateAdminOrderStatus(orderId, adminUserId, {
    status: "RETURNED",
    note: note || "Return approved from support",
  });

  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, orderNumber: true } });

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "RETURN_APPROVED",
    message: `Return approved for order ${order.orderNumber}`,
    metadata: { orderId },
  });

  await createUserNotification({
    userId: order.userId,
    type: "RETURN_APPROVED",
    title: "Return approved",
    message: `Your return request for order ${order.orderNumber} has been approved.`,
    entityType: "order",
    entityId: orderId,
  });

  return updated;
}

export async function rejectReturnFromSupport({ orderId, conversationId, adminUserId, note }) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, orderNumber: true } });

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "RETURN_REJECTED",
    message: `Return rejected for order ${order.orderNumber}`,
    metadata: { orderId, note },
  });

  await createUserNotification({
    userId: order.userId,
    type: "RETURN_REJECTED",
    title: "Return request update",
    message: `Your return request for order ${order.orderNumber} could not be approved.`,
    entityType: "order",
    entityId: orderId,
  });

  return { orderId, rejected: true };
}

export async function reshipOrderFromSupport({
  orderId,
  conversationId,
  adminUserId,
  trackingNumber,
  courier,
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }

  if (trackingNumber) {
    await updateAdminOrderTracking(orderId, adminUserId, { trackingNumber });
  }

  const updated = await updateAdminOrderStatus(orderId, adminUserId, {
    status: "SHIPPED",
    note: courier ? `Reshipped via ${courier}` : "Replacement / reshipment created",
  });

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "RESHIP_CREATED",
    message: `Reshipment created for order ${order.orderNumber}`,
    metadata: { orderId, trackingNumber, courier },
  });

  await createUserNotification({
    userId: order.userId,
    type: "RESHIP_CREATED",
    title: "Replacement shipped",
    message: `Your replacement for order ${order.orderNumber} has been shipped.`,
    entityType: "order",
    entityId: order.id,
  });

  return updated;
}

export async function ensureConversationUserLinked(conversation) {
  if (conversation.userId) {
    return conversation.userId;
  }

  const email = conversation.contactEmail?.toLowerCase();
  if (!email) return null;

  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true },
  });

  if (!user) return null;

  await prisma.supportRequest.update({
    where: { id: conversation.id },
    data: { userId: user.id },
  });

  return user.id;
}

export async function updateCustomerContactFromSupport({
  userId,
  conversationId,
  adminUserId,
  email,
  phoneNumber,
}) {
  const data = {};
  if (email) data.email = email.trim().toLowerCase();
  if (phoneNumber) data.phoneNumber = phoneNumber.trim();

  if (!Object.keys(data).length) {
    throw new AppError("No fields to update.", 400, "VALIDATION_ERROR");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      displayName: true,
      phoneNumber: true,
      createdAt: true,
    },
  });

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "CUSTOMER_UPDATED",
    message: "Customer contact details updated",
    metadata: { userId, fields: Object.keys(data) },
  });

  await createUserNotification({
    userId,
    type: "PROFILE_UPDATED",
    title: "Account updated",
    message: "Your account contact details have been updated by our support team.",
    entityType: "user",
    entityId: userId,
  });

  return updated;
}

export async function updateCustomerContactByConversation({
  conversationId,
  adminUserId,
  email,
  phoneNumber,
}) {
  const conversation = await prisma.supportRequest.findUnique({
    where: { id: conversationId },
    select: { id: true, userId: true, contactEmail: true },
  });

  if (!conversation) {
    throw new AppError("Conversation not found.", 404, "NOT_FOUND");
  }

  let userId = await ensureConversationUserLinked(conversation);

  if (!userId) {
    throw new AppError(
      "No registered account found for this ticket email. The customer must sign up with the same email, or you can confirm the new phone number via chat reply.",
      404,
      "USER_NOT_FOUND",
    );
  }

  return updateCustomerContactFromSupport({
    userId,
    conversationId,
    adminUserId,
    email,
    phoneNumber,
  });
}

export async function getCustomerInsights(userId, contactEmail) {
  let user = null;

  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      },
    });
  }

  if (!user && contactEmail) {
    user = await prisma.user.findFirst({
      where: { email: contactEmail.toLowerCase() },
      include: {
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      },
    });
  }

  if (!user) {
    return {
      id: null,
      displayName: null,
      email: contactEmail,
      phoneNumber: null,
      createdAt: null,
      totalOrders: 0,
      lifetimeSpend: "0",
      loyaltyTier: "Bronze",
      defaultShippingAddress: null,
      defaultBillingAddress: null,
    };
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    select: { grandTotal: true, paymentStatus: true },
  });

  const paidOrders = orders.filter((o) => o.paymentStatus === "CAPTURED" || o.paymentStatus === "REFUNDED");
  const lifetimeSpend = paidOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

  const defaultShipping = user.addresses.find((a) => a.isDefault && a.addressType === "SHIPPING")
    || user.addresses.find((a) => a.addressType === "SHIPPING")
    || user.addresses[0]
    || null;

  const defaultBilling = user.addresses.find((a) => a.isDefault && a.addressType === "BILLING")
    || user.addresses.find((a) => a.addressType === "BILLING")
    || defaultShipping;

  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    createdAt: user.createdAt.toISOString(),
    totalOrders: orders.length,
    lifetimeSpend: String(lifetimeSpend),
    loyaltyTier: loyaltyTierFromSpend(lifetimeSpend),
    defaultShippingAddress: defaultShipping,
    defaultBillingAddress: defaultBilling,
  };
}

export default {
  updateOrderShippingFromSupport,
  cancelOrderFromSupport,
  initiateRefundFromSupport,
  approveReturnFromSupport,
  rejectReturnFromSupport,
  reshipOrderFromSupport,
  updateCustomerContactFromSupport,
  updateCustomerContactByConversation,
  ensureConversationUserLinked,
  getCustomerInsights,
};
