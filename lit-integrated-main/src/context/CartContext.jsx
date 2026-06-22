import React, { createContext, useContext, useReducer } from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.find(
        (item) =>
          item.id === action.payload.id &&
          item.selectedColor === action.payload.selectedColor &&
          item.selectedSize === action.payload.selectedSize,
      );

      if (existingItem) {
        return state.map((item) =>
          item.id === existingItem.id &&
          item.selectedColor === existingItem.selectedColor &&
          item.selectedSize === existingItem.selectedSize
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + action.payload.quantity,
                  item.stock,
                ),
              }
            : item,
        );
      }

      return [...state, action.payload];

    case "REMOVE_FROM_CART":
      return state.filter(
        (item) =>
          !(
            item.id === action.payload &&
            item.selectedColor === action.payload.selectedColor &&
            item.selectedSize === action.payload.selectedSize
          ),
      );

    case "UPDATE_QUANTITY":
      return state.map((item) =>
        item.id === action.payload.id &&
        item.selectedColor === action.payload.selectedColor &&
        item.selectedSize === action.payload.selectedSize
          ? {
              ...item,
              quantity: Math.min(
                Math.max(1, action.payload.quantity),
                item.stock,
              ),
            }
          : item,
      );

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);

  const addToCart = (product) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: {
        ...product,
        quantity: product.quantity || 1,
      },
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: productId,
    });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: {
        id: productId,
        quantity,
      },
    });
  };

  const clearCart = () => {
    dispatch({
      type: "CLEAR_CART",
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
