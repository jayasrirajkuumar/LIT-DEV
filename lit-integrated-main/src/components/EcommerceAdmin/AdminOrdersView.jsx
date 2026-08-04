import React, { useEffect, useMemo, useState } from "react";
import {
  exportAdminOrders,
  fetchAdminOrders,
  fetchAdminOrderStats,
  updateAdminOrderNotes,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
} from "../../services/orderApiService";
import { mapApiOrderToUi } from "../../utils/orderMappers";
import {
  AdminPageHeader,
  AdminButton,
  AdminTable,
  AdminDrawer,
  AdminKpiCard,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminFormField,
  AdminCard,
  AdminCardHeader,
  AdminCardBody,
  AdminStatusBadge,
} from "../admin-ui";

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const AdminOrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [nextStatus, setNextStatus] = useState("PROCESSING");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const filters = {};
      if (statusFilter !== "ALL") filters.status = statusFilter;
      if (search.trim()) filters.search = search.trim();
      const [orderData, statsData] = await Promise.all([
        fetchAdminOrders(filters),
        fetchAdminOrderStats(),
      ]);
      setOrders(orderData.map(mapApiOrderToUi));
      setStats(statsData);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const statCards = useMemo(
    () => [
      { label: "Pending", value: (stats.PENDING ?? 0) + (stats.CONFIRMED ?? 0) },
      { label: "Processing", value: stats.PROCESSING ?? 0 },
      { label: "Shipped", value: (stats.SHIPPED ?? 0) + (stats.OUT_FOR_DELIVERY ?? 0) },
      { label: "Delivered", value: stats.DELIVERED ?? 0 },
    ],
    [stats],
  );

  const openOrder = (order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || "");
    setAdminNotes(order.adminNotes || "");
    setNextStatus(order.rawStatus === "CONFIRMED" ? "PROCESSING" : "SHIPPED");
    setDrawerOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    await updateAdminOrderStatus(selectedOrder.id, { status: nextStatus });
    await loadOrders();
  };

  const handleUpdateTracking = async () => {
    if (!selectedOrder || !trackingNumber.trim()) return;
    await updateAdminOrderTracking(selectedOrder.id, trackingNumber.trim());
    await loadOrders();
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    await updateAdminOrderNotes(selectedOrder.id, adminNotes);
    await loadOrders();
  };

  const handleExport = async () => {
    const csv = await exportAdminOrders(statusFilter !== "ALL" ? { status: statusFilter } : {});
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lit-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: "orderNumber", label: "Order", render: (row) => row.orderNumber },
    {
      key: "customer",
      label: "Customer",
      render: (row) => row.customer?.displayName || row.customer?.email || "—",
    },
    { key: "date", label: "Date", render: (row) => row.date },
    {
      key: "items",
      label: "Items",
      render: (row) => row.items?.length ?? row.lineItems?.length ?? "—",
    },
    {
      key: "total",
      label: "Total",
      render: (row) => `₹${row.pricing.grandTotal.toFixed(2)}`,
    },
    {
      key: "payment",
      label: "Payment",
      render: (row) => <AdminStatusBadge status={row.paymentStatus} />,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <AdminStatusBadge status={row.rawStatus} />,
    },
  ];

  return (
    <div className="adm-page">
      <AdminPageHeader
        title="Orders"
        subtitle="Manage fulfillment, tracking, and order lifecycle"
        actions={
          <AdminButton variant="outline" onClick={handleExport}>
            Export CSV
          </AdminButton>
        }
        toolbar={
          <>
            <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter orders">
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </AdminSelect>
            <AdminInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order number or email"
              aria-label="Search orders"
            />
            <AdminButton variant="secondary" onClick={loadOrders}>
              Search
            </AdminButton>
          </>
        }
      />

      {error && <div className="adm-alert">{error}</div>}

      <div className="adm-grid adm-grid--4">
        {statCards.map((card) => (
          <AdminKpiCard key={card.label} label={card.label} value={card.value} trend="—" />
        ))}
      </div>

      <AdminTable
        columns={columns}
        rows={orders}
        loading={loading}
        onRowClick={openOrder}
        selectedRowId={selectedOrder?.id}
        emptyTitle="No orders found"
        emptyDescription="Orders will appear here after customers checkout."
      />

      <AdminDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedOrder?.orderNumber}
        subtitle={selectedOrder?.customer?.email}
        width="lg"
      >
        {selectedOrder && (
          <div className="adm-order-detail">
            <div className="adm-grid adm-grid--2">
              <AdminCard padding="md">
                <AdminCardHeader title="Shipping" />
                <AdminCardBody>
                  <p className="adm-list__secondary">{selectedOrder.shippingInfo?.address || "—"}</p>
                </AdminCardBody>
              </AdminCard>
              <AdminCard padding="md">
                <AdminCardHeader title="Payment" />
                <AdminCardBody>
                  <AdminStatusBadge status={selectedOrder.paymentStatus} />
                  <p className="adm-list__secondary" style={{ marginTop: 8 }}>
                    Total: ₹{selectedOrder.pricing.grandTotal.toFixed(2)}
                  </p>
                </AdminCardBody>
              </AdminCard>
            </div>

            <AdminCard padding="md">
              <AdminCardHeader title="Order Items" />
              <AdminCardBody>
                <ul className="adm-list">
                  {(selectedOrder.items || selectedOrder.lineItems || []).map((item, index) => (
                    <li key={item.id || index} className="adm-list__item">
                      <div className="adm-list__primary">{item.name || item.productName}</div>
                      <div className="adm-list__secondary">Qty {item.quantity}</div>
                    </li>
                  ))}
                </ul>
              </AdminCardBody>
            </AdminCard>

            <AdminCard padding="md">
              <AdminCardHeader title="Status Timeline" />
              <AdminCardBody>
                <ul className="adm-order-timeline">
                  <li className="adm-order-timeline__item">
                    Current: <AdminStatusBadge status={selectedOrder.rawStatus} />
                  </li>
                  <li className="adm-order-timeline__item">Placed: {selectedOrder.date}</li>
                  {(selectedOrder.statusHistory ?? []).map((entry) => (
                    <li key={`${entry.status}-${entry.createdAt}`} className="adm-order-timeline__item">
                      {entry.statusLabel || entry.status}: {new Date(entry.createdAt).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </AdminCardBody>
            </AdminCard>

            {selectedOrder.cancellationReason && (
              <AdminCard padding="md">
                <AdminCardHeader title="Cancellation Reason" />
                <AdminCardBody>
                  <p className="adm-list__primary">
                    {selectedOrder.cancellationReason.reasonCode?.replace(/_/g, " ")}
                  </p>
                  {selectedOrder.cancellationReason.reasonText && (
                    <p className="adm-list__secondary">{selectedOrder.cancellationReason.reasonText}</p>
                  )}
                  <p className="adm-list__secondary">
                    Recorded: {new Date(selectedOrder.cancellationReason.createdAt).toLocaleString()}
                  </p>
                </AdminCardBody>
              </AdminCard>
            )}

            <AdminCard padding="md">
              <AdminCardHeader title="Actions" />
              <AdminCardBody>
                <div className="adm-page" style={{ gap: 12 }}>
                  <AdminFormField label="Update Status">
                    <AdminSelect value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                      {["PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </AdminSelect>
                  </AdminFormField>
                  <AdminButton onClick={handleUpdateStatus}>Update Status</AdminButton>

                  <AdminFormField label="Tracking Number">
                    <AdminInput value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                  </AdminFormField>
                  <AdminButton variant="secondary" onClick={handleUpdateTracking}>Save Tracking</AdminButton>

                  <AdminFormField label="Internal Notes">
                    <AdminTextarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4} />
                  </AdminFormField>
                  <AdminButton variant="outline" onClick={handleSaveNotes}>Save Notes</AdminButton>
                </div>
              </AdminCardBody>
            </AdminCard>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
};

export default AdminOrdersView;
