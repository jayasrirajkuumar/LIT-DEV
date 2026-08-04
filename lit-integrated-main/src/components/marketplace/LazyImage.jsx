import React, { useState } from "react";

const LazyImage = ({ src, alt, className = "", fit = "contain", ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`catalog-lazy-image catalog-lazy-image--${fit} ${loaded ? "is-loaded" : ""} ${className}`}
    >
      {!loaded && !failed && <div className="catalog-image-skeleton" aria-hidden="true" />}
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          {...props}
        />
      ) : (
        <div className="catalog-image-fallback" aria-hidden="true">
          <span className="catalog-image-fallback__mark">LIT</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
