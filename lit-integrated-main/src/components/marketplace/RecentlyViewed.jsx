import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { formatCatalogPrice } from "../../utils/catalogFormat";

const RecentlyViewed = ({ excludeProductId }) => {
  const items = useMemo(
    () => getRecentlyViewed().filter((item) => item.id !== excludeProductId).slice(0, 4),
    [excludeProductId],
  );

  if (!items.length) return null;

  return (
    <section className="mp-recommended-section">
      <h2 className="mp-section-title">Recently Viewed</h2>
      <div className="mp-recent-grid">
        {items.map((item) => (
          <Link key={item.id} to={`/shop/product/${item.slug}`} className="mp-recent-card">
            <div className="mp-recent-image">
              {item.primaryImage ? <img src={item.primaryImage} alt={item.name} loading="lazy" /> : <span>LIT</span>}
            </div>
            <div>
              <p className="mp-brand-name">{item.brand}</p>
              <p className="mp-product-title">{item.name}</p>
              <p className="mp-current-price">{formatCatalogPrice(item.price, item.currency)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
