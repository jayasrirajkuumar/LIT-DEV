import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/context-admin/AuthContext";
import { useUserAuth } from "../context/UserAuthContext";
import "../styles/AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: localLogin } = useAuth();
  const { login: azureLogin, isAuthenticated, userProfile, loading } = useUserAuth();

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const redirectParam =
    new URLSearchParams(location.search).get("redirect") ||
    sessionStorage.getItem("redirectAfterLogin");

  const isEcommerceAdmin = redirectParam === "ecommerce";

  useEffect(() => {
    if (redirectParam) {
      sessionStorage.setItem("redirectAfterLogin", redirectParam);
    }
  }, [redirectParam]);

  useEffect(() => {
    if (loading || !isEcommerceAdmin) return;

    if (isAuthenticated && userProfile?.role === "ADMIN") {
      const from = new URLSearchParams(location.search).get("from");
      navigate(from || "/admin/ecomDashboard", { replace: true });
    }
  }, [loading, isAuthenticated, userProfile, isEcommerceAdmin, navigate, location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocalLogin = (e) => {
    e.preventDefault();
    setError("");
    const success = localLogin(credentials.email, credentials.password);
    if (success) {
      navigate("/admin/dashboard");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleAzureAdminLogin = async () => {
    setError("");
    try {
      sessionStorage.setItem("redirectAfterLogin", "ecommerce");
      sessionStorage.setItem("auth_return_to", "/admin/ecomDashboard");
      await azureLogin("/admin/ecomDashboard");
    } catch (loginError) {
      setError(loginError.message || "Unable to start Azure sign-in.");
    }
  };

  if (isEcommerceAdmin) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-box">
          <h1>E-Commerce Admin</h1>
          <p className="admin-login-subtitle">
            Sign in with your Azure CIAM account. Your PostgreSQL user must have the ADMIN role.
          </p>
          {error && <div className="error-message">{error}</div>}
          <button type="button" className="login-button" onClick={handleAzureAdminLogin}>
            Sign in with Azure
          </button>
          {isAuthenticated && userProfile?.role !== "ADMIN" && (
            <p className="admin-login-note">
              Signed in as {userProfile?.email}, but this account is not an administrator.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1>Content Admin Login</h1>
        <p className="admin-login-subtitle">Newsletter and website content management.</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLocalLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <p className="admin-login-note">
          For marketplace admin, use{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/admin/login?redirect=ecommerce")}
          >
            E-Commerce Admin sign-in
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
