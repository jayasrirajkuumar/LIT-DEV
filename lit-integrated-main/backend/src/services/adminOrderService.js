import { prisma } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { toPublicOrder } from "../utils/orderMappers.js";
import { orderRepository } from "../repositories/orderRepository.js";
import { notificationService } from "./notificationService.js";
import { adminNotificationService } from "./adminNotificationService.js";
import { auditLogService } from "./auditLogService.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import { userRepository } from "../repositories/userRepository.js";

const VALID_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: ["RETURNED"],
  RETURNED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export async function listAdminOrders(filters = {}) {
  const result = await orderRepository.listAll(filters);
  if (result?.pagination) return result;
  return { orders: result, pagination: { page: 1, limit: result.length, total: result.length, totalPages: 1 } };
}

export async function getAdminOrder(orderId) {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }
  return order;
}

export async function updateAdminOrderStatus(orderId, adminUserId, payload) {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!existing) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }

  const nextStatus = payload.status;
  const allowed = VALID_TRANSITIONS[existing.orderStatus] ?? [];

  if (!allowed.includes(nextStatus) && existing.orderStatus !== nextStatus) {
    throw new AppError(
      `Cannot transition from ${existing.orderStatus} to ${nextStatus}.`,
      409,
      "INVALID_STATUS_TRANSITION",
    );
  }

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { orderStatus: nextStatus },
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
        status: nextStatus,
        note: payload.note || `Status updated to ${nextStatus}`,
        changedBy: adminUserId,
      },
    });

    return updated;
  });

  if (nextStatus === "SHIPPED") {
    await notificationService.orderShipped({
      userId: order.userId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      email: order.user?.email,
    });
  }

  if (nextStatus === "DELIVERED") {
    await notificationService.orderDelivered({
      userId: order.userId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      email: order.user?.email,
    });
  }

  if (nextStatus === "CANCELLED") {
    await adminNotificationService.notifyCancelledOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  }

  await auditLogService.record({
    adminUserId,
    action: AUDIT_ACTIONS.ORDER_UPDATED,
    entityType: "order",
    entityId: orderId,
    metadata: { status: nextStatus },
  });

  return toPublicOrder(order, { includeAdmin: true });
}

export async function updateAdminOrderTracking(orderId, adminUserId, payload) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { trackingNumber: payload.trackingNumber },
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

  if (!order) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }

  await orderRepository.addStatusHistory(
    orderId,
    order.orderStatus,
    `Tracking updated: ${payload.trackingNumber}`,
    adminUserId,
  );

  return toPublicOrder(order, { includeAdmin: true });
}

export async function updateAdminOrderNotes(orderId, payload) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { adminNotes: payload.adminNotes },
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

  if (!order) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }

  return toPublicOrder(order, { includeAdmin: true });
}

export async function exportAdminOrders(filters = {}) {
  const result = await orderRepository.listAll({ ...filters, page: 1, limit: 10000 });
  const orders = result.orders ?? result;
  const header = [
    "orderNumber",
    "email",
    "orderStatus",
    "paymentStatus",
    "grandTotal",
    "createdAt",
  ];
  const rows = orders.map((order) =>
    [
      order.orderNumber,
      order.customer?.email ?? "",
      order.orderStatus,
      order.paymentStatus,
      order.grandTotal,
      order.createdAt,
    ].join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

export async function getAdminOrderStats() {
  return orderRepository.countByStatus();
}

export default {
  listAdminOrders,
  getAdminOrder,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
  updateAdminOrderNotes,
  exportAdminOrders,
  getAdminOrderStats,
};
