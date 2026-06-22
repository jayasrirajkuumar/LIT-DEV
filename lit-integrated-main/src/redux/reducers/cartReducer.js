import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  wishlist: [],
  coupon: "",
  discount: 0,
  couponApplied: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.cart.find(
        (item) =>
          item._id === action.payload._id &&
          item.color === action.payload.color &&
          item.size === action.payload.size,
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item._id !== action.payload);
    },
    updateCartItem: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.cart.find((item) => item._id === itemId);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
    addToWishlist: (state, action) => {
      if (!state.wishlist.some((item) => item._id === action.payload._id)) {
        state.wishlist.push(action.payload);
      }
    },
    removeFromWishlist: (state, action) => {
      state.wishlist = state.wishlist.filter(
        (item) => item._id !== action.payload,
      );
    },
    setCoupon: (state, action) => {
      state.coupon = action.payload.coupon;
      state.discount = action.payload.discount;
      state.couponApplied = action.payload.couponApplied;
    },
    clearCoupon: (state) => {
      state.coupon = "";
      state.discount = 0;
      state.couponApplied = false;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  addToWishlist,
  removeFromWishlist,
  setCoupon,
  clearCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;
