import React, { createContext, useState, useContext } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item,
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: parseInt(quantity) }
          : item,
      ),
    );
  };

  const updateSize = (productId, size) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, size } : item,
      ),
    );
  };

  const applyPromoCode = (code) => {
    // Dummy promo code logic
    if (code === "DISCOUNT20") {
      setDiscount(20);
      setPromoCode(code);
      return true;
    }
    return false;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0,
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - subtotal * (discount / 100);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        showNotification,
        updateQuantity,
        updateSize,
        applyPromoCode,
        promoCode,
        discount,
        calculateSubtotal,
        calculateTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
