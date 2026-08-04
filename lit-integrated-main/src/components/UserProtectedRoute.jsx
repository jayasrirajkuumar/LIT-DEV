import React from "react";
import { useLocation } from "react-router-dom";
import { useUserAuth } from "../hooks/useUserAuth";
import { useAuthModal } from "../context/AuthModalContext";
import "./UserAuthLoading.css";

const AuthLoadingScreen = () => (
  <div className="user-auth-loading" role="status" aria-live="polite">
    <div className="user-auth-loading-panel">
      <div className="user-auth-loading-spinner" aria-hidden="true" />
      <p className="user-auth-loading-title">Checking authentication...</p>
    </div>
  </div>
);

const AuthRequiredPlaceholder = () => (
  <div className="auth-guard-placeholder">
    <div className="auth-guard-placeholder__panel">
      <h2>Sign in to continue your luxury shopping experience.</h2>
      <p>Redirecting you to sign in…</p>
    </div>
  </div>
);

const UserProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useUserAuth();
  const { requireAuth } = useAuthModal();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      requireAuth({ type: "protected_route", returnPath: location.pathname });
    }
  }, [loading, isAuthenticated, requireAuth, location.pathname]);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthRequiredPlaceholder />;
  }

  return children;
};

export default UserProtectedRoute;
