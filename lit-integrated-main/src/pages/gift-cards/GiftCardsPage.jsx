import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, CreditCard } from "lucide-react";
import GiftCardsLayout from "../../components/gift-cards/GiftCardsLayout";
import GiftCardWizard from "../../components/gift-cards/wizard/GiftCardWizard";
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
import litLogo from "../../assets/lit-logo.png";
import "../../styles/gift-cards.css";

const OCCASIONS = [
  "Birthday", "Anniversary", "Wedding", "Festival", "Congratulations",
  "Corporate", "Thank You", "New Year", "Christmas", "Graduation", "Custom",
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
  const [wizardActive, setWizardActive] = useState(false);

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

  useEffect(() => {
    document.body.classList.toggle("gc-body--wizard", wizardActive);
    return () => document.body.classList.remove("gc-body--wizard");
  }, [wizardActive]);

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

  const handleStartWizard = () => {
    setError("");
    setWizardActive(true);
  };

  const handleExitWizard = () => {
    setWizardActive(false);
    setError("");
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
      } else {
        const paid = await purchaseInternalGiftCard({ ...payload, paymentMethod: "MOCK" });
        setSuccess(paid);
        showToast("Gift card sent successfully!");
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

  const handleSendAnother = () => {
    setSuccess(null);
    setSelectedRecipient(null);
    setForm(defaultForm);
    setWizardActive(false);
  };

  return (
    <GiftCardsLayout hideFooter={wizardActive}>
      <div className={`gc-experience ${wizardActive ? "gc-experience--wizard" : "gc-experience--landing"}`}>
        {apiOffline && !wizardActive && (
          <div className="gc-offline-banner gc-offline-banner--landing" role="status">
            <strong>Backend offline.</strong> Purchase requires the API.
          </div>
        )}

        <AnimatePresence mode="wait">
          {!wizardActive && (
            <motion.section
              key="landing"
              className="gc-hero gc-hero--landing"
              id="gc-hero"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -72 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              <HeroBackdrop />
              <div className="gc-hero__content">
                <motion.img
                  src={litLogo}
                  alt="LIT"
                  className="gc-hero__logo"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                />
                <motion.h1
                  className="gc-hero__title"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  LIT Gift Cards
                </motion.h1>
                <motion.p
                  className="gc-hero__subtitle"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.5 }}
                >
                  Luxury Gaming Fashion
                  <br />
                  Premium Digital Gifting
                </motion.p>
                <motion.div
                  className="gc-hero__actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.button
                    type="button"
                    className="lit-btn lit-btn--primary lit-btn--lg"
                    onClick={handleStartWizard}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Gift size={18} style={{ marginRight: 8 }} />
                    Send Gift Card
                  </motion.button>
                  <motion.button
                    type="button"
                    className="lit-btn lit-btn--outline lit-btn--lg"
                    onClick={() => navigate("/gift-cards/redeem")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <CreditCard size={18} style={{ marginRight: 8 }} />
                    Redeem Gift Card
                  </motion.button>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {wizardActive && (
            <motion.div
              key="wizard"
              className="gc-wizard-shell"
              id="gc-create"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              {apiOffline && (
                <div className="gc-offline-banner gc-offline-banner--wizard" role="status">
                  <strong>Backend offline.</strong> Gift card designs load locally, but purchase requires the API.
                </div>
              )}
              <GiftCardWizard
                occasions={OCCASIONS}
                emojis={EMOJIS}
                form={form}
                setForm={setForm}
                amount={amount}
                config={config}
                presetAmounts={presetAmounts}
                selectedRecipient={selectedRecipient}
                setSelectedRecipient={setSelectedRecipient}
                gradient={gradient}
                templates={templates}
                pricing={pricing}
                walletBalance={walletBalance}
                isAuthenticated={isAuthenticated}
                loading={loading}
                error={error}
                success={success}
                recent={recent}
                onProceed={handleProceed}
                onRefreshPricing={refreshPricing}
                onSendAnother={handleSendAnother}
                onViewWallet={() => navigate("/profile/wallet")}
                onExit={handleExitWizard}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GiftCardPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onContinue={handlePaymentContinue}
        total={pricing?.grandTotal ?? amount}
        walletBalance={walletBalance}
        loading={loading}
      />
    </GiftCardsLayout>
  );
};

export default GiftCardsPage;
