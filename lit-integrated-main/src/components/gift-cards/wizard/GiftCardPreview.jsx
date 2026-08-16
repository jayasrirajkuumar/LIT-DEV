import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import litLogo from "../../../assets/lit-logo.png";

const fade = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.25 },
};

const GiftCardPreview = ({
  gradient,
  occasion,
  amount,
  selectedRecipient,
  senderName,
  message,
  collapsed,
  onToggleCollapse,
}) => (
  <aside className={`gc-wizard-preview ${collapsed ? "gc-wizard-preview--collapsed" : ""}`}>
    <div className="gc-wizard-preview__header">
      <h3 className="gc-wizard-preview__title">Live Preview</h3>
      <button type="button" className="gc-wizard-preview__toggle" onClick={onToggleCollapse}>
        {collapsed ? "Show" : "Hide"}
      </button>
    </div>
    {!collapsed && (
      <motion.div
        className="gc-preview-card gc-wizard-preview__card"
        style={{ background: gradient }}
        layout
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        <div className="gc-preview-card__shine" aria-hidden="true" />
        <div className="gc-preview-card__top">
          <AnimatePresence mode="wait">
            <motion.div
              key={occasion || "occasion"}
              className="gc-preview-card__meta gc-preview-card__meta--occasion"
              {...fade}
            >
              {occasion || "Occasion"} · LIT Gift Card
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div key={amount || "amount"} className="gc-preview-card__amount" {...fade}>
              ₹{amount ? amount.toLocaleString() : "—"}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="gc-preview-card__bottom">
          <div className="gc-preview-card__recipient-block">
            <AnimatePresence mode="wait">
              <motion.div key={selectedRecipient?.id || "to"} className="gc-preview-card__meta" {...fade}>
                To: {selectedRecipient?.displayName || "Select recipient"}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div key={senderName || "from"} className="gc-preview-card__meta" {...fade}>
                From: {senderName || "Sender"}
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key={message.slice(0, 40)}
                className="gc-preview-card__meta gc-preview-card__meta--message"
                {...fade}
              >
                &ldquo;{message.slice(0, 80)}{message.length > 80 ? "…" : ""}&rdquo;
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div className="gc-preview-card__code" {...fade}>
            LIT-XXXX-XXXX-XXXX
          </motion.div>
          <div className="gc-preview-card__meta">Expires: 12 months · QR on delivery</div>
        </div>
        <img src={litLogo} alt="" className="gc-preview-card__logo" />
      </motion.div>
    )}
  </aside>
);

export default GiftCardPreview;
