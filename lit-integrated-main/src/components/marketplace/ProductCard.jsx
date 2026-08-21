import React from "react";
import { Link } from "react-router-dom";
import { Heart, Check } from "lucide-react";
import { useLuxuryShopping } from "../../context/LuxuryShoppingContext";
import "../../styles/marketplace-luxury.css";

const ProductCard = ({ product }) => {
  const { toggleWishlist, isWishlisted, addToCart } = useLuxuryShopping();
  const wishlisted = isWishlisted(product.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="lux-product-card group select-none">
      {/* Product Image Area (Light cream background container) */}
      <Link
        to={`/shop/product/${product.slug}`}
        className="lux-product-image-box block relative"
        aria-label={`View ${product.brand} ${product.name}`}
      >
        <img
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          className="w-full h-full object-contain"
          loading="lazy"
        />

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`lux-wishlist-btn ${wishlisted ? "is-active text-red-500" : "text-[#22201d] hover:text-[#000000]"}`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={18}
            strokeWidth={1.75}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>

        {/* Quick Add Overlay on Hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full bg-black/90 hover:bg-black text-[#faf8f5] text-[10px] font-bold tracking-[0.16em] uppercase py-2.5 transition-colors"
          >
            + QUICK ADD
          </button>
        </div>
      </Link>

      {/* Product Info (Near-black background) */}
      <div className="lux-product-details">
        <Link to={`/shop/product/${product.slug}`} className="block">
          <h4 className="lux-product-brand">
            {product.brand}
          </h4>
          <p className="lux-product-name" title={product.name}>
            {product.name}
          </p>
        </Link>

        <div className="lux-product-pricing">
          {product.originalPrice && (
            <span className="lux-product-price-old">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          <span className="lux-product-price-new">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>

        {product.authenticated && (
          <div className="lux-product-auth-badge">
            <Check size={13} strokeWidth={2.5} className="text-[#c5a059]" />
            <span>AUTHENTICATED</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
