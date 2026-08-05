import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CreditCard } from "lucide-react";
import "../../styles/gift-cards.css";

const GiftCardPaymentModal = ({
  open,
  onClose,
  onContinue,
  total,
  walletBalance,
  loading,
}) => {
  const [method, setMethod] = useState("WALLET");
  const insufficient = walletBalance < total;

  useEffect(() => {
    if (open) setMethod(walletBalance >= total ? "WALLET" : "RAZORPAY");
  }, [open, walletBalance, total]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => event.key === "Escape" && onClose?.();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="gc-modal-overlay fixed inset-0 z-[2000] flex items-center justify-center overflow-y-auto bg-black/75 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="gc-modal gc-card my-auto max-h-[90dvh] w-full max-w-[420px] overflow-y-auto overscroll-contain"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="gc-section__title">Choose Payment Method</h3>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1rem" }}>
            Total: <strong>₹{total?.toLocaleString()}</strong> · Wallet: <strong>₹{walletBalance?.toLocaleString()}</strong>
          </p>

          <label className={`gc-payment-option ${method === "RAZORPAY" ? "gc-payment-option--active" : ""}`}>
            <input type="radio" name="pay" checked={method === "RAZORPAY"} onChange={() => setMethod("RAZORPAY")} />
            <CreditCard size={18} />
            <span>Razorpay</span>
          </label>

          <label className={`gc-payment-option ${method === "WALLET" ? "gc-payment-option--active" : ""} ${insufficient ? "gc-payment-option--disabled" : ""}`}>
            <input
              type="radio"
              name="pay"
              checked={method === "WALLET"}
              onChange={() => !insufficient && setMethod("WALLET")}
              disabled={insufficient}
            />
            <Wallet size={18} />
            <span>Wallet Balance</span>
          </label>

          {insufficient && method === "WALLET" && (
            <p className="adm-alert adm-alert--error" style={{ marginTop: "0.75rem" }}>
              Insufficient Wallet Balance. Please use Razorpay.
            </p>
          )}

          <div className="gc-modal-actions mt-6 flex flex-wrap justify-end gap-3 [&>button]:max-sm:flex-1">
            <button type="button" className="lit-btn lit-btn--outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="button"
              className="lit-btn lit-btn--primary"
              disabled={loading || (method === "WALLET" && insufficient)}
              onClick={() => onContinue(method)}
            >
              {loading ? "Processing..." : "Continue"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GiftCardPaymentModal;
