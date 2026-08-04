import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useUserAuth } from "../hooks/useUserAuth";
import { connectSupportSocket, disconnectSupportSocket } from "../services/supportChatService";
import {
  fetchNotifications,
  fetchNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/walletApiService";

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useUserAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const [listData, countData] = await Promise.all([
        fetchNotifications(),
        fetchNotificationCount(),
      ]);
      setNotifications(listData.notifications ?? []);
      setUnreadCount(countData.count ?? 0);
    } catch {
      // keep prior state on transient errors
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSupportSocket();
      return undefined;
    }

    const socket = connectSupportSocket({
      "notification:new": (notification) => {
        setNotifications((prev) => [notification, ...prev.filter((n) => n.id !== notification.id)]);
        if (!notification.isRead) setUnreadCount((c) => c + 1);
      },
      "gift-card-received": () => {
        void refresh();
      },
    });

    return () => {
      if (socket) socket.off("notification:new");
    };
  }, [isAuthenticated, refresh]);

  const markRead = useCallback(async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, loading, refresh, markRead, markAllRead }),
    [notifications, unreadCount, loading, refresh, markRead, markAllRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

export default NotificationProvider;
