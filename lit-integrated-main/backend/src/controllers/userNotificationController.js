import {
  listUserNotifications,
  markUserNotificationRead,
  markAllUserNotificationsRead,
  deleteUserNotification,
  getUnreadNotificationCount,
} from "../services/customerNotificationService.js";

export async function getMyNotifications(req, res) {
  const notifications = await listUserNotifications(req.dbUser.id);
  res.json({ success: true, message: "Notifications loaded.", data: { notifications } });
}

export async function getMyNotificationCount(req, res) {
  const count = await getUnreadNotificationCount(req.dbUser.id);
  res.json({ success: true, message: "Unread count loaded.", data: { count } });
}

export async function patchMyNotificationRead(req, res) {
  await markUserNotificationRead(req.dbUser.id, req.params.id);
  res.json({ success: true, message: "Notification marked as read.", data: { read: true } });
}

export async function putMyNotificationRead(req, res) {
  await markUserNotificationRead(req.dbUser.id, req.params.id);
  res.json({ success: true, message: "Notification marked as read.", data: { read: true } });
}

export async function putAllNotificationsRead(req, res) {
  const count = await markAllUserNotificationsRead(req.dbUser.id);
  res.json({ success: true, message: "All notifications marked as read.", data: { count } });
}

export async function deleteMyNotification(req, res) {
  await deleteUserNotification(req.dbUser.id, req.params.id);
  res.json({ success: true, message: "Notification deleted.", data: { deleted: true } });
}

export default {
  getMyNotifications,
  getMyNotificationCount,
  patchMyNotificationRead,
  putMyNotificationRead,
  putAllNotificationsRead,
  deleteMyNotification,
};
