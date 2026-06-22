import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Auth.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const from = location.state?.from?.pathname || "/admin/dashboard";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const isLoggedIn = auth.login(email, password);

    if (isLoggedIn) {
      navigate(from, { replace: true });
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1 className="auth-title">Admin Login</h1>
        {error && <p className="auth-error">{error}</p>}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">
          Login
        </button>
        <p className="auth-switch">
          Don't have an account? <Link to="/admin/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
