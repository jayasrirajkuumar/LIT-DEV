import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { upsertUserFromClaims } from "../services/userService";
import { getPostLoginRedirectPath } from "../context/UserAuthContext";
import {
  decodeJwt,
  exchangeCodeForTokens,
  logAuth,
  logAuthError,
  persistUserSession,
  validateIdTokenClaims,
} from "../config/authConfig";

const pageStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 24,
  background: "#06040c",
  color: "#f5f3ff",
};

const panelStyle = {
  width: "min(420px, 100%)",
  padding: "32px 28px",
  textAlign: "center",
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [welcomeName, setWelcomeName] = useState("");
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const clearCallbackUrl = () => {
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    const redirectAfterLogin = () => {
      const path = getPostLoginRedirectPath();
      logAuth("Redirecting after login", { path });
      navigate(path, { replace: true });
    };

    const processCallback = async () => {
      const query = new URLSearchParams(window.location.search);
      const oauthError = query.get("error");
      const oauthErrorDescription = query.get("error_description");

      if (oauthError) {
        setError(oauthErrorDescription || oauthError);
        clearCallbackUrl();
        return;
      }

      const code = query.get("code");
      const state = query.get("state");

      if (!code) {
        setError("No authorization code received. Please try signing in again.");
        clearCallbackUrl();
        return;
      }

      const storedState = sessionStorage.getItem("auth_state");
      if (!state || !storedState || state !== storedState) {
        setError("Invalid login state. Please try signing in again.");
        clearCallbackUrl();
        return;
      }

      try {
        const tokens = await exchangeCodeForTokens(code);
        const idToken = tokens.id_token;
        if (!idToken) throw new Error("Token response did not include an ID token.");

        const decodedUser = decodeJwt(idToken);
        if (!decodedUser) throw new Error("Unable to decode the ID token.");

        validateIdTokenClaims(decodedUser);
        persistUserSession(idToken, decodedUser);
        setWelcomeName(decodedUser.name || decodedUser.given_name || "Guest");

        await upsertUserFromClaims(decodedUser, idToken);
        clearCallbackUrl();
        redirectAfterLogin();
      } catch (callbackError) {
        logAuthError("Callback processing failed", callbackError);
        setError(callbackError.message || "Sign-in failed. Please try again.");
        clearCallbackUrl();
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div style={pageStyle}>
      <div style={panelStyle}>
        {error ? (
          <>
            <h2>Sign-in failed</h2>
            <p>{error}</p>
            <p>Please ensure the backend is running, then try again.</p>
            <button type="button" onClick={() => navigate("/", { replace: true })}>
              Return to home
            </button>
          </>
        ) : (
          <>
            <p aria-hidden="true">…</p>
            <h2>Welcome{welcomeName ? `, ${welcomeName}` : ""}</h2>
            <p>Completing your secure sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
