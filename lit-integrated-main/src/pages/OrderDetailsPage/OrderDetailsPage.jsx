import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cancelOrder, getOrderById, reorder } from "../../services/orderService";
import { formatCatalogPrice } from "../../utils/catalogFormat";
import PageShell from "../../components/layout/PageShell";
import StatusBadge from "../../components/order-returns/StatusBadge/StatusBadge";
import DeliveryTimeline from "../../components/order-returns/DeliveryTimeline/DeliveryTimeline";
import CancelOrderModal from "../../components/order-returns/CancelOrderModal/CancelOrderModal";
import ProductItemDetails from "../../components/order-returns/ProductItemDetails/ProductItemDetails";
import "../../components/order-returns/DeliveryTimeline/DeliveryTimeline.css";
import "./OrderDetailsPage.css";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    loadOrder();
  }, [orderId]);

  const handleCancelConfirm = async ({ reasonCode, reasonText }) => {
    setActionLoading(true);
    try {
      await cancelOrder(orderId, { reasonCode, reasonText });
      await loadOrder();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReorder = async () => {
    try {
      setActionLoading(true);
      await reorder(orderId);
      navigate("/cart");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <PageShell backLabel="Back to My Orders" backTo="/orders">
        <div className="order-details-status">
          <div className="lit-spinner" aria-hidden="true" />
          <p>Loading order details...</p>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Order Details" backLabel="Back to My Orders" backTo="/orders">
        <div className="lit-alert lit-alert--error">{error}</div>
        <Link to="/orders" className="lit-btn lit-btn--secondary">
          Return to My Orders
        </Link>
      </PageShell>
    );
  }

  if (!order) return null;

  const currency = "INR";
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <PageShell backLabel="Back to My Orders" backTo="/orders" showBack className="order-details-page">
      <header className="order-details-hero lit-card lit-card--elevated">
        <div className="order-details-hero__main">
          <p className="order-details-hero__label">Order Number</p>
          <h1 className="order-details-hero__number">{order.orderNumber || order.id}</h1>
          <div className="order-details-hero__meta">
            <StatusBadge status={order.status} />
            <span className="order-details-hero__date">Placed {order.date}</span>
          </div>
        </div>
        <div className="order-details-hero__actions lit-btn-row lit-btn-row--end">
          {order.canCancel && (
            <button
              type="button"
              className="lit-btn lit-btn--danger"
              onClick={() => setCancelOpen(true)}
              disabled={actionLoading}
            >
              Cancel Order
            </button>
          )}
          {!order.canCancel && order.cancelWindowExpired && (
            <p className="order-cancel-expired" role="status">
              Cancellation window has expired.
            </p>
          )}
          <button type="button" className="lit-btn lit-btn--secondary" onClick={handleReorder} disabled={actionLoading}>
            Reorder
          </button>
        </div>
      </header>

      <section className="lit-card order-details-section">
        <h2 className="lit-section-title">Order Progress</h2>
        <DeliveryTimeline
          orderStatus={order.rawStatus}
          statusHistory={order.statusHistory}
          bare
        />
      </section>

      <section className="lit-card order-details-section">
        <div className="order-details-section__header">
          <h2 className="lit-section-title">Ordered Products</h2>
          <span className="order-details-section__count">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
        </div>
        <div className="order-details-products">
          {order.items.map((item) => (
            <ProductItemDetails key={item.sku} item={item} variant="row" />
          ))}
        </div>
      </section>

      <div className="order-details-grid">
        <section className="lit-card order-details-section">
          <h2 className="lit-section-title">Shipping Address</h2>
          <div className="order-details-info">
            <p className="order-details-info__name">{order.shippingInfo.recipientName}</p>
            <p>{order.shippingInfo.address}</p>
            <p>{order.shippingInfo.contactInfo}</p>
            {order.trackingNumber && (
              <p className="order-details-info__tracking">
                Tracking: <strong>{order.trackingNumber}</strong>
              </p>
            )}
          </div>
        </section>

        <section className="lit-card order-details-section">
          <h2 className="lit-section-title">Payment Information</h2>
          <div className="order-details-info">
            <p>
              Status: <strong>{order.paymentStatus || "Completed"}</strong>
            </p>
          </div>
        </section>
      </div>

      <section className="lit-card order-details-section order-details-summary">
        <h2 className="lit-section-title">Order Summary</h2>
        <div className="lit-summary-row">
          <span>Subtotal</span>
          <span>{formatCatalogPrice(order.pricing.subtotal, currency)}</span>
        </div>
        <div className="lit-summary-row">
          <span>Shipping</span>
          <span>{formatCatalogPrice(order.pricing.shippingFee, currency)}</span>
        </div>
        <div className="lit-summary-row">
          <span>Tax</span>
          <span>{formatCatalogPrice(order.pricing.tax, currency)}</span>
        </div>
        <div className="lit-summary-row lit-summary-row--total">
          <span>Total</span>
          <span>{formatCatalogPrice(order.pricing.grandTotal, currency)}</span>
        </div>
      </section>

      <section className="lit-card order-details-help">
        <h2 className="lit-section-title">Need Help?</h2>
        <p className="lit-body">Questions about your order? Our concierge team is here to assist.</p>
        <div className="order-support-grid">
          <Link to="/contact" className="order-support-card">Contact Support</Link>
          <Link to="/returnpolicy" className="order-support-card">Return Policy</Link>
          <Link to="/shippingpolicy" className="order-support-card">Shipping Policy</Link>
          <Link to="/faq" className="order-support-card">FAQ</Link>
          <button type="button" className="order-support-card" disabled title="Coming soon">
            Chat (placeholder)
          </button>
        </div>
      </section>

      <CancelOrderModal
        open={cancelOpen}
        order={order}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelConfirm}
      />
    </PageShell>
  );
};

export default OrderDetailsPage;
