import { adminNotificationService } from "../services/adminNotificationService.js";

export async function getNotifications(req, res) {
  const unreadOnly = req.query.unreadOnly === "true";
  const limit = Number(req.query.limit) || 30;
  const offset = Number(req.query.offset) || 0;
  const result = await adminNotificationService.list({ unreadOnly, limit, offset });
  res.json({ success: true, data: result });
}

export async function getNotificationCount(_req, res) {
  const unreadCount = await adminNotificationService.getUnreadCount();
  res.json({ success: true, data: { unreadCount } });
}

export async function patchNotificationRead(req, res) {
  await adminNotificationService.markRead(req.validatedParams.id);
  res.json({ success: true, data: { read: true } });
}

export async function patchAllNotificationsRead(_req, res) {
  const result = await adminNotificationService.markAllRead();
  res.json({ success: true, data: result });
}

export async function deleteNotificationHandler(req, res) {
  await adminNotificationService.deleteNotification(req.validatedParams.id);
  res.json({ success: true, data: { deleted: true } });
}

export default {
  getNotifications,
  getNotificationCount,
  patchNotificationRead,
  patchAllNotificationsRead,
  deleteNotificationHandler,
};
