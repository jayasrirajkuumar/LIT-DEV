import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import GiftCardsLayout from "../../components/gift-cards/GiftCardsLayout";
import { useUserAuth } from "../../context/UserAuthContext";
import { redeemGiftCard, isGiftCardNetworkError } from "../../services/giftCardApiService";
import "../../styles/gift-cards.css";

const GiftCardRedeemPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useUserAuth();
  const [code, setCode] = useState(params.get("code") || "");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const c = params.get("code");
    if (c) setCode(c);
  }, [params]);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: `/gift-cards/redeem?code=${encodeURIComponent(code)}` } });
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await redeemGiftCard({ giftCardCode: code, pin });
      setResult(data);
    } catch (err) {
      if (isGiftCardNetworkError(err)) {
        setError("Server unavailable. Start the backend (npm run dev in backend/) and ensure the database is connected.");
      } else {
        setError(err.message || "Redemption failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GiftCardsLayout>
      <section className="gc-section" style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1 className="gc-hero__title" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Redeem Gift Card</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem" }}>
          Enter your gift code and PIN to add balance to your LIT wallet.
        </p>

        <form className="gc-card" onSubmit={handleRedeem}>
          {error && <p className="adm-alert adm-alert--error">{error}</p>}
          {result && (
            <div className="gc-success" style={{ padding: "1rem 0" }}>
              <p>Redeemed <strong>₹{result.redeemedAmount?.toLocaleString()}</strong></p>
              <p>Wallet balance: ₹{result.giftCardBalance?.toLocaleString()}</p>
            </div>
          )}
          <div className="gc-field" style={{ marginBottom: "1rem" }}>
            <label>Gift Card Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="LIT-XXXX-XXXX-XXXX" required />
          </div>
          <div className="gc-field" style={{ marginBottom: "1.5rem" }}>
            <label>PIN</label>
            <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="6-digit PIN" maxLength={6} required />
          </div>
          <button type="submit" className="lit-btn lit-btn--primary lit-btn--lg" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Redeeming..." : isAuthenticated ? "Redeem" : "Sign in to Redeem"}
          </button>
        </form>
      </section>
    </GiftCardsLayout>
  );
};

export default GiftCardRedeemPage;
