import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "../assets/auth-hero-characters.png";
import panelWaves from "../assets/auth-panel-waves.png";
import litLogo from "../assets/lit-logo.png";
import "./auth.css";

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 5.5 6.2v5.8c0 3.6 2.8 6.9 6.5 8 3.7-1.1 6.5-4.4 6.5-8V6.2L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m9.2 12.2 1.8 1.8 3.8-3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function AuthLayout({ children }) {
  return (
    <div className="lit-auth">
      <motion.aside
        className="lit-auth__hero"
        initial={{ opacity: 0, x: -52 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={heroImage} alt="" className="lit-auth__hero-img" />
        <div className="lit-auth__hero-feather" aria-hidden="true" />
        <div className="lit-auth__hero-shade" aria-hidden="true" />
        <div className="lit-auth__hero-copy">
          <p className="lit-auth__hero-line">SLIP BACK INTO YOUR</p>
          <p className="lit-auth__hero-line">
            <span className="lit-auth__hero-accent">SIGNATURE LOOK!</span>
          </p>
        </div>
      </motion.aside>

      <motion.section
        className="lit-auth__panel"
        initial={{ opacity: 0, x: 52 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="lit-auth__panel-bg"
          style={{ backgroundImage: `url(${panelWaves})` }}
          aria-hidden="true"
        />
        <div className="lit-auth__panel-vignette" aria-hidden="true" />

        <header className="lit-auth__brand-row">
          <Link to="/" className="lit-auth__brand-link" aria-label="LIT Home">
            <img src={litLogo} alt="LIT Luxury In Taste" className="lit-auth__brand-logo" />
          </Link>
        </header>

        <div className="lit-auth__main">{children}</div>

        <footer className="lit-auth__trust">
          <ShieldIcon />
          <span>Secure, private &amp; spam-free sign in experience</span>
        </footer>
      </motion.section>
    </div>
  );
}
