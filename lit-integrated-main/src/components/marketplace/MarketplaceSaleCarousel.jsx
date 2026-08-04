import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MarketplaceHome.css";

const SLIDES = [
  {
    id: "sale",
    title: "FINAL SALE UPTO 80% OFF",
    cta: "Shop Now",
    to: "/shop/products?discount=1",
  },
  {
    id: "new",
    title: "NEW SEASON COLLECTION",
    cta: "Shop Now",
    to: "/shop/products",
  },
  {
    id: "luxury",
    title: "CURATED LUXURY EDIT",
    cta: "Shop Now",
    to: "/shop/category/luxury-handbags",
  },
];

const MarketplaceSaleCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(next, 5000);
    return () => window.clearInterval(timer);
  }, [next]);

  const slide = SLIDES[activeIndex];

  return (
    <section className="mp-template-sale" aria-label="Promotional offers">
      <div className="mp-template-sale__panel">
        <h2 className="mp-template-sale__title">{slide.title}</h2>
        <Link to={slide.to} className="mp-template-sale__cta">
          {slide.cta}
        </Link>
        <div className="mp-template-dots" role="tablist" aria-label="Promo slides">
          {SLIDES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Slide ${index + 1}`}
              className={`mp-template-dot${index === activeIndex ? " is-active" : ""}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketplaceSaleCarousel;
