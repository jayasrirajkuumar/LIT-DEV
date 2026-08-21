import React, { createContext, useContext, useState, useEffect } from "react";
import { LUXURY_PRODUCTS } from "../data/marketplace/luxuryData";

const LuxuryShoppingContext = createContext(null);

export const LuxuryShoppingProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("lit_luxury_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem("lit_luxury_wishlist");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("lit_luxury_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem("lit_luxury_wishlist", JSON.stringify(Array.from(wishlistIds)));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistIds]);

  const showToast = (message) => {
    window.dispatchEvent(new CustomEvent("lit-toast", { detail: { message } }));
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    showToast(`Added ${product.brand} ${product.name} to bag`);
    setIsCartDrawerOpen(true);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    showToast("Item removed from bag");
  };

  const toggleWishlist = (productId) => {
    const product = LUXURY_PRODUCTS.find((p) => p.id === productId);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        showToast(product ? `Removed ${product.name} from wishlist` : "Removed from wishlist");
      } else {
        next.add(productId);
        showToast(product ? `Added ${product.name} to wishlist` : "Added to wishlist");
      }
      return next;
    });
  };

  const isWishlisted = (productId) => wishlistIds.has(productId);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const wishlistCount = wishlistIds.size;

  return (
    <LuxuryShoppingContext.Provider
      value={{
        cartItems,
        wishlistIds,
        cartCount,
        wishlistCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </LuxuryShoppingContext.Provider>
  );
};

export const useLuxuryShopping = () => {
  const context = useContext(LuxuryShoppingContext);
  if (!context) {
    throw new Error("useLuxuryShopping must be used within a LuxuryShoppingProvider");
  }
  return context;
};
