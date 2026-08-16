import React, { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useShopping } from "../../context/ShoppingContext";
import LazyImage from "./LazyImage";
import QuickViewModal from "./QuickViewModal";
import { formatCatalogPrice, getDiscountPercent } from "../../utils/catalogFormat";

const premiumCardMotion = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -8,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const ProductCard = memo(({ product, variant = "default" }) => {
  const isPremium = variant === "premium";
  const { addToCart, buyNow, toggleWishlist, isWishlisted } = useShopping();
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);

  const productId = product.id;
  const wishlisted = isWishlisted(productId);
  const discount = getDiscountPercent(product.price, product.comparePrice);
  const image = product.primaryImage || product.images?.[0]?.imageUrl;
  const productUrl = `/shop/product/${product.slug}`;
  const inStock = product.inventory?.isInStock ?? product.status !== "OUT_OF_STOCK";
  const isLowStock = product.inventory?.isLowStock;

  const handleWishlistClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await toggleWishlist(productId);
  };

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await addToCart(productId, 1);
  };

  const handleBuyNow = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await buyNow(productId, 1);
  };

  const handleQuickView = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setQuickViewOpen(true);
  };

  const CardWrapper = isPremium ? motion.article : motion.article;
  const cardProps = isPremium
    ? {
        className: "mp-product-card mp-product-card--premium",
        initial: "rest",
        whileHover: "hover",
        animate: "rest",
        variants: premiumCardMotion,
      }
    : {
        className: "mp-product-card",
        whileHover: { y: -6 },
        transition: { duration: 0.3 },
      };

  return (
    <>
      <CardWrapper {...cardProps}>
        <div className="mp-product-media">
          <Link to={productUrl} className="mp-product-image-wrap" aria-label={product.name}>
            <LazyImage
              src={image}
              alt={product.name}
              className="mp-product-image-inner"
              fit={isPremium ? "cover" : "contain"}
            />
            {isPremium && <span className="mp-product-image-overlay" aria-hidden="true" />}
            {isPremium && <span className="mp-product-image-shade" aria-hidden="true" />}
          </Link>

          <div className="mp-product-badges">
            {!inStock && <span className="mp-stock-pill out">Sold Out</span>}
            {inStock && isLowStock && <span className="mp-stock-pill low">Low Stock</span>}
            {discount && <span className="mp-discount-pill">{discount}% OFF</span>}
          </div>

          <button
            type="button"
            className={`mp-wishlist-btn ${wishlisted ? "active" : ""}`}
            onClick={handleWishlistClick}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <motion.button
            type="button"
            className="mp-quickview-btn"
            onClick={handleQuickView}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.3 }}
          >
            Quick View
          </motion.button>
        </div>

        <div className={`mp-product-info${isPremium ? " mp-product-info--premium" : ""}`}>
          <Link to={productUrl} className="mp-product-info-link">
            <div className="mp-brand-name">{product.brand}</div>
            <h3 className="mp-product-title">{product.name}</h3>
            {(product.category?.name || product.shortDescription) && (
              <p className="mp-product-category">
                {product.category?.name || product.shortDescription}
              </p>
            )}
            {!isPremium && (
              <div className="mp-product-rating" aria-label="Premium curated product">
                <span className="mp-product-rating__stars" aria-hidden="true">★★★★★</span>
                <span className="mp-product-rating__label">Curated</span>
              </div>
            )}
          </Link>

          {isPremium && (
            <div className="mp-product-meta">
              <div className="mp-price-row mp-price-row--premium">
                {product.comparePrice && (
                  <span className="mp-original-price">
                    {formatCatalogPrice(product.comparePrice, product.currency)}
                  </span>
                )}
                <span className="mp-current-price">
                  {formatCatalogPrice(product.price, product.currency)}
                </span>
                {discount && <span className="mp-discount-percent">{discount}% off</span>}
              </div>
              <div className="mp-authenticated-badge" aria-label="Authenticated product">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                AUTHENTICATED
              </div>
            </div>
          )}

          {!isPremium && (
            <>
              <div className="mp-price-row">
                <span className="mp-current-price">
                  {formatCatalogPrice(product.price, product.currency)}
                </span>
              </div>
              {product.comparePrice && (
                <div className="mp-original-price">
                  {formatCatalogPrice(product.comparePrice, product.currency)}
                </div>
              )}
            </>
          )}

          <div className="mp-button-row">
            <button type="button" className="mp-buy-now" onClick={handleBuyNow} disabled={!inStock}>
              Buy Now
            </button>
            <button type="button" className="mp-add-to-cart" onClick={handleAddToCart} disabled={!inStock}>
              Add to Cart
            </button>
          </div>
        </div>
      </CardWrapper>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onAddToCart={() => addToCart(productId, 1)}
        onToggleWishlist={handleWishlistClick}
        isWishlisted={wishlisted}
      />
    </>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
