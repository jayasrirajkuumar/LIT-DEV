import React from "react";
import { useAuthModal } from "../../context/AuthModalContext";
import "./RegisterInterest.css";

const RegisterInterest = () => {
  const { openAuthModal } = useAuthModal();

  const handleGetStarted = () => {
    openAuthModal("signup");
  };

  return (
    <section className="register-interest-container flex min-h-dvh w-full max-w-full items-center justify-center px-[clamp(1rem,10vw,12rem)] py-16 max-sm:px-4" aria-labelledby="register-interest-title">
      <div className="register-interest-card w-full max-w-[900px]">
        <h3 id="register-interest-title" className="register-interest-small-heading">
          Register your interest for LIT!
        </h3>
        <h2 className="register-interest-main-heading">
          Be the first to know when the game goes live. Don't miss out
        </h2>
        <p className="register-interest-subtext">SIGN UP and stay in loop!</p>
        <button className="register-interest-cta" onClick={handleGetStarted}>
          Get started
        </button>
      </div>
    </section>
  );
};

export default RegisterInterest;
