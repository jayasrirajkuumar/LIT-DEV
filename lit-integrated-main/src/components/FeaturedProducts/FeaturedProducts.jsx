import React, { useState, useEffect } from "react";
import { getFeaturedProducts } from "../../services/api";
import ProductCard from "../Shop/ProductCard";
import "./FeaturedProducts.css";

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedProducts();
        setFeaturedProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="featured-products-section">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="loading">Loading featured products...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-products-section">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="error">Error loading featured products: {error}</div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <section className="featured-products-section">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="no-products">
            No featured products available at the moment.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-products-section">
      <div className="container">
        <h2>Featured Products</h2>
        <div className="featured-products-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
