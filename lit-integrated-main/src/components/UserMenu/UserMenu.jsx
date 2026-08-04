import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useAuthModal } from "../../context/AuthModalContext";
import { getAvatarFallbackData } from "../../utils/avatarUtils";
import "./UserMenu.css";

const UserMenu = () => {
  const {
    isAuthenticated,
    displayName,
    displayEmail,
    avatarUrl,
    profileExtensions,
    logout,
  } = useUserAuth();
  const { openAuthModal } = useAuthModal();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const menuRef = useRef(null);
  const { initials, backgroundColor } = getAvatarFallbackData(
    displayName,
    profileExtensions?.username || displayEmail,
  );

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUrl]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const showAvatarImage = avatarUrl && !avatarLoadFailed;

  if (!isAuthenticated) {
    return (
      <div className="user-menu-auth-actions">
        <button
          type="button"
          className="user-menu-signin-btn"
          onClick={() => openAuthModal("signin")}
        >
          Sign In
        </button>
        <button
          type="button"
          className="user-menu-signup-btn"
          onClick={() => openAuthModal("signup")}
        >
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {showAvatarImage ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="user-menu-avatar-image"
            onError={() => setAvatarLoadFailed(true)}
          />
        ) : (
          <span
            className="user-menu-avatar-fallback"
            style={{ backgroundColor }}
            aria-hidden="true"
          >
            {initials}
          </span>
        )}
        <span className="user-menu-name">{displayName}</span>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-dropdown-header">
            <strong>{displayName}</strong>
            <span>{displayEmail}</span>
          </div>
          <Link to="/profile" onClick={() => setIsOpen(false)} role="menuitem">
            My Profile
          </Link>
          <Link to="/wishlist" onClick={() => setIsOpen(false)} role="menuitem">
            Wishlist
          </Link>
          <Link to="/orders" onClick={() => setIsOpen(false)} role="menuitem">
            Orders
          </Link>
          <button type="button" onClick={handleLogout} role="menuitem">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
