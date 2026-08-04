import React from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { formatRelativeTime, getNotificationIcon, getNotificationPath } from "../../utils/notificationHelpers";
import BackNavigation from "../../components/layout/BackNavigation";
import "./NotificationsPage.css";
import "./NotificationsPage.css";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, loading } = useNotifications();

  const handleOpen = async (notification) => {
    if (!notification.isRead) await markRead(notification.id);
    navigate(getNotificationPath(notification));
  };

  return (
    <div className="notifications-page">
      <BackNavigation label="Back" fallbackTo="/shop" />
      <div className="notifications-page__header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button type="button" className="lit-btn lit-btn--outline lit-btn--sm" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {loading && <p className="notifications-page__empty">Loading...</p>}

      {!loading && notifications.length === 0 && (
        <p className="notifications-page__empty">No notifications yet.</p>
      )}

      <ul className="notifications-page__list">
        {notifications.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className={`notifications-page__item${!n.isRead ? " notifications-page__item--unread" : ""}`}
              onClick={() => handleOpen(n)}
            >
              <span className="notifications-page__icon">{getNotificationIcon(n.type)}</span>
              <div className="notifications-page__content">
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <span>{formatRelativeTime(n.createdAt)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;
