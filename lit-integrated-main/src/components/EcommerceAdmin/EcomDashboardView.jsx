import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../../services/adminApiService";
import {
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaWarehouse,
  FaTags,
  FaRupeeSign,
  FaPlus,
  FaBoxOpen,
  FaClock,
  FaBan,
  FaHeadset,
} from "react-icons/fa";
import {
  AdminKpiCard,
  AdminCard,
  AdminCardHeader,
  AdminCardBody,
  AdminQuickAction,
  AdminEmptyState,
  AdminSkeletonCard,
  AdminStatusBadge,
} from "../admin-ui";

function formatAction(action) {
  return String(action || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

const EcomDashboardView = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchDashboardStats()
      .then((data) => {
        if (mounted) setStats(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Failed to load dashboard.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="adm-page">
        <div className="adm-grid adm-grid--dashboard-kpi">
          {Array.from({ length: 8 }).map((_, i) => (
            <AdminSkeletonCard key={i} lines={2} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adm-page">
        <div className="adm-alert">{error}</div>
        <p className="adm-page-header__subtitle">
          Sign in with an Azure account that has the ADMIN role to access admin APIs.
        </p>
      </div>
    );
  }

  const cards = stats?.cards ?? {};
  const support = stats?.support ?? {};
  const revenue = Number(cards.revenue ?? 0).toLocaleString("en-IN");

  return (
    <div className="adm-page">
      <div className="adm-grid adm-grid--dashboard-kpi">
        <AdminKpiCard
          icon={<FaRupeeSign />}
          label="Revenue"
          value={`₹${revenue}`}
          description={`Today: ₹${Number(cards.revenueToday ?? 0).toLocaleString("en-IN")}`}
        />
        <AdminKpiCard
          icon={<FaShoppingCart />}
          label="Orders Today"
          value={cards.ordersToday ?? 0}
          description={`Week: ${cards.ordersThisWeek ?? 0} · Month: ${cards.ordersThisMonth ?? 0}`}
        />
        <AdminKpiCard
          icon={<FaClock />}
          label="Pending Orders"
          value={cards.pendingOrders ?? 0}
          description="Awaiting processing"
        />
        <AdminKpiCard
          icon={<FaBan />}
          label="Cancelled"
          value={cards.cancelledOrders ?? 0}
          description="All-time cancelled"
        />
        <AdminKpiCard
          icon={<FaBox />}
          label="Products"
          value={cards.products ?? 0}
          description={`${cards.activeProducts ?? 0} active`}
        />
        <AdminKpiCard
          icon={<FaWarehouse />}
          label="Low Stock"
          value={cards.inventoryAlerts ?? 0}
          description={`${cards.outOfStock ?? 0} out of stock`}
        />
        <AdminKpiCard
          icon={<FaUsers />}
          label="Customers"
          value={cards.customers ?? 0}
          description="Registered shoppers"
        />
        <AdminKpiCard
          icon={<FaTags />}
          label="Categories"
          value={cards.categories ?? 0}
          description="Active catalog groups"
        />
        <AdminKpiCard
          icon={<FaHeadset />}
          label="Open Conversations"
          value={support.openConversations ?? support.openTickets ?? 0}
          description={`${support.waitingForAdmin ?? support.inProgress ?? 0} waiting for admin`}
        />
        <AdminKpiCard
          icon={<FaHeadset />}
          label="Waiting for Customer"
          value={support.waitingForCustomer ?? 0}
          description={`${support.unreadMessages ?? 0} unread messages`}
        />
        <AdminKpiCard
          icon={<FaHeadset />}
          label="Resolved Today"
          value={support.resolvedToday ?? 0}
          description={
            support.averageResponseTimeMinutes
              ? `Avg response ${support.averageResponseTimeMinutes}m`
              : `${support.totalTickets ?? 0} total tickets`
          }
        />
      </div>

      <div className="adm-grid adm-grid--dashboard-main">
        <AdminCard padding="md">
          <AdminCardHeader title="Recent Orders" subtitle="Latest marketplace activity" />
          <AdminCardBody>
            {(stats?.recentOrders ?? []).length === 0 ? (
              <AdminEmptyState compact title="No orders yet" description="Orders will appear here once customers checkout." />
            ) : (
              <ul className="adm-list">
                {stats.recentOrders.map((order) => (
                  <li key={order.id} className="adm-list__item">
                    <div>
                      <div className="adm-list__primary">{order.orderNumber}</div>
                      <div className="adm-list__secondary">{order.customer}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <AdminStatusBadge status={order.status} />
                      <div className="adm-list__secondary">₹{order.total}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminCardBody>
        </AdminCard>

        <div className="adm-grid adm-grid--dashboard-secondary">
          <AdminCard padding="md">
            <AdminCardHeader title="Top Products" subtitle="By units sold" />
            <AdminCardBody>
              {(stats?.topProducts ?? []).length === 0 ? (
                <AdminEmptyState compact title="No sales data" />
              ) : (
                <ul className="adm-list">
                  {stats.topProducts.map((item) => (
                    <li key={item.product?.id} className="adm-list__item">
                      <div className="adm-list__primary">{item.product?.name ?? "Product"}</div>
                      <span>{item.unitsSold} sold</span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCardBody>
          </AdminCard>

          <AdminCard padding="md">
            <AdminCardHeader title="Top Categories" subtitle="By product count" />
            <AdminCardBody>
              {(stats?.topCategories ?? []).length === 0 ? (
                <AdminEmptyState compact title="No categories" />
              ) : (
                <ul className="adm-list">
                  {stats.topCategories.map((item) => (
                    <li key={item.category?.id} className="adm-list__item">
                      <div className="adm-list__primary">{item.category?.name ?? "Category"}</div>
                      <span>{item.productCount} products</span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCardBody>
          </AdminCard>

          <AdminCard padding="md">
            <AdminCardHeader title="Newest Customers" subtitle="Recent registrations" />
            <AdminCardBody>
              {(stats?.recentUsers ?? []).length === 0 ? (
                <AdminEmptyState compact title="No users yet" />
              ) : (
                <ul className="adm-list">
                  {stats.recentUsers.map((user) => (
                    <li key={user.id} className="adm-list__item">
                      <div>
                        <div className="adm-list__primary">{user.displayName || user.email}</div>
                        <div className="adm-list__secondary">{user.role}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCardBody>
          </AdminCard>

          <AdminCard padding="md">
            <AdminCardHeader title="Low Stock" subtitle="Products below threshold" />
            <AdminCardBody>
              {(stats?.lowStockProducts ?? []).length === 0 ? (
                <AdminEmptyState compact title="All stocked" description="No low stock alerts." />
              ) : (
                <ul className="adm-list">
                  {stats.lowStockProducts.map((product) => (
                    <li key={product.id} className="adm-list__item">
                      <div className="adm-list__primary">{product.name}</div>
                      <span className="adm-stock--low">{product.quantity} left</span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCardBody>
          </AdminCard>

          <AdminCard padding="md">
            <AdminCardHeader title="Out of Stock" subtitle="Needs restocking" />
            <AdminCardBody>
              {(stats?.outOfStockProducts ?? []).length === 0 ? (
                <AdminEmptyState compact title="Fully stocked" />
              ) : (
                <ul className="adm-list">
                  {stats.outOfStockProducts.map((product) => (
                    <li key={product.id} className="adm-list__item">
                      <div className="adm-list__primary">{product.name}</div>
                      <span className="adm-stock--out">0 left</span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCardBody>
          </AdminCard>

          <AdminCard padding="md">
            <AdminCardHeader title="Latest Support Tickets" subtitle="Recent customer requests" />
            <AdminCardBody>
              {(support.latestConversations ?? support.latestTickets ?? []).length === 0 ? (
                <AdminEmptyState compact title="No support tickets" description="New tickets will appear here." />
              ) : (
                <ul className="adm-list">
                  {(support.latestConversations ?? support.latestTickets).map((ticket) => (
                    <li key={ticket.id} className="adm-list__item">
                      <div>
                        <div className="adm-list__primary">{ticket.ticketNumber}</div>
                        <div className="adm-list__secondary">
                          {ticket.contactName || ticket.contactEmail} · {ticket.lastMessagePreview || ticket.subject}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <AdminStatusBadge status={ticket.status} />
                        <div className="adm-list__secondary">
                          {new Date(ticket.lastMessageAt || ticket.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCardBody>
          </AdminCard>

          <AdminCard padding="md">
            <AdminCardHeader title="Recent Activity" subtitle="Admin audit log" />
            <AdminCardBody>
              {(stats?.recentActivity ?? []).length === 0 ? (
                <AdminEmptyState compact title="No activity yet" />
              ) : (
                <ul className="adm-list">
                  {stats.recentActivity.map((entry) => (
                    <li key={entry.id} className="adm-list__item">
                      <div>
                        <div className="adm-list__primary">{formatAction(entry.action)}</div>
                        <div className="adm-list__secondary">
                          {entry.admin?.displayName || entry.admin?.email || "System"}
                        </div>
                      </div>
                      <div className="adm-list__secondary">
                        {new Date(entry.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCardBody>
          </AdminCard>
        </div>
      </div>

      <AdminCard padding="md">
        <AdminCardHeader title="Quick Actions" subtitle="Common admin workflows" />
        <AdminCardBody>
          <div className="adm-grid adm-grid--4">
            <AdminQuickAction icon={<FaPlus />} title="Add Product" description="Create a new catalog item" onClick={() => navigate("products/add")} />
            <AdminQuickAction icon={<FaTags />} title="Manage Categories" description="Organize your catalog" onClick={() => navigate("categories")} />
            <AdminQuickAction icon={<FaShoppingCart />} title="View Orders" description="Process and ship orders" onClick={() => navigate("orders")} />
            <AdminQuickAction icon={<FaBoxOpen />} title="Inventory" description="Update stock levels" onClick={() => navigate("inventory")} />
            <AdminQuickAction icon={<FaHeadset />} title="Support Tickets" description="Manage customer requests" onClick={() => navigate("support")} />
          </div>
        </AdminCardBody>
      </AdminCard>
    </div>
  );
};

export default EcomDashboardView;
