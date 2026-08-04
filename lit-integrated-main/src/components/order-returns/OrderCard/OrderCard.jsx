import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../StatusBadge/StatusBadge";
import { formatCatalogPrice } from "../../../utils/catalogFormat";
import "./OrderCard.css";

const OrderCard = ({ order }) => {
  const handleCopy = (event, text) => {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  const itemCount = order.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const thumbnail = order.items[0]?.image || "/placeholder-product.png";

  return (
    <article className="order-card">
      <div className="order-card__header">
        <div className="order-card__header-group">
          <span className="order-card__label">Order</span>
          <span className="order-card__value order-card__value--mono">
            {order.orderNumber || order.id}
            <button
              type="button"
              onClick={(event) => handleCopy(event, order.orderNumber || order.id)}
              className="order-card__copy"
              title="Copy order number"
              aria-label="Copy order number"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
              </svg>
            </button>
          </span>
        </div>
        <div className="order-card__header-group">
          <span className="order-card__label">Placed</span>
          <span className="order-card__value">{order.date}</span>
        </div>
        <div className="order-card__header-group order-card__header-group--end">
          <span className="order-card__label">Total</span>
          <span className="order-card__value order-card__value--price">
            {formatCatalogPrice(order.pricing.grandTotal, "INR")}
          </span>
        </div>
      </div>

      <div className="order-card__body">
        <div className="order-card__product">
          <img src={thumbnail} alt="" className="order-card__thumb" />
          <div className="order-card__details">
            <StatusBadge status={order.status} />
            <h3 className="order-card__title">
              {order.items[0]?.name}
              {order.items.length > 1 && ` + ${order.items.length - 1} more`}
            </h3>
            <p className="order-card__meta">
              {itemCount} item{itemCount === 1 ? "" : "s"}
              {order.estimatedDelivery && order.status === "On the Way" && (
                <> · Est. {order.estimatedDelivery}</>
              )}
            </p>
          </div>
        </div>
        <Link to={`/orders/${order.id}`} className="lit-btn lit-btn--secondary order-card__cta">
          View Details
        </Link>
      </div>
    </article>
  );
};

export default OrderCard;
