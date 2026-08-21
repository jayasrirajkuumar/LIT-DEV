import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLuxuryShopping } from "../../context/LuxuryShoppingContext";
import MarketplaceCartDrawer from "./MarketplaceCartDrawer";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

/* ----------------------------------------------------------------
   EXACT CUSTOM SVG ICONS matching the reference UI upload
   Gold outlined: Search, Bell, Heart, Bag, Person (navbar row)
   ---------------------------------------------------------------- */

const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="22" y2="22" />
  </svg>
);

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconBag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconPerson = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconClose = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ---------------------------------------------------------------- */

const NAV_LINKS = [
  { label: "MEN",          to: "/shop/products?gender=men" },
  { label: "WOMEN",        to: "/shop/products?gender=women" },
  { label: "KIDS",         to: "/shop/products?kids=true" },
  { label: "NEW ARRIVALS", to: "/shop/products?sort=newest" },
  { label: "CLEARANCE",    to: "/shop/products?clearance=true" },
  { label: "GIFT CARDS",   to: "/gift-cards" },
];

const MarketplaceNavbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const {
    cartCount, wishlistCount,
    isCartDrawerOpen, setIsCartDrawerOpen,
    cartItems, updateQuantity, removeFromCart,
  } = useLuxuryShopping();

  const [query, setQuery]               = useState("");
  const [scrolled, setScrolled]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop/search?q=${encodeURIComponent(query.trim())}`);
  };

  const isActive = (to) => location.pathname + location.search === to;

  return (
    <>
      {/* ── ANNOUNCEMENT STRIP ───────────────────────────────────── */}
      <div className="lux-top-announcement" role="banner">
        AUTHENTIC LUXURY. CURATED DIFFERENTLY. UP TO 60% OFF.
      </div>

      {/* ── SECURED PAYMENTS STRIP ───────────────────────────────── */}
      <div className="lux-secured-strip">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mr-1.5 opacity-60">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        SECURED PAYMENTS
      </div>

      {/* ── MAIN NAVBAR ──────────────────────────────────────────── */}
      <header className={`lux-navbar ${scrolled ? "lux-navbar--scrolled" : ""}`}>
        <PageContainer className="flex items-center justify-between gap-4">

          {/* 1. LEFT — LIT Brand (logo placeholder — user will upload) */}
          <div className="flex items-center shrink-0">
            <Link to="/shop" className="flex items-center gap-2 group py-1" aria-label="LIT Luxury In Taste">
              {/* Placeholder — logo to be provided by user */}
              <span
                className="lux-serif text-[22px] sm:text-[26px] font-bold tracking-[0.18em] text-[#faf8f5] group-hover:text-[#d8b87a] transition-colors select-none"
                aria-label="LIT"
              >
                LIT
              </span>
              <span className="hidden sm:block text-[8px] font-semibold tracking-[0.22em] uppercase text-[#8c8579] leading-tight max-w-[48px]">
                LUXURY<br />IN TASTE
              </span>
            </Link>
          </div>

          {/* 2. CENTER — Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-10" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`text-[10.5px] xl:text-[11.5px] font-semibold tracking-[0.18em] xl:tracking-[0.22em] uppercase whitespace-nowrap transition-colors duration-200 ${
                  isActive(link.to) ? "text-[#d8b87a]" : "text-[#ece7df] hover:text-[#d8b87a]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 3. RIGHT — Icons Row (matching reference upload exactly) */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Search — desktop pill */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block mr-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#736c61] pointer-events-none">
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="lux-search-pill"
                aria-label="Search luxury products"
              />
            </form>

            {/* Search icon (mobile) */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="lux-nav-icon-btn md:hidden"
              aria-label="Search"
            >
              <IconSearch />
            </button>

            {/* Bell / Notifications */}
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              className="lux-nav-icon-btn"
              aria-label="Notifications"
            >
              <IconBell />
              <span className="lux-nav-badge">0</span>
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="lux-nav-icon-btn" aria-label="Wishlist">
              <IconHeart />
              <span className="lux-nav-badge">{wishlistCount}</span>
            </Link>

            {/* Shopping Bag — opens drawer */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="lux-nav-icon-btn"
              aria-label="Shopping Bag"
            >
              <IconBag />
              <span className="lux-nav-badge">{cartCount}</span>
            </button>

            {/* Person / Account */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="lux-nav-icon-btn"
              aria-label="Account"
            >
              <IconPerson />
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden lux-nav-icon-btn text-[#ece7df]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </PageContainer>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3 border-t border-[#1c1a17] mt-1 pt-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#736c61]">
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="lux-search-pill w-full"
                aria-label="Search"
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <nav className="lg:hidden bg-[#080706] border-t border-[#1c1a17] px-4 py-4 space-y-1" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block py-2.5 text-xs font-semibold tracking-[0.2em] uppercase text-[#ece7df] hover:text-[#d8b87a] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Cart Drawer */}
      <MarketplaceCartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
    </>
  );
};

export default MarketplaceNavbar;
