import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./Navbar.css";

import litLogo from "../../../assets/lit-logo.png";
import notificationIcon from "../../../assets/notification-icon.svg";
import UserMenu from "../../UserMenu/UserMenu";
import { useUserAuth } from "../../../hooks/useUserAuth";

const NAV_LINKS = [
  { id: "game-modes", label: "Game Modes", path: "/game-modes" },
  { id: "shop", label: "Marketplace", path: "/shop" },
  { id: "socials", label: "Socials", path: "/socials" },
  { id: "newsletter", label: "Newsletter", path: "/newsletter" },
  { id: "avatar-store", label: "Avatar Store", path: "/avatar-store" },
  { id: "ir-icon", label: "IR Icon", path: "/ir-icon" },
];

const isLinkActive = (pathname, path) => {
  if (path === "/shop") return pathname.startsWith("/shop");
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
};

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated } = useUserAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} aria-label="Main navigation">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" aria-label="LIT Home">
            <img src={litLogo} alt="LIT Logo" className="logo-img" />
          </Link>
        </div>

        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          {NAV_LINKS.map((item) => {
            const active = isLinkActive(location.pathname, item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="navbar-right">
          <motion.button
            type="button"
            className="notification-icon"
            aria-label="Notifications"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src={notificationIcon} alt="" className="notification-img" />
          </motion.button>
          <UserMenu />
          <button
            type="button"
            className="hamburger-menu"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            <div className={`hamburger-bar ${isMenuOpen ? "open" : ""}`} />
            <div className={`hamburger-bar ${isMenuOpen ? "open" : ""}`} />
            <div className={`hamburger-bar ${isMenuOpen ? "open" : ""}`} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
