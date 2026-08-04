import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MarketplaceSearchBar = ({ initialQuery = "", onFilterClick }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/shop/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <motion.div
      className="mp-search-container"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <form className="mp-search-wrapper" onSubmit={handleSubmit}>
        <div className="mp-search-box">
          <svg className="mp-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="search"
            placeholder="Search products here..."
            className="mp-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search products"
          />

          {onFilterClick && (
            <motion.button
              type="button"
              className="mp-filter-btn"
              onClick={onFilterClick}
              aria-label="Open filters"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
              </svg>
            </motion.button>
          )}
        </div>

        <div className="mp-action-buttons">
          {[
            { label: "Wishlist", path: "/wishlist", icon: "heart" },
            { label: "Cart", path: "/cart", icon: "bag" },
            { label: "Saved", path: "/wishlist", icon: "bookmark" },
          ].map((action) => (
            <motion.button
              key={action.label}
              type="button"
              className="mp-action-button"
              onClick={() => navigate(action.path)}
              aria-label={action.label}
              whileHover={{ scale: 1.08, backgroundColor: "rgba(147, 51, 234, 0.18)" }}
              whileTap={{ scale: 0.94 }}
            >
              {action.icon === "heart" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
              {action.icon === "bag" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              )}
              {action.icon === "bookmark" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </motion.button>
          ))}
        </div>
      </form>
    </motion.div>
  );
};

export default MarketplaceSearchBar;
