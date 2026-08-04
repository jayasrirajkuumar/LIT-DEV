import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./MarketplaceHome.css";

const MarketplaceLuxurySaleBanner = () => (
  <section className="mp-luxury-sale" aria-label="Exclusive luxury sale">
    <motion.div
      className="mp-luxury-sale__inner"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mp-luxury-sale__particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} className="mp-luxury-sale__particle" style={{ "--i": index }} />
        ))}
      </div>
      <div className="mp-luxury-sale__content">
        <p className="mp-luxury-sale__kicker">Exclusive Luxury Sale</p>
        <h2 className="mp-luxury-sale__title">UP TO 80% OFF</h2>
        <p className="mp-luxury-sale__subtitle">
          Limited-time access to authenticated luxury from the world&apos;s finest houses.
        </p>
        <Link to="/shop/products?discount=1" className="mp-home-btn mp-home-btn--primary mp-luxury-sale__cta">
          Shop The Sale
        </Link>
      </div>
    </motion.div>
  </section>
);

export default MarketplaceLuxurySaleBanner;
