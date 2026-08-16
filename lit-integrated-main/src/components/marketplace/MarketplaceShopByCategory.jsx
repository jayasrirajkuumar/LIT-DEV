import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import menImage from "../../assets/marketplace/shop/men-shop.png";
import womenImage from "../../assets/marketplace/shop/women-shop.png";
import "./MarketplaceLuxuryHome.css";

const SUB_LINKS = [
  { label: "Bags", to: "/shop/category/luxury-handbags" },
  { label: "Shoes", to: "/shop/category/luxury-shoes" },
  { label: "Clothing", to: "/shop/category/luxury-clothing" },
  { label: "Accessories", to: "/shop/category/accessories" },
];

const BLOCKS = [
  {
    id: "men",
    title: "MEN",
    image: menImage,
    exploreTo: "/shop/products?gender=men",
    links: SUB_LINKS,
  },
  {
    id: "women",
    title: "WOMEN",
    image: womenImage,
    exploreTo: "/shop/products?gender=women",
    links: SUB_LINKS,
  },
];

const MarketplaceShopByCategory = () => (
  <section className="mp-shop-by-category" aria-label="Shop by category">
    <div className="mp-luxury-section-header">
      <h2 className="mp-section-heading mp-section-heading--serif">Shop by Category</h2>
      <span className="mp-luxury-section-title__line" aria-hidden="true" />
    </div>

    <div className="mp-shop-by-category__grid">
      {BLOCKS.map((block, index) => (
        <motion.article
          key={block.id}
          className="mp-shop-by-category__card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mp-shop-by-category__media">
            <img src={block.image} alt={block.title} loading="lazy" />
            <div className="mp-shop-by-category__overlay" />
          </div>
          <div className="mp-shop-by-category__content">
            <h3>{block.title}</h3>
            <ul className="mp-shop-by-category__links">
              {block.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
              <li>
                <Link to={block.exploreTo} className="mp-shop-by-category__explore">
                  EXPLORE ALL
                </Link>
              </li>
            </ul>
          </div>
        </motion.article>
      ))}
    </div>
  </section>
);

export default MarketplaceShopByCategory;
