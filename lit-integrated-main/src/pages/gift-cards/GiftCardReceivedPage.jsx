import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, User } from "lucide-react";
import GiftCardsLayout from "../../components/gift-cards/GiftCardsLayout";
import { useToast } from "../../context/ToastContext";
import { useNotifications } from "../../context/NotificationContext";
import { fetchGiftCardDetail, claimGiftCard, declineGiftCard } from "../../services/walletApiService";
import "../../styles/gift-cards.css";

const GiftCardReceivedPage = () => {
  const { giftCardId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refresh: refreshNotifications } = useNotifications();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    fetchGiftCardDetail(giftCardId)
      .then((data) => setCard(data.giftCard ?? data))
      .catch((err) => showToast(err.message))
      .finally(() => setLoading(false));
  }, [giftCardId, showToast]);

  const handleClaim = async () => {
    setActing(true);
    try {
      const result = await claimGiftCard(giftCardId);
      await refreshNotifications();
      showToast(`₹${result.claimedAmount} credited to your wallet!`);
      navigate("/profile/wallet");
    } catch (err) {
      showToast(err.message);
    } finally {
      setActing(false);
    }
  };

  const handleDecline = async () => {
    setActing(true);
    try {
      await declineGiftCard(giftCardId);
      await refreshNotifications();
      showToast("Gift card declined.");
      navigate("/notifications");
    } catch (err) {
      showToast(err.message);
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <GiftCardsLayout>
        <section className="gc-section gc-card"><p>Loading gift card...</p></section>
      </GiftCardsLayout>
    );
  }

  if (!card) {
    return (
      <GiftCardsLayout>
        <section className="gc-section gc-card"><p>Gift card not found.</p></section>
      </GiftCardsLayout>
    );
  }

  const sender = card.sender;
  const isPending = card.claimStatus === "PENDING";

  return (
    <GiftCardsLayout>
      <section className="gc-section gc-card gc-claim-page gc-received-page">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="gc-received-sender">
            {sender?.profilePicture ? (
              <img src={sender.profilePicture} alt="" className="gc-received-sender__avatar" />
            ) : (
              <div className="gc-received-sender__avatar gc-received-sender__avatar--placeholder">
                <User size={28} />
              </div>
            )}
            <div>
              <p className="gc-received-sender__label">From</p>
              <strong>{card.senderName}</strong>
              {sender?.username && <span>@{sender.username}</span>}
            </div>
          </div>

          <div className="gc-claim-icon"><Gift size={32} /></div>
          <h2>Gift Card</h2>
          <p className="gc-claim-amount">₹{card.amount?.toLocaleString()}</p>
          {card.message && <p className="gc-claim-message">"{card.message}"</p>}

          <div className="gc-received-meta">
            <span>Sent {new Date(card.createdAt).toLocaleDateString()}</span>
            <span>Expires {new Date(card.expiryDate).toLocaleDateString()}</span>
          </div>

          {card.claimStatus === "CLAIMED" && (
            <p className="gc-claim-status gc-claim-status--claimed">Already claimed</p>
          )}
          {card.claimStatus === "DECLINED" && (
            <p className="gc-claim-status gc-claim-status--declined">Declined</p>
          )}

          {isPending && (
            <div className="gc-claim-actions">
              <button type="button" className="lit-btn lit-btn--primary lit-btn--lg" disabled={acting} onClick={handleClaim}>
                {acting ? "Claiming..." : "Claim Gift Card"}
              </button>
              <button type="button" className="lit-btn lit-btn--outline" disabled={acting} onClick={handleDecline}>
                Decline Gift Card
              </button>
            </div>
          )}
        </motion.div>
      </section>
    </GiftCardsLayout>
  );
};

export default GiftCardReceivedPage;
