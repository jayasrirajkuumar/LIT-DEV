import React from "react";
import { motion } from "framer-motion";
import { Wallet, CreditCard, Tag } from "lucide-react";

const GiftCardPayment = ({
  pricing,
  couponCode,
  onCouponChange,
  onApplyCoupon,
  walletBalance,
  isAuthenticated,
  loading,
  onProceed,
  selectedRecipient,
  amount,
  occasion,
}) => (
  <div className="gc-wizard-step gc-wizard-step--payment">
    <h2 className="gc-wizard-step__heading">Review & Payment</h2>
    <p className="gc-wizard-step__sub">Confirm details before sending</p>

    <div className="gc-wizard-review">
      <div className="gc-wizard-review__row">
        <span>Recipient</span>
        <strong>{selectedRecipient?.displayName || "—"}</strong>
      </div>
      <div className="gc-wizard-review__row">
        <span>Occasion</span>
        <strong>{occasion || "Custom"}</strong>
      </div>
      <div className="gc-wizard-review__row">
        <span>Gift Amount</span>
        <strong>₹{amount ? amount.toLocaleString() : "—"}</strong>
      </div>
    </div>

    <div className="gc-wizard-coupon gc-card">
      <label htmlFor="gc-coupon">
        <Tag size={16} /> Coupon Code
      </label>
      <div className="gc-wizard-coupon__row">
        <input
          id="gc-coupon"
          value={couponCode}
          onChange={(e) => onCouponChange(e.target.value)}
          placeholder="Enter coupon"
        />
        <motion.button
          type="button"
          className="lit-btn lit-btn--outline"
          onClick={onApplyCoupon}
          whileTap={{ scale: 0.97 }}
        >
          Apply
        </motion.button>
      </div>
    </div>

    {pricing && (
      <div className="gc-wizard-summary gc-card">
        <div className="gc-summary-row"><span>Gift Card Amount</span><span>₹{pricing.amount?.toLocaleString()}</span></div>
        <div className="gc-summary-row"><span>Platform Fee</span><span>₹{pricing.platformFee?.toLocaleString()}</span></div>
        <div className="gc-summary-row"><span>GST</span><span>₹{pricing.gstAmount?.toLocaleString()}</span></div>
        {pricing.discountAmount > 0 && (
          <div className="gc-summary-row"><span>Discount</span><span>-₹{pricing.discountAmount?.toLocaleString()}</span></div>
        )}
        <div className="gc-summary-row gc-summary-row--total">
          <span>Grand Total</span>
          <span>₹{pricing.grandTotal?.toLocaleString()}</span>
        </div>
      </div>
    )}

    {isAuthenticated && (
      <div className="gc-wizard-wallet">
        <Wallet size={18} />
        <span>Wallet balance: <strong>₹{walletBalance.toLocaleString()}</strong></span>
      </div>
    )}

    <motion.button
      type="button"
      className="lit-btn lit-btn--primary lit-btn--lg gc-wizard-pay-btn"
      disabled={loading || !amount || !selectedRecipient}
      onClick={onProceed}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <CreditCard size={18} style={{ marginRight: 8 }} />
      {loading ? "Processing..." : isAuthenticated ? "Proceed to Payment" : "Sign in to Send"}
    </motion.button>
  </div>
);

export default GiftCardPayment;
