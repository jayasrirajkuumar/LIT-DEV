import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";

/**
 * Protects e-commerce admin routes with Azure CIAM + PostgreSQL ADMIN role.
 */
const EcomAdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, userProfile, loading, login } = useUserAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      sessionStorage.setItem("auth_return_to", location.pathname);
    }
  }, [loading, isAuthenticated, location.pathname]);

  if (loading) {
    return (
      <div className="ecom-admin-auth-loading">
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/admin/login?redirect=ecommerce&from=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (userProfile?.role !== "ADMIN") {
    return (
      <div className="ecom-admin-access-denied">
        <h2>Admin access required</h2>
        <p>
          Your account ({userProfile?.email || "signed-in user"}) does not have the ADMIN role in
          PostgreSQL. Contact an administrator to grant access.
        </p>
        <button type="button" onClick={() => login("/admin/ecomDashboard")}>
          Sign in with a different account
        </button>
      </div>
    );
  }

  return children;
};

export default EcomAdminProtectedRoute;
