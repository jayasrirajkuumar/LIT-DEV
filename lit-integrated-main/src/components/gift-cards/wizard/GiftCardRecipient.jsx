import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { User, Clock } from "lucide-react";
import LitUserSearch from "../LitUserSearch";

function maskPhone(phone) {
  if (!phone || phone.length < 4) return phone || "—";
  return `${phone.slice(0, phone.length - 2).replace(/\d(?=\d{2})/g, "X")}${phone.slice(-2)}`;
}

const GiftCardRecipient = ({
  selectedRecipient,
  onSelect,
  onClear,
  isAuthenticated,
  recent,
  senderName,
  onSenderNameChange,
}) => {
  const recentRecipients = useMemo(() => {
    const seen = new Set();
    return (recent ?? [])
      .map((card) => ({
        id: card.recipientId || card.recipient?.id,
        displayName: card.recipientName || card.recipient?.displayName,
        phoneNumber: card.recipient?.phoneNumber,
        profilePicture: card.recipient?.profilePicture,
        username: card.recipient?.username,
      }))
      .filter((r) => r.id && r.displayName && !seen.has(r.id) && seen.add(r.id))
      .slice(0, 5);
  }, [recent]);

  return (
    <div className="gc-wizard-step gc-wizard-step--recipient">
      <h2 className="gc-wizard-step__heading">Choose Recipient</h2>
      <p className="gc-wizard-step__sub">Send to a registered LIT member</p>

      <div className="gc-wizard-recipient-search">
        <LitUserSearch
          selectedUser={selectedRecipient}
          onSelect={onSelect}
          onClear={onClear}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {recentRecipients.length > 0 && !selectedRecipient && (
        <div className="gc-wizard-recent">
          <h3 className="gc-wizard-recent__title">
            <Clock size={16} /> Recent Recipients
          </h3>
          <ul className="gc-wizard-recent__list">
            {recentRecipients.map((user) => (
              <motion.li key={user.id}>
                <button
                  type="button"
                  className="gc-wizard-recent__item"
                  onClick={() => onSelect(user)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="gc-wizard-recent__avatar">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="" />
                    ) : (
                      <User size={18} />
                    )}
                  </span>
                  <span className="gc-wizard-recent__info">
                    <strong>{user.displayName}</strong>
                    <span>{maskPhone(user.phoneNumber)}</span>
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <div className="gc-field gc-wizard-sender">
        <label htmlFor="gc-sender-name">From</label>
        <input
          id="gc-sender-name"
          value={senderName}
          onChange={(e) => onSenderNameChange(e.target.value)}
          placeholder="Your name"
        />
      </div>
    </div>
  );
};

export default GiftCardRecipient;
