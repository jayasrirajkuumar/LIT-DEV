import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./ArticleSimpleHeader.css";
import litLogo from "../../../assets/lit-logo.png";
import SubscriptionForm from "../../../components/shared/SubscriptionForm";
import { useState } from "react";
import landingBg from "../../../assets/landing-page-bg.png";

// --- NEW: A small component for the arrow icon ---
const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="back-arrow-svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ArticleSimpleHeader = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleGoBack = () => {
    navigate(-1);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSubscribe = () => {
    // Implement the subscribe logic here
    setSubscribed(true);
    setEmail("");
  };

  return (
    <header className="article-simple-header">
      <div className="header-left">
        <button onClick={handleGoBack} className="back-button">
          <BackArrowIcon />
          <span>Back</span>
        </button>
      </div>

      <div className="header-center">
        <Link to="/" className="header-logo-link">
          <img
            src={litLogo}
            alt="Luxury In Totes Logo"
            className="header-logo-img"
          />
        </Link>
      </div>

      <div className="header-right">
        <button className="subscribe-button" onClick={openModal}>
          Subscribe
        </button>
        <Link to="/signin" className="signin-link">
          SIGN IN
        </Link>
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="hamburger-menu" onClick={toggleMenu}>
        <div className={`hamburger-bar ${isMenuOpen ? "open" : ""}`}></div>
        <div className={`hamburger-bar ${isMenuOpen ? "open" : ""}`}></div>
        <div className={`hamburger-bar ${isMenuOpen ? "open" : ""}`}></div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu">
          <button
            className="mobile-subscribe-button"
            onClick={() => {
              openModal();
              setIsMenuOpen(false);
            }}
          >
            Subscribe
          </button>
          <Link
            to="/signin"
            className="mobile-signin-link"
            onClick={() => setIsMenuOpen(false)}
          >
            SIGN IN
          </Link>
        </div>
      </div>

      {showModal && (
        <div className="popup-overlay" onClick={closeModal}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
              ×
            </button>
            <h2>Subscribe to Our Newsletter</h2>
            <p>
              Get weekly updates on luxury, sustainable, fast fashion and the
              sneaker market
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubscribe();
              }}
            >
              <input
                type="email"
                placeholder="Your Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribed}
              />
              <button
                type="submit"
                className="subscribe-button"
                disabled={subscribed}
              >
                {subscribed ? "✔ Subscribed" : "SUBSCRIBE NOW"}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default ArticleSimpleHeader;
