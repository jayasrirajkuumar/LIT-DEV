import React, { useCallback, useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import "./MarketplaceHome.css";

const SLIDES = [
  {
    id: "delivery",
    title: "DELIVERY ACROSS INDIA",
    text: "We deliver across all pin codes in India",
  },
  {
    id: "shipping",
    title: "FREE SHIPPING",
    text: "Complimentary delivery on orders above ₹2,999",
  },
  {
    id: "returns",
    title: "EASY RETURNS",
    text: "Hassle-free returns within our luxury return window",
  },
];

const MarketplaceDeliveryCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(next, 6000);
    return () => window.clearInterval(timer);
  }, [next]);

  const slide = SLIDES[activeIndex];

  return (
    <section className="mp-template-delivery" aria-label="Delivery information">
      <div className="mp-template-delivery__panel">
        <h2 className="mp-template-delivery__title">{slide.title}</h2>
        <div className="mp-template-delivery__visual" aria-hidden="true">
          <svg className="mp-template-delivery__map" viewBox="0 0 120 140" fill="none">
            <path
              d="M60 8c-18 14-34 28-34 52 0 28 34 72 34 72s34-44 34-72c0-24-16-38-34-52z"
              fill="rgba(0,0,0,0.06)"
            />
          </svg>
          <MapPin size={56} strokeWidth={1.25} className="mp-template-delivery__pin" />
        </div>
        <p className="mp-template-delivery__text">{slide.text}</p>
        <div className="mp-template-dots" role="tablist" aria-label="Delivery slides">
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

export default MarketplaceDeliveryCarousel;
