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
          className="mp-quickview-backdrop fixed inset-0 z-[2000] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="mp-quickview-modal relative my-auto max-h-[90dvh] w-full max-w-[920px] overflow-y-auto overscroll-contain rounded-[var(--mp-radius-xl)] border border-[var(--mp-border)] bg-[var(--mp-glass)] p-6 shadow-[var(--mp-shadow-soft)] max-sm:p-4"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view ${product.name}`}
          >
            <button type="button" className="mp-quickview-close sticky top-0 z-10 ml-auto grid size-9 place-items-center rounded-full border border-[var(--mp-border)] bg-neutral-900/90 text-[1.4rem] leading-none text-white backdrop-blur" onClick={onClose} aria-label="Close">
              ×
            </button>

            <div className="mp-quickview-grid grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
              <div className="mp-quickview-image aspect-square min-w-0 overflow-hidden rounded-[var(--mp-radius-lg)] bg-white">
                <LazyImage src={image} alt={product.name} />
              </div>

              <div className="mp-quickview-info min-w-0 break-words">
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

                <div className="mp-detail-actions flex flex-wrap gap-3 [&>*]:max-sm:w-full">
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
