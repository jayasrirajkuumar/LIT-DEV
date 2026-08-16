import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useShopping } from "../../context/ShoppingContext";
import UserMenu from "../UserMenu/UserMenu";
import NotificationBell from "../notifications/NotificationBell";
import litLogo from "../../assets/lit-logo.png";
import "./MarketplaceNavbar.css";

const CATEGORIES = [
  { label: "Men", to: "/shop/products?gender=men" },
  { label: "Women", to: "/shop/products?gender=women" },
  { label: "Kids", to: "/shop/products?kids=true" },
  { label: "New Arrivals", to: "/shop/products?sort=newest" },
  { label: "Clearance", to: "/shop/products?discount=1" },
  { label: "Gift Cards", to: "/gift-cards", highlight: true },
];

const MarketplaceNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useUserAuth();
  const { cartCount, wishlistCount } = useShopping();
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop/search?q=${encodeURIComponent(query.trim())}`);
    setMobileOpen(false);
    setMobileSearchOpen(false);
  };

  const isActive = (to) => location.pathname + location.search === to;

  const renderNavLinks = (className = "mp-navbar__center") => (
    <nav className={className} aria-label="Marketplace categories">
      {CATEGORIES.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className={`${isActive(item.to) ? "active" : ""}${item.highlight ? " mp-navbar__link--highlight" : ""}`}
          onClick={() => setMobileOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const renderSearch = (className = "mp-navbar__search") => (
    <form className={className} onSubmit={handleSearch}>
      <Search size={18} strokeWidth={1.75} className="mp-navbar__search-icon" aria-hidden="true" />
      <input
        type="search"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search luxury products"
      />
    </form>
  );

  const renderIconActions = ({ includeWishlist = true } = {}) => (
    <>
      {isAuthenticated ? (
        <NotificationBell />
      ) : (
        <button type="button" className="mp-navbar__icon-btn" aria-label="Notifications" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
      )}

      {isAuthenticated && includeWishlist && (
        <Link to="/wishlist" className="mp-navbar__icon-btn" aria-label="Wishlist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {wishlistCount > 0 && <span className="mp-navbar__badge">{wishlistCount}</span>}
        </Link>
      )}

      {isAuthenticated && (
        <Link to="/cart" className="mp-navbar__icon-btn" aria-label="Shopping cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && <span className="mp-navbar__badge">{cartCount}</span>}
        </Link>
      )}
    </>
  );

  return (
    <>
      <header className={`mp-navbar${scrolled ? " mp-navbar--scrolled" : ""}`}>
        <div className="mp-navbar__inner">
          {/* Left — brand */}
          <div className="mp-navbar__left">
            <Link to="/shop" className="mp-navbar__brand" aria-label="Luxury In Taste Marketplace home">
              <img src={litLogo} alt="" className="mp-navbar__brand-mark" aria-hidden="true" />
              <span className="mp-navbar__brand-copy">
                <span className="mp-navbar__brand-wordmark">Luxury In Taste</span>
              </span>
            </Link>
          </div>

          {/* Center — navigation */}
          {renderNavLinks()}

          {/* Right — search + actions (single row, no nesting overlap) */}
          <div className={`mp-navbar__right${isAuthenticated ? " mp-navbar__right--auth" : " mp-navbar__right--guest"}`}>
            {renderSearch()}
            <div className="mp-navbar__icon-group">{renderIconActions()}</div>
            <UserMenu />
          </div>

          {/* Mobile compact actions */}
          <div className="mp-navbar__mobile-tools">
            <button
              type="button"
              className={`mp-navbar__icon-btn mp-navbar__search-toggle${mobileSearchOpen ? " is-active" : ""}`}
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen((prev) => !prev)}
            >
              <Search size={18} strokeWidth={1.75} />
            </button>
            {renderIconActions({ includeWishlist: false })}
            <UserMenu />
            <button
              type="button"
              className="mp-navbar__menu-toggle"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X size={24} strokeWidth={1.75} /> : <Menu size={24} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="mp-navbar__mobile-search">
            {renderSearch("mp-navbar__search mp-navbar__search--expanded")}
          </div>
        )}
      </header>

      <button
        type="button"
        className={`mp-navbar__overlay${mobileOpen ? " is-visible" : ""}`}
        aria-label="Close menu"
        onClick={() => setMobileOpen(false)}
        tabIndex={mobileOpen ? 0 : -1}
      />

      <aside
        className={`mp-navbar__mobile-panel${mobileOpen ? " is-open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        {renderNavLinks("mp-navbar__mobile-nav")}
        {isAuthenticated && (
          <div className="mp-navbar__mobile-actions">
            <Link to="/wishlist" className="mp-navbar__mobile-link" onClick={() => setMobileOpen(false)}>
              Wishlist
              {wishlistCount > 0 && <span className="mp-navbar__mobile-badge">{wishlistCount}</span>}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};

export default MarketplaceNavbar;
