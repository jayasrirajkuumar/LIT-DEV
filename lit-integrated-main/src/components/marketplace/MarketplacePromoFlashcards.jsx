import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import seasonImage from "../../assets/marketplace-promo-season.png";
import womenImage from "../../assets/women.png";
import luxuryImage from "../../assets/luxury-fashion.png";
import "./MarketplacePromoFlashcards.css";

const SLIDES = [
  {
    id: "season",
    image: seasonImage,
    alt: "Couple in luxury resort wear by the sea",
    title: "The Season's Edit",
    kicker: "UP TO 60% OFF",
    subtitle: "Where luxury meets contemporary wardrobe essentials",
    cta: "Shop The Collection",
    to: "/shop/products",
  },
  {
    id: "arrivals",
    image: womenImage,
    alt: "Women's luxury fashion editorial",
    title: "New Arrivals",
    kicker: "JUST LANDED",
    subtitle: "Discover the latest pieces from iconic maisons",
    cta: "Explore Now",
    to: "/shop/products",
  },
  {
    id: "curated",
    image: luxuryImage,
    alt: "Curated luxury fashion selection",
    title: "Curated Luxury",
    kicker: "EDITOR'S PICK",
    subtitle: "Investment pieces that define modern elegance",
    cta: "Shop Curated",
    to: "/shop/category/luxury-handbags",
  },
];

const slideVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 48 : -48,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -48 : 48,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

const MarketplacePromoFlashcards = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((index) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  }, [activeIndex]);

  const next = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(next, 7000);
    return () => window.clearInterval(timer);
  }, [next]);

  const slide = SLIDES[activeIndex];

  return (
    <section className="mp-promo-flashcards" aria-label="Featured collections">
      <div className="mp-promo-flashcards__panel">
        <div className="mp-promo-flashcards__viewport">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.article
              key={slide.id}
              className="mp-promo-slide"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="mp-promo-slide__media">
                <img src={slide.image} alt={slide.alt} />
              </div>
              <div className="mp-promo-slide__content">
                <h2 className="mp-promo-slide__title">{slide.title}</h2>
                <p className="mp-promo-slide__kicker">{slide.kicker}</p>
                <p className="mp-promo-slide__subtitle">{slide.subtitle}</p>
                <Link to={slide.to} className="mp-promo-slide__cta">
                  {slide.cta}
                </Link>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className="mp-promo-flashcards__dots" role="tablist" aria-label="Promo slides">
          {SLIDES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show slide ${index + 1}: ${item.title}`}
              className={`mp-promo-flashcards__dot${index === activeIndex ? " is-active" : ""}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketplacePromoFlashcards;
