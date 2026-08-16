import React from "react";
import { motion } from "framer-motion";

const GiftCardAmountSelector = ({
  presetAmounts,
  amount,
  customAmount,
  minAmount,
  onSelectPreset,
  onCustomChange,
}) => (
  <div className="gc-wizard-step gc-wizard-step--amount">
    <h2 className="gc-wizard-step__heading">Choose Amount</h2>
    <p className="gc-wizard-step__sub">Pick a preset or enter a custom value</p>
    <div className="gc-amount-grid">
      {presetAmounts.map((preset) => {
        const active = amount === String(preset) && !customAmount;
        return (
          <motion.button
            key={preset}
            type="button"
            className={`gc-amount-card ${active ? "gc-amount-card--selected" : ""}`}
            onClick={() => onSelectPreset(preset)}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            animate={active ? { scale: 1.05 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <span className="gc-amount-card__currency">₹</span>
            <span className="gc-amount-card__value">{preset.toLocaleString()}</span>
          </motion.button>
        );
      })}
    </div>
    <div className="gc-field gc-wizard-custom-amount">
      <label htmlFor="gc-custom-amount">Custom Amount</label>
      <input
        id="gc-custom-amount"
        placeholder={`₹${minAmount ?? 100} – ₹50,000`}
        value={customAmount}
        onChange={(e) => onCustomChange(e.target.value)}
      />
      {customAmount && Number(customAmount) < (minAmount ?? 100) && (
        <p className="gc-field__error">Minimum amount is ₹{minAmount ?? 100}</p>
      )}
    </div>
  </div>
);

export default GiftCardAmountSelector;
