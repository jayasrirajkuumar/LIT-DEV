import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import menImage from "../../assets/men.png";
import womenImage from "../../assets/women.png";
import kidsImage from "../../assets/kids.png";
import "./MarketplaceLuxuryHome.css";

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

const CATEGORIES = [
  { id: "men", title: "MEN", image: menImage, alt: "Men's luxury collection", links: MEN_LINKS },
  { id: "women", title: "WOMEN", image: womenImage, alt: "Women's luxury collection", links: WOMEN_LINKS },
  { id: "kids", title: "KIDS", image: kidsImage, alt: "Kids luxury collection", links: KIDS_LINKS },
];

const CategoryCard = ({ title, image, alt, links, index }) => (
  <motion.article
    className="mp-luxury-category-card"
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-30px" }}
    transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4 }}
  >
    <div className="mp-luxury-category-card__media">
      <img src={image} alt={alt} className="mp-luxury-category-card__image" loading="lazy" />
      <div className="mp-luxury-category-card__overlay" />
    </div>
    <div className="mp-luxury-category-card__content">
      <h3>{title}</h3>
      <div className="mp-luxury-category-card__links">
        {links.map((link) => (
          <Link key={link.label} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  </motion.article>
);

const MarketplaceLuxuryCategories = () => (
  <section className="mp-luxury-categories" aria-label="Shop by category">
    <div className="mp-luxury-section-header">
      <p className="mp-section-kicker">Collections</p>
      <h2 className="mp-section-heading">Shop By Category</h2>
      <span className="mp-luxury-section-title__line" aria-hidden="true" />
    </div>

    <div className="mp-luxury-categories__grid">
      {CATEGORIES.map((category, index) => (
        <CategoryCard
          key={category.id}
          title={category.title}
          image={category.image}
          alt={category.alt}
          links={category.links}
          index={index}
        />
      ))}
    </div>

    <div className="mp-luxury-categories__view-all">
      <Link to="/shop/products">View All</Link>
    </div>
  </section>
);

export default MarketplaceLuxuryCategories;
