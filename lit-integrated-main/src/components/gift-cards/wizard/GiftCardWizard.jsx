import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GiftCardStepper, { WIZARD_STEPS } from "./GiftCardStepper";
import GiftCardPreview from "./GiftCardPreview";
import GiftCardOccasionStep from "./GiftCardOccasionStep";
import GiftCardAmountSelector from "./GiftCardAmountSelector";
import GiftCardRecipient from "./GiftCardRecipient";
import GiftCardMessage from "./GiftCardMessage";
import GiftCardCarousel from "./GiftCardCarousel";
import GiftCardPayment from "./GiftCardPayment";
import GiftCardWizardNav from "./GiftCardWizardNav";
import GiftCardSuccess from "./GiftCardSuccess";

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -100 : 100, opacity: 0 }),
};

const GiftCardWizard = ({
  occasions,
  emojis,
  form,
  setForm,
  amount,
  config,
  presetAmounts,
  selectedRecipient,
  setSelectedRecipient,
  gradient,
  templates,
  pricing,
  walletBalance,
  isAuthenticated,
  loading,
  error,
  success,
  recent,
  onProceed,
  onRefreshPricing,
  onSendAnother,
  onViewWallet,
  onExit,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);

  const minAmount = config?.minAmount ?? 100;

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return Boolean(form.occasion);
      case 2:
        return Boolean(amount && amount >= minAmount);
      case 3:
        return Boolean(selectedRecipient);
      case 4:
        return true;
      case 5:
        return Boolean(form.theme);
      case 6:
        return Boolean(amount && selectedRecipient);
      default:
        return false;
    }
  }, [currentStep, form.occasion, form.theme, amount, minAmount, selectedRecipient]);

  const goToStep = (step) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const goNext = () => {
    if (currentStep === WIZARD_STEPS.length) {
      onProceed();
      return;
    }
    if (!canProceed) return;
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, WIZARD_STEPS.length));
  };

  const goBack = () => {
    if (currentStep === 1) {
      onExit?.();
      return;
    }
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  if (success) {
    return (
      <section className="gc-wizard gc-wizard--fullscreen">
        <GiftCardSuccess
          success={success}
          selectedRecipient={selectedRecipient}
          onSendAnother={() => {
            onSendAnother();
            setCurrentStep(1);
          }}
          onViewWallet={onViewWallet}
        />
      </section>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <GiftCardOccasionStep
            occasions={occasions}
            value={form.occasion}
            onChange={(occasion) => setForm((p) => ({ ...p, occasion }))}
          />
        );
      case 2:
        return (
          <GiftCardAmountSelector
            presetAmounts={presetAmounts}
            amount={form.amount}
            customAmount={form.customAmount}
            minAmount={minAmount}
            onSelectPreset={(preset) =>
              setForm((p) => ({ ...p, amount: String(preset), customAmount: "" }))
            }
            onCustomChange={(value) =>
              setForm((p) => ({ ...p, customAmount: value, amount: "" }))
            }
          />
        );
      case 3:
        return (
          <GiftCardRecipient
            selectedRecipient={selectedRecipient}
            onSelect={setSelectedRecipient}
            onClear={() => setSelectedRecipient(null)}
            isAuthenticated={isAuthenticated}
            recent={recent}
            senderName={form.senderName}
            onSenderNameChange={(senderName) => setForm((p) => ({ ...p, senderName }))}
          />
        );
      case 4:
        return (
          <GiftCardMessage
            message={form.message}
            emojis={emojis}
            onChange={(message) => setForm((p) => ({ ...p, message }))}
            onEmojiAdd={(em) => setForm((p) => ({ ...p, message: `${p.message}${em}` }))}
          />
        );
      case 5:
        return (
          <GiftCardCarousel
            templates={templates}
            selectedSlug={form.theme}
            onSelect={(theme) => setForm((p) => ({ ...p, theme }))}
          />
        );
      case 6:
        return (
          <GiftCardPayment
            pricing={pricing}
            couponCode={form.couponCode}
            onCouponChange={(couponCode) => setForm((p) => ({ ...p, couponCode }))}
            onApplyCoupon={onRefreshPricing}
            walletBalance={walletBalance}
            isAuthenticated={isAuthenticated}
            loading={loading}
            onProceed={onProceed}
            selectedRecipient={selectedRecipient}
            amount={amount}
            occasion={form.occasion}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="gc-wizard gc-wizard--fullscreen">
      <GiftCardStepper currentStep={currentStep} onStepClick={goToStep} />

      {error && <p className="adm-alert adm-alert--error gc-wizard__error">{error}</p>}

      <div className="gc-wizard__body">
        <div className="gc-wizard__layout">
          <div className="gc-wizard__main">
            <div className="gc-wizard__stage">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="gc-wizard__panel"
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <GiftCardPreview
            gradient={gradient}
            occasion={form.occasion}
            amount={amount}
            selectedRecipient={selectedRecipient}
            senderName={form.senderName}
            message={form.message}
            collapsed={previewCollapsed}
            onToggleCollapse={() => setPreviewCollapsed((c) => !c)}
          />
        </div>
      </div>

      {currentStep < 6 && (
        <GiftCardWizardNav
          currentStep={currentStep}
          totalSteps={WIZARD_STEPS.length}
          canProceed={canProceed}
          onBack={goBack}
          onContinue={goNext}
          loading={loading}
        />
      )}
    </section>
  );
};

export default GiftCardWizard;
