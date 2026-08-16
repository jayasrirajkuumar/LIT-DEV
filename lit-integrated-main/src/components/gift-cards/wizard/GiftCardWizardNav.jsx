import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const GiftCardWizardNav = ({
  currentStep,
  totalSteps,
  canProceed,
  onBack,
  onContinue,
  continueLabel,
  loading,
}) => (
  <footer className="gc-wizard-nav">
    <motion.button
      type="button"
      className="lit-btn lit-btn--outline gc-wizard-nav__back"
      onClick={onBack}
      disabled={loading}
      whileTap={{ scale: 0.97 }}
    >
      <ArrowLeft size={18} style={{ marginRight: 6 }} />
      Back
    </motion.button>
    <motion.button
      type="button"
      className="lit-btn lit-btn--primary gc-wizard-nav__continue"
      onClick={onContinue}
      disabled={!canProceed || loading}
      whileHover={canProceed ? { scale: 1.02 } : {}}
      whileTap={canProceed ? { scale: 0.98 } : {}}
    >
      {continueLabel || (currentStep === totalSteps ? "Proceed to Payment" : "Continue")}
      {currentStep < totalSteps && <ArrowRight size={18} style={{ marginLeft: 6 }} />}
    </motion.button>
  </footer>
);

export default GiftCardWizardNav;
