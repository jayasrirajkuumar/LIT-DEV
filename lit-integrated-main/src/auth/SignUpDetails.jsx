import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserAuth } from "../hooks/useUserAuth";
import AuthLayout from "./AuthLayout";
import {
  persistSignupDraft,
  removeOtpSession,
  removeSignupDraft,
  retrieveSignupDraft,
} from "./session";
import "./auth.css";

function UserIcon() {
  return (
    <svg className="lit-auth__field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="lit-auth__field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.5 4h7l1 3.5H7.5L8.5 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="7" y="7.5" width="10" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function SignUpDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useUserAuth();

  const existingDraft = retrieveSignupDraft();
  const [firstName, setFirstName] = useState(existingDraft?.firstName || "");
  const [lastName, setLastName] = useState(existingDraft?.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(existingDraft?.phoneNumber || "");
  const [error, setError] = useState("");

  const returnPath = new URLSearchParams(location.search).get("return") || "/shop";

  useEffect(() => {
    removeOtpSession();
  }, []);

  if (!loading && isAuthenticated) {
    return <Navigate to={returnPath} replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedFirst || trimmedFirst.length < 2) {
      setError("Please enter your first name.");
      return;
    }

    if (!trimmedLast || trimmedLast.length < 2) {
      setError("Please enter your last name.");
      return;
    }

    if (trimmedPhone && !/^\+?[\d\s()-]{8,20}$/.test(trimmedPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    removeSignupDraft();
    persistSignupDraft({
      firstName: trimmedFirst,
      lastName: trimmedLast,
      phoneNumber: trimmedPhone,
      returnPath,
    });

    navigate(`/sign-up/email?return=${encodeURIComponent(returnPath)}`);
  };

  return (
    <AuthLayout>
      <motion.form
        className="lit-auth__form lit-auth__form--signup-details"
        onSubmit={handleSubmit}
        noValidate
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="lit-auth__step">Step 1 of 2</p>
        <h1 className="lit-auth__heading">SIGN UP</h1>
        <p className="lit-auth__lead">Tell us a little about yourself to create your LIT account.</p>

        <div className="lit-auth__field-row">
          <div>
            <label className="lit-auth__label" htmlFor="signup-first-name">
              First Name
            </label>
            <div className="lit-auth__field lit-auth__field--compact">
              <UserIcon />
              <input
                id="signup-first-name"
                className="lit-auth__input"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="First name"
                autoComplete="given-name"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="lit-auth__label" htmlFor="signup-last-name">
              Last Name
            </label>
            <div className="lit-auth__field lit-auth__field--compact">
              <UserIcon />
              <input
                id="signup-last-name"
                className="lit-auth__input"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Last name"
                autoComplete="family-name"
                required
              />
            </div>
          </div>
        </div>

        <label className="lit-auth__label" htmlFor="signup-phone">
          Phone Number <span className="lit-auth__optional">(optional)</span>
        </label>
        <div className="lit-auth__field">
          <PhoneIcon />
          <input
            id="signup-phone"
            className="lit-auth__input"
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter your phone number"
            autoComplete="tel"
          />
        </div>

        {error && (
          <p className="lit-auth__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="lit-auth__submit">
          Continue
        </button>

        <p className="lit-auth__hint">Next, we&apos;ll verify your email with a one-time passcode.</p>

        <p className="lit-auth__alt">
          Already have an account?{" "}
          <Link className="lit-auth__link" to={`/sign-in?return=${encodeURIComponent(returnPath)}`}>
            Sign In
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}
