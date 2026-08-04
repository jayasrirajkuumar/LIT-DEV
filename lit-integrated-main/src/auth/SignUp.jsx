import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserAuth } from "../hooks/useUserAuth";
import { startSignUpOtp, mapNativeAuthError } from "../services/nativeAuthService";
import AuthLayout from "./AuthLayout";
import {
  buildDisplayName,
  normalizeAuthEmail,
  persistOtpSession,
  removeOtpSession,
  retrieveSignupDraft,
} from "./session";
import "./auth.css";

function MailIcon() {
  return (
    <svg className="lit-auth__field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 16V8A1.5 1.5 0 0 1 4 6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="m3.5 7.5 8.2 5.5c.5.35 1.1.35 1.6 0l8.2-5.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useUserAuth();
  const signupDraft = retrieveSignupDraft();

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const returnPath =
    signupDraft?.returnPath ||
    new URLSearchParams(location.search).get("return") ||
    "/shop";

  useEffect(() => {
    removeOtpSession();
  }, []);

  if (!loading && isAuthenticated) {
    return <Navigate to={returnPath} replace />;
  }

  if (!signupDraft) {
    return <Navigate to={`/sign-up?return=${encodeURIComponent(returnPath)}`} replace />;
  }

  const displayName = buildDisplayName(signupDraft);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = normalizeAuthEmail(email);

    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result = await startSignUpOtp(value, {
        displayName,
        phoneNumber: signupDraft.phoneNumber || undefined,
      });

      persistOtpSession({
        mode: "signup",
        email: value,
        continuationToken: result.continuationToken,
        codeLength: result.codeLength || 8,
        maskedTarget: result.maskedTarget || value,
        tokenFingerprint: result.tokenFingerprint || null,
        issuedAt: result.issuedAt || Date.now(),
        returnPath,
        profile: {
          firstName: signupDraft.firstName,
          lastName: signupDraft.lastName,
          phoneNumber: signupDraft.phoneNumber || "",
          displayName,
        },
      });

      navigate("/auth/verify-otp");
    } catch (err) {
      if (err.code === "user_already_exists" || err.code === "user_exists") {
        setError("An account already exists for this email. Sign in instead.");
      } else {
        setError(mapNativeAuthError(err, "send"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <motion.form
        className="lit-auth__form"
        onSubmit={handleSubmit}
        noValidate
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="lit-auth__step">Step 2 of 2</p>
        <h1 className="lit-auth__heading">SIGN UP</h1>
        <p className="lit-auth__lead">
          Hi {signupDraft.firstName}, enter your email to receive a verification code.
        </p>

        <label className="lit-auth__label" htmlFor="signup-email">
          Email Address
        </label>
        <div className="lit-auth__field">
          <MailIcon />
          <input
            id="signup-email"
            className="lit-auth__input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter your email address"
            autoComplete="email"
            autoFocus
            disabled={busy}
            required
          />
        </div>

        {error && (
          <p className="lit-auth__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="lit-auth__submit" disabled={busy}>
          {busy ? (
            <span className="lit-auth__submit-inner">
              <span className="lit-auth__loader" aria-hidden="true" />
              Sending…
            </span>
          ) : (
            "Send OTP"
          )}
        </button>

        <p className="lit-auth__hint">We&apos;ll send an 8-digit OTP to your email address</p>

        <button
          type="button"
          className="lit-auth__back"
          onClick={() => navigate(`/sign-up?return=${encodeURIComponent(returnPath)}`)}
          disabled={busy}
        >
          ← Edit personal details
        </button>

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
