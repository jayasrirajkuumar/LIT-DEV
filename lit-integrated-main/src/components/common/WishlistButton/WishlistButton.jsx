import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/reducers/cartReducer"; // Adjust path if needed

const WishlistButton = ({ product }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.cart.wishlist);
  const isWishlisted = wishlist.some((item) => item._id === product._id);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  return (
    <button
      className={`inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent px-4 py-3 text-base font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${isWishlisted ? "bg-red-50 text-red-600" : ""}`}
      onClick={handleWishlistClick}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        className="shrink-0 transition-transform"
        viewBox="0 0 24 24"
        fill={isWishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
          {isWishlisted ? "Saved" : "Save"}
        </path>
      </svg>
      {/* <span></span> */}
    </button>
  );
};

export default WishlistButton;
