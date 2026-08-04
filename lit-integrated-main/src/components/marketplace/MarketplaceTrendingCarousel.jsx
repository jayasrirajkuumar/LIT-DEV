import React, { useRef } from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import "./MarketplaceHome.css";

const MarketplaceTrendingCarousel = ({ products = [], loading = false, error = null }) => {
  const trackRef = useRef(null);

  if (error) return null;

  return (
    <section className="mp-template-products mp-template-products--trending" aria-label="Trending now">
      <h2 className="mp-template-section-title">Trending Now</h2>

      {loading && <ProductSkeleton count={4} />}

      {!loading && products.length > 0 && (
        <div className="mp-template-products__track" ref={trackRef}>
          {products.map((product) => (
            <div key={product.id} className="mp-template-products__item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MarketplaceTrendingCarousel;
