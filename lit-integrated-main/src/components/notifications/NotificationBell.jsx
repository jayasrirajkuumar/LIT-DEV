import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  NotificationContext,
  NotificationProvider,
  useNotifications,
} from "../../context/NotificationContext";
import { formatRelativeTime, getNotificationIcon, getNotificationPath } from "../../utils/notificationHelpers";
import "./NotificationBell.css";

const NotificationBellInner = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleClick = async (notification) => {
    if (!notification.isRead) await markRead(notification.id);
    setOpen(false);
    navigate(getNotificationPath(notification));
  };

  const recent = notifications.slice(0, 8);

  return (
    <div className="lit-notif-bell" ref={ref}>
      <button
        type="button"
        className={`mp-navbar__icon-btn${open ? " is-active" : ""}`}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="mp-navbar__badge lit-notif-bell__badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="lit-notif-dropdown" role="menu">
          <div className="lit-notif-dropdown__header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" className="lit-notif-dropdown__mark-all" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="lit-notif-dropdown__list">
            {recent.length === 0 ? (
              <p className="lit-notif-dropdown__empty">No notifications yet.</p>
            ) : (
              recent.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`lit-notif-item${!n.isRead ? " lit-notif-item--unread" : ""}`}
                  onClick={() => handleClick(n)}
                >
                  <span className="lit-notif-item__icon">{getNotificationIcon(n.type)}</span>
                  <span className="lit-notif-item__body">
                    <span className="lit-notif-item__title">{n.title}</span>
                    <span className="lit-notif-item__message">{n.message}</span>
                    <span className="lit-notif-item__time">{formatRelativeTime(n.createdAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
          <Link to="/notifications" className="lit-notif-dropdown__footer" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

const NotificationBell = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return (
      <NotificationProvider>
        <NotificationBellInner />
      </NotificationProvider>
    );
  }
  return <NotificationBellInner />;
};

export default NotificationBell;
