import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../../services/orderService";
import OrderControls from "../../components/order-returns/OrderControls/OrderControls";
import OrderCard from "../../components/order-returns/OrderCard/OrderCard";
import PageShell from "../../components/layout/PageShell";
import "./OrdersPage.css";

const OrdersPage = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "All",
    searchTerm: "",
    timeRange: "all",
  });

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        setAllOrders(data);
      } catch (err) {
        setError("Failed to load orders. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let processedOrders = [...allOrders];

    if (filters.status !== "All") {
      processedOrders = processedOrders.filter((order) => order.status === filters.status);
    }

    if (filters.searchTerm) {
      const lowercasedTerm = filters.searchTerm.toLowerCase();
      processedOrders = processedOrders.filter(
        (order) =>
          order.id.toLowerCase().includes(lowercasedTerm) ||
          (order.orderNumber || "").toLowerCase().includes(lowercasedTerm) ||
          order.items.some(
            (item) =>
              item.name.toLowerCase().includes(lowercasedTerm) ||
              item.brand.toLowerCase().includes(lowercasedTerm),
          ),
      );
    }

    if (filters.timeRange !== "all") {
      const today = new Date();
      const cutoffDate = new Date();
      cutoffDate.setDate(today.getDate() - parseInt(filters.timeRange, 10));

      processedOrders = processedOrders.filter((order) => {
        const orderDate = new Date(order.orderTimestamp);
        return orderDate >= cutoffDate;
      });
    }

    return processedOrders;
  }, [allOrders, filters]);

  const handleFilterChange = (newFilter) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilter,
    }));
  };

  if (loading) {
    return (
      <PageShell
        title="My Orders"
        subtitle="View, track, and manage your past and current orders."
        backLabel="Back to Marketplace"
        backTo="/shop"
      >
        <div className="orders-status">
          <div className="lit-spinner" aria-hidden="true" />
          <p>Loading your orders...</p>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell
        title="My Orders"
        backLabel="Back to Marketplace"
        backTo="/shop"
      >
        <div className="lit-alert lit-alert--error">{error}</div>
      </PageShell>
    );
  }

  if (allOrders.length === 0) {
    return (
      <PageShell
        title="My Orders & Returns"
        subtitle="View, track, and manage your past and current orders."
        backLabel="Back to Marketplace"
        backTo="/shop"
      >
        <div className="orders-empty-state">
          <div className="lit-empty__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
            </svg>
          </div>
          <h2 className="lit-empty__title">No Orders Yet</h2>
          <p className="lit-empty__message">You haven&apos;t placed any orders yet.</p>
          <Link to="/shop" className="lit-btn lit-btn--primary">
            Explore Marketplace
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="My Orders & Returns"
      subtitle="View, track, and manage your past and current orders."
      backLabel="Back to Marketplace"
      backTo="/shop"
    >
      <OrderControls filters={filters} onFilterChange={handleFilterChange} />

      <div className="order-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <div className="orders-empty-state orders-empty-state--compact">
            <p className="lit-empty__message">No orders match your current filters.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default OrdersPage;
