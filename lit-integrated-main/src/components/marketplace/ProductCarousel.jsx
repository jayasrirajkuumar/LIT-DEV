import React, { memo, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import "./ProductCarousel.css";

const SCROLL_GAP = 32;

const slideMotion = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: index * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

const ProductCarousel = memo(({
  products = [],
  title = "Products",
  showTitle = true,
  className = "",
  ariaLabel = title,
  viewAllTo = "/shop/products",
  viewAllLabel = "View All →",
}) => {
  const trackRef = useRef(null);

  const getScrollStep = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 352;
    const slide = track.querySelector(".mp-product-carousel__slide");
    return (slide?.offsetWidth || 320) + SCROLL_GAP;
  }, []);

  const scroll = useCallback(
    (direction) => {
      const track = trackRef.current;
      if (!track) return;
      track.scrollBy({ left: direction * getScrollStep(), behavior: "smooth" });
    },
    [getScrollStep],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, [products.length]);

  if (!products.length) return null;

  return (
    <motion.section
      className={`mp-product-carousel ${className}`.trim()}
      aria-label={ariaLabel}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mp-product-carousel__shell">
        <div className="mp-product-carousel__glow mp-product-carousel__glow--left" aria-hidden="true" />
        <div className="mp-product-carousel__glow mp-product-carousel__glow--right" aria-hidden="true" />

        {showTitle && (
          <div className="mp-product-carousel__header">
            <div className="mp-product-carousel__header-spacer" aria-hidden="true" />
            <div className="mp-product-carousel__header-center">
              <h2 className="mp-product-carousel__title">{title}</h2>
              <span className="mp-product-carousel__title-line" aria-hidden="true" />
            </div>
            {viewAllTo ? (
              <Link to={viewAllTo} className="mp-product-carousel__view-all">
                {viewAllLabel}
              </Link>
            ) : (
              <div className="mp-product-carousel__header-spacer" aria-hidden="true" />
            )}
          </div>
        )}

        <div className="mp-product-carousel__stage">
          <button
            type="button"
            className="mp-product-carousel__float-arrow mp-product-carousel__float-arrow--left"
            onClick={() => scroll(-1)}
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>

          <div className="mp-product-carousel__viewport">
            <div ref={trackRef} className="mp-product-carousel__track">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="mp-product-carousel__slide"
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-20px" }}
                  variants={slideMotion}
                >
                  <ProductCard product={product} variant="premium" />
                </motion.div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="mp-product-carousel__float-arrow mp-product-carousel__float-arrow--right"
            onClick={() => scroll(1)}
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.section>
  );
});

ProductCarousel.displayName = "ProductCarousel";

export const ProductCarouselSkeleton = memo(({ title = "Products", count = 5 }) => (
  <section className="mp-product-carousel mp-product-carousel--skeleton" aria-hidden="true">
    <div className="mp-product-carousel__shell">
      <div className="mp-product-carousel__header">
        <div className="mp-product-carousel__header-spacer" />
        <div className="mp-product-carousel__header-center">
          <h2 className="mp-product-carousel__title">{title}</h2>
          <span className="mp-product-carousel__title-line" />
        </div>
        <div className="mp-product-carousel__header-spacer" />
      </div>
      <div className="mp-product-carousel__track">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="mp-product-carousel__slide">
            <div className="mp-product-carousel__skeleton-card">
              <div className="mp-skeleton-image" />
              <div className="mp-skeleton-line wide" />
              <div className="mp-skeleton-line" />
              <div className="mp-skeleton-buttons">
                <div className="mp-skeleton-btn" />
                <div className="mp-skeleton-btn" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

ProductCarouselSkeleton.displayName = "ProductCarouselSkeleton";

export default ProductCarousel;
