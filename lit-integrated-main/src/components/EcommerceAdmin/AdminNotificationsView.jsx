import React, { useEffect, useMemo, useState } from "react";
import {
  deleteAdminNotification,
  fetchAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/adminApiService";
import {
  AdminPageHeader,
  AdminButton,
  AdminSelect,
  AdminDrawer,
  AdminStatusBadge,
  AdminCard,
  AdminCardHeader,
  AdminCardBody,
} from "../admin-ui";

const TYPE_LABELS = {
  NEW_ORDER: "New Order",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
  CANCELLED_ORDER: "Cancelled Order",
  NEW_CUSTOMER: "Customer Registration",
  FAILED_PAYMENT: "Payment Issue",
  SUPPORT_REQUEST: "Support Request",
  AUDIT: "Audit Event",
};

function typeLabel(type) {
  return TYPE_LABELS[type] || type?.replace(/_/g, " ") || "Notification";
}

const AdminNotificationsView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAdminNotifications({ limit: 100 });
      setItems(data.items ?? []);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === "unread") return items.filter((item) => !item.isRead);
    if (filter === "read") return items.filter((item) => item.isRead);
    return items;
  }, [filter, items]);

  const unreadCount = items.filter((item) => !item.isRead).length;

  const openDetail = async (notification) => {
    setSelected(notification);
    setDrawerOpen(true);
    if (!notification.isRead) {
      try {
        await markNotificationRead(notification.id);
        setItems((prev) =>
          prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)),
        );
        setSelected((prev) => (prev ? { ...prev, isRead: true } : prev));
      } catch {
        // Non-blocking
      }
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleDelete = async (id) => {
    await deleteAdminNotification(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selected?.id === id) {
      setDrawerOpen(false);
      setSelected(null);
    }
  };

  return (
    <div className="adm-page">
      <AdminPageHeader
        title="Notifications"
        subtitle="Operational alerts from orders, inventory, customers, support, and audit events."
        toolbar={
          <>
            <AdminSelect value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter notifications">
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </AdminSelect>
            {unreadCount > 0 && (
              <AdminButton variant="secondary" onClick={handleMarkAllRead}>
                Mark all read
              </AdminButton>
            )}
          </>
        }
      />

      {error && <p className="adm-alert adm-alert--error">{error}</p>}

      {loading ? (
        <p className="adm-list__secondary">Loading notifications...</p>
      ) : filteredItems.length === 0 ? (
        <div className="adm-empty">
          <div className="adm-empty__visual" aria-hidden="true">
            <svg viewBox="0 0 120 120" className="adm-empty__illustration">
              <circle cx="60" cy="60" r="36" fill="rgba(147, 51, 234, 0.15)" />
              <path d="M60 34v14M60 72v8" stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="adm-empty__title">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </h3>
          <p className="adm-empty__desc">
            Alerts for new orders, low stock, cancellations, and support requests will appear here.
          </p>
        </div>
      ) : (
        <ul className="adm-notifications-list">
          {filteredItems.map((notification) => (
            <li
              key={notification.id}
              className={`adm-notifications-list__item${notification.isRead ? "" : " unread"}`}
            >
              <button type="button" className="adm-notifications-list__main" onClick={() => openDetail(notification)}>
                <div className="adm-notifications-list__top">
                  <AdminStatusBadge status={typeLabel(notification.type)} />
                  <span className="adm-notifications-list__date">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </button>
              <div className="adm-notifications-list__actions">
                {!notification.isRead && (
                  <AdminButton
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await markNotificationRead(notification.id);
                      setItems((prev) =>
                        prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)),
                      );
                    }}
                  >
                    Mark read
                  </AdminButton>
                )}
                <AdminButton size="sm" variant="danger" onClick={() => handleDelete(notification.id)}>
                  Delete
                </AdminButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AdminDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.title || "Notification"}
        subtitle={selected ? typeLabel(selected.type) : undefined}
        footer={
          selected && (
            <AdminButton variant="danger" onClick={() => handleDelete(selected.id)}>
              Delete
            </AdminButton>
          )
        }
      >
        {selected && (
          <AdminCard padding="md">
            <AdminCardHeader title="Details" />
            <AdminCardBody>
              <p><strong>Type:</strong> {typeLabel(selected.type)}</p>
              <p><strong>Status:</strong> {selected.isRead ? "Read" : "Unread"}</p>
              <p><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}</p>
              <p><strong>Message:</strong> {selected.message}</p>
              {selected.entityType && (
                <p><strong>Related:</strong> {selected.entityType} {selected.entityId ? `#${selected.entityId}` : ""}</p>
              )}
            </AdminCardBody>
          </AdminCard>
        )}
      </AdminDrawer>
    </div>
  );
};

export default AdminNotificationsView;
