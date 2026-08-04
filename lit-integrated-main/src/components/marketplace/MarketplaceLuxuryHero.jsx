import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import heroBgImage from "../../assets/marketplace-hero-bg.png";
import handbagsImage from "../../assets/marketplace/flashcards/flashcard-handbags.png";
import watchesImage from "../../assets/marketplace/flashcards/flashcard-watches.png";
import shoesImage from "../../assets/marketplace/flashcards/flashcard-shoes.png";
import "./MarketplaceLuxuryHome.css";

const FLOATING_CARDS = [
  { id: "handbags", image: handbagsImage, label: "Iconic Handbags", price: "₹24,999" },
  { id: "watches", image: watchesImage, label: "Luxury Watches", price: "₹89,500" },
  { id: "shoes", image: shoesImage, label: "Designer Shoes", price: "₹18,750" },
];

const MarketplaceLuxuryHero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section ref={ref} className="mp-luxury-hero" aria-label="Luxury in taste">
      <div className="mp-luxury-hero__bg" aria-hidden="true">
        <div className="mp-luxury-hero__image-layer">
          <img
            src={heroBgImage}
            alt=""
            className="mp-luxury-hero__image"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
        </div>
        <div className="mp-luxury-hero__gradient" />
        <div className="mp-luxury-hero__particles">
          {Array.from({ length: 18 }).map((_, index) => (
            <span key={index} className="mp-luxury-hero__particle" style={{ "--i": index }} />
          ))}
        </div>
      </div>

      <motion.div className="mp-luxury-hero__content" style={{ y: contentY }}>
        <motion.p
          className="mp-luxury-hero__kicker"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Luxury In Taste
        </motion.p>
        <motion.h1
          className="mp-luxury-hero__title"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          LUXURY IN TASTE
        </motion.h1>
        <motion.div
          className="mp-luxury-hero__divider"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.28, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          <span />
        </motion.div>
        <motion.p
          className="mp-luxury-hero__subtitle"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Discover premium fashion, curated collections, designer brands and exclusive deals.
        </motion.p>
        <motion.div
          className="mp-luxury-hero__actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to="/shop/products" className="mp-lux-btn mp-lux-btn--primary">
            Shop Now
          </Link>
          <Link to="/shop#brands" className="mp-lux-btn mp-lux-btn--ghost mp-lux-btn--gold">
            Explore Brands
          </Link>
        </motion.div>
      </motion.div>

      <motion.div className="mp-luxury-hero__floats" style={{ y: cardsY }} aria-hidden="true">
        {FLOATING_CARDS.map((card, index) => (
          <motion.div
            key={card.id}
            className={`mp-luxury-hero__float-card mp-luxury-hero__float-card--${index + 1}`}
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mp-luxury-hero__float-media">
              <img src={card.image} alt="" />
            </div>
            <div className="mp-luxury-hero__float-info">
              <span>{card.label}</span>
              <strong>{card.price}</strong>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default MarketplaceLuxuryHero;
