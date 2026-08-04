import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import seasonImage from "../../assets/marketplace-promo-season.png";
import clothingImage from "../../assets/marketplace/flashcards/flashcard-clothing.png";
import handbagsImage from "../../assets/marketplace/flashcards/flashcard-handbags.png";
import watchesImage from "../../assets/marketplace/flashcards/flashcard-watches.png";
import shoesImage from "../../assets/marketplace/flashcards/flashcard-shoes.png";
import accessoriesImage from "../../assets/marketplace/flashcards/flashcard-accessories.png";
import giftsImage from "../../assets/marketplace/flashcards/flashcard-gifts.png";
import "./MarketplaceLuxuryHome.css";

const LOOKBOOK_ITEMS = [
  { id: "summer", title: "Summer Edit", image: seasonImage, to: "/shop/products", tall: true },
  { id: "wardrobe", title: "Timeless Wardrobe", image: clothingImage, to: "/shop/category/luxury-clothing" },
  { id: "handbags", title: "Statement Bags", image: handbagsImage, to: "/shop/category/luxury-handbags", tall: true },
  { id: "watches", title: "Horology", image: watchesImage, to: "/shop/category/luxury-watches" },
  { id: "footwear", title: "Designer Footwear", image: shoesImage, to: "/shop/category/luxury-shoes" },
  { id: "accessories", title: "Fine Accessories", image: accessoriesImage, to: "/shop/category/accessories", tall: true },
  { id: "gifts", title: "Gift Selection", image: giftsImage, to: "/shop/gift-cards" },
];

const MarketplaceLookbook = () => (
  <section className="mp-lookbook" aria-label="Luxury lookbook">
    <div className="mp-luxury-section-header">
      <p className="mp-section-kicker">Inspiration</p>
      <h2 className="mp-section-heading">Luxury Lookbook</h2>
      <span className="mp-luxury-section-title__line" aria-hidden="true" />
    </div>

    <div className="mp-lookbook__grid">
      {LOOKBOOK_ITEMS.map((item, index) => (
        <motion.div
          key={item.id}
          className={`mp-lookbook__item${item.tall ? " mp-lookbook__item--tall" : ""}`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ delay: index * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to={item.to} className="mp-lookbook__link">
            <img src={item.image} alt={item.title} loading="lazy" />
            <div className="mp-lookbook__overlay">
              <span>{item.title}</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
);

export default MarketplaceLookbook;
