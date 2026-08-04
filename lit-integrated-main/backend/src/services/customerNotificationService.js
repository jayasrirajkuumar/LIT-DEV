import { prisma } from "../database/prismaClient.js";
import { getSupportSocketHub } from "./supportSocketHub.js";

export async function createUserNotification({
  userId,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  metadata = null,
}) {
  if (!userId) return null;

  const notification = await prisma.userNotification.create({
    data: {
      userId,
      type,
      title,
      message,
      entityType,
      entityId,
    },
  });

  const payload = {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    entityType: notification.entityType,
    entityId: notification.entityId,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
    ...(metadata ?? {}),
  };

  getSupportSocketHub()?.emitUserNotification?.({ userId, notification: payload });

  return notification;
}

export async function listUserNotifications(userId, { limit = 50 } = {}) {
  const notifications = await prisma.userNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
  });

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    entityType: n.entityType,
    entityId: n.entityId,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function markUserNotificationRead(userId, notificationId) {
  const existing = await prisma.userNotification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!existing) return null;

  return prisma.userNotification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function getUnreadNotificationCount(userId) {
  return prisma.userNotification.count({
    where: { userId, isRead: false },
  });
}

export async function markAllUserNotificationsRead(userId) {
  const result = await prisma.userNotification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return result.count;
}

export async function deleteUserNotification(userId, notificationId) {
  const existing = await prisma.userNotification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!existing) return null;
  await prisma.userNotification.delete({ where: { id: notificationId } });
  return { deleted: true };
}

export default {
  createUserNotification,
  listUserNotifications,
  markUserNotificationRead,
  markAllUserNotificationsRead,
  deleteUserNotification,
  getUnreadNotificationCount,
};
