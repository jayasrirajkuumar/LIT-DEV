import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import seasonImage from "../../assets/marketplace-promo-season.png";
import clothingImage from "../../assets/marketplace/flashcards/flashcard-clothing.png";
import handbagsImage from "../../assets/marketplace/flashcards/flashcard-handbags.png";
import watchesImage from "../../assets/marketplace/flashcards/flashcard-watches.png";
import shoesImage from "../../assets/marketplace/flashcards/flashcard-shoes.png";
import "./MarketplaceLuxuryHome.css";

const COLLECTIONS = [
  {
    id: "summer",
    kicker: "Seasonal Edit",
    title: "Summer Collection",
    subtitle: "Light silhouettes and refined essentials for the warmer months.",
    image: seasonImage,
    to: "/shop/products",
    reverse: false,
  },
  {
    id: "essentials",
    kicker: "Forever Pieces",
    title: "Luxury Essentials",
    subtitle: "Investment wardrobe staples curated for timeless elegance.",
    image: clothingImage,
    to: "/shop/category/luxury-clothing",
    reverse: true,
  },
  {
    id: "new-arrivals",
    kicker: "Just Landed",
    title: "New Arrivals",
    subtitle: "The latest authenticated drops from iconic maisons worldwide.",
    image: handbagsImage,
    to: "/shop/products",
    reverse: false,
  },
  {
    id: "limited",
    kicker: "Rare Access",
    title: "Limited Edition",
    subtitle: "Exclusive pieces available for a select window only.",
    image: watchesImage,
    to: "/shop/products?discount=1",
    reverse: true,
  },
  {
    id: "designer",
    kicker: "Editor's Choice",
    title: "Designer Picks",
    subtitle: "Hand-selected by our curators for discerning taste.",
    image: shoesImage,
    to: "/shop/products",
    reverse: false,
  },
];

const MarketplaceFeaturedCollections = () => (
  <section className="mp-featured-collections" aria-label="Featured collections">
    <div className="mp-luxury-section-header">
      <p className="mp-section-kicker">Curated Edits</p>
      <h2 className="mp-section-heading">Featured Collections</h2>
      <span className="mp-luxury-section-title__line" aria-hidden="true" />
    </div>

    <div className="mp-featured-collections__list">
      {COLLECTIONS.map((collection, index) => (
        <motion.article
          key={collection.id}
          className={`mp-featured-collection${collection.reverse ? " mp-featured-collection--reverse" : ""}`}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: index * 0.05, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to={collection.to} className="mp-featured-collection__link">
            <div className="mp-featured-collection__media">
              <img src={collection.image} alt={collection.title} loading="lazy" />
              <div className="mp-featured-collection__overlay" />
            </div>
            <div className="mp-featured-collection__content">
              <p className="mp-featured-collection__kicker">{collection.kicker}</p>
              <h3>{collection.title}</h3>
              <p className="mp-featured-collection__subtitle">{collection.subtitle}</p>
              <span className="mp-featured-collection__cta">Explore Collection</span>
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  </section>
);

export default MarketplaceFeaturedCollections;
