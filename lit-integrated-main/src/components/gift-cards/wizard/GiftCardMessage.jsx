import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const GiftCardMessage = ({ message, emojis, onChange, onEmojiAdd }) => (
  <div className="gc-wizard-step gc-wizard-step--message">
    <h2 className="gc-wizard-step__heading">Personal Message</h2>
    <p className="gc-wizard-step__sub">Add a heartfelt note for your recipient</p>

    <div className="gc-wizard-message-editor">
      <textarea
        maxLength={500}
        value={message}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write something memorable..."
        className="gc-wizard-message-editor__input"
      />
      <div className="gc-wizard-message-editor__footer">
        <div className="gc-wizard-emoji-row">
          {emojis.map((em) => (
            <motion.button
              key={em}
              type="button"
              className="gc-wizard-emoji-btn"
              onClick={() => onEmojiAdd(em)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              {em}
            </motion.button>
          ))}
        </div>
        <span className="gc-wizard-message-editor__count">{message.length}/500</span>
      </div>
    </div>

    <AnimatePresence>
      {message && (
        <motion.div
          className="gc-wizard-message-preview"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <span className="gc-wizard-message-preview__label">Preview</span>
          <p>&ldquo;{message}&rdquo;</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default GiftCardMessage;
