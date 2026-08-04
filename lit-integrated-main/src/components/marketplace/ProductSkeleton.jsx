import React from "react";

const ProductSkeleton = ({ count = 6 }) => (
  <section className="mp-products-section animate-in">
    <h2 className="mp-section-title mp-skeleton-title" aria-hidden="true" />
    <div className="mp-product-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div className="mp-skeleton-card" key={index} aria-hidden="true">
          <div className="mp-skeleton-image" />
          <div className="mp-skeleton-line wide" />
          <div className="mp-skeleton-line" />
          <div className="mp-skeleton-line short" />
          <div className="mp-skeleton-buttons">
            <div className="mp-skeleton-btn" />
            <div className="mp-skeleton-btn" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ProductSkeleton;
