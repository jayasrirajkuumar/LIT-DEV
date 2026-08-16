import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const OCCASION_ICONS = {
  Birthday: "🎂",
  Anniversary: "💍",
  Wedding: "💒",
  Festival: "🪔",
  Congratulations: "🎉",
  Corporate: "🏢",
  "Thank You": "🙏",
  "New Year": "🎆",
  Christmas: "🎄",
  Graduation: "🎓",
  Custom: "✨",
};

const GiftCardOccasionStep = ({ occasions, value, onChange }) => (
  <div className="gc-wizard-step gc-wizard-step--occasion">
    <h2 className="gc-wizard-step__heading">Choose Occasion</h2>
    <p className="gc-wizard-step__sub">Select the perfect moment for your gift</p>
    <div className="gc-occasion-grid">
      {occasions.map((occasion) => {
        const selected = value === occasion;
        return (
          <motion.button
            key={occasion}
            type="button"
            className={`gc-occasion-card ${selected ? "gc-occasion-card--selected" : ""}`}
            onClick={() => onChange(occasion)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            animate={selected ? { scale: 1.04 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <span className="gc-occasion-card__icon">{OCCASION_ICONS[occasion] || "🎁"}</span>
            <span className="gc-occasion-card__label">{occasion}</span>
            {selected && (
              <motion.span
                className="gc-occasion-card__check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <Check size={14} strokeWidth={3} />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default GiftCardOccasionStep;
