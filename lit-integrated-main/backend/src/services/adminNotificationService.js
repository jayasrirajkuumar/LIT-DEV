import { prisma } from "../database/prismaClient.js";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import { isLowStock } from "../utils/inventoryHelpers.js";

async function createIfNotExists({ type, title, message, entityType, entityId }) {
  const existing = await prisma.adminNotification.findFirst({
    where: {
      type,
      entityType: entityType ?? null,
      entityId: entityId ? String(entityId) : null,
      isRead: false,
    },
  });

  if (existing) return existing;

  return prisma.adminNotification.create({
    data: {
      type,
      title,
      message,
      entityType: entityType ?? null,
      entityId: entityId ? String(entityId) : null,
    },
  });
}

export async function notifyNewOrder({ orderId, orderNumber, total }) {
  return createIfNotExists({
    type: NOTIFICATION_TYPES.NEW_ORDER,
    title: "New order received",
    message: `Order ${orderNumber} for ₹${total} was placed.`,
    entityType: "order",
    entityId: orderId,
  });
}

export async function notifyCancelledOrder({ orderId, orderNumber }) {
  return createIfNotExists({
    type: NOTIFICATION_TYPES.CANCELLED_ORDER,
    title: "Order cancelled",
    message: `Order ${orderNumber} was cancelled.`,
    entityType: "order",
    entityId: orderId,
  });
}

export async function notifyNewCustomer({ userId, email, displayName }) {
  return createIfNotExists({
    type: NOTIFICATION_TYPES.NEW_CUSTOMER,
    title: "New customer registered",
    message: `${displayName || email} joined the marketplace.`,
    entityType: "user",
    entityId: userId,
  });
}

export async function notifyFailedPayment({ orderId, orderNumber }) {
  return createIfNotExists({
    type: NOTIFICATION_TYPES.FAILED_PAYMENT,
    title: "Payment failed",
    message: `Payment failed for order ${orderNumber}.`,
    entityType: "order",
    entityId: orderId,
  });
}

export async function syncOperationalAlerts() {
  const [lowStockProducts, outOfStockProducts] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { inventory: true },
      take: 100,
    }),
    prisma.product.findMany({
      where: { status: "OUT_OF_STOCK" },
      take: 50,
    }),
  ]);

  await Promise.all(
    lowStockProducts
      .filter((p) => isLowStock(p.inventory))
      .slice(0, 20)
      .map((product) =>
        createIfNotExists({
          type: NOTIFICATION_TYPES.LOW_STOCK,
          title: "Low stock alert",
          message: `${product.name} has ${product.inventory?.quantity ?? 0} units left.`,
          entityType: "product",
          entityId: product.id,
        }),
      ),
  );

  await Promise.all(
    outOfStockProducts.slice(0, 20).map((product) =>
      createIfNotExists({
        type: NOTIFICATION_TYPES.OUT_OF_STOCK,
        title: "Out of stock",
        message: `${product.name} is out of stock.`,
        entityType: "product",
        entityId: product.id,
      }),
    ),
  );
}

export async function listNotifications({ unreadOnly = false, limit = 30, offset = 0 } = {}) {
  const where = unreadOnly ? { isRead: false } : {};

  const [items, total, unreadCount] = await Promise.all([
    prisma.adminNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.adminNotification.count({ where }),
    prisma.adminNotification.count({ where: { isRead: false } }),
  ]);

  return {
    items: items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      entityType: n.entityType,
      entityId: n.entityId,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
    pagination: { limit, offset, total },
  };
}

export async function markNotificationRead(notificationId) {
  return prisma.adminNotification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead() {
  const result = await prisma.adminNotification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
  return { updated: result.count };
}

export async function deleteNotification(notificationId) {
  await prisma.adminNotification.delete({ where: { id: notificationId } });
  return { deleted: true };
}

export async function getUnreadCount() {
  return prisma.adminNotification.count({ where: { isRead: false } });
}

export async function notifySupportRequest({
  requestId,
  ticketNumber,
  contactName,
  contactEmail,
  userId,
  orderId,
  type,
}) {
  const label = ticketNumber || requestId;
  const who = contactName || contactEmail || "A customer";
  return createIfNotExists({
    type: "SUPPORT_REQUEST",
    title: "New support ticket",
    message: `${who} submitted ticket ${label}${type ? ` (${type.toLowerCase()})` : ""}.`,
    entityType: "support_request",
    entityId: requestId,
  });
}

export const adminNotificationService = {
  notifyNewOrder,
  notifyCancelledOrder,
  notifyNewCustomer,
  notifyFailedPayment,
  notifySupportRequest,
  syncOperationalAlerts,
  list: listNotifications,
  markRead: markNotificationRead,
  markAllRead: markAllNotificationsRead,
  deleteNotification,
  getUnreadCount,
};

export default adminNotificationService;
