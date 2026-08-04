import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, ArrowUpRight, ArrowDownLeft, Gift } from "lucide-react";
import BackNavigation from "../../../components/layout/BackNavigation";
import { useToast } from "../../../context/ToastContext";
import {
  fetchWallet,
  fetchWalletHistory,
  fetchSentGiftCards,
  fetchReceivedGiftCards,
} from "../../../services/walletApiService";
import "./WalletPage.css";

const WalletPage = () => {
  const { showToast } = useToast();
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [w, h, s, r] = await Promise.all([
          fetchWallet(),
          fetchWalletHistory(),
          fetchSentGiftCards(),
          fetchReceivedGiftCards(),
        ]);
        setWallet(w.wallet ?? w);
        setHistory(h.transactions ?? []);
        setSent(s.giftCards ?? []);
        setReceived(r.giftCards ?? []);
      } catch (error) {
        showToast(error.message || "Failed to load wallet.");
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  if (loading) {
    return (
      <div className="wallet-page">
        <BackNavigation label="Back to Profile" fallbackTo="/profile" />
        <p className="wallet-loading">Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <BackNavigation label="Back to Profile" fallbackTo="/profile" />
      <h1 className="wallet-page__title">Wallet</h1>

      <div className="wallet-balance-card">
        <div className="wallet-balance-card__label">Wallet Balance</div>
        <div className="wallet-balance-card__amount">₹{wallet?.walletBalance?.toLocaleString() ?? "0"}</div>
        <div className="wallet-balance-card__meta">
          <span>Credits: ₹{wallet?.totalCredits?.toLocaleString() ?? "0"}</span>
          <span>Debits: ₹{wallet?.totalDebits?.toLocaleString() ?? "0"}</span>
        </div>
        <Link to="/gift-cards" className="lit-btn lit-btn--primary">Send Gift Card</Link>
      </div>

      <section className="wallet-section">
        <h2><ArrowUpRight size={18} /> Recent Transactions</h2>
        {history.length === 0 ? (
          <p className="wallet-empty">No transactions yet.</p>
        ) : (
          <ul className="wallet-tx-list">
            {history.slice(0, 10).map((tx) => (
              <li key={tx.id}>
                <div>
                  <strong>{tx.description}</strong>
                  <span>{new Date(tx.createdAt).toLocaleString()}</span>
                </div>
                <span className={tx.type.includes("RECEIVED") || tx.type === "CREDIT" || tx.type === "TOP_UP" ? "wallet-tx--credit" : "wallet-tx--debit"}>
                  {tx.type.includes("RECEIVED") || tx.type === "CREDIT" || tx.type === "TOP_UP" ? "+" : "-"}₹{tx.amount?.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="wallet-section">
        <h2><Gift size={18} /> Received Gift Cards</h2>
        {received.length === 0 ? (
          <p className="wallet-empty">No gift cards received.</p>
        ) : (
          <ul className="wallet-gc-list">
            {received.map((card) => (
              <li key={card.id}>
                <div>
                  <strong>From {card.senderName}</strong>
                  <span>₹{card.amount?.toLocaleString()} · {card.claimStatus}</span>
                </div>
                {card.claimStatus === "PENDING" && (
                  <Link to={`/gift-cards/received/${card.id}`} className="lit-btn lit-btn--outline lit-btn--sm">Claim</Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="wallet-section">
        <h2><ArrowDownLeft size={18} /> Sent Gift Cards</h2>
        {sent.length === 0 ? (
          <p className="wallet-empty">No gift cards sent.</p>
        ) : (
          <ul className="wallet-gc-list">
            {sent.map((card) => (
              <li key={card.id}>
                <div>
                  <strong>To {card.recipientName}</strong>
                  <span>₹{card.amount?.toLocaleString()} · {card.claimStatus}</span>
                </div>
                <span className="lit-badge">{card.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default WalletPage;
