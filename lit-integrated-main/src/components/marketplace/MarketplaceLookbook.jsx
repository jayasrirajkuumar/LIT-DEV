import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import seasonImage from "../../assets/marketplace-promo-season.png";
import clothingImage from "../../assets/marketplace/flashcards/flashcard-clothing.png";
import handbagsImage from "../../assets/marketplace/flashcards/flashcard-handbags.png";
import watchesImage from "../../assets/marketplace/flashcards/flashcard-watches.png";
import "./MarketplaceLuxuryHome.css";

const DISCOVER_ITEMS = [
  { id: "new-edit", title: "THE NEW EDIT", subtitle: "Discover what's just arrived", image: seasonImage, to: "/shop/products?sort=newest", cta: "SHOP NEW ARRIVALS" },
  { id: "maison", title: "THE MAISON EDIT", subtitle: "Exquisite pieces from the world's most iconic brands", image: handbagsImage, to: "/shop#brands", cta: "SHOP THE EDIT" },
  { id: "world", title: "A WORLD OF LUXURY", subtitle: "History, style and authenticity by LIT", image: watchesImage, to: "/shop/products", cta: "EXPLORE THE COLLECTION" },
  { id: "seasonal", title: "THE SEASONAL EDIT", subtitle: "Fresh picks for the moment", image: clothingImage, to: "/shop/products?discount=1", cta: "SHOP NOW" },
];

const MarketplaceLookbook = () => (
  <section className="mp-lookbook mp-lookbook--discover" aria-label="Discover more">
    <div className="mp-luxury-section-header">
      <p className="mp-section-kicker">Editorial</p>
      <h2 className="mp-section-heading mp-section-heading--serif">Discover More</h2>
      <span className="mp-luxury-section-title__line" aria-hidden="true" />
    </div>

    <div className="mp-lookbook__discover-grid">
      {DISCOVER_ITEMS.map((item, index) => (
        <motion.article
          key={item.id}
          className="mp-lookbook__discover-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
        >
          <Link to={item.to} className="mp-lookbook__discover-link">
            <img src={item.image} alt={item.title} loading="lazy" />
            <div className="mp-lookbook__discover-overlay">
              <h3>{item.title}</h3>
              {item.subtitle && <p>{item.subtitle}</p>}
              <span>{item.cta}</span>
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  </section>
);

export default MarketplaceLookbook;
