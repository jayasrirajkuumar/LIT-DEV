import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import menImage from "../../assets/men.png";
import womenImage from "../../assets/women.png";
import kidsImage from "../../assets/kids.png";
import "./MarketplaceHome.css";

const KIDS_LINKS = [
  { label: "Shop All", to: "/shop/products?kids=true" },
  { label: "Clothing", to: "/shop/products?kids=true&category=luxury-clothing" },
  { label: "Shoes", to: "/shop/products?kids=true&category=luxury-shoes" },
  { label: "Accessories", to: "/shop/products?kids=true&category=accessories" },
];

const MEN_LINKS = [
  { label: "Shop All", to: "/shop/products?gender=men" },
  { label: "Clothing", to: "/shop/category/luxury-clothing" },
  { label: "Shoes", to: "/shop/category/luxury-shoes" },
  { label: "Bags", to: "/shop/category/luxury-handbags" },
  { label: "Accessories", to: "/shop/category/accessories" },
];

const WOMEN_LINKS = [
  { label: "Shop All", to: "/shop/products?gender=women" },
  { label: "Clothing", to: "/shop/category/luxury-clothing" },
  { label: "Shoes", to: "/shop/category/luxury-shoes" },
  { label: "Bags", to: "/shop/category/luxury-handbags" },
  { label: "Accessories", to: "/shop/category/accessories" },
];

const HeroBanner = ({ title, image, alt, links }) => (
  <motion.div className="mp-template-category-card" whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
    <div className="mp-template-category-card__media">
      <img src={image} alt={alt} className="mp-template-category-card__image" />
      <div className="mp-template-category-card__overlay" />
    </div>
    <div className="mp-template-category-card__content">
      <h2>{title}</h2>
      <div className="mp-template-category-card__links">
        {links.map((link) => (
          <Link key={link.label} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  </motion.div>
);

const MarketplaceCategoryBanners = () => (
  <section className="mp-template-categories" aria-label="Shop by category">
    <div className="mp-template-category-grid">
      <HeroBanner title="MEN" image={menImage} alt="Men's luxury collection" links={MEN_LINKS} />
      <HeroBanner title="WOMEN" image={womenImage} alt="Women's luxury collection" links={WOMEN_LINKS} />
      <HeroBanner title="KIDS" image={kidsImage} alt="Kids luxury collection" links={KIDS_LINKS} />
    </div>
    <div className="mp-template-view-all">
      <Link to="/shop/products">View All</Link>
    </div>
  </section>
);

export default MarketplaceCategoryBanners;
