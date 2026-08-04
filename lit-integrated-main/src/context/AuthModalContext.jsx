import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../hooks/useUserAuth";

const AuthModalContext = createContext(null);

const PENDING_ACTION_KEY = "lit_pending_shopping_action";

export function savePendingShoppingAction(action) {
  sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
}

export function consumePendingShoppingAction() {
  const raw = sessionStorage.getItem(PENDING_ACTION_KEY);
  sessionStorage.removeItem(PENDING_ACTION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const AuthModalProvider = ({ children }) => {
  const { isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingAction, setPendingAction] = useState(null);

  const closeModal = useCallback(() => {
    setPendingAction(null);
  }, []);

  const openAuthModal = useCallback(
    (mode = "signin", action = null) => {
      if (isAuthenticated) return;

      if (action) {
        setPendingAction(action);
        savePendingShoppingAction(action);
      } else {
        setPendingAction(null);
      }

      const path = mode === "signup" ? "/sign-up" : "/sign-in";
      const returnTarget = action?.returnPath || `${location.pathname}${location.search}`;
      const returnTo = encodeURIComponent(returnTarget);
      navigate(`${path}?return=${returnTo}`);
    },
    [isAuthenticated, location.pathname, location.search, navigate],
  );

  const requireAuth = useCallback(
    (action) => {
      if (isAuthenticated) {
        return true;
      }
      openAuthModal("signin", action);
      return false;
    },
    [isAuthenticated, openAuthModal],
  );

  const value = useMemo(
    () => ({
      requireAuth,
      openAuthModal,
      closeModal,
      pendingAction,
    }),
    [requireAuth, openAuthModal, closeModal, pendingAction],
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
};

export default AuthModalProvider;
