import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck } from "lucide-react";
import "../../styles/marketplace-luxury.css";

const MarketplaceCartDrawer = ({ isOpen, onClose, cartItems = [], onUpdateQuantity, onRemoveItem }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const delivery = subtotal > 0 ? (subtotal >= 50000 ? 0 : 1500) : 0;
  const grandTotal = subtotal + delivery;

  return (
    <>
      <div
        className="lux-cart-drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="lux-cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Your Bag"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1f1d1a]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} className="text-[#c5a059]" />
            <h2 className="lux-heading text-lg font-normal tracking-[0.14em] uppercase text-[#faf8f5]">
              YOUR BAG ({cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#a09a8f] hover:text-[#faf8f5] transition-colors p-1"
            aria-label="Close bag"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center">
              <ShoppingBag size={48} strokeWidth={1} className="text-[#423e38] mb-4" />
              <p className="lux-heading text-base text-[#faf8f5] mb-2 tracking-wide">YOUR BAG IS EMPTY</p>
              <p className="text-xs text-[#8c857a] max-w-[240px] mb-6">
                Explore our curated luxury collections and find your next statement piece.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/shop/products");
                }}
                className="lux-btn-primary text-xs"
              >
                EXPLORE EDIT
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-5 border-b border-[#1a1815] relative group"
              >
                <div className="w-20 h-20 bg-[#ece7df] flex items-center justify-center p-2 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#faf8f5] truncate">
                        {item.brand}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-[#6e685f] hover:text-[#dc2626] transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-[#a09a8f] truncate mb-1">
                      {item.name}
                    </p>
                    <p className="text-xs font-semibold text-[#d8b87a]">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-[#2b2824] bg-[#12110f]">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="p-1 text-[#a09a8f] hover:text-[#faf8f5] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-xs font-semibold text-[#faf8f5]">
                        {item.quantity || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="p-1 text-[#a09a8f] hover:text-[#faf8f5] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-[#070606] border-t border-[#1f1d1a] space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#8c857a]">
                <span>SUBTOTAL</span>
                <span className="text-[#faf8f5]">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#8c857a]">
                <span>SECURED DELIVERY</span>
                <span className="text-[#d8b87a]">
                  {delivery === 0 ? "COMPLIMENTARY" : `₹${delivery.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-[#1c1a17] text-[#faf8f5]">
                <span className="tracking-wide">TOTAL</span>
                <span className="text-[#d8b87a] font-bold">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-[#8c857a] justify-center pt-1">
              <ShieldCheck size={12} className="text-[#c5a059]" />
              <span>Includes 100% Authenticity Guarantee & Insurance</span>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/shop/checkout");
                }}
                className="lux-btn-primary w-full py-3.5 text-xs"
              >
                PROCEED TO CHECKOUT
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/cart");
                }}
                className="lux-btn-outline w-full py-2.5 text-xs"
              >
                VIEW FULL BAG
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MarketplaceCartDrawer;
