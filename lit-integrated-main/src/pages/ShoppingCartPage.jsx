import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackNavigation from "../components/layout/BackNavigation";
import { useUserAuth } from "../hooks/useUserAuth";
import { useShopping } from "../context/ShoppingContext";
import { formatCatalogPrice } from "../utils/catalogFormat";
import "../styles/marketplace.css";
import "./ShoppingCartPage.css";

const ShoppingCartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserAuth();
  const {
    cart,
    loading,
    updateCartItemQuantity,
    removeFromCart,
    moveCartItemToWishlist,
  } = useShopping();

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0,
  );

  if (!isAuthenticated) {
    return (
      <div className="shopping-cart-page">
        <BackNavigation label="Back to Marketplace" fallbackTo="/shop" />
        <div className="shopping-cart-empty">
          <h1>Your cart</h1>
          <p>Sign in to view and manage your cart.</p>
          <Link to="/shop" className="shopping-cart-cta">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !cart) {
    return (
      <div className="shopping-cart-page">
        <BackNavigation label="Back to Marketplace" fallbackTo="/shop" />
        <div className="shopping-cart-loading">
          <div className="lit-spinner" aria-hidden="true" />
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="shopping-cart-page">
        <BackNavigation label="Back to Marketplace" fallbackTo="/shop" />
        <div className="shopping-cart-empty">
          <h1>Your cart is empty</h1>
          <p>Discover curated luxury pieces in the LIT Marketplace.</p>
          <Link to="/shop" className="shopping-cart-cta">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-cart-page">
      <BackNavigation label="Back to Marketplace" fallbackTo="/shop" />
      <div className="shopping-cart-header">
        <h1>Your Cart</h1>
        <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>

      <div className="shopping-cart-layout">
        <div className="shopping-cart-items">
          {items.map((item) => {
            const image = item.product.primaryImage || item.product.images?.[0]?.imageUrl;
            return (
              <motion.article
                key={item.id}
                className="shopping-cart-item"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link to={`/shop/product/${item.product.slug}`} className="shopping-cart-item-image">
                  {image ? <img src={image} alt={item.product.name} /> : <span>LIT</span>}
                </Link>

                <div className="shopping-cart-item-details">
                  <Link to={`/shop/product/${item.product.slug}`}>
                    <p className="shopping-cart-item-brand">{item.product.brand}</p>
                    <h2>{item.product.name}</h2>
                  </Link>
                  <p className="shopping-cart-item-price">
                    {formatCatalogPrice(item.product.price, item.product.currency)}
                  </p>

                  <div className="shopping-cart-item-actions">
                    <div className="mp-quantity-control">
                      <button
                        type="button"
                        onClick={() => updateCartItemQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <input type="number" min="1" value={item.quantity} readOnly aria-label="Quantity" />
                      <button
                        type="button"
                        onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button type="button" className="shopping-cart-link-btn" onClick={() => removeFromCart(item.productId)}>
                      Remove
                    </button>
                    <button
                      type="button"
                      className="shopping-cart-link-btn"
                      onClick={() => moveCartItemToWishlist(item.productId)}
                    >
                      Move to wishlist
                    </button>
                  </div>
                </div>

                <div className="shopping-cart-item-total">
                  {formatCatalogPrice(Number(item.product.price) * item.quantity, item.product.currency)}
                </div>
              </motion.article>
            );
          })}
        </div>

        <aside className="shopping-cart-summary">
          <h2>Order Summary</h2>
          <div className="shopping-cart-summary-row">
            <span>Subtotal</span>
            <span>{formatCatalogPrice(subtotal, items[0]?.product.currency || "INR")}</span>
          </div>
          <p className="shopping-cart-note">Shipping and tax are calculated at checkout.</p>
          <button type="button" className="shopping-cart-cta" onClick={() => navigate("/shop/checkout")}>
            Proceed to Checkout
          </button>
          <button type="button" className="shopping-cart-secondary" onClick={() => navigate("/shop")}>
            Continue Shopping
          </button>
        </aside>
      </div>
    </div>
  );
};

export default ShoppingCartPage;
