import React from "react";
import { useCart } from "../context/CartContext";

const Notification = () => {
  const { showNotification } = useCart();

  if (!showNotification) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "black",
        color: "white",
        padding: "15px 25px",
        borderRadius: "4px",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease-in-out",
      }}
    >
      Product added to cart
    </div>
  );
};

export default Notification;
