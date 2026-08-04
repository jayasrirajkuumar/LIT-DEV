import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import seasonImage from "../../assets/marketplace-promo-season.png";
import clothingImage from "../../assets/marketplace/flashcards/flashcard-clothing.png";
import handbagsImage from "../../assets/marketplace/flashcards/flashcard-handbags.png";
import "./MarketplaceHome.css";

const SLIDES = [
  {
    id: "new-season",
    image: seasonImage,
    kicker: "NEW SEASON",
    title: "Luxury Redefined",
    subtitle: "Discover curated collections from the world's most iconic maisons.",
    primaryCta: { label: "Shop Now", to: "/shop/products" },
    secondaryCta: { label: "Explore Collection", to: "/shop/category/luxury-clothing" },
  },
  {
    id: "handbags",
    image: handbagsImage,
    kicker: "ICONIC PIECES",
    title: "Statement Handbags",
    subtitle: "Investment silhouettes crafted for the modern connoisseur.",
    primaryCta: { label: "Shop Handbags", to: "/shop/category/luxury-handbags" },
    secondaryCta: { label: "View Brands", to: "/shop#brands" },
  },
  {
    id: "clothing",
    image: clothingImage,
    kicker: "EDITOR'S PICK",
    title: "Timeless Wardrobe",
    subtitle: "Elevated essentials with uncompromising craftsmanship.",
    primaryCta: { label: "Shop Clothing", to: "/shop/category/luxury-clothing" },
    secondaryCta: { label: "New Arrivals", to: "/shop/products" },
  },
];

const slideVariants = {
  enter: (direction) => ({ opacity: 0, scale: 1.04, x: direction > 0 ? 60 : -60 }),
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction) => ({
    opacity: 0,
    scale: 0.98,
    x: direction > 0 ? -60 : 60,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const MarketplaceHeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (index) => {
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    },
    [activeIndex],
  );

  const next = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(next, 5000);
    return () => window.clearInterval(timer);
  }, [next]);

  const slide = SLIDES[activeIndex];

  return (
    <section className="mp-home-hero" aria-label="Featured collections">
      <div className="mp-home-hero__viewport">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            className="mp-home-hero__slide"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <img src={slide.image} alt="" className="mp-home-hero__image" />
            <div className="mp-home-hero__overlay" />
            <div className="mp-home-hero__content">
              <motion.p
                className="mp-home-hero__kicker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {slide.kicker}
              </motion.p>
              <motion.h1
                className="mp-home-hero__title"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {slide.title}
              </motion.h1>
              <motion.p
                className="mp-home-hero__subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {slide.subtitle}
              </motion.p>
              <motion.div
                className="mp-home-hero__actions"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Link to={slide.primaryCta.to} className="mp-home-btn mp-home-btn--primary">
                  {slide.primaryCta.label}
                </Link>
                <Link to={slide.secondaryCta.to} className="mp-home-btn mp-home-btn--ghost">
                  {slide.secondaryCta.label}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mp-home-hero__indicators" role="tablist" aria-label="Hero slides">
        {SLIDES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Slide ${index + 1}: ${item.title}`}
            className={`mp-home-hero__dot${index === activeIndex ? " is-active" : ""}`}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default MarketplaceHeroCarousel;
