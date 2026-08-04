import React from "react";
import { formatCatalogPrice } from "../../../utils/catalogFormat";
import "./ProductItemDetails.css";

const ProductItemDetails = ({ item, variant = "stack" }) => {
  const unitPrice = item.price ?? item.priceAtPurchase ?? 0;
  const lineTotal = unitPrice * (item.quantity ?? 1);

  if (variant === "row") {
    return (
      <article className="product-item-details-container is-row">
        <img src={item.image} alt={item.name} className="item-image" />
        <div className="item-info">
          <p className="item-brand">{item.brand}</p>
          <h3 className="item-name">{item.name}</h3>
          <p className="item-meta">Qty {item.quantity ?? 1} · SKU {item.sku}</p>
        </div>
        <div className="item-price-col">
          <span className="item-line-price">{formatCatalogPrice(lineTotal, "INR")}</span>
          {(item.quantity ?? 1) > 1 && (
            <span className="item-unit-price">
              {formatCatalogPrice(unitPrice, "INR")} each
            </span>
          )}
        </div>
      </article>
    );
  }

  return (
    <div className="product-item-details-container">
      <img src={item.image} alt={item.name} className="item-image" />
      <div className="item-info">
        <p className="item-brand">{item.brand}</p>
        <h3 className="item-name">{item.name}</h3>
        {item.description && <p className="item-description">{item.description}</p>}
        {item.size && <p className="item-size">Size: {item.size}</p>}
      </div>
    </div>
  );
};

export default ProductItemDetails;
