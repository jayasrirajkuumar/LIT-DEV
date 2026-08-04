import React, { useEffect, useState } from "react";
import {
  fetchAdminCustomers,
  fetchAdminCustomerById,
  updateAdminCustomerStatus,
} from "../../services/adminApiService";
import {
  AdminPageHeader,
  AdminTable,
  AdminDrawer,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminBadge,
  AdminCard,
  AdminCardHeader,
  AdminCardBody,
  AdminStatusBadge,
} from "../admin-ui";

function getInitials(name, email) {
  const source = name || email || "?";
  return source.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const AdminCustomersView = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const filters = {};
      if (search.trim()) filters.search = search.trim();
      if (statusFilter) filters.isActive = statusFilter;
      const data = await fetchAdminCustomers(filters);
      setCustomers(Array.isArray(data) ? data : data.customers ?? []);
    } catch (err) {
      setError(err.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openCustomer = async (customer) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    setError("");
    try {
      const data = await fetchAdminCustomerById(customer.id);
      setDetail(data);
    } catch (err) {
      setError(err.message || "Failed to load customer.");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!detail?.user) return;
    try {
      await updateAdminCustomerStatus(detail.user.id, !detail.user.isActive);
      const refreshed = await fetchAdminCustomerById(detail.user.id);
      setDetail(refreshed);
      await loadCustomers();
    } catch (err) {
      setError(err.message || "Failed to update account.");
    }
  };

  const columns = [
    {
      key: "customer",
      label: "Customer",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="adm-avatar">{getInitials(row.displayName, row.email)}</div>
          <div>
            <div className="adm-table-product__name">{row.displayName || "—"}</div>
            <div className="adm-table-product__meta">{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: "phone", label: "Phone", render: (row) => row.phoneNumber || "—" },
    { key: "orders", label: "Orders", render: (row) => row.orderCount ?? 0 },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <AdminBadge variant={row.isActive ? "success" : "neutral"}>
          {row.isActive ? "Active" : "Inactive"}
        </AdminBadge>
      ),
    },
    {
      key: "joined",
      label: "Joined",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const hasFilters = Boolean(search.trim() || statusFilter);

  return (
    <div className="adm-page">
      <AdminPageHeader
        title="Customers"
        subtitle="View profiles, addresses, and order history"
        toolbar={
          <>
            <AdminInput
              type="search"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search customers"
            />
            <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </AdminSelect>
            <AdminButton variant="secondary" onClick={loadCustomers}>
              Search
            </AdminButton>
          </>
        }
      />

      {error && <div className="adm-alert">{error}</div>}

      <AdminTable
        columns={columns}
        rows={customers}
        loading={loading}
        onRowClick={openCustomer}
        selectedRowId={detail?.user?.id}
        emptyTitle={hasFilters ? "No customers found" : "No customers registered yet."}
        emptyDescription={
          hasFilters
            ? "Try adjusting your search filters."
            : "Customer accounts will appear here once users sign up on the marketplace."
        }
      />

      <AdminDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={detail?.user?.displayName || detail?.user?.email || "Customer"}
        subtitle={detail?.user?.email}
        width="lg"
        footer={
          detail?.user && (
            <AdminButton
              variant={detail.user.isActive ? "danger" : "primary"}
              onClick={handleToggleActive}
            >
              {detail.user.isActive ? "Deactivate Account" : "Activate Account"}
            </AdminButton>
          )
        }
      >
        {detailLoading && <p>Loading profile...</p>}
        {detail?.user && !detailLoading && (
          <div className="adm-order-detail">
            <AdminCard padding="md">
              <AdminCardHeader title="Profile" />
              <AdminCardBody>
                <p><strong>Email:</strong> {detail.user.email}</p>
                <p><strong>Phone:</strong> {detail.user.phoneNumber || "—"}</p>
                <p><strong>Role:</strong> {detail.user.role}</p>
                <p><strong>Status:</strong> <AdminBadge variant={detail.user.isActive ? "success" : "neutral"}>{detail.user.isActive ? "Active" : "Inactive"}</AdminBadge></p>
                <p><strong>Last login:</strong> {detail.user.lastLogin ? new Date(detail.user.lastLogin).toLocaleString() : "—"}</p>
              </AdminCardBody>
            </AdminCard>

            <AdminCard padding="md">
              <AdminCardHeader title={`Addresses (${detail.addresses?.length ?? 0})`} />
              <AdminCardBody>
                {detail.addresses?.length ? (
                  <ul className="adm-list">
                    {detail.addresses.map((address) => (
                      <li key={address.id} className="adm-list__item">
                        <div>
                          <div className="adm-list__primary">{address.fullName}</div>
                          <div className="adm-list__secondary">
                            {address.addressLine1}, {address.city}, {address.state} {address.postalCode}
                          </div>
                          <div className="adm-list__secondary">{address.country} · {address.addressType}{address.isDefault ? " · Default" : ""}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="adm-list__secondary">No saved addresses.</p>
                )}
              </AdminCardBody>
            </AdminCard>

            <AdminCard padding="md">
              <AdminCardHeader title={`Orders (${detail.orders?.length ?? 0})`} />
              <AdminCardBody>
                {detail.orders?.length ? (
                  <ul className="adm-list">
                    {detail.orders.map((order) => (
                      <li key={order.id} className="adm-list__item">
                        <div>
                          <div className="adm-list__primary">{order.orderNumber}</div>
                          <div className="adm-list__secondary">{new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <AdminStatusBadge status={order.orderStatus} />
                          <div className="adm-list__secondary">₹{Number(order.grandTotal).toFixed(2)}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="adm-list__secondary">No orders yet.</p>
                )}
              </AdminCardBody>
            </AdminCard>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
};

export default AdminCustomersView;
