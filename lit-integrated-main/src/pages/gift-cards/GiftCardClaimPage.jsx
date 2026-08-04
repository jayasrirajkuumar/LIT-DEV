import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import GiftCardsLayout from "../../components/gift-cards/GiftCardsLayout";
import { useToast } from "../../context/ToastContext";
import { fetchGiftCardDetail, claimGiftCard, declineGiftCard } from "../../services/walletApiService";
import "../../styles/gift-cards.css";

const GiftCardClaimPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    fetchGiftCardDetail(id)
      .then((data) => setCard(data.giftCard ?? data))
      .catch((err) => showToast(err.message))
      .finally(() => setLoading(false));
  }, [id, showToast]);

  const handleClaim = async () => {
    setActing(true);
    try {
      const result = await claimGiftCard(id);
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
      await declineGiftCard(id);
      showToast("Gift card declined.");
      navigate("/profile/wallet");
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

  const claimed = card.claimStatus === "CLAIMED";
  const declined = card.claimStatus === "DECLINED";

  return (
    <GiftCardsLayout>
      <section className="gc-section gc-card gc-claim-page">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="gc-claim-icon"><Gift size={32} /></div>
          <h2>Gift Card</h2>
          <p className="gc-claim-amount">₹{card.amount?.toLocaleString()}</p>
          <p className="gc-claim-from">From <strong>{card.senderName}</strong></p>
          {card.message && <p className="gc-claim-message">"{card.message}"</p>}

          {claimed && <p className="gc-claim-status gc-claim-status--claimed">Already claimed</p>}
          {declined && <p className="gc-claim-status gc-claim-status--declined">Declined</p>}

          {card.claimStatus === "PENDING" && (
            <div className="gc-claim-actions">
              <button type="button" className="lit-btn lit-btn--primary lit-btn--lg" disabled={acting} onClick={handleClaim}>
                {acting ? "Claiming..." : "Claim Gift"}
              </button>
              <button type="button" className="lit-btn lit-btn--outline" disabled={acting} onClick={handleDecline}>
                Decline
              </button>
            </div>
          )}
        </motion.div>
      </section>
    </GiftCardsLayout>
  );
};

export default GiftCardClaimPage;
