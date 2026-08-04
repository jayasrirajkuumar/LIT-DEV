import React, { useState } from "react";
import { createSupportRequest } from "../../../services/supportApiService";
import "./CancelOrderModal.css";

const REASONS = [
  { code: "CHANGED_MIND", label: "Changed my mind" },
  { code: "BETTER_PRICE", label: "Found a better price" },
  { code: "ORDERED_BY_MISTAKE", label: "Ordered by mistake" },
  { code: "DELIVERY_TOO_SLOW", label: "Delivery too slow" },
  { code: "PAYMENT_ISSUE", label: "Payment issue" },
  { code: "DIFFERENT_PRODUCT", label: "Want different product" },
  { code: "OTHER", label: "Other" },
];

export default function CancelOrderModal({ open, order, onClose, onConfirm }) {
  const [step, setStep] = useState("confirm");
  const [reasonCode, setReasonCode] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const reset = () => {
    setStep("confirm");
    setReasonCode("");
    setReasonText("");
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submitCancellation = async () => {
    try {
      setLoading(true);
      setError("");
      await onConfirm({ reasonCode, reasonText: reasonCode === "OTHER" ? reasonText : null });
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to cancel order.");
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async (type) => {
    try {
      await createSupportRequest({
        orderId: order?.id,
        type,
        subject: `Help with order ${order?.orderNumber || order?.id}`,
        message: `Customer requested help before cancelling order ${order?.orderNumber || order?.id}.`,
      });
      setStep("support-sent");
    } catch {
      setError("Could not submit support request. You can still continue cancellation.");
    }
  };

  return (
    <div className="cancel-modal-backdrop" onClick={handleClose} role="presentation">
      <div className="cancel-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {step === "confirm" && (
          <>
            <h2>Cancel order?</h2>
            <p>This will stop processing for order {order?.orderNumber || order?.id}.</p>
            <div className="cancel-modal__actions">
              <button type="button" className="lit-btn lit-btn--ghost" onClick={handleClose}>
                Keep Order
              </button>
              <button type="button" className="lit-btn lit-btn--danger" onClick={() => setStep("reason")}>
                Continue
              </button>
            </div>
          </>
        )}

        {step === "reason" && (
          <>
            <h2>Why are you cancelling?</h2>
            <div className="cancel-modal__reasons">
              {REASONS.map((reason) => (
                <label key={reason.code} className="cancel-modal__reason">
                  <input
                    type="radio"
                    name="cancel-reason"
                    value={reason.code}
                    checked={reasonCode === reason.code}
                    onChange={() => setReasonCode(reason.code)}
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>
            {reasonCode === "OTHER" && (
              <textarea
                className="cancel-modal__textarea"
                placeholder="Tell us more..."
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                rows={3}
              />
            )}
            <div className="cancel-modal__actions">
              <button type="button" className="lit-btn lit-btn--ghost" onClick={() => setStep("confirm")}>
                Back
              </button>
              <button
                type="button"
                className="lit-btn lit-btn--danger"
                disabled={!reasonCode || (reasonCode === "OTHER" && !reasonText.trim())}
                onClick={() => setStep("help")}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === "help" && (
          <>
            <h2>Need help instead?</h2>
            <p>Our concierge team can help with delivery, payment, or product changes.</p>
            <div className="cancel-modal__help-grid">
              <button type="button" className="lit-btn lit-btn--outline" onClick={() => handleSupport("CHAT")}>
                Chat Support
              </button>
              <button type="button" className="lit-btn lit-btn--outline" onClick={() => handleSupport("GENERAL")}>
                Contact Support
              </button>
            </div>
            <div className="cancel-modal__actions">
              <button type="button" className="lit-btn lit-btn--ghost" onClick={() => setStep("reason")}>
                Back
              </button>
              <button type="button" className="lit-btn lit-btn--danger" disabled={loading} onClick={submitCancellation}>
                {loading ? "Cancelling…" : "Continue Cancellation"}
              </button>
            </div>
          </>
        )}

        {step === "support-sent" && (
          <>
            <h2>Support request sent</h2>
            <p>Our team will reach out shortly. You can still cancel if needed.</p>
            <button type="button" className="lit-btn lit-btn--secondary" onClick={handleClose}>
              Close
            </button>
          </>
        )}

        {error && <p className="lit-alert lit-alert--error">{error}</p>}
      </div>
    </div>
  );
}
