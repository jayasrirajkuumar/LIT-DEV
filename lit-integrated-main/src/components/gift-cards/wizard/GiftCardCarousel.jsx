import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import litLogo from "../../../assets/lit-logo.png";

const GiftCardCarousel = ({ templates, selectedSlug, onSelect }) => {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, templates.findIndex((t) => t.slug === selectedSlug)),
  );

  const scrollToIndex = (index) => {
    const clamped = Math.max(0, Math.min(index, templates.length - 1));
    setActiveIndex(clamped);
    const template = templates[clamped];
    if (template) onSelect(template.slug);
    const track = trackRef.current;
    if (track) {
      const card = track.children[clamped];
      card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  if (!templates.length) return null;

  return (
    <div className="gc-wizard-step gc-wizard-step--design">
      <h2 className="gc-wizard-step__heading">Gift Card Design</h2>
      <p className="gc-wizard-step__sub">Swipe through premium templates</p>

      <div className="gc-carousel">
        <button
          type="button"
          className="gc-carousel__nav gc-carousel__nav--prev"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous design"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="gc-carousel__track" ref={trackRef}>
          {templates.map((template, index) => {
            const selected = selectedSlug === template.slug;
            const offset = index - activeIndex;
            return (
              <motion.button
                key={template.slug}
                type="button"
                className={`gc-carousel__card ${selected ? "gc-carousel__card--selected" : ""}`}
                style={{ background: template.gradient }}
                onClick={() => scrollToIndex(index)}
                animate={{
                  scale: selected ? 1.08 : 0.88,
                  rotateY: offset * -8,
                  opacity: Math.abs(offset) > 2 ? 0.35 : Math.abs(offset) === 0 ? 1 : 0.65,
                  zIndex: selected ? 10 : 5 - Math.abs(offset),
                }}
                whileHover={{ y: selected ? -6 : -3 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              >
                <div className="gc-carousel__card-shine" />
                <span className="gc-carousel__card-label">{template.name}</span>
                <img src={litLogo} alt="" className="gc-carousel__card-logo" />
              </motion.button>
            );
          })}
        </div>

        <button
          type="button"
          className="gc-carousel__nav gc-carousel__nav--next"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex >= templates.length - 1}
          aria-label="Next design"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="gc-carousel__dots">
        {templates.map((t, i) => (
          <button
            key={t.slug}
            type="button"
            className={`gc-carousel__dot ${i === activeIndex ? "gc-carousel__dot--active" : ""}`}
            onClick={() => scrollToIndex(i)}
            aria-label={`Design ${t.name}`}
          />
        ))}
      </div>
    </div>
  );
};

export default GiftCardCarousel;
