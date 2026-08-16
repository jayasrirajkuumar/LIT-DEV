import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Download, Share2, Gift } from "lucide-react";

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 0.6,
        color: ["#9333ea", "#a78bfa", "#c4b5fd", "#7c3aed", "#fbbf24"][i % 5],
      })),
    [],
  );

  return (
    <div className="gc-success-confetti" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="gc-success-confetti__piece"
          style={{ left: p.left, background: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: 280, opacity: 0, rotate: 360 }}
          transition={{ duration: 1.8, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

const GiftCardSuccess = ({ success, selectedRecipient, onSendAnother, onViewWallet }) => {
  const card = success?.giftCard;
  const txnId = success?.payment?.providerRef || card?.providerRef || card?.giftCardCode;

  const handleShare = async () => {
    const text = `I sent a ₹${card?.amount?.toLocaleString()} LIT gift card to ${card?.recipientName || selectedRecipient?.displayName}!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "LIT Gift Card Sent", text });
      } catch {
        /* dismissed */
      }
    } else {
      await navigator.clipboard?.writeText(text);
    }
  };

  const handleDownload = () => {
    const payload = {
      recipient: card?.recipientName || selectedRecipient?.displayName,
      amount: card?.amount,
      code: card?.giftCardCode,
      transactionId: txnId,
      sentAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lit-gift-card-${card?.giftCardCode || "receipt"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.section
      className="gc-wizard-success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Confetti />
      <motion.div
        className="gc-wizard-success__icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
      >
        <Check size={40} strokeWidth={2.5} />
      </motion.div>
      <h2 className="gc-wizard-success__title">Gift Card Sent Successfully</h2>
      <p className="gc-wizard-success__sub">
        The recipient will receive an in-app notification and email to claim the gift card.
      </p>

      <div className="gc-wizard-success__details gc-card">
        <div className="gc-wizard-success__row">
          <span>Recipient</span>
          <strong>{card?.recipientName || selectedRecipient?.displayName}</strong>
        </div>
        <div className="gc-wizard-success__row">
          <span>Amount</span>
          <strong>₹{card?.amount?.toLocaleString()}</strong>
        </div>
        <div className="gc-wizard-success__row">
          <span>Transaction ID</span>
          <strong className="gc-wizard-success__txn">{txnId || "—"}</strong>
        </div>
        {card?.giftCardCode && (
          <div className="gc-wizard-success__row">
            <span>Gift Card Code</span>
            <strong className="gc-success__code">{card.giftCardCode}</strong>
          </div>
        )}
      </div>

      <div className="gc-wizard-success__actions">
        <motion.button type="button" className="lit-btn lit-btn--outline" onClick={handleDownload} whileTap={{ scale: 0.97 }}>
          <Download size={16} style={{ marginRight: 6 }} /> Download
        </motion.button>
        <motion.button type="button" className="lit-btn lit-btn--outline" onClick={handleShare} whileTap={{ scale: 0.97 }}>
          <Share2 size={16} style={{ marginRight: 6 }} /> Share
        </motion.button>
        <motion.button type="button" className="lit-btn lit-btn--primary" onClick={onViewWallet} whileTap={{ scale: 0.97 }}>
          Done
        </motion.button>
      </div>
      <motion.button
        type="button"
        className="gc-wizard-success__another"
        onClick={onSendAnother}
        whileHover={{ scale: 1.02 }}
      >
        <Gift size={16} style={{ marginRight: 6 }} /> Send Another Gift Card
      </motion.button>
    </motion.section>
  );
};

export default GiftCardSuccess;
