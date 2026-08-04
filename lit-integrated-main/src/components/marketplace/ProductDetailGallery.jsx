import React, { useState } from "react";
import { motion } from "framer-motion";
import LazyImage from "./LazyImage";

const ProductDetailGallery = ({ images = [], productName }) => {
  const sorted = [...images].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const activeImage = sorted[activeIndex] || sorted[0];

  if (!sorted.length) {
    return (
      <div className="mp-gallery">
        <div className="mp-gallery-main catalog-image-fallback">LIT</div>
      </div>
    );
  }

  return (
    <div className="mp-gallery">
      <motion.div
        className={`mp-gallery-main ${zoomed ? "is-zoomed" : ""}`}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.35 }}
      >
        <LazyImage
          src={activeImage.imageUrl}
          alt={activeImage.altText || productName}
        />
      </motion.div>

      {sorted.length > 1 && (
        <div className="mp-gallery-thumbs">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={`mp-gallery-thumb ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              <LazyImage src={image.imageUrl} alt={image.altText || productName} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductDetailGallery;
