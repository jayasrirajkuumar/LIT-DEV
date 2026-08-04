import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserAuth } from "../hooks/useUserAuth";
import { startSignInOtp, mapNativeAuthError } from "../services/nativeAuthService";
import AuthLayout from "./AuthLayout";
import { persistOtpSession, removeOtpSession, normalizeAuthEmail } from "./session";
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

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useUserAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const returnPath = new URLSearchParams(location.search).get("return") || "/shop";

  useEffect(() => {
    removeOtpSession();
  }, []);

  if (!loading && isAuthenticated) {
    return <Navigate to={returnPath} replace />;
  }

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
      const result = await startSignInOtp(value);
      persistOtpSession({
        mode: "signin",
        email: value,
        continuationToken: result.continuationToken,
        codeLength: result.codeLength || 8,
        maskedTarget: result.maskedTarget || value,
        tokenFingerprint: result.tokenFingerprint || null,
        issuedAt: result.issuedAt || Date.now(),
        returnPath,
      });
      navigate("/auth/verify-otp");
    } catch (err) {
      if (err.code === "user_not_found") {
        setError("No account found for this email. Create an account to continue.");
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
        <h1 className="lit-auth__heading">SIGN IN</h1>
        <p className="lit-auth__lead">Sign in with email and OTP</p>

        <label className="lit-auth__label" htmlFor="signin-email">
          Email Address
        </label>
        <div className="lit-auth__field">
          <MailIcon />
          <input
            id="signin-email"
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

        <p className="lit-auth__alt">
          New here?{" "}
          <Link className="lit-auth__link" to={`/sign-up?return=${encodeURIComponent(returnPath)}`}>
            Sign Up
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}
