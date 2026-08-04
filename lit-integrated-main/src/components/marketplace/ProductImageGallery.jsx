import React, { useState } from "react";
import LazyImage from "./LazyImage";

const ProductImageGallery = ({ images = [], productName }) => {
  const sorted = [...images].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = sorted[activeIndex] || sorted[0];

  if (!sorted.length) {
    return (
      <div className="catalog-gallery">
        <div className="catalog-gallery-main catalog-image-fallback">LIT</div>
      </div>
    );
  }

  return (
    <div className="catalog-gallery">
      <div className="catalog-gallery-main">
        <LazyImage
          src={activeImage.imageUrl}
          alt={activeImage.altText || productName}
        />
      </div>
      {sorted.length > 1 && (
        <div className="catalog-gallery-thumbs">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={`catalog-gallery-thumb ${index === activeIndex ? "active" : ""}`}
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

export default ProductImageGallery;
