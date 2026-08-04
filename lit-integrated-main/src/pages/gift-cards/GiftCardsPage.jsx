import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Gift, CreditCard } from "lucide-react";
import GiftCardsLayout from "../../components/gift-cards/GiftCardsLayout";
import { useUserAuth } from "../../context/UserAuthContext";
import { useToast } from "../../context/ToastContext";
import {
  fetchGiftCardConfig,
  previewGiftCardPurchase,
  isGiftCardNetworkError,
  previewGiftCardPurchaseLocal,
} from "../../services/giftCardApiService";
import {
  fetchWallet,
  fetchPaymentConfig,
  createPaymentOrder,
  purchaseInternalGiftCard,
  fetchSentGiftCards,
} from "../../services/walletApiService";
import GiftCardPaymentModal from "../../components/gift-cards/GiftCardPaymentModal";
import LitUserSearch from "../../components/gift-cards/LitUserSearch";
import litLogo from "../../assets/lit-logo.png";
import "../../styles/gift-cards.css";

const OCCASIONS = [
  "Birthday", "Anniversary", "Wedding", "Festival", "Congratulations",
  "Thank You", "New Year", "Christmas", "Graduation", "Custom",
];

const FAQ = [
  { q: "Who can receive a gift card?", a: "Only registered LIT users. Search by name, username, or phone number." },
  { q: "How does the recipient claim it?", a: "They receive a notification and can claim the gift card in-app to credit their wallet." },
  { q: "What payment methods are supported?", a: "Wallet balance or Razorpay (test mode in development)." },
  { q: "What happens if they decline?", a: "The gift card is cancelled and the amount is refunded to your wallet." },
];

const EMOJIS = ["🎁", "✨", "💜", "🎉", "🙏", "❤️"];

function HeroBackdrop() {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 4,
      })),
    [],
  );

  return (
    <>
      <div className="gc-hero__bg" />
      <div className="gc-hero__shards" aria-hidden="true">
        <span className="gc-hero__shard gc-hero__shard--1" />
        <span className="gc-hero__shard gc-hero__shard--2" />
        <span className="gc-hero__shard gc-hero__shard--3" />
      </div>
      <div className="gc-hero__particles">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="gc-hero__particle"
            style={{ left: p.left, top: p.top }}
            animate={{ y: [0, -20, 0], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
          />
        ))}
      </div>
    </>
  );
}

const defaultForm = {
  occasion: "",
  amount: "",
  customAmount: "",
  senderName: "",
  message: "",
  theme: "luxury-black",
  couponCode: "",
};

const GiftCardsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, displayName } = useUserAuth();
  const { showToast } = useToast();
  const [config, setConfig] = useState(null);
  const [apiOffline, setApiOffline] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [pricing, setPricing] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);

  const amount = form.customAmount ? Number(form.customAmount) : Number(form.amount);
  const templates = config?.templates ?? [];

  const selectedTemplate = templates.find((t) => t.slug === form.theme) || templates[0];
  const gradient = selectedTemplate?.gradient || "linear-gradient(135deg,#0a0a0a,#9333ea)";

  useEffect(() => {
    fetchGiftCardConfig()
      .then(({ config: cfg, fromFallback }) => {
        setConfig(cfg);
        setApiOffline(fromFallback);
      })
      .catch(() => setError("Failed to load gift card settings."));
  }, []);

  useEffect(() => {
    if (displayName) {
      setForm((p) => ({ ...p, senderName: p.senderName || displayName }));
    }
  }, [displayName]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchSentGiftCards()
      .then((data) => setRecent(data.giftCards ?? []))
      .catch(() => {});
    fetchWallet()
      .then((data) => setWalletBalance(data.wallet?.walletBalance ?? data.walletBalance ?? 0))
      .catch(() => {});
    fetchPaymentConfig()
      .then(setPaymentConfig)
      .catch(() => {});
  }, [isAuthenticated, success]);

  const refreshPricing = useCallback(async () => {
    if (!amount || amount < 100) {
      setPricing(null);
      return;
    }
    if (!isAuthenticated) {
      if (config && amount >= (config.minAmount ?? 100)) {
        try {
          const local = previewGiftCardPurchaseLocal({ amount }, config);
          setPricing(local.pricing);
        } catch {
          setPricing(null);
        }
      }
      return;
    }
    try {
      const data = await previewGiftCardPurchase({
        amount,
        couponCode: form.couponCode || undefined,
      });
      setPricing(data.pricing ?? data);
    } catch (err) {
      if (isGiftCardNetworkError(err) && config) {
        setApiOffline(true);
        try {
          const local = previewGiftCardPurchaseLocal({ amount }, config);
          setPricing(local.pricing);
        } catch {
          setPricing(null);
        }
      } else {
        setPricing(null);
      }
    }
  }, [amount, form.couponCode, isAuthenticated, config]);

  useEffect(() => {
    const t = setTimeout(refreshPricing, 400);
    return () => clearTimeout(t);
  }, [refreshPricing]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleProceed = () => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: "/gift-cards" } });
      return;
    }
    if (!selectedRecipient) {
      setError("Select a registered LIT user to send the gift card.");
      showToast("Select a registered LIT user.");
      return;
    }
    if (!amount || amount < (config?.minAmount ?? 100)) {
      setError(`Minimum gift card amount is ₹${config?.minAmount ?? 100}.`);
      showToast(`Minimum amount is ₹${config?.minAmount ?? 100}.`);
      return;
    }
    setError("");
    setShowPaymentModal(true);
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePaymentContinue = async (paymentMethod) => {
    setShowPaymentModal(false);
    setLoading(true);
    setError("");

    const payload = {
      amount,
      recipientId: selectedRecipient.id,
      senderName: form.senderName,
      message: form.message || null,
      occasion: form.occasion || "Custom",
      theme: form.theme,
      couponCode: form.couponCode || null,
      paymentMethod,
    };

    try {
      if (paymentMethod === "RAZORPAY" && paymentConfig?.razorpayEnabled) {
        const orderData = await createPaymentOrder(pricing?.grandTotal ?? amount, "gift_card");
        const order = orderData.order ?? orderData;
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error("Failed to load Razorpay checkout.");

        await new Promise((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: order.keyId || paymentConfig.razorpayKeyId,
            amount: Math.round((pricing?.grandTotal ?? amount) * 100),
            currency: "INR",
            name: "LIT Marketplace",
            description: "Gift Card Purchase",
            order_id: order.orderId,
            handler: async (response) => {
              try {
                const paid = await purchaseInternalGiftCard({
                  ...payload,
                  paymentMethod: "RAZORPAY",
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                setSuccess(paid);
                showToast("Gift card sent successfully!");
                scrollTo("gc-success");
                resolve();
              } catch (err) {
                reject(err);
              }
            },
            modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
          });
          rzp.open();
        });
      } else if (paymentMethod === "WALLET") {
        const paid = await purchaseInternalGiftCard({ ...payload, paymentMethod: "WALLET" });
        setSuccess(paid);
        showToast("Gift card sent successfully!");
        scrollTo("gc-success");
      } else {
        const paid = await purchaseInternalGiftCard({ ...payload, paymentMethod: "MOCK" });
        setSuccess(paid);
        showToast("Gift card sent successfully!");
        scrollTo("gc-success");
      }
    } catch (err) {
      const message = err.message || "Purchase failed.";
      setError(message);
      showToast(message);
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = config?.presetAmounts ?? [250, 500, 1000, 2000, 5000, 10000];

  return (
    <GiftCardsLayout>
      {apiOffline && (
        <div className="gc-offline-banner" role="status">
          <strong>Backend offline.</strong> Gift card designs load locally, but purchase and redeem require the API.
          Run <code>npm run dev</code> in the <code>backend</code> folder and connect to PostgreSQL (Azure VPN or local Docker).
        </div>
      )}

      <section className="gc-hero" id="gc-hero">
        <HeroBackdrop />
        <div className="gc-hero__content">
          <img src={litLogo} alt="LIT" className="gc-hero__logo" />
          <h1 className="gc-hero__title">LIT Gift Cards</h1>
          <p className="gc-hero__subtitle">
            Luxury Gaming Fashion
            <br />
            Premium Digital Gifting
          </p>
          <div className="gc-hero__actions">
            <button type="button" className="lit-btn lit-btn--primary lit-btn--lg" onClick={() => scrollTo("gc-create")}>
              <Gift size={18} style={{ marginRight: 8 }} />
              Send Gift Card
            </button>
            <button type="button" className="lit-btn lit-btn--outline lit-btn--lg" onClick={() => navigate("/gift-cards/redeem")}>
              <CreditCard size={18} style={{ marginRight: 8 }} />
              Redeem Gift Card
            </button>
          </div>
        </div>
      </section>

      <section className="gc-section" id="gc-create">
        <h2 className="gc-section__title"><Sparkles size={20} /> Create a Gift Card</h2>
        {error && <p className="adm-alert adm-alert--error">{error}</p>}

        <div className="gc-grid">
          <div>
            <div className="gc-card" style={{ marginBottom: "1.5rem" }}>
              <div className="gc-form-grid">
                <div className="gc-field">
                  <label>Occasion</label>
                  <select value={form.occasion} onChange={(e) => setForm((p) => ({ ...p, occasion: e.target.value }))}>
                    <option value="">Select occasion</option>
                    {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="gc-field gc-form-grid--full">
                  <label>Amount (₹)</label>
                  <div className="gc-amount-chips">
                    {presetAmounts.map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={`gc-amount-chip ${form.amount === String(a) && !form.customAmount ? "gc-amount-chip--active" : ""}`}
                        onClick={() => setForm((p) => ({ ...p, amount: String(a), customAmount: "" }))}
                      >
                        ₹{a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input
                    style={{ marginTop: 8 }}
                    placeholder="Custom amount (₹100 – ₹50,000)"
                    value={form.customAmount}
                    onChange={(e) => setForm((p) => ({ ...p, customAmount: e.target.value, amount: "" }))}
                  />
                </div>
                <div className="gc-field gc-form-grid--full">
                  <LitUserSearch
                    selectedUser={selectedRecipient}
                    onSelect={setSelectedRecipient}
                    onClear={() => setSelectedRecipient(null)}
                  />
                </div>
                <div className="gc-field">
                  <label>From</label>
                  <input value={form.senderName} onChange={(e) => setForm((p) => ({ ...p, senderName: e.target.value }))} placeholder="Your name" />
                </div>
                <div className="gc-field gc-form-grid--full">
                  <label>Personal Message ({form.message.length}/500)</label>
                  <textarea
                    maxLength={500}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Write a personal message..."
                  />
                  <div className="gc-amount-chips" style={{ marginTop: 8 }}>
                    {EMOJIS.map((em) => (
                      <button key={em} type="button" className="gc-amount-chip" onClick={() => setForm((p) => ({ ...p, message: `${p.message}${em}` }))}>{em}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="gc-section" style={{ padding: 0 }} id="gc-templates">
              <h3 className="gc-section__title">Select Gift Card Design</h3>
              <div className="gc-templates">
                {templates.map((t) => (
                  <motion.button
                    key={t.slug}
                    type="button"
                    className={`gc-template ${form.theme === t.slug ? "gc-template--selected" : ""}`}
                    style={{ background: t.gradient }}
                    onClick={() => setForm((p) => ({ ...p, theme: t.slug }))}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="gc-template__label">{t.name}</span>
                    <img src={litLogo} alt="" className="gc-template__logo" />
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="gc-card" style={{ marginTop: "1.5rem" }} id="gc-payment">
              <h3 className="gc-section__title">Payment Summary</h3>
              <div className="gc-field" style={{ marginBottom: "1rem" }}>
                <label>Coupon Code</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={form.couponCode} onChange={(e) => setForm((p) => ({ ...p, couponCode: e.target.value }))} placeholder="Enter coupon" />
                  <button type="button" className="lit-btn lit-btn--outline" onClick={refreshPricing}>Apply</button>
                </div>
              </div>
              {pricing && (
                <>
                  <div className="gc-summary-row"><span>Gift Card Amount</span><span>₹{pricing.amount?.toLocaleString()}</span></div>
                  <div className="gc-summary-row"><span>Platform Fee</span><span>₹{pricing.platformFee?.toLocaleString()}</span></div>
                  <div className="gc-summary-row"><span>GST</span><span>₹{pricing.gstAmount?.toLocaleString()}</span></div>
                  {pricing.discountAmount > 0 && (
                    <div className="gc-summary-row"><span>Discount</span><span>-₹{pricing.discountAmount?.toLocaleString()}</span></div>
                  )}
                  <div className="gc-summary-row gc-summary-row--total"><span>Final Total</span><span>₹{pricing.grandTotal?.toLocaleString()}</span></div>
                </>
              )}
              <button
                type="button"
                className="lit-btn lit-btn--primary lit-btn--lg"
                style={{ width: "100%", marginTop: "1rem" }}
                disabled={loading || !amount || !selectedRecipient}
                onClick={handleProceed}
              >
                {loading ? "Processing..." : isAuthenticated ? "Proceed Now" : "Sign in to Send"}
              </button>
              {isAuthenticated && (
                <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
                  Wallet balance: ₹{walletBalance.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <aside className="gc-preview" id="gc-preview">
            <h3 className="gc-section__title">Live Preview</h3>
            <div className="gc-preview-card" style={{ background: gradient }}>
              <div className="gc-preview-card__shine" />
              <div>
                <div className="gc-preview-card__meta">{form.occasion || "Occasion"} · LIT Gift Card</div>
                <div className="gc-preview-card__amount">₹{amount ? amount.toLocaleString() : "—"}</div>
              </div>
              <div>
                <div className="gc-preview-card__meta">To: {selectedRecipient?.displayName || "Select recipient"}</div>
                <div className="gc-preview-card__meta">From: {form.senderName || "Sender"}</div>
                {form.message && <div className="gc-preview-card__meta" style={{ marginTop: 8, fontStyle: "italic" }}>&ldquo;{form.message.slice(0, 80)}&rdquo;</div>}
                <div className="gc-preview-card__code">LIT-XXXX-XXXX-XXXX</div>
                <div className="gc-preview-card__meta">Expires: 12 months · QR on delivery</div>
              </div>
              <img src={litLogo} alt="" style={{ position: "absolute", bottom: 12, right: 12, width: 28, opacity: 0.8 }} />
            </div>
          </aside>
        </div>
      </section>

      <GiftCardPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onContinue={handlePaymentContinue}
        total={pricing?.grandTotal ?? amount}
        walletBalance={walletBalance}
        loading={loading}
      />

      {success && (
        <section className="gc-section gc-success gc-card" id="gc-success">
          <h2>Gift Card Sent!</h2>
          <p>Sent to: <strong>{success.giftCard?.recipientName || selectedRecipient?.displayName}</strong></p>
          <p>Amount: <strong>₹{success.giftCard?.amount?.toLocaleString()}</strong></p>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>
            The recipient will receive an in-app notification and email to claim the gift card.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <button type="button" className="lit-btn lit-btn--outline" onClick={() => { setSuccess(null); setSelectedRecipient(null); setForm(defaultForm); scrollTo("gc-hero"); }}>
              Send Another Gift Card
            </button>
            <button type="button" className="lit-btn lit-btn--primary" onClick={() => navigate("/profile/wallet")}>
              View Wallet
            </button>
          </div>
        </section>
      )}

      <section className="gc-section gc-faq" id="gc-faq">
        <h2 className="gc-section__title">FAQ</h2>
        {FAQ.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p style={{ marginTop: 8, color: "rgba(255,255,255,0.65)" }}>{item.a}</p>
          </details>
        ))}
      </section>

      {recent.length > 0 && (
        <section className="gc-section" id="gc-recent">
          <h2 className="gc-section__title">Recent Gift Cards</h2>
          <div className="gc-recent-list">
            {recent.slice(0, 5).map((card) => (
              <div key={card.id} className="gc-recent-item">
                <div>
                  <strong>{card.giftCardCode}</strong>
                  <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)" }}>
                    {card.recipientName} · ₹{card.amount?.toLocaleString()}
                  </div>
                </div>
                <span className="lit-badge">{card.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="gc-mobile-cta">
        <button type="button" className="lit-btn lit-btn--primary lit-btn--lg" style={{ width: "100%" }} onClick={handleProceed} disabled={loading}>
          Buy Gift Card
        </button>
      </div>
    </GiftCardsLayout>
  );
};

export default GiftCardsPage;
