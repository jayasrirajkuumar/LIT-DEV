import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../../../../services/orderService";
import { formatCatalogPrice } from "../../../../utils/catalogFormat";
import StatusBadge from "../../../../components/order-returns/StatusBadge/StatusBadge";

const OrderDetailsSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState({});

  useEffect(() => {
    getOrders()
      .then((data) => setOrders(data.slice(0, 3)))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="order-details-container profile-order-empty">
        <h2 className="profile-section-title">Recent Orders</h2>
        <div className="lit-loading">
          <div className="lit-spinner" aria-hidden="true" />
          <p>Loading recent orders...</p>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="order-details-container profile-order-empty">
        <h2 className="profile-section-title">Recent Orders</h2>
        <div className="profile-empty-state">
          <h3>No Orders Yet</h3>
          <p>You haven&apos;t placed any orders yet.</p>
          <Link to="/shop" className="lit-btn lit-btn--primary">
            Explore Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-container">
      <div className="profile-card-header">
        <h2 className="profile-section-title">Recent Orders</h2>
        <Link to="/orders" className="lit-btn lit-btn--ghost">
          View All
        </Link>
      </div>
      <div className="profile-order-list">
        {orders.map((order) => {
          const itemCount = order.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
          const thumbnail = brokenImages[order.id]
            ? "/placeholder-product.png"
            : (order.items[0]?.image || "/placeholder-product.png");

          return (
            <Link key={order.id} to={`/orders/${order.id}`} className="profile-order-item">
              <img
                src={thumbnail}
                alt=""
                className="profile-order-item__thumb"
                onError={() => setBrokenImages((prev) => ({ ...prev, [order.id]: true }))}
              />
              <div className="profile-order-item__body">
                <div className="profile-order-item__top">
                  <strong>{order.orderNumber || order.id}</strong>
                  <StatusBadge status={order.status} />
                </div>
                <p className="profile-order-item__meta">
                  {order.date} · {itemCount} item{itemCount === 1 ? "" : "s"}
                </p>
                <p className="profile-order-item__product">{order.items[0]?.name}</p>
              </div>
              <div className="profile-order-item__aside">
                <span className="profile-order-item__total">
                  {formatCatalogPrice(order.pricing.grandTotal, "INR")}
                </span>
                <span className="profile-order-item__link">View Details</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default OrderDetailsSection;
