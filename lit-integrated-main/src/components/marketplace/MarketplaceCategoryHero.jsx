import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import menImage from "../../assets/men.png";
import womenImage from "../../assets/women.png";
import kidsImage from "../../assets/kids.png";
import "./MarketplaceLuxuryHome.css";

const PANELS = [
  { id: "men", title: "MEN", image: menImage, to: "/shop/products?gender=men", alt: "Men's luxury fashion" },
  { id: "women", title: "WOMEN", image: womenImage, to: "/shop/products?gender=women", alt: "Women's luxury fashion" },
  { id: "kids", title: "KIDS", image: kidsImage, to: "/shop/products?kids=true", alt: "Kids luxury fashion" },
];

const MarketplaceCategoryHero = () => (
  <section className="mp-category-hero" aria-label="Shop men, women, and kids">
    <div className="mp-category-hero__grid">
      {PANELS.map((panel, index) => (
        <motion.article
          key={panel.id}
          className="mp-category-hero__panel"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to={panel.to} className="mp-category-hero__link">
            <img src={panel.image} alt={panel.alt} className="mp-category-hero__image" loading={index === 0 ? "eager" : "lazy"} />
            <div className="mp-category-hero__overlay" />
            <div className="mp-category-hero__content">
              <h2>{panel.title}</h2>
              <span className="mp-category-hero__cta">
                SHOP NOW <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  </section>
);

export default MarketplaceCategoryHero;
