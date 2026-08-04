import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LazyImage from "./LazyImage";
import { formatCatalogPrice, getDiscountPercent } from "../../utils/catalogFormat";

const QuickViewModal = ({ product, open, onClose, onAddToCart, onToggleWishlist, isWishlisted }) => {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!product) return null;

  const discount = getDiscountPercent(product.price, product.comparePrice);
  const image = product.primaryImage || product.images?.[0]?.imageUrl;
  const inStock = product.inventory?.isInStock ?? product.status !== "OUT_OF_STOCK";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="mp-quickview-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="mp-quickview-modal"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view ${product.name}`}
          >
            <button type="button" className="mp-quickview-close" onClick={onClose} aria-label="Close">
              ×
            </button>

            <div className="mp-quickview-grid">
              <div className="mp-quickview-image">
                <LazyImage src={image} alt={product.name} />
              </div>

              <div className="mp-quickview-info">
                <p className="mp-detail-brand">{product.brand}</p>
                <h2>{product.name}</h2>
                <p className="mp-detail-short">{product.shortDescription}</p>

                <div className="mp-price-row">
                  <span className="mp-current-price">
                    {formatCatalogPrice(product.price, product.currency)}
                  </span>
                  {discount && <span className="mp-discount">{discount}% OFF</span>}
                </div>

                {product.comparePrice && (
                  <div className="mp-original-price">
                    {formatCatalogPrice(product.comparePrice, product.currency)}
                  </div>
                )}

                <p className={inStock ? "mp-stock-in" : "mp-stock-out"}>
                  {inStock ? "In stock" : "Out of stock"}
                </p>

                <div className="mp-detail-actions">
                  <Link to={`/shop/product/${product.slug}`} className="mp-buy-now" onClick={onClose}>
                    View Details
                  </Link>
                  <button type="button" className="mp-add-to-cart" onClick={onAddToCart} disabled={!inStock}>
                    Add to Cart
                  </button>
                </div>

                <button
                  type="button"
                  className={`mp-wishlist-text-btn ${isWishlisted ? "active" : ""}`}
                  onClick={onToggleWishlist}
                >
                  {isWishlisted ? "Saved to wishlist" : "Add to wishlist"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
