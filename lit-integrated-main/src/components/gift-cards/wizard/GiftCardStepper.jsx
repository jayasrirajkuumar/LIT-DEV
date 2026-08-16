import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const WIZARD_STEPS = [
  { id: 1, label: "Occasion" },
  { id: 2, label: "Amount" },
  { id: 3, label: "Recipient" },
  { id: 4, label: "Message" },
  { id: 5, label: "Design" },
  { id: 6, label: "Payment" },
];

const GiftCardStepper = ({ currentStep, onStepClick }) => {
  const progress = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="gc-wizard-stepper">
      <div className="gc-wizard-stepper__track">
        <motion.div
          className="gc-wizard-stepper__progress"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        />
      </div>
      <ol className="gc-wizard-stepper__steps">
        {WIZARD_STEPS.map((step) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          return (
            <li key={step.id} className="gc-wizard-stepper__step">
              <button
                type="button"
                className={`gc-wizard-stepper__node ${active ? "gc-wizard-stepper__node--active" : ""} ${done ? "gc-wizard-stepper__node--done" : ""}`}
                onClick={() => done && onStepClick?.(step.id)}
                disabled={!done && !active}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check size={14} strokeWidth={3} /> : step.id}
              </button>
              <span className={`gc-wizard-stepper__label ${active ? "gc-wizard-stepper__label--active" : ""}`}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default GiftCardStepper;
