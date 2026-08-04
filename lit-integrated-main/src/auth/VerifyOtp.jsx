import React, { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserAuth } from "../hooks/useUserAuth";
import { useAuthModal, savePendingShoppingAction } from "../context/AuthModalContext";
import {
  completeSessionFromTokens,
  mapNativeAuthError,
  resendSignInOtp,
  resendSignUpOtp,
  verifySignInOtp,
  verifySignUpOtp,
} from "../services/nativeAuthService";
import { applySignupProfileDetails } from "../services/userService";
import AuthLayout from "./AuthLayout";
import { persistOtpSession, removeOtpSession, removeSignupDraft, retrieveOtpSession } from "./session";
import "./auth.css";

const RESEND_WAIT = 30;

function OtpGrid({ count, value, onChange, disabled, shake, autoCompleteKey }) {
  const refs = useRef([]);
  const cells = Array.from({ length: count }, (_, i) => (value[i] || "").replace(/\D/g, ""));

  const focusAt = useCallback((index) => {
    const node = refs.current[index];
    if (node) {
      node.focus();
      node.select();
    }
  }, []);

  useEffect(() => {
    if (!disabled) focusAt(0);
  }, [count, disabled, focusAt]);

  const publish = (next) => onChange(next.join("").slice(0, count));

  const onInput = (index, raw) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      const next = [...cells];
      next[index] = "";
      publish(next);
      return;
    }

    if (digits.length > 1) {
      const chunk = digits.slice(0, count);
      const next = Array.from({ length: count }, (_, i) => chunk[i] || "");
      publish(next);
      focusAt(Math.min(chunk.length, count - 1));
      return;
    }

    const next = [...cells];
    next[index] = digits;
    publish(next);
    if (index < count - 1) focusAt(index + 1);
  };

  const onKeyDown = (index, event) => {
    if (event.key === "Backspace" && !cells[index] && index > 0) {
      event.preventDefault();
      const next = [...cells];
      next[index - 1] = "";
      publish(next);
      focusAt(index - 1);
    }
  };

  const onPaste = (event) => {
    event.preventDefault();
    const chunk = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, count);
    if (!chunk) return;
    const next = Array.from({ length: count }, (_, i) => chunk[i] || "");
    publish(next);
    focusAt(Math.min(chunk.length, count - 1));
  };

  return (
    <div
      className={`lit-auth__otp-grid${shake ? " lit-auth__otp-grid--shake" : ""}`}
      role="group"
      aria-label={`${count}-digit verification code`}
    >
      {cells.map((cell, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          className="lit-auth__otp-cell"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-lpignore="true"
          data-1p-ignore="true"
          name={index === 0 ? `otp-${autoCompleteKey}` : undefined}
          maxLength={index === 0 ? count : 1}
          value={cell}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => onInput(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useUserAuth();
  const { pendingAction } = useAuthModal();

  const [session, setSession] = useState(() => retrieveOtpSession());
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_WAIT);
  const [shake, setShake] = useState(false);

  const activeSession = retrieveOtpSession() || session;
  const digitCount = activeSession?.codeLength || 8;
  const ready = code.length === digitCount;
  const verifyLabel = activeSession?.mode === "signup" ? "Verify & Sign Up" : "Verify & Sign In";
  const pageTitle = activeSession?.mode === "signup" ? "SIGN UP" : "SIGN IN";
  const pageLead =
    activeSession?.mode === "signup"
      ? "Create your account with email and OTP"
      : "Sign in with email and OTP";

  useEffect(() => {
    const latest = retrieveOtpSession();
    if (latest) setSession(latest);
  }, []);

  useEffect(() => {
    if (!activeSession?.continuationToken) return undefined;
    setCode("");
    setSecondsLeft(RESEND_WAIT);
  }, [activeSession?.continuationToken]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (!error) return undefined;
    setShake(true);
    const t = window.setTimeout(() => setShake(false), 500);
    return () => window.clearTimeout(t);
  }, [error]);

  if (!authLoading && isAuthenticated) {
    return <Navigate to={activeSession?.returnPath || "/shop"} replace />;
  }

  if (!activeSession?.continuationToken || !activeSession?.email) {
    return <Navigate to="/sign-in" replace />;
  }

  const formatTimer = (total) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    if (!ready || busy) return;

    const latestSession = retrieveOtpSession();
    if (!latestSession?.continuationToken) {
      setError("Your verification session expired. Please request a new code.");
      return;
    }

    const sanitizedCode = code.replace(/\D/g, "");
    const expectedLength = latestSession.codeLength || 8;
    if (sanitizedCode.length !== expectedLength) {
      setError(`Please enter the full ${expectedLength}-digit verification code.`);
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (pendingAction) savePendingShoppingAction(pendingAction);

      const tokens =
        latestSession.mode === "signup"
          ? await verifySignUpOtp(
              latestSession.continuationToken,
              sanitizedCode,
              latestSession.email,
              expectedLength,
              latestSession.profile,
            )
          : await verifySignInOtp(latestSession.continuationToken, sanitizedCode, expectedLength);

      await completeSessionFromTokens(tokens);

      if (latestSession.mode === "signup" && latestSession.profile) {
        await applySignupProfileDetails(latestSession.profile);
      }

      removeOtpSession();
      removeSignupDraft();
      navigate(latestSession.returnPath || "/shop", { replace: true });
    } catch (err) {
      setError(mapNativeAuthError(err, "verify", latestSession));
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || busy) return;

    const latestSession = retrieveOtpSession();
    if (!latestSession?.continuationToken) {
      setError("Your verification session expired. Please request a new code.");
      return;
    }

    setBusy(true);
    setError("");
    setCode("");
    setSecondsLeft(RESEND_WAIT);

    try {
      const payload =
        latestSession.mode === "signup"
          ? await resendSignUpOtp(latestSession.continuationToken)
          : await resendSignInOtp(latestSession.continuationToken);

      const nextSession = {
        ...latestSession,
        continuationToken: payload.continuationToken,
        codeLength: payload.codeLength || latestSession.codeLength || 8,
        maskedTarget: payload.maskedTarget || latestSession.maskedTarget,
        tokenFingerprint: payload.tokenFingerprint || null,
        issuedAt: payload.issuedAt || Date.now(),
      };
      persistOtpSession(nextSession);
      setSession(nextSession);
    } catch (err) {
      setError(mapNativeAuthError(err, "resend", latestSession));
    } finally {
      setBusy(false);
    }
  };

  const handleBack = () => {
    removeOtpSession();
    navigate(activeSession.mode === "signup" ? "/sign-up/email" : "/sign-in", { replace: true });
  };

  const otpTarget = activeSession.maskedTarget || activeSession.email;
  const autoCompleteKey = activeSession.tokenFingerprint || activeSession.continuationToken?.slice(-8) || "otp";

  return (
    <AuthLayout>
      <motion.form
        className="lit-auth__form lit-auth__form--verify"
        onSubmit={handleVerify}
        noValidate
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="lit-auth__heading">{pageTitle}</h1>
        <p className="lit-auth__lead">{pageLead}</p>
        <p className="lit-auth__hint">Code sent to {otpTarget}. Use only the latest OTP.</p>

        <label className="lit-auth__label">Enter {digitCount}-Digit OTP</label>
        <OtpGrid
          count={digitCount}
          value={code}
          onChange={setCode}
          disabled={busy}
          shake={shake}
          autoCompleteKey={autoCompleteKey}
        />

        {error && (
          <p className="lit-auth__error" role="alert">
            {error}
          </p>
        )}

        <p className="lit-auth__resend-line">
          {secondsLeft > 0 ? (
            <span>Resend OTP in {formatTimer(secondsLeft)}</span>
          ) : (
            <>
              Didn&apos;t receive the OTP?{" "}
              <button type="button" className="lit-auth__link-btn" onClick={handleResend} disabled={busy}>
                Resend OTP
              </button>
            </>
          )}
        </p>

        <button type="submit" className="lit-auth__submit" disabled={busy || !ready}>
          {busy ? (
            <span className="lit-auth__submit-inner">
              <span className="lit-auth__loader" aria-hidden="true" />
              Verifying…
            </span>
          ) : (
            verifyLabel
          )}
        </button>

        <button type="button" className="lit-auth__back" onClick={handleBack} disabled={busy}>
          ← Change email
        </button>
      </motion.form>
    </AuthLayout>
  );
}
